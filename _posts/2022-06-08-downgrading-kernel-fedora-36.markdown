---
layout: post
title:  "Downgrading your Linux kernel on Fedora"
date:   2022-06-08
render_with_liquid: false
---
I've been using Fedora as my daily driver on my work laptop for the past 3 years. During
that timeframe, I've only encountered a handful of minor annoyances. Lately, I was bit by
one of them: distorted audio in voice chat applications like Slack and Teams. It turns out
that a [Pipewire bug](https://bugzilla.kernel.org/show_bug.cgi?id=215576) in versions 5.16
through 5.18 of the Linux kernel 5.16 shipped with [Fedora 35 and Fedora 36](https://gitlab.freedesktop.org/pipewire/pipewire/-/issues/2019) is the culprit.

After a detour of unsuccesfully attempts to [resurrect Pulseaudio](https://fedoraproject.org/wiki/Changes/DefaultPipeWire), the abstraction layer used by most distro's to manage audio, I ended up
downgrading the kernel to version 5.15 until a fix lands in future releases. Fedora makes this
a relatively painless process.

Older kernels can be found as packaged RPM's on [Koji](https://koji.fedoraproject.org/koji/packageinfo?packageID=8), Fedora's build system and package database. In a nutshell, you just have to download the
appropriate kernel RPM's and install them. Here's how you do that:

First, install the `koji` command line application. It makes it easy to help directly download
packages from koji.

```bash
$ sudo dnf install koji
```

Now, you can easily search and list available kernels from Koji:

```bash
$ koji list-builds --package=kernel --after="2021-11-12" | grep "5.15"
```

Here's how you download a kernel version from koji. Notice how it will download a bunch of
RPM's at once:

```
$ koji download-build --arch=x86_64 kernel-5.15.2-200.fc35
$ ls kernel-*.rpm
kernel-5.15.18-200.fc35.x86_64.rpm
kernel-core-5.15.18-200.fc35.x86_64.rpm
kernel-debug-5.15.18-200.fc35.x86_64.rpm
kernel-debug-core-5.15.18-200.fc35.x86_64.rpm
kernel-debug-devel-5.15.18-200.fc35.x86_64.rpm
kernel-debug-devel-matched-5.15.18-200.fc35.x86_64.rpm
kernel-debug-modules-5.15.18-200.fc35.x86_64.rpm
kernel-debug-modules-extra-5.15.18-200.fc35.x86_64.rpm
kernel-debug-modules-internal-5.15.18-200.fc35.x86_64.rpm
kernel-devel-5.15.18-200.fc35.x86_64.rpm
kernel-devel-matched-5.15.18-200.fc35.x86_64.rpm
kernel-modules-5.15.18-200.fc35.x86_64.rpm
kernel-modules-extra-5.15.18-200.fc35.x86_64.rpm
kernel-modules-internal-5.15.18-200.fc35.x86_64.rpm
```

You could just try and install everything with `dnf`...

```bash
$ sudo dnf update kernel-*.rpm
```

... but that's just going to fail. `dnf` is going to complain that you're trying
to install an older version of a newer package that's already installed. Instead,
you need to install these packages manually. You also don't need to install all of
them. All you need are the `kernel`, `kernel-core` and `kernel-modules` packages.
Everything else is downloaded if you're willing to participate as a [Fedora tester](https://fedoraproject.org/wiki/Test_Day:2021-11-14_Kernel_5.15_Test_Week) trying out
the next version of Fedora.

```bash
$ sudo dnf install ./kernel-5.15.18-200.fc35.x86_64.rpm ./kernel-core-5.15.18-200.fc35.x86_64.rpm ./kernel-modules-5.15.18-200.fc35.x86_64.rpm
```

Finally, reboot your system. The kernel will be added as an option to the GRUB bootloader
menu and set as the default to start from. You will be booted automatically in to a session
with the older kernel.

Typically, Fedora will only keep up to three kernel versions installed on your system. So,
note how installing the 5.15 kernel will simply replace the oldest kernel that's already
installed on your system. Fedora keeps you from installing multiple kernels to prevent you
from filling up the boot partition to a point where it affects booting your system.

You could use the `versionlock` of `dnf` to have the specific version of the kernel
always available. In other words, prevent it from being removed when you update your system:

```bash
$ sudo dnf install python3-dnf-plugins-extras-versionlock
$ sudo dnf versionlock add kernel-5.15.18-200.fc35
# Remove the lock
$ sudo dnf versionlock remove kernel-5.15.18-200.fc35
```

Finally, note how I'm installing a kernel package tagged for Fedora 35 on a Fedora 36
installation. So far, I haven't run into any major issues. Of course, YMMV and so I would
only recommend downgrading to a previous version of a kernel as a last ditch effort. And even
then, only when you're just going for jump between minor versions.