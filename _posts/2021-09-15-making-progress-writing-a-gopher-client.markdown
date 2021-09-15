---
layout: post
title:  "Making some progress writing a Gopher client"
date:   2021-09-15
categories: golang
render_with_liquid: false
---
Late last month, I had hit that point where the architecture of my Gopher client was really bugging me down. Implementing a search form modal, for sending queries to search servers like Veronica-2, turned out to be really painful. I had kind of shied away from looking at other browsers like [Amfora](https://github.com/makeworld-the-better-one/amfora) because I didn't want to make a straight up clone of an existing application.

Since this was my very first application with a somewhat complex terminal user interface, I caved and decided to dig into Amfora anyway. Turned out I was overcomplicating things, trying to do way too much with structs and struct methods where just regular functions sufficed.

I spend the last three weeks taking cues from Amfora while refactoring large parts of the code. Last night, I had revived most of the existing functionality in a new, more flexible architecture. I was also able to throw away several code smells left and right. The new architecture reduced some aspects that needed re-implementing into one or two lines of code.

I'm quite happy overall since what I build isn't Amfora. This experience affirms once more that learning from other people's code does pay dividends.