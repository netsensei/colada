---
layout: post
title:  "The Translated Entity Reference module"
date:   2014-01-15 20:00:00
categories: Drupal Internationalization
comments: true
---
A few weeks ago, I ran into an issue with the [Entity Reference](http://drupal.org/project/entityreference) module and the [Internationalization](http://drupal.org/project/i18n) suite. A client with a project featuring content in multiple languages, wanted the autocomplete widget only to show suggestions in the active language. On the surface, this didn't look like an exceptional request, but the process to devise a good solution became quite interesting.

The problem starts with the autocomplete field widget which comes with the Entity Reference module. An editor begins typing a few letters, and the autocomplete suggests a list of possible matches. However, in a multilanguage setup, the default autocomplete selection widget, doesn't filter those suggestions based on active language or the parent's language. As a result, the autocomplete shows all matches regardless of language.

In most cases, this is just an annoyance. It becomes a real issue if the referenced items are named things. Like persons, movie titles, places,... A biography node titled "Max Planck" will have the same node title in French as well as in Dutch. The default autocomplete widget will show both items. Obviously, this is confusing for editors. Moreover, they risk referencing nodes with differing languages.

You could solve this problem by using the views selection mode instead. This plugin builds the autocomplete list using Views. You just have to create an extra view with a language filter. This approach appeared a bit cumbersome to me. Instead, I wanted to see if the autocomplete suggestions themselves could be fixed.

Based on a [patch](https://drupal.org/node/1462766) posted in the Entity Reference issue queue, I wrote a new contrib module: [Translated Entity Reference](http://drupal.org/project/translated_entityreference) This module brings an easy to apply fix for this problem.

In the following screencast, I show you the issue, how the module is used to fix this and explain how I the fix was implemented.

<iframe width="560" height="315" src="//www.youtube.com/embed/HrnWHSr0gSA" frameborder="0" allowfullscreen></iframe>

I hope this module is useful. Thank you for feedback or contributing patches in the [issue queue](https://drupal.org/project/issues/translated_entityreference).
