---
layout: post
title:  "Dependency injection in Symfony"
date:   2014-09-30 20:00:00
categories: Symfony development
comments: false
---
Some time ago, I started venturing into the Symfony project. With Drupal 8 having Symfony components at its' core, this is the right time to start exploring.

As PHP has made vast strides into improving OOP support over the past years,  frameworks such as Symfony are leveraging all that functionality. And with them, new ways of building things are being adopted.

One of the core concepts that drive Symfony is Dependency Injection (DI) or Inversion of Control (IoC). It's the glue that binds all those loose coupled components into your application. It gives you tremendous power.

In this article, I'm not going to bother with the theoretical background. If you want to understand how Dependency Injection works, the [first two parts of Fabpot's series](http://fabien.potencier.org/article/11/what-is-dependency-injection) provide a great introduction.

While searching for clues on how DI and Dependency Injection Containers (DIC) are used, I missed a easy-to-understand practical example. So, I'm going to show you how it works in a working, functional Symfony application.

## The Airlines application

The application we are building will provide us with a custom terminal comamnd wich will fetch a [list of airlines from a remote JSON file](http://demo.thedatatank.com/openflights/airlines) and show them in a formatted table on the command line.

You can find the [example code on GitHub](https://github.com/netsensei/airlines).

The application itself consists of a few components:

* The application code.
* The Guzzle library component.
* The Symfony Command component.
* The Dependency Injection component.

We'll use [Composer](https://getcomposer.org/) to download and install all the necessary packages.

## Setting the stage

Let's create a new project folder and add a <code class="ihl">composer.json</code> file.

{% highlight bash %}
mkdir airlines
touch composer.json
{% endhighlight bash %}

Add this to the composer.json file:

{% highlight json %}
{
    "name": "colada/airlines",
    "description": "Fetch and list all the available airlines",
    "license": "MIT",
    "authors": [
        {
            "name": "Matthias Vandermaesen",
            "email": "matthias@colada.be"
        }
    ],
    "minimum-stability": "dev",
    "require": {
        "symfony/console": "~2.5",
        "guzzle/guzzle": "3.9.2",
        "symfony/dependency-injection": "~2.5",
        "symfony/config": "~2.5",
        "symfony/yaml": "~2.5"
    },
    "autoload": {
        "psr-0": {
            "": "src/"
        }
    }
}
{% endhighlight json %}

Let's take a look at the <code class="ihl">require</code> property. The <code class="ihl">symfony/console</code> and <code class="ihl">guzzle/guzzle</code> entries refer to the libraries our application is going to leverage to define a new terminal command and make HTTP calls. The <code class="ihl">symfony/*</code> entries refer to the packages we are going to need to make DI happen.

The file describes all the packages the application will need. Now let's go install them.

{% highlight bash %}
composer install
{% endhighlight bash %}

Alternatively, you could use <code class="ihl">composer init</code class="ihl"> to create a composer.json file and <code class="ihl">composer required</code> to fetch and add those packages.

You should end up with a <code class="ihl">vendor/</code> folder containing all the libraries we've specified in the composer.json file.

## Bootstrap the application

Now let's go and create the actual application itself. We start with writing our bootstrapping code. This code will bootstrap all the components, load everything and kick things off.

Let's make a new <code class="ihl">app/</code> folder inside your application folder and create a <code class="ihl">console</code> file within that folder. The file should be executable as we will execute it directly from the command line.

{% highlight bash %}
mkdir app
touch app/console
chmod +x app/console
{% endhighlight bash %}

Open the console file in your editor and add these lines of code:

{% highlight php %}
#!/usr/bin/env php
<?php

/*
 * This file is part of the Airlines package.
 *
 * (c) Matthias Vandermaesen <matthias@colada.be>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// set to run indefinitely if needed
set_time_limit(0);

// Set the default timezone
date_default_timezone_set('Europe/Brussels');

// This line includes the Composer autoloader. An autoloader will automatically
// register, find and load PHP files found via PHP namespaces and the PHP 'use'
// statement. Autoloaders and packages that support autoloading, generally
// implement the PSR-0 and PSR-4 standards.
require_once __DIR__ . '/../vendor/autoload.php';

// Import the classes of the Dependency Injection component we'll use.
// The Service Container or Dependency Injection container is provided by the
// dependencyInjection component from the Symfony Project.
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

// Generate a new container object. This will hold all our dependencies.
$container = new ContainerBuilder();

// Create a new file loader object. Decorate it with the container and tell it
// to find YAML files in the /config folder. Those will be read and used by
// the containerbuilder object to create a new container object.
$loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/config'));

// Load the /config/services.yml file. This file registers all the classes
// this project uses and defines all their dependencies.
$loader->load('services.yml');

// This is the first time we use the container. Get an instance of the
// airlines.main service from the container and return it as a usable object.
$main = $container->get('airlines.main');

// Call the run() method of object of type \Colada\Airlines\Main
$main->run();
?>
{% endhighlight php %}

The comments should be self explanatory. Note that the code is going to load of a file called <code class="ihl">services.yml</code> which can found in the <code class="ihl">app/config</code> folder. This file does two specific things:

* It registers all the project specific classes
* It defines all the classes/libraries these classes depend on.

The other noteworthy thing are the last two lines. First, an instance of the <code class="ihl">airlines.main</code> service, which is defined in the YAML file, is being instantiated, and then its' <code class="ihl">run()</code> method is invoked which will set the entire application in motion.

## Defining dependencies between components

Let's take a look at that YAML file. From the project root, create a new folder and add the <code class="ihl">services.yml</code> file.

{% highlight bash %}
mkdir app/config
touch app/config/services.yml
{% endhighlight bash %}

Now let's add this into the file:

{% highlight yaml %}
services:
  airlines.main:
    class: Colada\Airlines\Main
    arguments: ['@console.application', '@airlines.airlines']
  airlines.airlines:
    class: Colada\Airlines\Airlines
    calls:
      - [setHttpClient, ['@guzzle.client']]
  console.application:
    class: Symfony\Component\Console\Application
  guzzle.client:
    class: Guzzle\Http\Client
{% endhighlight yaml %}

This YAML structure represents the internal wiring of our application. It defines which classes should be instantiated and how those classes should be injected - via constructor or setter method - into each other. Another way of reading this file is considering it as a graph representation of class dependencies.

The entry point of our application, defined in our <code class="ihl">app/console</code> file, is an instance of type <code class="ihl">Colada\Airlines\Main</code> which takes instances of the <code class="ihl">Symfony\Component\Console\Application</code> and <code class="ihl">Colada\Airlines\Airlines</code> types as constructor arguments. The <code class="ihl">Colada\Airlines\Airlines</code> instance in turn gets an instance of <code class="ihl">Guzzle\Http\Client</code> as a constructor argument.

Now, the beauty of the system is that **you don't need to worry about the entire instantiation juggling part**. The dependency container will automatically takes care of that for you by autoloading all the necessary classes and injecting them into each other on runtime.

Now, we still need the code for the <code class="ihl">airlines.*</code>services. Let's create a new folder for the application specific code.

{% highlight bash %}
mkdir -p src/Colada/Airlines
touch src/Colada/Airlines/Main.php
touch src/Colada/Airlines/Airlines.php
{% endhighlight bash %}

Then copy the code from the [Airlines.php](https://github.com/netsensei/airlines/blob/master/src/Colada/Airlines/Airlines.php) and [Main.php](https://github.com/netsensei/airlines/blob/master/src/Colada/Airlines/Main.php) files on Github and paste it into those files.

## The dependency injection container

Now, resolving the entire dependency tree at runtime would be too expensive. Instead, we'll instantiate a specific PHP object which stores and manages all the instances based off a class which has all the dependencies hard coded.

This is called the container.

In simple applications, you could easily write your own container class. in larger applications, generating the code based on a configuration file is far more efficient approach.




