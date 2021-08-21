---
layout: post
title:  "Writing a Gopher client"
date:   2021-08-21
categories: gopher smolweb
render_with_liquid: false
---
A few months ago, I landed on this article titled [Gopher, Geminin and the smol internet](https://thedorkweb.substack.com/p/gopher-gemini-and-the-smol-internet). I was aware of this part of the Internet which lives primiarly in text, terse protocols and pubnix servers. But now I became genuinely interested. As I was picking up Go, I was keen to start a new greenfield sideproject. I decided to write a [Gopher](https://en.wikipedia.org/wiki/Gopher_(protocol)) client.

So, over summer, I've been steadily churning out code. The Gopher protocol itself is dead easy to understand. The actual [RFC 1436](https://datatracker.ietf.org/doc/html/rfc1436) comes in at 16 pages. Ommitting the parts describing server implementations, you'll need to read even less build a client. Since, Gopher uses on TCP port 70, you can just connect to any server with plain curl:

```bash
$ curl gopher://gopher.floodgap.com
$ curl gopher://circumlunar.space
$ curl gopher://dimension.sh
```

Gopher is a precursor to the Web. It's hypertext modeled as menus which contain lists of links to binary files, text files and other menus, all of which residing on the local server or a remote server. Navigating through menus, you essentially browse from one server to the next through this interlinked web of pages. The difference with the Web is that there are almost no moving parts. No markup, no styles, no media. The lithe plain text nature of Gopherspace is a breathe of fresh air compared to the mainstream Web.

Rather then using [Lynx](https://lynx.browser.org/) or other, existing browsers, building and dogfooding my own Gopher client has been really great fun so far. It's been a long while since I started a personal coding project, and so this is clearly an awesome fit for me.

So far, I've got the basics implemented:

* A terminal UI with a statusbar, navigation bar and view area. I'm using [tview](https://github.com/rivo/tview).
* Support for SUB and TXT items.
* Gopher Search. You can search with engines like Veronica-2.
* History: allowing you to navigate backward and forward through visited items.

Here are some other features which I might / will implement:

* Persistent configuration (so you can set your own gopher server as a startpage)
* Support for binary items (e.g. images)
* Displaying history
* Bookmarks
* Support for TLS, gopher+
* Spidering / downloading gopher items

Once I'm done with Gopher, I might decide to move on towards adding support for [Gemini](https://gemini.circumlunar.space/) as well.

Coming from backend development for Web applications, building a text-based browser while I'm learning a programming language is an experience which takes me out of my comfort zone. Go's syntactic succinctness allowed me to start going quite easily, but the big challenge right now is figuring out good architectural patterns. While early re-factoring is typically not recommended, I've noticed myself revisiting parts of the code, re-shuffling things, as I gain a better understanding of what I'm building.

I'll publish the project on Github once things have matured a bit more.