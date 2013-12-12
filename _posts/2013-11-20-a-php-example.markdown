---
layout: post
title:  "A PHP example!"
date:   2013-11-20 22:32:00
categories: php
---

You'll find this post in your `_posts` directory - edit this post and re-build (or run with the `-w` switch) to see your changes!
To add new posts, simply add a file in the `_posts` directory that follows the convention: YYYY-MM-DD-name-of-post.ext.

{% highlight php %}
<?php

function mymodule_custom_image_ds_field($field) {
  $show = field_get_items('node', $field['entity'], 'field_show_image');

  if ($show[0]['value'] == TRUE) {
    $image = field_get_items('node', $field['entity'], 'field_image');
    if (!empty($image)) {
      $variables = array(
        'style_name' => 'square_thumbnail',
        'path' => $image[0]['uri'],
      );

      return theme('image_style', $variables);
    }
  }
}

{% endhighlight %}

Check out the [Jekyll docs][jekyll] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll's GitHub repo][jekyll-gh].

[jekyll-gh]: https://github.com/mojombo/jekyll
[jekyll]:    http://jekyllrb.com
