---
layout: post
title:  "Implementing the Europeana API in PHP"
date:   2015-10-05 9:00:00
categories: PHP Europeana
comments: true
---
Over the past couple of months, I have been steadily working on several personal experiments that reuse cultural data made published by the [Europeana project](http://www.europeana.eu). Over the past few days, I released most of my code as open source on [Github](https://github.com/netsensei/europeana). Here's my story about implementing the [Europeana API](http://labs.europeana.eu/api).

In february, I landed a job as a data conservator for the [Flemish Art Collection](http://flemishartcollection.be/). No longer employed as a full time [Drupal](http://drupal.org) developer, I'm now working in the domain of [digital humanities](https://en.wikipedia.org/wiki/Digital_humanities) with a strong focus on management and online dissemination of museum data like objects registration records and all related information.

## What is Europeana?

[Europeana](http://www.europeana.eu) wants to create a pan-european digital library that disseminates a combined corpus of our digitized cultural heritage. Over the past decade a large network of cultural institutions that provide digital cultural data to Europeana, was established. Today, the library contains over 40 million references to images, documents, sounds and video provided by about 2,000 institutions. Most of this material is accessible via the Web.

In march, I attended an [Europeana Tech](http://pro.europeana.eu/structure/europeana-tech) workspace event in Brussels. [Europeana Labs](http://labs.europeana.eu), the [Europeana API](http://labs.europeana.eu/api) and several accompanying projects were presented there. As the API and the published data are to a large extent geared towards reuse, I got intrigued. How usable is the API? Does it allow me to query for relevant information? Is it possible to build meaningful applications on top of it?

## The idea

I noticed that a modern, versatile integration of the API in PHP wasn't readily available. [This project](https://github.com/dan-nl/europeana-api) makes a fair attempt, but lacks documentation, unit tests and publication via [packagist](https://packagist.org/). So, after some deliberation, I decided to embark on writing the necessary tools as a side project and releasing them under an open source license.

The project would consist of two phases. First, I'd focus on writing a generic API library in PHP. It would contain a set of classes and functions which abstracts all the boilerplate of dealing with a REST API away. The library should be heavily geared towards reusability: write once, use many times. Using the library, a developer should only have to focus on building application specific functionality instead of having to figure out how to communicate with the API.

Secondly, as soon as the library would get in a usable state, I would start writing a few example implementations. The challenge here would be finding compelling use cases that reuse data from the API.

## An API library in PHP

Last week, I released a usable PHP library that implements the API. The source code is available on [Github (http://github.com/netsensei/europeana)](http://github.com/netsensei/europeana) and if you use [Packagist](https://packagist.org/packages/colada/europeana), downloading the library to your project is as straightforward as issuing a <code class="ihl">composer require colada/europeana</code> command or adding it as a dependency in your composer.json.

Features:

* [PSR-4 & PSR-2](http://www.php-fig.org/psr/) compliant.
* Uses [Guzzle](https://github.com/guzzle/guzzle) as a HTTP client, but can be changed to other implementations via a generic Client interface.
* Abstracts the API to a high level 'transport - payload - response' model.
* JSON de/serialization via [JMS Serializer](http://jmsyst.com/libs/serializer)
* Supports PHP 5.4 and up.
* [PHPUnit](https://phpunit.de/) tested.

When setting out, the main challenge was finding an architectural model that would be maintainable while I implemented each API call. The [Slack API library built by Cas Leentfar](https://github.com/cleentfaar/slack) fitted that bill perfectly. With his permission, I repurposed its' foundations and adapted them so that I could send requests to and parse responses from the Europeana API.

When implementing an API, one inevitably validates the API documentation. You'll notice discrepancies between the documentation and the behaviour of the API pretty quick. I reached out to the Foundation via the Europeana API list or via mail when I had encountered parts that where undocumented or didn't behave the way they were documented. They provided valuable feedback.

## Applications

As soon as the library entered a usable state, I switched to building a few experimental applications. I had two main goals here: validating that my library is architecturally sound from an application point of view and creating something that's actually useful.

I created:

* A PHP based, command line integration which queries the Europeana API.
* A set of primitive interfaces in a [Laravel](http://laravel.com) based custom application.
* An integration of the API with [The Datatank](http://thedatatank.com).

Currently, the last project got released on Github.

## Europeana via The Datatank

[The DataTank](http://thedatatank.com) is a RESTful data management system written in PHP5. It acts as a customised datahub that enables publishing several data formats into web readable formats. In other words: The Datatank allows you to create your own REST API endpoints. The application can be extended with custom readers called installed resources.

I developped an [installed resource](http://docs.thedatatank.com/5.6/installed) which queries limited datasets from the Europeana API and publishes them as JSON, XML or PHP. The Datatank acts as a proxy for the Europeana API and allows you to set up a custom API point for your own specific purposes. The current state of the project enables data providers to create dedicated endpoints through which they can open up their specific datasets.

What are the benefits of this approach? This lower the bar for targetted reuse of Euroepana data. It allows data providers to easily isolate and publish specific subsets via their own endpoint. The burden of communicating with the Europeana API, shifts from consumer applications to the Datatank proxy. Removing that kind of complexity makes it easier to build case-specific applications.

As requested datasets are cached by The Datatank, client applications are less dependent on the availability of the Europeana API itself: if the endpoint is temporarily unavailable, the data can still be requested from The Datatank cache. Of course, application consumers should be wary of outdated cached data, if ingests with updated records happen at high frequency intervals at the Europeana side.

The code and acompanying documentation can be found on [Github at https://github.com/netsensei/TdtEuropeana](https://github.com/netsensei/TdtEuropeana).

## What's next?

The PHP library is still a work in progress. There are  parts of the API that need to be implemented or improved (ie. making the transport adhere to [PSR-7](http://www.php-fig.org/psr/psr-7/)), there's a lack of basic documentation and unit testing is not yet complete. I'm currently working on those three fronts.

If you decide to use the library in your own projects, please file bug reports and feature requests in the issue queue.
