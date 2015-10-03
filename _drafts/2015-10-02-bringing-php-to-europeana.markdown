---
layout: post
title:  "Bringing PHP to Europeana"
date:   2014-02-07 20:00:00
categories: PHP Europeana
comments: true
---
Over the past couple of months, I have been steadily working on several personal experiments that use cultural data made published by the Europeana project. Over the past few days, I released most of my code as open source on Github. Here's my story of implementing their API.

In february, I landed a job as a data conservator for the Flemish Art Collection. No longer being a full time Drupal developer, I am now working with cultural heritage data curated by several large Flemish art historic museums.

What is Europeana? It's a project that wants to create a pan-european digital library that disseminates our digitized cultural heritage. Over the past decade, a large network of cultural institutions that provide digital cultural data to Europeana, was established. Today, the library contains over 40 million references to images, documents, sounds and video. And it's all accessible via the Web.

In march, I attended an Europeana Tech workspace event in Brussels. At that event, the Europeana API and several project implementing the API where presented. The attendees were invited to start leveraging the API. Given my background as a historian with hands-on programming experience: the API caught my attention.

## The idea

I noticed that a modern, versatile integration of the API in PHP wasn't readily available. So, after some deliberation, I decided to embark on writing the necessary tools myself and releasing them as open source for others to re-use.

The project would consist of two parts. First, I'd focus on writing a generic API library in PHP. It would contain a set of classes and functions that abstracted all the boilerplate of dealing with a REST API. Using the library, a developer should only have to focus on buildng application specific functionality instead of having to figure out how to communicate with the API.

Secondly, as soon as my library would get in a usable state, I would start writing a few example implementations. The challenge here would be finding compelling use cases that reuse data from the API.

## An API library in PHP

After a summer of steady work, mainly during my daily commute and in evening hours, I released a workable PHP library that implements the API. You can find the source code on Github (http://github.com/netsensei/europeana) and if you use Packagist, a package manager for PHP, downloading the library to your project is as easy as issuing a composer require colada/europeana command.

The library features:

* PSR-4 & PSR-2 compliant.
* Uses Guzzle as a HTTP client, but can be interchanged via a generic Client interface.
* Abstracts the API to a high level 'transport - payload - response' model.
* JSON de/serialization via JMS Serializer
* Supports PHP 5.4 and up.
* PHPUnit tested.

When setting out, the main challenge was finding an architectural model that would scale well while I implemented each API call and all the properties. The Slack API library built by Cas Leentfar fitted that bill perfectly. With his permission, I repurposed the foundations of his library and adapted them so that I could send requests to and parse responses from the Europeana API.

When implementing an API, you also - almost by default - validate the API documentation. You'll notice discrepancies between the documentation and the behaviour of the API pretty quick. I reached out to the foundation via the Europeana API list or via mail when I had encountered parts that where undocumented or didn't behave the way they were documented. They were very accomodating answering my questions and giving me feedback.

## The implementations

As soon as the library entered a usable state, I decided to build a few experimental applications that would validate


