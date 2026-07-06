---
layout: post
title:  "Where should periodic jobs run: the orchestrator or the container?"
date:   2026-07-06 08:00:00
categories: Docker
comments: false
slug: where-should-periodic-jobs-run
---
I have a job that needs to run periodically once an hour. The job needs to be
containerized and deployed to a server cluster that's managed by a workload
orchestrator like Hashicorp's [Nomad](https://developer.hashicorp.com/nomad) or [Kubernetes](https://kubernetes.io/).

In this blogpost, we'll explore a few alternative approaches to scheduling in a
containerized context, highlighting the advantages and pitfalls of each approach.
We'll conclude with my chosen approach for the use case I was facing.

Let's kick off by looking at the job scheduler within a workload orchestrator.
Orchestrators like Nomad and Kubernetes ([CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)) let you periodically
spin up a new container on a tick signal, run a script, and then exit. While
convenient, this approach comes with challenges regarding resilience, logging,
timing, and lifecycle management:

* Relying on the *overlap policy* of the orchestrator can cause pile-ups or silently
  dropped runs if you're not too careful. Containers are executed in isolation, and
  the orchestrator doesn't know what happens inside them.
* If the cluster becomes unhealthy, it's possible for the orchestrator to *skip runs*
  which is a silent failure because the job wasn't executed at its scheduled time.
* A container is expected to exit, but can get blocked by i/o or networking. Batch jobs
  don't have a [liveness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), so the orchestrator's only check is the exit code. A *stuck container*
  is another silent failure.
* The *cold start* of a container adds a start-up cost that might weigh more than the
  actual job execution.
* *Logging happens in isolation* since each run happens in a separate, ephemeral container.
  Correlating a job's history to the lifecycle of containers requires external log collection.
* A side effect of periodic scheduling is the creation of completed and failed containers
  that need to be *garbage collected*. This requires proper configuration, which is
  another concern to be mindful of.

An alternative approach is letting a cron service inside the container do
all the heavy lifting. The container itself acts like it hosts a long 
running service, and the intricacies of periodic scheduling are kept away
from the orchestrator.

A straightforward implementation of periodic scheduling inside a container is to 
create a shell script with a `while` loop combined with `sleep` to manage 
periodic execution:

```bash
#!/usr/bin/bash
while true; do
  /path/to/command
  sleep 900   # every 15 minutes
done
```

It's a solution that's easy, simple and requires no dependencies. But it does come 
with several major limitations.

* `sleep 900` means: "wait 900 seconds after the job finishes", not "run every 900 seconds".
  If the job takes 30 seconds to execute, the next job will run at 15m30s. This error accumulates
  causing *drift*.
* Unlike cron or other periodic schedulers, it's not possible to align to the wall clock, e.g. "at 2:00am".
* There is no isolation between the loop and the job. If the command or script dies, the loop will
  stop as well. The only option is restarting the container.
* There is no graceful shutdown. Running as PID 1, the loop doesn't trap `SIGTERM` or forward it
  to the child process. When the orchestrator stops the container, the job gets killed abruptly, mid-run.
* There is no protection against overlap, no logging, and no missed-run handling.
* You can only run one job per loop, so it's not possible to define multiple schedules like cron.

It's tempting to try to solve these by adding to the script. Sometimes, that might be 
reasonable, but beware of unintentionally attempting to design and implement a periodic scheduler
with tools that weren't meant for such a use case.

A `while` / `sleep` loop inside a container does have its uses, though:

* It's a great solution for simple, tolerant workloads where a rough schedule is good enough, e.g.
  a simple, preferably idempotent, clean-up job that needs to run once a day.
* It's quick to implement in local development or prototyping to try out a job.

However, once you require clock alignment, crash resilience, multiple cron schedules, cron syntax,
or clean shutdown, you need a proper *periodic scheduler* service you can run inside a container.

Traditional `cron` / `crond` was originally designed for long-lived VMs and physical systems, not
ephemeral containers. This makes it a poor fit for periodic scheduling inside a container context.

* It's intended to daemonize (double-fork into the background) and run under an init system. That
  detaches it from PID 1, the very process the container's lifecycle is built around, so it doesn't
  fit the one-process-in-the-foreground model a container expects. Just like the simple loop, it
  doesn't handle `SIGTERM` in a way that allows for a graceful shutdown of the child processes it
  manages.
* The design assumes that output is logged through `syslog`, or mailed to the user, whereas in a
  container context, the convention is to log to `stdout` / `stderr`. As a result, the risk here
  is losing job output. Errors won't surface to the orchestrator either, and are dropped silently.
* `cron` runs jobs in a bare shell environment. However, containers pass configuration via
  environment variables. Passing those on to jobs managed through `cron` is non-trivial, and you may
  end up resorting to writing `.env` files inside the container.
* `cron` / `crond` typically wants to run as `root` and requires `setuid` to run jobs as a
  different user. This clashes with the preferred security practice of running containers as an
  unprivileged user.

This leaves a gap for job scheduling inside containers. There are several alternatives that
fill this void. The closest fit is [supercronic](https://github.com/aptible/supercronic). This installs as a single static Go binary. It
runs as a non-root foreground process, writes to stdout, and runs jobs as child processes,
forwarding signals and reaping them correctly. It inherits the container's environment, so the
configuration passed in via environment variables is available to your jobs without any extra
plumbing. Via cron-like syntax, you can schedule multiple jobs within a single container.

A close contender is [yacron](https://github.com/gjcarneiro/yacron). It's Python-based, and therefore heavier than supercronic. It does
offer built-in overlap protection as well as reporting via various channels like e-mail, Slack, and so on. Do note that the
original project is no longer maintained; a [yacron2](https://github.com/ptweezy/yacron2) fork picks up where it left off.

I ended up picking supercronic since that ticks all of the above boxes. It's worth being clear about
what it doesn't do: supercronic won't protect against overlap or recover missed runs. For my
once-an-hour, idempotent job that's an acceptable trade-off, but a job that must never overlap would
be a reason to reach for yacron instead.

Installation is fairly easy. The first step is copying the relevant install steps into your
`Dockerfile`:

```docker
# Install supercronic
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.46/supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=5bcefed628e32adc08e32634db2d10e9230dbca0 \
    SUPERCRONIC=supercronic-linux-amd64

RUN curl -fsSLO "$SUPERCRONIC_URL" \
 && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "$SUPERCRONIC" \
 && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
 && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic
```

You'll need a `docker-entrypoint.sh` and `crontab` file. The first launches supercronic
having the latter as a single argument. The `crontab` file defines the job schedule.

In your `Dockerfile` add:

```docker
COPY ./crontab /scripts/
COPY --chmod=755 ./docker-entrypoint.sh /scripts/

# Run as an unprivileged user rather than root
USER my-user

ENTRYPOINT ["/scripts/docker-entrypoint.sh"]
```

The `docker-entrypoint.sh` script reads:

```bash
#!/usr/bin/bash

exec supercronic /scripts/crontab
```

The `crontab` file reads:

```bash
# Some programs read $SHELL; cron-style schedulers don't set it by default,
# so define it here or the binary exits with an error.
SHELL=/bin/bash
HOME=/home/my-user

# Schedule and execute command (shell script, binary,...)
*/15 * * * * /path/to/command
```

This also changes how you troubleshoot issues. Instead of chasing across dead containers and debugging at the orchestrator level, everything gets contained to a single long-lived
container. The container's log stream is the first and last stop when diagnosing problems.

Supercronic logs every job's lifecycle to stderr, alongside the job's own output. The
`-json` flag makes that greppable, while `-debug` allows you to raise the verbosity.

On startup, the crontab gets validated and supercronic will exit if it's malformed.
This shows up in the logs, but you can also catch it before a deploy by running
`supercronic -test ./crontab` and checking the startup log.

When a job runs but exits non-zero, the exit status is in supercronic's log line and the
reason is usually in the job's own output right beside it. The most common culprit is the
environment: a command that works in your own shell but fails under supercronic is almost
always a missing variable or `PATH`. Reproduce it by `exec`-ing into the container and
running the exact command yourself.

Supercronic won't kill long-running jobs, so a hung run appears as "starting" in the
logs without an apparent "finish" line. Wrapping the command with `timeout` is one
way to deal with this (e.g. `*/15 * * * * timeout 600 /path/to/command`). If you're
developing your own tooling, try to be mindful of a condition that's never met and
keeps a routine waiting forever.

Finally, monitoring your setup is best done on two levels. A liveness probe lets
the orchestrator restart the container if the scheduler itself dies completely. Pairing
the job you're trying to run with a heartbeat towards external monitoring (e.g. [healthchecks.io](https://healthchecks.io/), [icinga](https://icinga.com/),...)
allows you to catch silently failing job runs. Of course, you want to ship the logs
themselves to an external aggregator since even long-lived containers are still at
heart ephemeral.

*Note: Claude Opus 4.8 assisted during research and editing of this blogpost.*