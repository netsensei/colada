---
layout: post
title:  "Template suggestions and Panels panes"
date:   2012-12-02 20:00:00
categories: Drupal
---
Although it comes with a steep learning curve, Drupal's Theme API is a wonderful piece of engineering. Once you master the basics of theming functions, templates and their preprocessors and how to wield them in your own custom theme, you're golden. Template suggestions are a particular feature that might require a while before you can wrap your head around them. In this article, I'll explore the basic concepts behind them and I'll take it up a notch by showing you how to use them in combination with Panels.

## So, what are template suggestions?

It's a part of the system that allows you to define variations on an existing template without actually having to create the corresponding template files. This gives a front end engineer even more granular control when overriding templates. The most straightforward examples are the ones provided for the <a href="http://drupal.org/node/1089656">node.tpl.php</a> template. You can create variations based on the node type, using a template which targets an entire node type, or node id, a specific template for a specific node.  Those variations are defined in <em>template_preprocess_node()</em> and look like this:

```php
<?php
function template_preprocess_node(&$variables) {
  // ... [snip] ...
  $variables['theme_hook_suggestions'][] = 'node__' . $node->type;
  $variables['theme_hook_suggestions'][] = 'node__' . $node->nid;
}
?>
```

These lines define variations on the base template in your own custom theme:

1. node.tpl.php
2. node-1234.tpl.php
3. node-article.tpl.php

If a visitor lands on example.com/node/1234, the node-1234.tpl.php template will be used instead of the base template. When a node of type article is displayed, the node-article.tpl.php will be used during rendering.

The awesome part about this system is that I can easily define a new variation in my custom theme. I just have to override <em>template_preprocess_node()</em> in template.php and I'm set to create new suggestions. Suppose I want to create a template variation targetting nodes created by a specific user 1234, then I'll just add this function to my template.php file:

```php
<?php
function mytheme_preprocess_node(&$variables) {
  $node = $variables['node'];
  $variables['theme_hook_suggestions'][] = 'node__user_' . $node->uid;
}
?>
```

Now I can create specific template in my custom theme: node--user-1234.tpl.php.

See what I did there? I didn't do a verbatim copy/paste of the existing function. I merely created a new template preprocess function and added it to my template.php. Why? Because Drupal will still execute the original template_preprocess_node() function and pass the $variables variable by reference to any variations in the template.php of active (sub)themes! It's important to remember that. As a consequence, the other template suggestions will still be available since we haven't actually overwritten them.

## Should I use this technique?

Of course, overriding templates very quickly becomes cumbersome in any project of notable size. You'll easily end up with an unmanageable pile of overridden templates. Moreover, overriding templates comes with a performance penalty. Tools like Display Suite and Panels have made life much easier when it comes to controlling output.  A Drupal Developer worth their salt should prefer either one of those instead of simply overriding templates.  So, why should you use this technique? Because even so, sooner or later you'll end up overriding a template anyhow. When you're working on a project with a responsive output which has to cater to any kind of (mobile) device. And in those cases, you'll most likely need to target a very specific case. Knowing how to do this can be a huge timesaver.

## How about Panels?

Although Panels and CTools allow one to do away with the intricacies of template files, they still use a few base templates to render panes. The generic <em>panels-pane.tpl.php</em> template that comes with Panels, is a prime candidate to be overridden. It's not well documented, but it comes with a few template suggestions:

```php
<?php
function template_preprocess_panels_pane(&$vars) {
  $content = &$vars['content'];

  // ... snip ...

  // Set up some placeholders for constructing template file names.
  $base = 'panels_pane';
  $delimiter = '__';

  // Add template file suggestion for content type and sub-type.
  $vars['theme_hook_suggestions'][] = $base . $delimiter . $content->type;
  $vars['theme_hook_suggestions'][] = $base . $delimiter . strtr($content->type, '-', '_') . $delimiter . strtr($content->subtype, '-', '_');

  // ... snip ...

  $vars['content'] = !empty($content->content) ? $content->content : '';
}
?>
```

This is taken from the panels.module file and when under close scrutinization, you'll see that you can create templates based on pane type and/or pane subtype! Like this:

1. panels-pane.tpl.php
2. panels-pane--type.tpl.php
3. panels-pane--type-subtype.tpl.php

So if you want to target only the panel panes generated by custom panes you should create a template <em>panels-pane--custom.tpl.php</em>.

Of course, if you're an intrepid developer, you're know probably thinking: I should be able to override <em>template_preprocess_panels_pane()</em> and add template suggestions. Overriding the preprocessor in your own template.php like this should do the trick:

```php
<?php
function mytheme_preprocess_panels_pane(&$vars) {
  $content = &$vars['content'];

  // Set up some placeholders for constructing template file names.
  $base = 'panels_pane';
  $delimiter = '__';

  // Add template file suggestion for content type and sub-type.
  $vars['theme_hook_suggestions'][] = $base . $delimiter . $content->type;
}
?>
```

Alas, you're out of luck. The <em>$content</em> variable isn't an object in your copy of that function: it's a string. The culprit is this final line in the original <em>template_preprocess_panels_pane()</em> function in the panels.module file:

```php
<?php
$vars['content'] = !empty($content->content) ? $content->content : '';
?>
```

Even if you do a verbatim copy/paste of the original function and start tinkering with it, weird things might happen.

There is a <a href="http://drupal.org/node/1853282">workaround</a> however. A template can but doesn't have to be associated with a preprocess function. Defining them is optional. You can always define your own <em>hook_theme()</em> implementation in template.php and set the - lesser known - 'override preprocess functions' property. This will cause the system to ignore all preprocess functions, except the one defined in template.php.  So, how does this translate into code?

In the template.php of your theme, you add a <em>hook_theme()</em> implementation (Yes, <em>hook_theme()</em> is not restricted to modules!). First you copy/paste the entire <em>template_preprocess_panels_pane()</em> function. Then, just add a new hook_theme_suggestion for your own custom template variation:

```php
<?php
/**
 * Implements hook_theme()
 */
function mytheme_theme() {
  $theme['panels_pane'] = array(
    'variables' => array('output' => array(), 'pane' => array(), 'display' => array()),
    'path' => drupal_get_path('module', 'panels') . '/templates',
    'template' => 'panels-pane',
    'override preprocess functions' => TRUE,
  );

  return $theme;
}

/**
 * Overrides template_preprocess_panels_pane
 */
function mytheme_preprocess_panels_pane(&$vars) {
  // ... [snip copy/paste of the original function] ...
}
?>
```

And you're set to add a new template variation called <em>panels-pane--custom-mycustomtemplate.tpl.php</em> to your theme. Creating extra template variations on panels-pane.tpl.php is not a very common use case but they do happen. Now you can deal with them properly.
