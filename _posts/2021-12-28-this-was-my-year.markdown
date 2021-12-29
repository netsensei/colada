---
layout: post
title:  "This was my year"
date:   2021-12-28
render_with_liquid: false
---
Well, 2021 is drawing to a close. I want to take some time and look back. A lot has changed in my personal life pulling me away from the keyboard in more ways then I thought would happen at the start of the year. At the same time, I'm surprised how much I did achieve.

**Learning Go**

At work, we decided to work towards [Go](https://go.dev/) because of it's built-in concurrency, large standard library and it's many optimizations for building cloud native applications. Starting to learn Go was a big achievement this year. I've barely scratched the surface at this point, but I will be using Go for many things for a long time to come. That much is certain.

**Picking up HTMX**

Another technology we started to use at work is [htmx](https://htmx.org/). It's a library that leverages HTML as true hypertext. It allows you to asynchronously change parts of a webpage by sending HTML fragments over the wire. As a result, application state as well as business logic as kept on the server. This results in a far less heavy and complicated client application running in the browser.

I'm quite excited about this technology. Unless your web application tries to approximate the user experience of a native application, it's worth considering whether using technologies geared towards single-page applications (SPA's), like Vue or Angular, are a good fit.

**Building a Gopher client**

I build a fully fledged, basic [Gopher](https://en.wikipedia.org/wiki/Gopher_(protocol)) client in Go. In fact, I build it several times over picking up new technologies each time. At this point, I have a basic application build on top of tview. However, I did hit limits in terms of available time to keep on building and learning in 2021. Also, tview itself feels limiting in and of itself.

I'm considering to rebuild the application once more using the [Bubbletea TUI framework](https://github.com/charmbracelet/bubbletea). My hope is to move forward and add features like bookmarks, file downloads, better error handling, a decent status bar and so on.

**Containerization**

Work also got me a taste of containerization through [Docker](https://www.docker.com/). In 2021, I got a lot of opportunities to learn the in's and out's of the Dockerfile, Docker Compose, Docker Swarm and so much more. I remember dipping my toes into this stuff back in 2015, and not quite understanding the benefits. Today, I feel containerization is the best thing since sliced bread.

**A home server**

I bought an Intel NUC 8i3BEH at the end of 2020. I toyed with it at the start of 2021, installing [Proxmox](https://www.proxmox.com/en/) and mucking about with Docker containers from [linuxserver.io](https://www.linuxserver.io/) as well as Ansible.

My initial use case was building a storage solution for a growing, amorphous blob of files I've been calling my personal archives. I ended up deviating from that path, partly because a clear approach on how to handle files didn't crystalize in my mind, and on the other hand because the files I wanted to archive needed quite some time sorting and curating first.

And so, the NUC has been sitting powered down on my desk for the majority of the past year. I'm currently taking time to clean out the files I want to archive first.

Meanwhile, I'm considering how to setup the NUC in a way to act as a NAS with some power features. I'm thinking about installing [PhotoPrism](https://photoprism.app/), [Syncthing](https://syncthing.net/) and [Rclone](https://rclone.org/). The one thing I'm missing is a workflow orchestrator which does some processing of files I upload to the NUC. I'm currently eyeing [temporal](https://temporal.io/) which I need to try out first.

**This blog**

I rebooted this blog. It was a nice project to do over Easter. It didn't take that long to chuck out the old code, upgrade Jekyll and give the site a new theme. Doing so also helped me write a bit more on here. Not as much as I liked, but a lot more then I did before. I hope to continue that in 2022.

By contrast, my [lifelog](https://www.netsensei.be/) saw very few updates in 2021. In august, I [wrote](https://www.colada.be/on-moving-away-from-wordpress.html) about the pain of maintaining a installation and the complexity that has been added over the years to the overall authoring experience. At this point, I'm considering migrating the entire thing towards a static site generator like [Hugo](https://gohugo.io/).


Writing all of this down, I'm surprised about how much I still managed to accomplish in 2021. At any rate, I hope to find more focus and move these personal projects forward in 2022. And share my experiences with you, dear reader, on this blog.