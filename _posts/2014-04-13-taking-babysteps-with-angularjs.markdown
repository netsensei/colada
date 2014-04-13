---
layout: post
title:  "Taking baby steps with AngularJS"
date:   2014-04-13 19:40:00
categories: Javascript
comments: true
---
I've been joining the AngularJS bandwagon lately. Why? Because modern browsers and devices can do so much more besides merely rendering static HTML. And client side frameworks are excellent companions for processig raw server side API output. Here's what I've come to learn.

Of late, I've been wielding AngularJS on the job and in my side projects. In fact, I've whipped up a first small project: [Belgian Rail Liveboards](http://netsensei.github.io/angular-br-liveboards/) It's a directive you can use in your own projects. Once added, it will show a departure liveboard as shown on large screens around Belgian railway stations. The data is fetched real time from the [iRail open data API](http://data.irail.be/).

So, what are the take away's from doing this side project?

**Easy to get started, hard to learn**

It's easy to step into Angular. The [PhoneCat tutorial](http://docs.angularjs.org/tutorial) is a great starting point. [Egghead.io](https://egghead.io/) condenses most information in easy to grok videos.

While documentation is in abundance, you can easily lose track. The API has evolved rapidly so you should beware of outdated information.

You get the most out of Angular in combination with tools like Grunt, NodejS and Bower. Articles and tutorials might be terse or assume you have already partly taken steps to setup and configure your environment. Also, there is more then one way to get these tools to work together. Laying documentation side by side can add to your confusion.

You want to build a more complex app? Modelling a consistent folder structure becomes crucial if you want to maintain your sanity. Seed projects can be helpful, but deciding which one to pick can be challenging. Take a bit of extra time to try and compare them and go with the one which suits your use case best.

I went through several trail-and-error experiences while grokking documentation and setting things up. But don't let that put you off.

**Front end unit testing is awesome**

I gained a lot from investing in learing about automated tests. I've added the [Karma](http://karma-runner.github.io/0.12/index.html) unit test runner to my project. It supports several testing frameworks. I decided to go with [Jasmine](http://jasmine.github.io/). Boy, was I pleasantly surprised to see how easy it has become to write front end unit tests.

I've also toyed a bit with [Protractor](https://github.com/angular/protractor), Angulars' own E2E (end-2-end) testing framework. I'm going to write a follow up on that since it took me a bit of effort to get this going on my laptop.

**Easy integration with backend services**

The [$http service](http://docs.angularjs.org/api/ng/service/$http) is Angulars' hidden power house. It allows you to connect with whatever external source available. It relies on a [promise/deffered](http://docs.angularjs.org/api/ng/service/$q) implementation that makes Angular handle asynchronous, non-blocking calls as non other.

The [$resource factory](http://docs.angularjs.org/api/ngResource/service/$resource) is built on top of $http and abstracts the last complexities of dealing with REST api's away.

[David Mosher](http://blog.davemo.com/) has done an excellent [screencast on end-to-end with AngularJS and Laravel](http://blog.davemo.com/posts/2013-05-21-end-to-end-with-angularjs.html) that shows off how to hook up Angular with a popular backend framework.

Will I venture further with frameworks like Angular? Yes!

As a Drupal developer, trying to build complex forms and experiences while solely relying on the Drupal API has caused my fair share of headaches. I've unleashed Angular on a few use cases and I'm amazed how fast it allowed me to build what used to be hard to implement features. Front end frameworks also hugely tone down the amount of complex PHP logic you'll write to deal with things like validation, keeping track of state, etc.

The [next major version](https://drupal.org/drupal-8.0) will be especially well equiped to deal with these new tools.

The most important take away? Getting to know these new tools is important regardless of your role in your team/company. They are obvioulsy here to stay.

