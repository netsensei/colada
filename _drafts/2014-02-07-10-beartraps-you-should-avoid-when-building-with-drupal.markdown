---
layout: post
title:  "10 beartraps you should avoid while building with Drupal"
date:   2014-02-07 20:00:00
categories: Drupal Internationalization
comments: true
---

Sooner or later, you'll inherit a project build by someone else. Although we
build projects using the same framework foundations, each project comes with
its' own idiosyncracies. Rolling into an existing project means exploring what'sbehind the backdrops. Oftentimes, that's where the shadow of technical debtlooms. Seemingly innocuous requests, are far more challenging to realize than first meet the eye. You'll repeatedly stubmle upon common errors and strings of bandaids, quick fixes and workarounds. Before long, you might end up having to admit defeat as budget spins out of control and client expectations are not met. So, is there a way to get around this? Or do we have to suck it up?

Leon Fayer succinctly points out in ["You're code might be elegant, but mine f*****n works"](http://omniti.com/seeds/your-code-may-be-elegant) that the problem of technical debt is related to the lack of understanding business value and the contstraints within which we have to get stuff out of the door. It's all about striking a balance between building a workable, maintainable technical solution and fitting in the alotted time and budget.

This rings even more true within the context of the consulting business where there's even less margin to catch up on technical debt. It takes a few years before one masters this delicate balancing act.

## The problem with Drupal

The problem with Drupal is that it provides plenty of opportunity to shoot
yourself in the foot. The framework is infamous for it's steep learning curve and there's usually more then one way to build a feature.

1. Module shopping
5. Abuse site building tools (Views, Display Suite,...)
8. Abuse configuration export tools (Features,...)
9. Ignore basic security practices
2. Business logic in the theming layer
6. Ignore coding standards
7. Ignore the Drupal API's (reinvent the wheel)
4. Add PHP in the database
3. Hack core and/or contrib
10. Don't reïnvent the wheel


