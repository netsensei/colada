---
layout: post
title:  "Building a simple Jekyll site with Bootstrap"
date:   2021-04-15
categories: jekyll bootstrap website
render_with_liquid: false
---
This is a really simple website build with Jekyll and Bootstrap. I mentioned in my previous blogpost how I wrote almost no SCSS code to implement the design. Relying on Bootstrap proved to be a boon. Here's how I did it.

Let's create a clean Jekyll site from scratch in a directory called `bootstrap`. These commands will scaffold a skeleton site in the `bootstrap` directory. You get some content, `_config.yml`, `Gemfile` and a `Gemfile.lock` files. The `_site` directory contains your generated site.

```bash
$ jekyll new bootstrap
$ bundle exec jekyll serve
```

Navigate to http://localhost:4000 and you will see your new site.

Notice how everything is nicely themed in your browser. There's a `_site/assets/main.css` file which contains all the styling. This defaul ttheme is called "Minima" However, moving to the root of your project, there's no reference to any templates or CSS. So, where does this theming come from? Jekyll pulls the entire theme from a separate Ruby gem during site generation.

You can easily pull up information about the theme via the `gem` command:

```bash
$ gem info minima
*** LOCAL GEMS ***

minima (2.5.1)
    Author: Joel Glovier
    Homepage: https://github.com/jekyll/minima
    License: MIT
    Installed at: /home/netsensei/.rbenv/versions/2.7.3/lib/ruby/gems/2.7.0

    A beautiful, minimal theme for Jekyll.
```

The <a href="https://jekyllrb.com/docs/themes/">Jekyll documentation</a> tells us that there are two ways of implementing a theme: as a separate gem, and as an integral part of a Jekyll project. You can also use a Gem theme and then override parts of the theme in your jekyll projects.

Our site will have a Bootstrap based theme, so we need complete control over both CSS as well as adding Bootstrap specific classes to the HTML. In this example, we are going to copy the templates from Minima and add Bootstrap specific classes as we go. 

```bash
$ cd bootstrap
$ cp -r /home/netsensei/.rbenv/versions/2.7.3/lib/ruby/gems/2.7.0/gems/minima-2.5.1/_layouts .
$ cp -r /home/netsensei/.rbenv/versions/2.7.3/lib/ruby/gems/2.7.0/gems/minima-2.5.1/_includes .
```

Overriding the CSS is easy: create an `assets/css` directory, add a `main.scss` file.

```bash
$ mkdir -p assets
$ touch assets/main.scss
```

The contents of the `main.scss` file should contain an empty Liquid front matter denoted as two consecutive lines with triple dashes and a single import statement.

```scss
---
---
@import "mytheme";
```

This SCSS file will import the `mytheme.scss` file from the `_sass` directory. While the `main.scss` file is the entry file used by Jekyll to convert the SCSS to CSS, the `mytheme.scss` file is the specific entry file for our own Bootstrap based theme. The `sass` compiler follows all the `import` statements in the SCSS and processes all SCSS files.

```bash
$ mkdir _sass
$ touch _sass/mytheme.scss
```

When you reload / rebuild your site via `bundle exec jekyll serve`, the entire theming disappears in your browser. This means that the Jekyll uses our own empty `mytheme.scss` SCSS file rather then Minima's `minima.scss` provided by the Gem.

Let's get Bootstrap's source files, unpack the `scss` directory from the ZIP file and put the files it contains in a `_sass/bootstrap` directory:

```bash
$ cd _sass
$ curl -L -O https://github.com/twbs/bootstrap/archive/v5.0.0-beta3.zip
$ unzip v5.0.0-beta3.zip "bootstrap-5.0.0-beta3/scss/*"
$ mv bootstrap-5.0.0-beta3/scss/ bootstrap
$ rmdir bootstrap-5.0.0-beta3
```

Moving on, wiring up Bootstrap in our theme is pretty straightforward. Add this import statement to your `mytheme.scss` file and reload the page. You should already see things change as Bootstrap's default typography and baseline CSS kicks in.

```scss
@import "bootstrap/bootstrap";
```

The above statement will import the entirety of Bootstrap. But the modularity of Bootstrap allows you to <a href="https://getbootstrap.com/docs/5.0/customize/sass/">only import selected bits</a> of the framework.

Let's change a few templates to add back some of the styling / theming. We'll use Bootstrap's components and classes. A deep dive of Bootstrap itself is beyond the scope of the article. But comparing the original template with Bootstrapped template should make it fairly clear how things are integrated.

_includes/header.html:
{% raw %}
```html
<header class="site-header mb-3" role="banner">
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    {%- assign default_paths = site.pages | map: "path" -%}
    {%- assign page_paths = site.header_pages | default: default_paths -%}
    <div class="container-md">
      <a class="navbar-brand" rel="author" href="{{ "/" | relative_url }}">{{ site.title | escape }}</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          {%- for path in page_paths -%}
            {%- assign my_page = site.pages | where: "path", path | first -%}
            {%- if my_page.title -%}
            <li class="nav-item">
              <a class="nav-link" href="{{ my_page.url | relative_url }}">{{ my_page.title | escape }}</a>
            </li>
            {%- endif -%}
          {%- endfor -%}
        </ul>
      </div>
    </div>
  </nav>
</header>
```
{% endraw %}

_layout/default.html:
{% raw %}
```html
<!DOCTYPE html>
<html lang="{{ page.lang | default: site.lang | default: "en" }}">

  {%- include head.html -%}

  <body>

    {%- include header.html -%}

    <main class="page-content" aria-label="Content">
      <div class="container-md">
        {{ content }}
      </div>
    </main>

    {%- include footer.html -%}

  </body>

</html>
```
{% endraw %}

_layout/home.html:
{% raw %}
```html
---
layout: default
---

<div class="home">
  {%- if page.title -%}
    <h1 class="page-heading">{{ page.title }}</h1>
  {%- endif -%}

  {{ content }}

  {%- if site.posts.size > 0 -%}
    <h2 class="post-list-heading">{{ page.list_title | default: "Posts" }}</h2>
    <ul class="post-list list-unstyled">
      {%- for post in site.posts -%}
      <li>
        {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
        <span class="post-meta">{{ post.date | date: date_format }}</span>
        <h3>
          <a class="post-link" href="{{ post.url | relative_url }}">
            {{ post.title | escape }}
          </a>
        </h3>
        {%- if site.show_excerpts -%}
          {{ post.excerpt }}
        {%- endif -%}
      </li>
      {%- endfor -%}
    </ul>

    <p class="rss-subscribe">subscribe <a href="{{ "/feed.xml" | relative_url }}">via RSS</a></p>
  {%- endif -%}

</div>
```
{% endraw %}

_includes/social.html:
{% raw %}
```html
<ul class="list-unstyled social-media-list">
  {%- if site.github_username -%}<li><a href="https://github.com/{{ site.github_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> <span class="username">{{ site.github_username| escape }}</span></a></li>{%- endif -%}
  {%- if site.twitter_username -%}<li><a href="https://www.twitter.com/{{ site.twitter_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/minima-social-icons.svg#twitter' | relative_url }}"></use></svg> <span class="username">{{ site.twitter_username| escape }}</span></a></li>{%- endif -%}
  <ul>
```
{% endraw %}

_includes/footer.html
{% raw %}
```html
<footer class="site-footer h-card">
  <data class="u-url" href="{{ "/" | relative_url }}"></data>

  <div class="wrapper container-md">

    <h2 class="footer-heading">{{ site.title | escape }}</h2>

    <div class="row">
      <div class="footer-col col-4">
        <ul class="list-unstyled contact-list">
          <li class="p-name">
            {%- if site.author -%}
              {{ site.author | escape }}
            {%- else -%}
              {{ site.title | escape }}
            {%- endif -%}
            </li>
            {%- if site.email -%}
            <li><a class="u-email" href="mailto:{{ site.email }}">{{ site.email }}</a></li>
            {%- endif -%}
        </ul>
      </div>

      <div class="footer-col col-4">
        {%- include social.html -%}
      </div>

      <div class="footer-col col-4">
        <p>{{- site.description | escape -}}</p>
      </div>
    </div>

  </div>

</footer>
```
{% endraw %}

Regenerating the site and reloading the page should show you a Jekyll site which doesn't look all that bad. Let's customize the site a bit by adding our own SCSS to `mytheme.scss`. Here's a big tip:

**Don't directly override Bootstrap SCSS selectors with your own custom SCSS.**

Bootstrap is a complex framework. Overriding the default selectors out of the box with custom SCSS will make it very hard to debug and maintain your code later on. Upgrading to next versions of Bootstrap will be real pain. There's two ways of customizing and ammending Bootstrap:

* Overriding the variables in `_sass/bootstrap/_variables.scss`.
* Adding your own CSS clasess wich will isolate your own custom CSS tweaks from Bootstrap.

Tweaking the variables is easy. The <a href="https://getbootstrap.com/docs/5.0/customize/sass/#maps-and-loops">documentation</a> points you in the right direction on how to do this. 

Let's replace the default color scheme with the <a href="https://github.com/morhetz/gruvbox">Gruvbox color scheme</a>. I've chosen to override the basic colors themselves, instead of using the `$theme-colors` map.

I need to declare and initialize the variables before I import Bootstrap:

_sass/mytheme.scss:

```scss
// Needed because Gruvbox colors aren't optimized for legibility.
$min-contrast-ratio: 2;

$white:    #fbf1c7 !default; // 229 fg0
$gray-100: #ebdbb2 !default; // 223 fg1
$gray-200: #d5c4a1 !default; // 250 fg2
$gray-300: #bdae93 !default; // 248 fg3
$gray-400: #a89984 !default; // 246 fg4
$gray-500: #928374 !default; // 245 gray
$gray-600: #7c6f64 !default; // 243 bg4
$gray-700: #665c54 !default; // 241 bg3
$gray-800: #504945 !default; // 239 bg2
$gray-900: #3c3836 !default; // 237 bg1
$black:    #282828 !default; // 235 bg0

$blue:    #458588 !default; // 66 blue
$indigo:  #b16286 !default; // 132 purple
$purple:  #d3869b !default; // 175 purple
$pink:    #fb4934 !default; // 167 red
$red:     #cc241d !default; // 124 red
$orange:  #d65d0e !default; // 166 orange
$yellow:  #fabd2f !default; // 214 yellow
$green:   #98971a !default; // 106 green
$teal:    #b8bb26 !default; // 142 green
$cyan:    #83a598 !default; // 109 blue

@import "bootstrap/bootstrap";
```

There are many more variables you can override. Just take a look in `_sass/bootstrap/_variables.scss` to figure out what you need.

There are still times when you need to write your own custom SCSS. The social media icons in the footer of the site are a great example. These ar SVG objects. Minima gave them a height and width of 16 by 16 pixels. We need to re-introduce that CSS if we want to fix the layout of the icons.

Let's do just that after importing Bootstrap. We use our own project specific class `.svg-icon` instead of repurposing a Bootstrap class.

_sass/mytheme.scss
```scss
.svg-icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    fill: #828282;
    vertical-align: text-top;
}
```

Bootstrap comes with a ton of utility classes, a Grid framework, helpers, components,... There's a set of classes that implements `flexbox` so you don't have to write your own custom class with a `display: flex` attribute. Just use the `d-flex` class from Bootstrap. Project specific classes should be used sparingly for those edge cases.
 
We still haven't installed Bootstrap's Javascript library. If we want some functionality like modals and popups to work, we have to download that and install it as well. Let's do just that.

```bash
$ mkdir assets/js
$ cd assets
$ curl -L -O https://github.com/twbs/bootstrap/archive/v5.0.0-beta3.zip
$ unzip v5.0.0-beta3.zip "bootstrap-5.0.0-beta3/dist/js/bootstrap.bundle.min.js"
$ mv bootstrap-5.0.0-beta3/dist/js/bootstrap.bundle.min.js js/
$ rm -rf bootstrap-5.0.0-beta3
$ rm v5.0.0-beta3.zip
```

Let's include the Javascript library in the footer of the site.

_includes/footer.html
```html
<footer>
    ...
</footer>
<script src="{{ "/assets/js/bootstrap.bundle.min.js" | relative_url }}"></script>
```

At this point, you should have caught the gist and be able to keep on building and expanding your Jekyll site. You can create an intricate page architecture using just Bootstrap classes and minimal SCSS tweaks and changes, combined with Jekyll's powerful templating.

Even so, this approach does come with a few limitations. We heavily rely on Jekyll's pipelining to generate our CSS which is rather slow. We also haven't added any custom JavaScript yet. Modern frontend tools such as <a href="https://webpack.js.org/">Webpack</a> are a preferred choice once you want to move on to more complex setups. But that's beyond the scope of this article. The approach outlined in this article is perfect for simple websites which only require a minimal setup.