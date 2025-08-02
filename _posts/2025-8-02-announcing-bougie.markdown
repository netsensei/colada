---
layout: post
title:  "Announcing Bougie, a terminal browser for the smolweb"
date:   2025-08-02
render_with_liquid: false
---
Some years ago, I experimented with [Gopher](/writing-a-gopher-client.html) in the wake of the rising Small Web movement at the time. In the past few weeks and months, I picked those experiments back up, as a hobby project. This resulted in Bougie, a simple terminal browser which will support the [Gopher](https://en.wikipedia.org/wiki/Gopher_(protocol)), [Gemini protocol](https://geminiprotocol.net/) and [Finger](https://en.wikipedia.org/wiki/Finger_(protocol)) protocols.

So far, I've completed these features:

* A friendly UI with easy keyboard based navigation
* Support for the Gopher protocol
* Tracking browsing history
* File downloads
* Flexible configuration

Adding support for Gemini and Finger is on the roadmap. I also plan to add support for bookmarking. And maybe customizable theming. The goal is building a text based browser that's intuitive and simple to use, so I'm going to refrain from adding too many features.

Bougie is written in Go and leverages the [Charmbracelet's](https://charm.land/) [Bubbletea framework](https://github.com/charmbracelet/bubbletea), with [Bubbles](https://github.com/charmbracelet/bubbles) and [Lipgloss](https://github.com/charmbracelet/lipgloss). When I started out, I picked the [cview TUI toolkit](https://codeberg.org/tslocum/cview), but I felt it was lacking in terms of messaging and event handling. In the past few years, Bubbletea became the go-to framework for TUI app builders. The [Elm architecture](https://guide.elm-lang.org/architecture/) is easy enough to understand, yet powerful and flexible to build complex UI's.

My main motivation for writing Bougie is just building something cool, and learning new concepts in the process. Like, how to build a TUI based application, how the terminal actually works, or how to automate and manage a build, package and release cycle with tools like [goreleaser](https://goreleaser.com/).