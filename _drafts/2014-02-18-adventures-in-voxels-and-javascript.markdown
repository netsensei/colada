---
layout: post
title:  "Adventures in voxels and Javascript"
date:   2014-02-24 10:00:00
categories: Javascript
comments: true
---
A few weeks ago, I decided to try out something completely different: a foray in javascript and gaming. Colleague [@frankbaele](http://twitter.com/frankbaele)  spent the better part of last year tinkering with JavaScript and basic game development. Pretty much inspired, I decided to try and do the same.

## Javascript

As a Drupal backend developer, writing PHP covers the better part of my working days. Despite its' shortcomings, I've come to like PHP. But because its' a server side preprocessing language, PHP's application domain is kinda limited. Javascript isn't that secluded. With the advent of such technologies as NodeJS and advanced browser capabilities, it has proven to be a very versatile tool.

While working on this site over the fall of last year, I've tinkered with JavaScript tangently. I've experimented with [GruntJS](http://www.gruntjs.com) and implemented the odd JQuery helper plugin.

So, I got a taste to venture a bit further.

## VoxelJS

As your average teenager, I was drawn to immersive 3d environments. I spent countless hours in the virtual worlds created by the great game development studios of the day.

Starting out in game development isn't easy. Building a game is very complex undertaking. However, there are enough frameworks and kits out there to get started quickly.

Minecraft became one of the most successful indie games of the last years. Small wonder that several Javascript developers ported the basics to a [ThreeJS](http://threejs.org) based gaming engine called [VoxelJS](voxeljs.com).

A Voxel engine is based on the concept modelling the world in voxels or volume pixels. The math is pretty specific, but VoxelJS abstracts the hardest part in an easy to understand API. The original authors' original intention was to create a learning experience.

On a free saturday afternoon a few weeks ago, I followed [Shama's 10 minute tutorial](https://www.youtube.com/watch?v=khWOLOL2SzA) getting VoxelJS up and running. After an hour of toying, I was roaming around in mmy own 3d world.

First thing I hacked together was my own terrain generator. The tutorial uses the [perlin-terrain-generator](https://github.com/maxogden/voxel-perlin-terrain) which uses the Perlin noise algorithm to generate a basic heightmap. I tinkered with the code to get a feel for how things work and finally came up with my own extremely expensive flat terrain generator.

<img src="/assets/media/voxeljs.png" alt="Voxel JS" />

At the moment, I'm toying with sprites and sprite support. It was surprisingly easy to wield the [ThreeJS SpriteMaterial class](http://threejs.org/docs/api/materials/SpriteMaterial.html) and get it to work with VoxelJS. Writing an optimal implementation which includes atlas support, is the real challenge here.

## What's next?

I've barely scratched the surface. There's a loads more out there. I don't really have a game plan beyond exploring the API and see what I can do with it. My current thinking direction involves visualization of available open data sets. It sounds like a cool idea to take data from public instances, repurpose them in a 3D environment and come up with an element of gamification.

So far, it's been refreshing to look what else is out there. However, the vote is still out how far I'm going to pursue this little experiment.

