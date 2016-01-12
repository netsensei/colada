---
layout: post
title:  "Decoupled Drupal: a couple of considerations"
date:   2016-01-10 20:00:00
categories: Drupal
comments: false
---
Over the past few months, Dries has posted a series of blogposts about decoupled Drupal culminating in [Selecting a client-side framework for Drupal](buytaert.net/selecting-a-client-side-framework-for-drupal). He explores the impact of decoupling frontend from the backend architecture alltogether via Javascript and webservices. Here are a few of my own thoughts on the subject.

Somewhere in 2011, I took over the maintance of the [Commerce Product Display Manager](https://www.drupal.org/project/commerce_product_display_manager) module. It allows you to manage product display entities associated with products in [your webshop](https://drupalcommerce.org/) (think: multiple sizes of a particular t-shirt, icecream flavours and the like) This is actually an expontential problem: the UI is suited for a small webshop (say 10 products, 3 displays each) but as soon as you're trying to maintain a larger warehouse (say 20.000 products, 25 displays each) the UI won't be as helpful.

This was already [an issue](https://www.drupal.org/node/1178160) nearly 5 years ago. With the advent of frameworks like Backbone and Angular, I considered a complete rewrite of the module leveraging those frameworks. It would have meant rebuilding the module and adding a decoupled interface.

I ended up not pushing through with this idea. Here's why:

1. Over the past 4 years, projects on the side were at an overall low because of other priorities in my life.

2. Because of the lack of a contemporary JS framework in core, I would have had to choose a framework myself (Angular!) and bootstrap it from the module. That meant risking conflicts if some other 3rd party module would do the same with another framework.

3. It meant diving into Javascript or at least finding someone willing to join me. At the time, I suffered from [quite a lot of anxiety](http://www.colada.be/the-agony-of-choice.html) about having to put a stake in a language I wasn't very proficient in while these technologies were evolving at a mindboggling pace.

4. It seemed that every week, the next best thing was - [and still is](http://www.isaacchansky.me/days-since-last-new-js-framework/) - popping up. Frontend has been the Wild Wild West for the past 5 years. I wasn't motivated to build a UI only to tear it down again 6 months later.

5. The D7 module would still need to do a lot of the heavy lifting behind the web services that feed a decoupled interface. [Experience in other projects](https://www.youtube.com/watch?v=p3zSQieBIe8) thaught me you generally end up writing your own biased, idiosyncratic API which doesn't match up well with others. This is what projects like [GraphQL](https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html) want to solve.

6. I'm a firm believer of accessibility and progressive enhancement. With only so much free time, I didn't see how I could deliver an inclusive experience.

And so, the discussion of a decoupled interface for Drupal is, in my view, much needed. Here are a few short key points I want to make:

1. Incorporating a client-side JS framework: yes. Pulling in NodeJS on the server side: no! This is not the same Javascript as one would write for the frontend. It would only add more cat herding to a an already complex stack of technologies. Furthermore, we should consider alternatives within the PHP realm such as [ReactPHP](http://reactphp.org/) or even aim ahead of the curve and go with HTTP/2. Also, we let's not forget that tuning websockets security- and performancewise can be a challenge:  ([Same Origin Policy, anyone?](https://gist.github.com/subudeepak/9897212)).

2. All good things come measured. I don't think decoupling the entire frontend from the backend and encapsulating it into a single page app is a good idea. To my mind, this equals raising a separate silo that requires it's own specific domain knowledge to be maintained. This is exactly what [WordPress' Calypso](https://developer.wordpress.com/calypso/) ultimately is: a decoupled webbased frontend running inside an [Electron](http://electron.atom.io/) powered desktop app. Instead, I believe that we should deconstruct our current, complex UI's (Views, Display management, Filtered tables,...) and turn them into reusable, decoupled components. This is what [Web Components](http://webcomponents.org/) ([Polymer](https://www.polymer-project.org/1.0/)!) are all about. Definitely take a look at this [Guide to Web Components](https://css-tricks.com/modular-future-web-components/) to learn more.

3. Drupals' success is the moldability of it's data structures through fields and entities. But that's only part of the story. The other part is that modules like Display Suite and Panels have brought that same moldability to the presentation of content through finegrained layout control. Those modules where a breathe of fresh air, but with each complex project, I felt we stretched their capabilities and the value they added when it came to saving time managing complex configurations. In a decoupled world, the door is open to rethink how we approach managing content and display. [Jeffrey Zeldman lately pointed out that even today, separation of structure and style is still par for the course](http://www.zeldman.com/2016/01/05/13913/). There is a huge opportunity here to redefine the balance of control over layout between editors, site builders an developers.

4. I've spent many years with Drupal because of its' excellent developer experience. Building a website with Drupal is a breeze. In recent years, our profession has seen rapid specialization. A 'web developer' as such seemingly doesn't exist anymore. This specialization comes at a cost: building a functioning cross disciplinary team is hard. As we are ushered into an era of decoupling, a seamless developer experience through unified API's upholding a frictionless collaboration between frontend and backend specialists will be a key asset for Drupal. The larger question here is: can we create comprehensible API's that make it possible for a single developer to still build and maintain modules? Or, more sharply put, will module building inevitably evolve into a team based activity as we throw decoupled interfaces into the mix?

5. Building accessible web experiences through web standards is a plight that is important to me. [Dries already raised a few concerns here](http://buytaert.net/the-future-of-decoupled-drupal). In the WordPress community, [a similar discussion is going](http://glueckpress.com/7131/progressive-enhancement/). Mike Little, one of the leaders of the community, makes a [fair point](https://mikelittle.org/thoughts-on-progressive-enhancement-and-accessibility/): we should not forget that our efforts are not solely for the sake of technology nor revenue. We build first and foremost for people. When we are talking about web experiences, we should be talking about inclusive experiences. The complexity which comes with decoupled interfaces should not be an excuse to turn our attention away from that.

6. Given all those points, selecting the "right" framework to include in core isn't the biggest challenge. At this point, the discussion largely revolves around [market research](http://buytaert.net/selecting-a-client-side-framework-for-drupal). The options that are on the table all have their pro's and con's. Personally, I've had most experience with Angular 1.x. But seeing how the world of frameworks is currently in flux: YMMV. Much as we staked our future on JQuery a decade ago, regardless of our analysis, our choice will ultimately be, in part, a leap of faith.

7. As we add decoupling, we will need the support and the traction of the community to incorporate these new API's. This means: providing enough documentation and guidance to the pave the road towards broader acceptance.

I'm closing on the same note as [_nod](http://read.theodoreb.net/2016/drupal-gets-feature-request-out-of-the-blue.html) did: [Let's grab some paint and decorate that bikeshed](https://www.drupal.org/node/2645250).



