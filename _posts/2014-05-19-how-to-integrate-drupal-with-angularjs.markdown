---
layout: post
title:  "How to integrate Drupal with Angularjs"
date:   2014-05-19 20:00:00
categories: Drupal AngularJS
comments: true
---
Is it easy to expose data stored in Drupal and use it in a web application? Of course it is! But how do you make Drupal and AngularJS play nice together? I decided to record an introductory screencast that answers this question.

Over the past few months, I've come to love the power of Angular and how easy it makes development. A big grievance I have with Drupal is that it tries to deal with a lot of frontend functionality from a backend perspective. A typical example is a list with exposed filters. On a basic site, using what Views offers out of the box is great, but in a larger, more complex setup, you're likely to end up writing a lot of custom PHP code to bend things the way you want them. The asynchronous approach of Angular reduces the responsibility of the backend to a more fitting size: exposing data stored in Drupal via flexible API's. Handling the rendering of filters, multistep forms, etc. is offloaded to Angular.

Earlier this month, I attended a Drupal User Group, hosted at the XIO offices in Ghent. One of the highlights of the evening was a talk by [@frankbaele](http://www.twitter.com/frankbaele) about integrating Drupal, Solr and AngularJS. It was great to see Frank succintly demonstrate the power and flexibility of this approach. (See: [screencast](https://www.youtube.com/watch?v=sRva9hleFXY) - beware: in Dutch)

I felt that a very introductory screencast that just focusses on the integration itself, would be a great addition. So, without further ado:

<a href="https://www.youtube.com/watch?v=p3zSQieBIe8">Watch the screencast on YouTube</a>.

The gist of this screencast:

I'm building an AngularJS app from scratch. The data is exposed by Drupal via Views and [Views Datasource](https://drupal.org/project/views_datasource) modules. I use the [AngularJS](https://drupal.org/project/angularjs) module and [Grunt](http://gruntjs.com) to build a custom app which displays a list of nodes.
