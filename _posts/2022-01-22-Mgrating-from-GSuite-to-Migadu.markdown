---
layout: post
title:  "Migrating from G Suite to Migadu"
date:   2022-01-23
render_with_liquid: false
---
Well, it happened. [Google has decided to shutter it's 'G Suite Legacy Free Edition' and require users to start paying for Google Workspace starting May 1st of this year](https://9to5google.com/2022/01/19/g-suite-legacy-free-edition/). This move doesn't really surprise me. Google has been pushing out it's generous freemium offering for a few years now as Workspace is a direct competitor to Microsofts Office 365, targeting business users.

When Google started offering Google Apps, some 16 years, I was running my own e-mail server on a noisy, beat up
Pentium II box in my studio. I decided to move my mailbox under `netsensei.nl` towards Google Apps. When I started my
freelance business, I also used Google Apps for mailboxes under `colada.be`. All was good and I didn't have to
worry about hosting mail. That is, until a few days ago.

Luckily, I only used G Suite for mailboxes under my own domains. The obvious choice would be to shell out some cash
every month to Google. However, Google Workspace is pricey for my needs. I predominantly use those mailboxes for
online accounts, mailing lists and historical archiving, and less so as a primary personal contact point. There's
a lot of history here, but suffice to say that consolidating my e-mail under a single domain has become a
non-trivial task in this day and age. As a result, I need to keep mailboxes under both domains alive, and shelling out
at least 12O EUR a year to do just that is a non-starter.

So, I'm looking at migrating towards another email provider.

## Migadu

There's no shortage of online mail providers. Protonmail, Fastmail, Posteo.io,... There's plenty to choose from.
I took a cursory glance at them but I still felt they were expensive coming from "free as in free beer". These are
low-key mailboxes. I remembered [Drew DeVault](https://drewdevault.com) blogging about [Email service provider recommendations](https://drewdevault.com/2020/06/19/Mail-service-provider-recommendations.html).
He recommended [Migadu](https://www.migadu.com/), a small Swiss business providing e-mail services for whom he did some consulting.

Rather then spending hours on comparing services, I simply registered with them and started their free trail.
Straight up first impression: Migadu is a breath of fresh air compared to Google.

* Migadu offers everything you'd expect from a mail provider.
* You're in control and the dashboard offers everything you need to manage mailboxes under multiple domains.
* The admin dashboard and webmail are no-nonsense and extremely lightweight. I like that. A lot.
* Setting everything up only takes a few minutes.
* There's no shortage of good documentation to get started.

While I use the free trial for now, Migadu starts it's offering with a [micro-plan](https://www.migadu.com/pricing/) of just 19$ per year.
Sure, it's very limited as to what you can do with it: you can only receive 200 mails and send out 20 mails per day on your entire Migadu account.
For me, that's perfect for my use case of having a few low-key use mailboxes.

Getting started was really easy:

1. Register and activate an account with Migadu.
2. Add a new domain `colada.be` to Migadu.
3. Configure MX, TXT and CNAME records in the admin panel of my DNS host.
4. Let Migadu pick up and verify the DNS changes.
5. Create a new mailbox in Migadu under the domain `colada.be`.

## Migrating mails

This is the non-trivial part. How do you transfer a mailbox from one provider to the next? I don't want to lose any data.
I started by moving a mailbox with some 14.500 messages from Google to GSuite. [Migadu recommends](https://www.migadu.com/guides/imapsync/)
using [imapsync](https://imapsync.lamiral.info) to get the job done. It took a bit of trail-and-error but this command worked for me:

```bash
imapsync \
  --dry \
  --host1 imap.gmail.com \
  --user1 XXXXXX@colada.be \
  --authmech1 LOGIN \
  --ssl1 --sep1 . \
  --passfile1 pass-gmail.txt \
  --prefix1 ""  \
  --host2 imap.migadu.com \
  --user2 XXXXXX@colada.be \
  --passfile2 pass-migadu.txt
```

`imapsync` is quite a verbose tool, and you do get detailed statistics when execution completes:

```bash
++++ Statistics
Transfer started on                     : Sun Jan 23 17:02:47 2022
Transfer ended on                       : Sun Jan 23 19:05:20 2022
Transfer time                           : 7352.6 sec
Folders synced                          : 24/24 synced
Messages transferred                    : 14431
Messages skipped                        : 0
Messages found duplicate on host1       : 0
Messages found duplicate on host2       : 0
Messages found crossduplicate on host2  : 0
Messages void (noheader) on host1       : 0
Messages void (noheader) on host2       : 0
Messages found in host1 not in host2    : 0 messages
Messages found in host2 not in host1    : 0 messages
Messages deleted on host1               : 0
Messages deleted on host2               : 0
Total bytes transferred                 : 230323064 (219.653 MiB)
Total bytes skipped                     : 0 (0.000 KiB)
Message rate                            : 2.0 messages/s
Average bandwidth rate                  : 30.6 KiB/s
Reconnections to host1                  : 0
Reconnections to host2                  : 0
Memory consumption at the end           : 446.8 MiB (started with 372.1 MiB)
Load end is                             : 0.72 0.46 0.39 2/1941 on 8 cores
Biggest message                         : 4773349 bytes (4.552 MiB)
Memory/biggest message ratio            : 98.2
Start difference host2 - host1          : -14431 messages, -230323064 bytes (-219.653 MiB)
Final difference host2 - host1          : 0 messages, 0 bytes (0.000 KiB)
The sync looks good, all 7123 identified messages in host1 are on host2.
There is no unidentified message
The sync is strict, all 7123 identified messages in host2 are on host1.
Detected 0 errors
```

So, it spend some 2 hours shifting through and processing 219MB or 14.500 messages between Google and Migadu. This wasn't a "large" mailbox
with a ton of massive attachments. The largest message came in at only 4.5MiB. Things change though when you have to move larger volumes.
The [FAQ of imapsync](https://imapsync.lamiral.info/FAQ.d/FAQ.Gmail.txt) does tell that Google IMAP set daily limits on how much data
you can move. And so, migrating may become an affair that spans several days. That's where you might want to put the above command
in a separate shell script and do something like this:

```bash
$ ./migrate.sh >> /tmp/migadu.txt 2>&1 &
```

## The benefit of owning your personal domain

The real take-away here is the clear benefit of hosting your mailboxes under a domain you own. The entire process of moving away from Google only
took so long. And if I end up not being happy with Migadu, I can just pick up everything and move to somewhere else. Migadu itself uses this freedom
as a selling point.

However, I've also been using gmail since 2004 as my primary mail address. Those were different times, and it seemed like a good idea
back then. Over those 16 years, I've build a digital identity sharing that mail address across many different private platforms, public services,
mailing lists, organizations, people, etc. Moving away from the `gmail.com` domain has become an entirely different challenge as, inevitably, you just
can't configure the `gmail.com` pointing to a different mail provider. It's effectively a lock-in with great consequences for anyone's digital
identity. Google can either deliberately or accidentally erase your mailbox. It's vulnerable position to be in, as your mailbox really still is the
linchpin of your digital identity.

And yet, email taking on such a foundational role in one's digital identity is also a silver lining. It's innate decentralized nature of the protocol
at least gives you the freedom to move and migrate. Ultimately, weaning of from a third party domain towards one you own is above all a matter of going
through the pain of cutting out all dependencies, one account, one platform and one service at a time.

Taking stock of this challenge and deciding how to move forward, well, that's for another time.
