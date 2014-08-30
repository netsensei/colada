---
layout: post
title:  "Taming breadcrumbs in Drupal"
date:   2014-08-30 20:00:00
categories: Drupal menu
comments: true
---
Breadcrumbs are one of those components on a website that don't always get the attention they deserve. If done right, they can become a valuable asset. But if thrown in as an afterthought, they can turn into another nail of a projects' coffin.

Assisting visitors in forming a clear mental map, is key if you want to retain their attention. After all, anyone who browses the web follows the path of least resistance to the information they want. That's why constructing a clear cut content strategy and information architecture is an important step before laying the brickwork of code.

Generally, the bulk of first-time visitors won't enter via the homepage but sideways, through an article or product page linked from the results page on a search engine. Adding a breadcrumb element can be very helpful when conveying that structure to the visitor. A breadcrumb gives visitors a direct visual clue on where they are in the chapters, sections, categories,... of your project. A clear breadcrumb trail can draw them further into your site.

So, how do you lay down a sensible breadcrumb trail in Drupal?

## The active trail.

The breadcrumbs component as provided by Drupal core is based on something called the "active trail". This is the trail of different menu links you follow as you descend into the innards of the site. Content on a website is generally structured as a hierarchical tree.

Suppose you are visiting Jim's Premium Cars, you can click on the "Second Hand Cars" item from the main menu, then continue to the "Ford" departement from the subnavigation and finally select the "Trucks" section. The active trail would then look like this: Second Hand Cars > Ford > Trucks.

Drupal uses the active trail to create a breadcrumbs element which would look like this: Home > Second Hand Cars > Ford > Trucks.

## Understanding Drupal breadcrumbs

This brings us to a vital part in understanding Drupal's breadcrumbs: it's tightly knit to the menu system. While you're busy adding and shuffling menu link items, you're also laying the foundations for the breadcrumbs.

However, breadcrumbs are oftentimes viewed as a separate component that requires only minor effort and minimal analysis to build. It's easy to spot a common pitfall now: adding deviations - other sections, altered titles,... - from the active trail while designing the breadcrumbs.

A few small adjustments are generally no biggy. But don't be surprised if concocting complex breadcrumbs building algorithms that don't hold any relation to the menu, results in extra custom (re)work and effort.

Consider the fact that deviating from the active trail might actually be a cue that the content architecture contains a few flaws. If necessary, revisit the site architecture and ask yourself if you need to reshuffle or rename (sub)sections.

Developers and project managers should be aware of these issues. A quick verification on paper of your breadcrumbs design should allow you to spot problems early on.

## Barebones coding

With the pitfalls covered, we do need to be able to make some adjustments. Breadcrumbs in Drupal are quite barebones. In fact, they only render the active trail excluding the active menu item. That is, the corresponding menu item path presently open in your browser window.

Here's how you can easily achieve common, minor adjustments:

1. Adding the active menu item to the end of the breadcrumb. This snippet can be found on [api.drupal.org](https://api.drupal.org/api/drupal/modules%21system%21system.api.php/function/hook_menu_breadcrumb_alter/7).

{% highlight php %}
<?php
/**
 * Implements hook_breadcrumbs_alter().
 */
function myproject_menu_breadcrumb_alter(&$active_trail, $item) {
  // Always display a link to the current page by duplicating the last link in
  // the active trail. This means that menu_get_active_breadcrumb() will remove
  // the last link (for the current page), but since it is added once more here,
  // it will appear.
  if (!drupal_is_front_page()) {
    $end = end($active_trail);
    if ($item['href'] == $end['href']) {
      $active_trail[] = $end;
    }
  }
}
?>
{% endhighlight %}

2. Removing the 'Home' root element from the breadcrumb trail.

{% highlight php %}
<?php
/**
 * Implements hook_breadcrumbs_alter().
 */
function myproject_menu_breadcrumb_alter(&$active_trail, $item) {
  // Shifts the first element from the active trail array. We assume that this
  // is the front page.
  if (!drupal_is_front_page()) {
    array_shift($active_trail);
  }
}
?>
{% endhighlight %}

3. Adding labels or icons before / after the breadcrumbs. Anything visual or non-functional should be added by overriding the theme_breadcrumb function in your theme's template.php.

{% highlight php %}
<?php
/**
 * Overrides theme_breadcrumb
 */
function mytheme_breadcrumb($variables) {
  $breadcrumb = $variables['breadcrumb'];

  if (!empty($breadcrumb)) {
    // Provide a navigational heading to give context for breadcrumb links to
    // screen-reader users. Make the heading invisible with .element-invisible.
    $output = '<h2 class="element-invisible">' . t('You are here') . '</h2>';

    $output .= '<div class="breadcrumb">' . implode(' » ', $breadcrumb) . '</div>';
    return $output;
  }
}
?>
{% endhighlight %}

## Common pitfalls

### drupal_set_breadcrumb

Anyone digging in Drupal's core API's will sooner or later stumble upon [drupal_set_breadcrumb](https://api.drupal.org/api/drupal/includes%21common.inc/function/drupal_set_breadcrumb/7). This function allows you to set the breadcrumb trail for the current page. It's a function usually called in hook implementations or callbacks. Although this sounds like a good thing, using this can cause headaches.

This function uses a static cache to keep the breadcrumb trail. Throughout a request, various calls to this function can and will overwrite the cache at various occasions. So, if you call your own implementation too soon or too late, your changes will be ignored. You might even end up implementing [hook_module_implements_alter](https://api.drupal.org/api/drupal/modules%21system%21system.api.php/function/hook_module_implements_alter/7) or even update the module weight in the system table just to inject your values at the right moment.

Personally, I've come to regard this more as an internal function instead of using it in any custom code.

### hook_menu_breadcrumb_alter and theme_breadcrumb

At this point, it's very tempting to use [hook_menu_breadcrumb_alter](https://api.drupal.org/api/drupal/modules%21system%21system.api.php/function/hook_menu_breadcrumb_alter/7) and [theme_breacrumb](https://api.drupal.org/api/drupal/includes%21theme.inc/function/theme_breadcrumb/7) to alter the breadcrumbs themselves.

Don't do this.

You'll be altering the $active_trail variable in your hook implementation, but you're not actually bending the active trail itself. You'll notice this once you start adding CSS to the active state of the various menu items. The breadcrumb might be okay, but the corresponding menu items are not active. Now you're going to fiddle around with [menu_set_active_trail](https://api.drupal.org/api/drupal/includes%21menu.inc/function/menu_set_active_trail/7) and their ilk. But doing so will break the breadcrumb logic you so carefully constructed.

Trust me, we've all been there once.

So, when do you use hook_breadcrumb_alter? Only after you've got the active trail sorted out. Be sure that each level in your navigation has the intended, active menu item. So, you'll want to alter the active trail first.

In the next sections, I'll show you how we can do that.

Oh, [theme_breacrumb](https://api.drupal.org/api/drupal/includes%21theme.inc/function/theme_breadcrumb/7) is a theming function: only override this if you need to add an extra wrapper or css class to the entire breadcrumb. Whatever you do, never, ever try to 'fix' or 'alter' the breadcrumb in a theming function. You'll save the lives of countless of kittens.

## Hooking up content collections

The active trail only points to pages (paths or url's) which are part of the menu. As soon as you start exploring content which is not directly linked in the navigation, the concept of an active trail becomes non-existent.

Consider such item types as blogposts, news articles, product sheets, biographies, etc. You just don't create separate menu items for these. Consequently, the menu won't show any active menu items when you visit those. However, individual blogposts are part of a content cluster around a 'blog' item in the navigation. So, you might want a breadcrumb trail which points to that item whenever you land on the detail page of a blogpost node.

That's where the [Menu Position](https://www.drupal.org/project/menu_position) module becomes your weapon of choice. This module allows you create conditional rules that will alter the active trail to a specific menu item.

Menu Position allows you to group content based on vocabulary, bundle type, language, path match, etc. It's pluggable so you can easily write your own contextual plugin if need be.

Menu Position covers a large group of use cases so use this before writing custom code.

## Taxonomy Menu

Sometimes, things get a bit more complex. When your menu maps to terms in a taxonomy vocabulary and your content is assigned to those terms. The [Taxonomy Menu](https://www.drupal.org/project/taxonomy_menu) automatically syncs the terms to menu items. But you'll still have to create new Menu Position rules manually for each new term.

If the menu / vocabulary structure is complex and prone to frequent change, maintaining all those menu position rules is probably not going to work out.

The following snippet might solve just that. Here's how it works:

1. Take the term from from a predefined taxonomy reference field and bundle.
2. Construct the taxonomy term internal path.
3. Use [menu_tree_set_path](https://api.drupal.org/api/drupal/includes%21menu.inc/function/menu_tree_set_path/7) to calculate the active trail to the path.
4. Set the preffered link for this path.
5. Add the node path to the end of the adjusted active trail.
6. Use [menu_set_active_trail](https://api.drupal.org/api/drupal/includes%21menu.inc/function/menu_set_active_trail/7) to save the new trail.

{% highlight php %}
<?php
/**
 * Implements hook_node_view().
 *
 * Using Taxonomy Menu and you want your breadcrumbs / active trail to follow suit?
 * This snippet will handle that so that your breadcrumbs can / might look like this:
 *
 *   home >> term A >> subterm B >> node title
 *
 * How to use:
 *  1) Set the $node->type to the bundle you want to target
 *  2) Set 'field_article_taxonomyreference' to the relevant taxonomy reference field.
 *  3) Profit!!
 *
 * Why not use Menu Position module?
 *  You could, but you might end up creating a rule per menu item. With taxonomy menu,
 *  and a somewhat complex menu tree, such a solution wouldn't scale well.
 */
function hook_node_view($node, $view_mode, $langcode) {
  if ($node->type == 'article' && $view_mode == 'full') {
    $items = field_get_items('node', $node, 'field_article_taxonomyreference');
    if (!empty($items)) {
      $item = array_pop($items);
      $term = $item['taxonomy_term'];
      $path = taxonomy_menu_create_path($term->vid, $term->tid);

      // Set the active menu_tree path
      menu_tree_set_path('main-menu', $path);

      // Manually set the preferred link for this path so that
      // menu_get_active_trail() returns the proper trail.
      $preferred_links = &drupal_static('menu_link_get_preferred');
      $preferred_links[$_GET['q']][MENU_PREFERRED_LINK] = menu_link_get_preferred($path);

      // Add the node path at the end of the trail.
      $active_trail = menu_set_active_trail();
      $menu_item = array(
        'title' => $node->title,
        'href' => 'node/' . $node->nid,
        'link_path' => 'node/' . $node->nid,
        'type' => MENU_CALLBACK,
        'localized_options' => array(),
      );
      array_push($active_trail, $menu_item);
      menu_set_active_trail($active_trail);
    }
  }
}
?>
{% endhighlight %}

Of course, you can just adapt this snippet. This example implements hook_node_view, but it could be used on other fieldable entity types as well. Provided there is a taxonomy reference field and the term path is available as a menu item.

Do note that you can't use this on Drupal versions prior to 7.9 since the menu_tree_set_path() function was only introduced with that release.

Also note that drupal_set_breadcrumb() usually takes precedence over menu_set_active_trail() (per the documentation). I say usually because page altering modules such as [Panels Everywhere](https://www.drupal.org/project/panels_everywhere) or [Page Manager Existing Pages](https://www.drupal.org/project/pm_existing_pages) can cause that order to be different.

## Contributed modules

Of course, you don't necessarily have to dive into custom code. There's a wealth of breadcrumb managing modules out there:

* [Custom Breadcrumbs](https://www.drupal.org/project/custom_breadcrumbs)
* [Path Breadcrumbs](https://www.drupal.org/project/path_breadcrumbs)
* [Hansel](https://www.drupal.org/project/hansel)
* [Crumbs](https://www.drupal.org/project/crumbs)
* [Easy Breadcrumb](https://www.drupal.org/project/easy_breadcrumb)
* [Menu Breadcrumb](https://www.drupal.org/project/menu_breadcrumb)
* ...

Some are very popular, some are less common. Some just try to solve some basic annoyances about the default behaviour, but most of them are complex suits with a bit of learning curve. If anything, they all try to make the breadcrumb controllable by site builder to a certain extent.

So, are they any good and which one should I choose?

Short story: your mileage may vary.

It really depends on what you are trying to accomplish and how your project is architecturally conceived. Make sure you have a firm grasp of how your breadcrumbs need to behave and then try a few of these in timebox. Don't stop at the interface but review their code as well so you understand what they do. When confronted with problems, don't dwell too long on solving them: try another contributed module or consider rolling a custom solution if you need to.

## Conclusion

When I started this foray into breadcrumbs, I didn't expect to write such a lengthy blogpost. There's obviously more to it then meets the eye. Preparation and understanding the nature of the beast is key to deal with breadcrumbs in a swift and sound way.

I've only covered breadcrumbs in Drupal 7. Looking forward, Drupal 8 will certainly solve several problems. Or make it easier to deal with them. Nonetheless, I do expect several existing breadcrumb modules to be ported and new challenges to pop up that will need to be sorted out.




