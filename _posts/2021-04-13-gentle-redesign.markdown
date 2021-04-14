---
layout: post
title:  "Gentle redesign"
date:   2021-04-14
categories: website
---
I've let this website languish over the past years. The design was old and the content got stale. Lately, I took some time off from work over Easter. One year into the pandemic, how that time gets spend is still restricted. Over the past weeks, I made it a point to work on a personal projects.  And so, here we are. I find myself giving this website a due amount of attention.

I gave the site a fresh design and modernized the entire frontend code. I chose a lightweight retro aesthetic with a focus on readibility. The color scheme is taken from <a href="https://github.com/morhetz/gruvbox">Gruvbox</a> which is popular in terminals and vim. I also use Gruvbox for syntax highlighting. The font of the headings is <a href="https://fonts.google.com/specimen/IBM+Plex+Mono">IBM Plex Mono</a>.

I moved away from Thoughtbot's <a href="https://github.com/thoughtbot/bourbon">Bourbon</a > towards <a href="https://getbootstrap.com">Bootstrap 5</a>. Relying on what Bootstrap provided out of the box allowed me to write almost no custom SCSS. Overriding Bootstrap was mostly a matter of overriding variables. Back in 2014, compiling SCSS was non-trivial and so I used <a href="https://gruntjs.com/">Grunt</a> to manage the heavy handed transpiling pipeline. These days, <a href="https://jekyllrb.com/docs/assets/#sassscss">Jekyll includes proper SCSS compilation</a>.

I still use <a href="https://jekyllrb.com/">Jekyll</a> and <a href="https://pages.github.com/">Github Pages</a>. I briefly considered moving towards other static site generators such as <a href="https://gohugo.io/">Hugo</a>, but I didn't feel like there was added benefit to be found in doing so. 

In an age of privacy concerns, I decided to drop the Disqus comments and not replace them with an alternative. I feel it's no longer fitting to farm out comment hosting towards an untrusted third party. Moreover, since I live in Europe, there are legal considerations as well. I also feel that hosting online discussions is a courtesy which comes with consierable obligations on the part of the host. Providing the possibility to leave comments should be done sparingly.

In the same vain, I have replaced embeded content with hyperlinks to hosted locations and I removed a stale Google Analytics tracker.

Having done all this, I'm ready to go on this journey once more.

If you would like to reach out, you can find my contact details on the <a href="/about.html">about me</a> page.