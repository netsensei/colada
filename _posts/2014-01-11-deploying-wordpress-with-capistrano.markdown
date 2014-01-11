---
layout: post
title:  "Easily deploy WordPress with Capistrano and Composer"
date:   2014-01-11 20:00:00
categories: WordPress Capistrano Composer
comments: true
---
Over the past decade, I've been writing my personal lifelog on
[netsensei.be](http://www.netsensei.be). I started out using [Movable Type](http://movabletype.org/) but switched to [WordPress](http://www.wordpress.Org) soon after. Deployment of updates has always been a nagging problem. I went through the painstaking motions using FTP, SCP and other tools. Oftentimes, I would forego an upgrade because the process of ugprading was just too time consuming.

As the release cycle of WordPress upgrades has shortened, I can't afford missing out on security releases, however, I don't want to lose more time then strictly necessary.

So, I set out to look for a better way of maintaining WordPress upgrades. A viable solution had to answer to these requirements:

* Minimize time spent moving files around
* Integrate seamlessly with git and my [Linode VPS](https://www.linode.com/)
* Preferably be as terse as a one line command
* Be secure (no FTP!)
* Be maintainable and well documented
* Doesn't require learning a specific meta language just to get going

## Connecting the dots

I started scouring the Web after people facing the same challenge. A few search queries on Google and I ended up with these two inspiring articles:

* [Deploying WordPress with Git and Capistrano](http://www.mixd.co.uk/blog/deploying-wordpress-using-git-and-capistrano/) by Aaron Thomas.
* [Using Composer with WordPress](http://roots.io/using-composer-with-wordpress/) by Scott Walkinshaw.

It was pretty easy to connect the dots and bring a new project to life: [Pressto](https://github.com/netsensei/pressto). It's a boilerplate for new and existing WordPress projects and makes WordPress, Capistrano and [Composer](http://getcomposer.org/) work together.

## Composer

Packaging tools are invaluable for any ecosystem being it Ruby, JS or PHP. The [Composer](http://getcomposer.org/)  tool has become a great workhorse to manage third party libraries. Instead of forking a third party library or framework into your own project and
suffering the maintenance of it, [Composer](http://getcomposer.org/)  manages the dependency for you.

WordPress is no exception. I no longer wanted to curate a fork of the codebase in my own project. Scott's article shows how Composer can do the heavy lifting for you.

## Capistrano

Then there's deploying a changes between environments. Git and [Capistrano](http://capistranorb.com) are perfect to get the job done. I've moved the codebase of my blog to a private BitBucket account and created 'develop', 'staging' and 'production' branches.

When deploying, you should try to avoid excess manual work. Executing 5 or 10 shell commands manually is cumbersome at best. Automation is key if you want to avoid mistakes and save time.

[Capistrano](http://capistranorb.com) is a deployment tool written in Ruby which does just that. It allows you to define common household tasks using an extension of the Rake DSL.

I chose Capistrano because:

* It's easy to set up
* You don't need to learn an extra language (contrary to Chef or Puppet)
* Allows you to do rollbacks to previous rolled out versions
* It's extendable with your own or third party plugins

Aaron's article drives you through the setup. Beware though, his article targets Capistrano 2.0. Version 3.0 is now downloadable and brings several notable changes.

## Pressto

[Pressto](https://github.com/netsensei/pressto) brings [Composer](http://getcomposer.org/) and [Capistrano](http://capistranorb.com) together. The idea is that your project does not contain the full WordPress codebase anymore. There are only a composer.json and a composer.lock file. They describe which version of WordPress should be installed with the project. The [capistrano/composer extension](https://github.com/capistrano/composer) will fire [Composer](http://getcomposer.org/) remotely during deployment. And WordPress gets installed without you ever having to overwrite, commit or maintain a fork in your own projects' codebase.

Upgrading WordPress becomes a breeze:

1. Open the composer.json file and change to the WordPress version you want to install.
2. Run `composer update` locally to update the composer.lock file
3. Commit and push both composer.json and composer.lock file
4. Run `cap production deploy` to deploy the update remotely.
5. Open your site in a browser, login and perform any pending database updates.

Typical project specific files are normally contained within WordPress' wp-content/ folder. However, WordPress allows you [to move those files to a separate place](http://codex.wordpress.org/Giving_WordPress_Its_Own_Directory) in your file system. Pressto keeps all project specific files in a separate app/ folder while WordPress itself is downloaded and installed in a wp/ folder.

## Download

You can download [Pressto from GitHub](https://github.com/netsensei/pressto). Feedback, pull requests,... are welcome.

