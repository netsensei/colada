---
layout: post
title:  "Bending Drupal Commerce add to cart form"
date:   2013-01-28 20:00:00
categories: Drupal Commerce
---
The other day, I had to tweak the "Add to cart" feature which comes out of the box with Drupal Commerce. Adding and tweaking features in Commerce can be a bit daunting. The package contains a fully fledged API with several subsystems to handle orders, products, checkout,... It's easy to get lost if you are new. This article explores this use case and the particularities I had to go through.

## The challenge

I was involved in a webshop project. The challenge is to place the product price next to the quantity dropdown form element in the "Add to cart" form, separated with a multiplier sign. The end result should look like: price x quantity. Why? Because visually relating price and quantity makes for good UX. Check out this example of how the end result is supposed to look.

One might think it's easy to build something similar, but don't get fooled. It's trickier then things might appear. Let's take a look at the Field UI in the administration backend and see how things are actually set up by Commerce. Open up the default view mode of the corresponding product display node type for the product type you want to edit. Here, we control the display of the different fields shown on the product page. The Field UI not only shows you the fields from the product display node type, but also those inherited from the product entity. Including "Commerce price" and "Product variations" fields.

The hairy problem here is that price is a separate field. It's not an actual part of the add to cart form. The HTML rendered by Commerce also makes a structural divide between the form and the price. Even more so, the displayed price can be changed on the fly through an AJAX call! A product display is an aggregate of products. Each product has its' own SKU and attributes (color, size,...) which determine the price. So you want that skirt in a yellow bubble pattern instead of plain red? Well, you'll get a more expensive proposition, if you choose that option from the "Pattern" attribute dropdown. These product attributes are part of the form, yet if you change them, the price field will be dynamically updated too! Whatever we do, we don't want to break this intermingled functionality.

So, how can we nudge the price into the form in a controlled, sensible way?

## Solutions

CSS
Without touching any PHP, you could work your way around this with some clever CSS. Since content and style should be separated, and HTML should only define structure in a document (i.e. product detail page), dealing with this through CSS sounds like a good way to go. Getting the price into the form might prove to be a long stretch though. You'll need to break out your positionising kungfu and you might spend a lot of time debugging in different browsers, devices,...

JQuery
Get your JQuery toolbelt out. With some search and replace actions in the DOM we could fit the price right into the cart HTML which makes for easier styling. However, we take a risk here of breaking the attribute based price refresh, if we are not too careful. Besides, it's a very lazy hack: the Drupal Way is not the fastest road in this case, but it's still the correct and least error-prone way of doing things.

The Drupal Way
So, first some code. I'll explain in a bit.

{% highlight php %}
<?php
/**
 * Alter the add to cart form
 */
function mymodule_form_commerce_cart_add_to_cart_form_alter(&$form, &$form_state) {
  // Are we coming from a node/x page or the attribute refresh AJAX callback?
  // Depending on the context: fetch the product display object from the URL or
  // form_state context.
  $entity = NULL;

  if (isset($form_state['triggering_element'])) {
    $entity = $form_state['context']['entity'];
  }
  else {
    $entity = menu_get_object();
  }

  if (isset($entity)) {
    global $language;
    $view_mode = 'full';
    $entity_type = 'node';
    $bundle = $entity->type;
    $wrapper = NULL;
    $product = NULL;
    $langcode = $language->language;

    // Create a container and move the quantity form field into it
    $quantity = $form['quantity'];
    unset($form['quantity']);

    $form['quantity']['#datatype'] = 'integer';
    $form['pricing'] = array(
      '#type' => 'container',
    );
    $form['pricing']['quantity'] = $quantity;
    $form['pricing']['quantity']['#weight'] = 0;

    // Let's get the referenced product entity
    $instances = field_info_instances($entity_type, $bundle);
    $reference_view_mode = $entity_type . '_' . $view_mode;

    // Loop through product reference fields to see if any exist on this entity
    // bundle that is either hidden or displayed with the Add to Cart form display
    // formatter.
    foreach (commerce_info_fields('commerce_product_reference', $entity_type) as $field_name => $field) {
      if (isset($instances[$field_name])) {
        // Load a wrapper for the entity being viewed.
        if (empty($wrapper)) {
          $wrapper = entity_metadata_wrapper($entity_type, $entity);
        }

        // Find the default product based on the cardinality of the field.
        if ($field['cardinality'] == 1) {
          $product = $wrapper->{$field_name}->value();
        }
        else {
          $product = $wrapper->{$field_name}->get(0)->value();

          // If the product is disabled, attempt to find one that is active and
          // use that as the default product instead.
          if (!empty($product) && $product->status == 0) {
            foreach ($wrapper->{$field_name} as $delta => $product_wrapper) {
              if ($product_wrapper->status->value() != 0) {
                $product = $product_wrapper->value();
                break;
              }
            }
          }
        }
      }

      if (!empty($product) && $instances[$field_name]['settings']['field_injection']) {
        // Add the display context for these field to the product.
        $product->display_context = array(
          'entity_type' => $entity_type,
          'entity' => $entity,
          'view_mode' => $reference_view_mode,
          'language' => $langcode,
        );
        $product_field_name = 'commerce_price';
        $field_instances = field_info_instances('commerce_product', $product->type);
        $product_field = $field_instances[$product_field_name];
        if (!isset($product_field['display'][$reference_view_mode])) {
          $reference_view_mode = 'default';
        }

        // Only prepare visible fields.
        if (!isset($product_field['display'][$reference_view_mode]['type']) ||
          $product_field['display'][$reference_view_mode]['type'] != 'hidden') {
          $content = field_view_field('commerce_product', $product, $product_field_name,
            $reference_view_mode, $langcode);
          $output = render($content);

          $form['pricing']['price'] = array(
              '#markup' => $output,
          );


          if ($field['cardinality'] != 1) {
            // Construct an array of classes that will be used to theme and
            // target the rendered field for AJAX replacement.
            $classes = array(
                'commerce-product-field',
                drupal_html_class('commerce-product-field-' . $product_field_name),
                drupal_html_class('field-' . $product_field_name),
                drupal_html_class(implode('-', array('node', $entity->nid, 'product',
                  $product_field_name))),
            );

            $form['pricing']['price']['#prefix'] = '<span class="price-operator">&times;</span>
              <div class="' . implode(' ', $classes) . '">';
            $form['pricing']['price']['#suffix'] = '</div>';
            $form['pricing']['price']['#weight'] = 20;
          }
        }
      }
    }
  }
}
?>
{% endhighlight %}

In essence, I just alter the commerce_cart_add_to_cart_form() function (Part of the Cart (commerce_cart) module and add the commerce price field as an extra element to the form. There are two hurdles I have to take: (i) Retrieving the price from the referenced product entities (ii) Rebuild the price field in such a way that the AJAX dynamics will not break.

The correct price is retrieved in commerce_product_reference_entity_view() (Product Reference module) which is actually an implementation of hook_entity_view. The logic in the hook implementation does exactly what I want to do. I dissected what I needed to display only one field - the commerce price - and reapplied that code in my own form alter function. Now, I need to muddle with the code to make it all fit

Since a hook_form_alter function is context unaware, I had to retrieve the calling product display node from the context and pass it to the code. I'm assuming we are on a detail page here, so that's why I use menu_get_object() to retrieve the node. But that's not enough. There's the issue of an AJAX call. I knew that Drupal rebuilds the entire form, calling all the form alter functions, whenever someone chooses a different option from an attribute dropdown. The entire code would be run again, but menu_get_object() wouldn't work since the call is not coming from a node page but a special url called by javascript. Luckily, checking the "triggering element" property allows me to discern how my code gets called. The product display node object is conveniently stored in $form_state['context']['entity']. This way, I'm pretty sure I'll always end up with the current product display node entity fully loaded and available.

Next up, I need to attach the price to the form and make it work together with the quantity. It's a two step proces. First, I'll move the quantity into a container. Like this:


{% highlight php %}
<?php
// Create a container and move the quantity form field into it
$quantity = $form['quantity'];
unset($form['quantity']);
$form['quantity']['#datatype'] = 'integer';
$form['pricing'] = array(
  '#type' => 'container',
);
$form['pricing']['quantity'] = $quantity;
?>
{% endhighlight %}

There is a slight problem here. The commerce_cart_add_to_cart_form_validate() function assumes the existence of $form['quantity']['#datatype'], but I'm breaking the structure. The validator will start to fail because of that. That's why I've added the expliciet $form['quantity']['#datatype'] = 'integer'; Yes, it's a bit of a hack, but it works. If you *really* want to do it the clean way, then you would have to replace the standard validation callback with a copy of the function changing the reference to the new location of the quantity field.

Rendering the price field and adding it to the form happens over here:

{% highlight php %}
<?php
$content = field_view_field('commerce_product', $product, $product_field_name,
$reference_view_mode, $langcode);
$output = render($content);
$form['pricing']['price'] = array(
  '#markup' => $output,
);
?>
{% endhighlight %}

Done right, the $classes variable should contain all the information necessary to render the exact same HTML context as the regular commerce price field would have. This is necessary since the AJAX javascript relies on those. I used the #prefix and #suffix properties to add the containing div's. I also added the × operator to the #prefix.

{% highlight php %}
<?php
$form['pricing']['price']['#prefix'] = '<span class="price-operator">&times;</span>
  <div class="' . implode(' ', $classes) . '">';
$form['pricing']['price']['#suffix'] = '</div>';
?>
{% endhighlight %}

## Wrap up

Although I achieved my goal, I'm left with a bit of mixed feelings about this. I'm happy I pulled it off using the Drupal Way. I didn't reinvent the wheel with lazy hacks in JQuery and CSS. I did it through a nice form alter. Just the way the Drupal API intends it. Yet, I had to reïmplement a lot of existing logic in a separate function to make sure nothing breaks. That's plain wrong when you live by code reuse. It's also a consequence of the trade off made by the Commerce architects separating price from form in two separate Field API fields. The flexibility of a toolbox comes before the adaptability towards a very specific use case.
