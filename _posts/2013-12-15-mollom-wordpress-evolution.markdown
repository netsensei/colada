---
layout: post
title:  "Mollom for WordPress 2.0: Evolution"
date:   2013-12-15 22:19:14
categories: jekyll update
---
Over the past couple years, I’ve been working on and off on the integration between [Mollom](http://www.mollom.com) and [WordPress](http://wordpress.org). Today, I proudly present you [the release of the second version of the plugin](http://wordpress.org/plugins/mollom). Nearly 4 years in development, the plugin has been completely re-architected. It contains many improvements and new features below and above the hood:

*   Optimized spam filtering by using Mollom’s latest REST API
*   User-friendly integration of secure CAPTCHAs in your project
*   Better handling of false-positives
*   Fending off human spammers through a network-wide reputation system
*   Advanced moderation through Mollom’s Content Moderation Platform (mollom.com/moderation)
*   … and much more!

If you’re interested in a feature overview: check out the blog of [Daniel ‘Sun’ Kudwien](http://daniel.kudwien.net/2013/07/stop-blog-spam-on-wordpress/).

» Download and install the [Mollom plugin from WordPress’ Plugin Directory](http://wordpress.org/plugins/mollom).

## Why did it take so long?

Well, let’s go back in time. For me, this project started happenstance. I was fed up with spam on my [WordPress blog](http://www.netsensei.be). [Automattic](http://automattic.com) had just released their [Akismet](http://akismet.com) spam filtering service, but spammers still managed to pollute my moderation queue. Around the same time, Dries released a first beta of a similar service called Mollom. It came with basic [Drupal integration](http://drupal.org/project/mollom). I was interested and that very same day, I started working on a WordPress plugin. As time passed, this project became a way to scratch my own itch, contribute something back and have a great learning experience.

While I work together with the people at Mollom, I’ve never been affiliated with the company as an employee or paid freelancer. I’m still an independent third party developer doing this voluntarily after office hours. As such, this had an impact on the development process. Instead of a continuous effort, work progressed in series of spikes.

### The lack of second opinions

As its sole developer, there were times when I had to take some distance from the project from time to time to keep perspective and focus. Today, I’ve come to recognise that I lacked a good soundboard: someone whom I can throw ideas at and hand me feedback. Daniel ‘Sun’ Kudwien has been involved in the rewrite over the last year. As a seasoned developer and core contributor for the Drupal project, his fresh view on things pushed the project in the right direction.

Testimony of this is [his proposed changeset](https://github.com/Mollom/wordpress-mollom/pull/25) which contained a radical different view on the architecture of the plugin. It was an eyeopener. It painfully showed me I had been working on this for too long without proper mentoring. I recognised that this code was the way to go, and so I accepted his code merely a day later.

### Catching up on evolving APIs

Initially, Mollom’s API was XML-RPC based and contained only several core API calls. In the first months of development, I got a chance give feedback on mismatches between documentation and what the API actually did. While this first version was good enough to get started, it was not durable. For one, there was a complex server failover system which had to be implemented client-side in case the service was unavailable. And so, Mollom developed a proper [REST API](mollom.com/api) which came with a few fundamental changes to reduce complexity.

At that time, I came to a conclusion that the first version of the plugin wasn’t sustainable either. The plugin was functional, but not maintainable: integrating minor API changes, let alone the new REST API, was not feasible. A complete rewrite of the plugin was in order. Separating the client implementation of the API in PHP from any framework or application specific code became an important milestone. I ended up writing my own generic class which implemented the API. Around that time, Dries came to the same conclusion and opened up an issue in the [Drupal module issue queue](https://drupal.org/node/446994). It was important to get this right for the Drupal module as well as the WordPress plugin. Today, both are leveraging the same [independent PHP class](https://github.com/Mollom/MollomPHP). This is a big plus since management of changes in the Mollom API now happens in a flexible, loose-coupled fashion.

### Building on top of a legacy application

WordPress itself proved to be a major hurdle. Although the system has evolved and expanded, it still contains quite a lot legacy code as it’s geared towards backward compatibility. The core focus of WordPress has always been to provide an easy-to-use blogging platform. As a result, the core architecture hasn’t changed much over the past decade.

A typical application specific characteristic is its rather monolithic build: major subsystems are only partly decoupled. While Drupal has a fully fledged centralized Form handling API, WordPress does not. In fact, it just sanitizes and replaces all user input before database storage, exposing none of the original user input. We had to work our way around this and substitute our own form handling for Mollom to play nicely. Because of the decentralized handling of forms, we were only able to target WordPress’ comment system for now.

WordPress also doesn’t keep track of state between different subscribed event callback executions. In other words, data added to an object in the pre_process_comment action gets lost before entering the comment_post action. Almost 5 years ago, as a rookie, I tried to [solve this problem through global variables](http://wordpress.org/support/topic/issue-with-global-variables).

### Missing a collaborative development platform

Development of the first version started out on a Subversion repository hosted on wordpress.org. Over those years, the WordPress developer platform sadly didn’t make the same transitions as with [GitHub](http://github.org) or [Drupal.org](http://drupal.org). The platform lacks transparency needed for any collaborative project. That’s why I moved to GitHub nearly three years ago.

Today, all development happens over at [GitHub](https://github.com/Mollom/wordpress-mollom). All collaboration happens remote so a good platform which fosters teamwork, sharing of information, documentation, issues, code,... is a key factor in driving evolution. However, through git hooks we’re still pushing releases to the [subversion repository at wordpress.org](http://wordpress.org/plugins/mollom) since that’s still the authoritive repository where WordPress installations get their updates.

### Shifting personal priorities

Several major changes happened in my personal life in the span of a few years. I moved a few times around, lived in different cities, bought and refurbished an apartment, changed jobs,... Finally, a few months ago, I moved in with my girlfriend and her 6 year old daughter. Although I love building stuff online, those changes shaped my outlook on life and the way I’m spending time today.

## So, what’s next?

With a new major version out of the door, we can look forward towards new challenges to tackle.  Here’s a few things we’ll be considering:

Extend support towards other WordPress core forms. Our experience with Drupal learned us that spammers also target open registration forms, mass generating bogus accounts. Blocking those in a sensible way is an important challenge. We’ll also investigate other third party form generating plugins such as [Contact form 7](http://wordpress.org/plugins/contact-form-7/).

The REST API contains more settings and protective measures than currently exposed to the end user. We’ll be looking at how to make relevant features of the API also available.

We’ll dedicate time to maintain this new version. This means fixing bugs and adding small improvements wherever possible. The idea is to push minor releases on a regular basis.

Receiving feedback from an active user base is important to any open source project. If you’re stumbling upon undiscovered bugs or problems, we invite you to submit a ticket in our [GitHub issue queue](”https://github.com/Mollom/wordpress-mollom/issues?state=open”). We also invite you to clone and try out the development code in our repository.

With your help, we hope to rid the world of spam allowing you to create better quality content.
