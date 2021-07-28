---
layout: post
title:  "Learning Go"
date:   2021-07-28
categories: languages programming
render_with_liquid: false
---
I started out learning [Go](golang.org/) a few months ago. Go is a statically typed, compiled programming language. Go is syntactically similar to C, but with memory safety, garbage collection, structural typing and CSP-style concurrency. I tried picking up C in my early 20s, but I never got the hang of it and, like many others, I ended up switching between dynamically typed, interpreted / JIT compiled languages such as  Ruby, PHP, Perl, Python, JavaScript.

While the aformentioned languages have served me well, I've encountered limits of each of them. Either it's their lacking type system or run-time efficiency or something else. Those shortcomings tend to become more or less pronounced depending on the type of problem I'm working on.

Over the past years, my career has been steadily moved from strictly building Web applications towards data engineering. And technology has evolved as well. Today, I'm mostly looking for tools that allow me to efficiently build robust and performant systems for data processing and delivery. And Go fits that bill for me.

Go was developed in 2007 at Google by Rob Pike, Ken Thompson and Robert Griesemer taking into account the criticisms on other languages, while keeping their useful characteristics. Its design is focussed on (a) run time efficiency, (b) readability and usability and (c) high performance networking and multiprocessing.

Go applications are blazingly fast. Not just because it's a compiled, statically typed language, but the entire thing is designed for speed to bottom. A big feature is concurrency in Go via goroutines which doesn't just refer to parallel processing but also asynchronous processing. Go's concurreny is inspired by Erlang but the existence of channels sets it apart again.

A great real world example of Go's performance is [esbuild](https://esbuild.github.io/), a JavaScript bundler written in Go.

The language itself only gives you a terse, almost spartan, set of constructs, while ommitting features such as function overloading (variadic functions partly cover this, but at the expense of losing type checking) or even polymorphism (Go favors composition). Go enforces you to construct your logic in an explicit, imperative programming style. Personally, I feel that the enforced terseness does lead to succinct, readable code.

Go's lack in language features is made up by it's [standard library](https://pkg.go.dev/std) offering many affordances such as HTML templating, HTTP networking, logging and so on which are part and parcel in networked environments.

Mark McGranaghan's [Go By Example](https://gobyexample.com/) has been a very useful resource in taking my first introductory steps into Go. Today, Alan Donovan & Brian Kernighan's [Go Programming Language](https://www.gopl.io/) was in the mail. I bought it as a physical book so I can use it as a reference work while exploring Go.