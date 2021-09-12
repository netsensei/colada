---
layout: post
title:  "Rendering fields with HTML templates in Go"
date:   2021-09-11
categories: golang
render_with_liquid: false
---
Go's standard library provides HTML templating. Together with the net/http package, you can very easily build a service that renders a webpages. Asserting fine-grained control over templates and page rendering becomes a bit of a challenge in a complex use case where context drives how a page should be rendered. A typical use case is showing parts of structured content - a product, a news article, an event,... - depending on a logged in users role, or the type of content which is rendered.

Go's HTML templating provides `define`, `template`, `yield` and `block` functions. These promote template reusability, maintainability and flexible implementations. There's a risk that you may end up incorporating too much application logic in your templates, depending on your use case's requirements.

A common pattern used in programming is the [Model-View-Presenter](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter) pattern. It's a derivative of the ubiquitous Model-View-Controller pattern. It differs in that the application logic is pushed towards a Presenter which acts as a middle man. The MVP pattern seems like a good candidate to mitigate the risk of generating complex templates.

I've build a small prototype. I'll let the code speak for itself:

```go
package main

import (
	"bytes"
	"html/template"
	"net/http"
	"strings"
)

func main() {
	http.HandleFunc("/article", articleController)
	http.ListenAndServe(":8080", nil)
}

func articleController(w http.ResponseWriter, r *http.Request) {
    // This is our Model
	var article = &Article{
		PublicationType:  "article",
		Title:            "A journal article title",
		AlternativeTitle: "An alternative journal article title",
		Body:             "Here's the body text of the article",
		Author:           "Jon Doe",
		Type:             "Newsarticle",
	}

	// Compose a view with the presenter and the article
	var presenter = &ArticlePresenter{article}
	var view = &ArticleView{presenter}

	// Let the view render and pass the output to an io.Writer
	w.Header().Set("Content-Type", "text/html")
	view.Render(w)
}

type Article struct {
	PublicationType  string
	Title            string
	AlternativeTitle string
	Body             string
	Author           string
	Type             string
}

// The view is only responsible for rendering an input to HTML.

type View interface {
	Render()
}

type ArticleView struct {
	presenter Presenter
}

func (av *ArticleView) Render(w http.ResponseWriter) {
	// Let the presenter process the article and return a renderable object e.g. a map.
	tree := av.presenter.Process()

	// Walk through the tree recursively and call all rendering functions
	content := template.HTML(doRender(tree))

	// Wrap the HTML output in an article template
	article := `
		<div class="article">
			<h1>\{\{.Title\}\}</h1>
			\{\{ .Content \}\}
		</div>
	`

	t, _ := template.New("article").Parse(article)

    t.ExecuteTemplate(w, "article", struct {
		Title   string
		Content template.HTML
	}{"A news article", content})
}

// A tree walker function which triggers rendering

func doRender(element interface{}) string {
	var output []string

	tree, ok := element.(map[string]*FieldSet)
	if ok {
		for _, fieldset := range tree {
			output = append(output, fieldset.Render())
		}
		return strings.Join(output, "")
	}

	return strings.Join(output, "")
}

// The Presenter creates a renderable object

type Presenter interface {
	Process() map[string]*FieldSet
}

type ArticlePresenter struct {
	Article *Article
}

// Processes the Article object according to business rules / requirements.

func (ap *ArticlePresenter) Process() map[string]*FieldSet {
	tree := make(map[string]*FieldSet)

	items := []*TextField{}

	items = append(items, &TextField{
		Label: "Title",
		Value: ap.Article.Title,
	})

	items = append(items, &TextField{
		Label: "Alternative Title",
		Value: ap.Article.AlternativeTitle,
	})

	items = append(items, &TextField{
		Label: "Copy",
		Value: ap.Article.Body,
	})

	tree["content"] = &FieldSet{
		Label: "Content",
		Items: items,
	}

	if ap.Article.PublicationType == "article" {
		items := []*TextField{}

		items = append(items, &TextField{
			Label: "Author",
			Value: ap.Article.Body,
		})

		items = append(items, &TextField{
			Label: "Type",
			Value: ap.Article.Body,
		})

		tree["metadata"] = &FieldSet{
			Label: "Metadata",
			Items: items,
		}
	}

	return tree
}

// Define field types

type Field interface {
	Render() string
}

type FieldSet struct {
	Label string
	Items []*TextField
}

func (fs *FieldSet) Render() string {
	tpl := `
		<div class="fieldset">
		    <h2>\{\{ .Label \}\}</h2>

			<ul class="items">
			\{\{ range .Items \}\}
				<li>\{\{ . \}\}</li>
			\{\{ end \}\}
			</div>
		</div>
	`

	// Render children
	var items []template.HTML
	for _, item := range fs.Items {
		items = append(items, item.Render())
	}

	// Render the fieldset as a whole
	t := template.Must(template.New("fieldset").Parse(tpl))
	buf := &bytes.Buffer{}
	err := t.Execute(buf, struct {
		Label string
		Items []template.HTML
	}{Label: fs.Label, Items: items})

	if err != nil {
		panic(err)
	}

	return buf.String()
}

type TextField struct {
	Label string
	Value string
}

func (tf *TextField) Render() template.HTML {
	tpl := `
	 	<p><strong>\{\{ .Label \}\}</strong>: \{\{ .Value \}\}</p>
	`

	t := template.Must(template.New("field").Parse(tpl))
	buf := &bytes.Buffer{}
	err := t.Execute(buf, struct {
		Label string
		Value string
	}{Label: tf.Label, Value: tf.Value})

	if err != nil {
		panic(err)
	}

	return template.HTML(buf.String())
}
```

Of course, there's a lot that could be optimized here. There's the repetition of templating calls across the `Render()` methods. There's the `doRender()` function which I could replace entirely with a dedicated `ArticleTree` struct. There's the fact that a `map` structure doesn't guarantee that the order of elements returned will be the order in which they were inserted. I'm not going to go into those.

I can spot a few take aways here.

A lot of moving parts are isolated into interchangeable, reusable composable structs, and the `ArticleController` becomes really lean. This allows you to organize your code architecture in a very clean and maintainable way without losing readability.

The context specific application logic is entirely tied up into the `Process()` method of a `Presenter`. A change in business constraints doesn't mean you have to do a major rewrite of existing code everywhere. You can even create a new concrete `Presenter` if too much complexity gets tied up in a single `Presenter`.

Template reusability is still promoted. You can create new field types to organize and re-organize the constituent parts of the web page. Generation of concrete HTML output is delegated to the various implementations of field types.

This is a pattern which tends to be used in content management systems build in interpreted languages like Drupal. A lot of the heavy lifting, rendering discrete pieces of HTML and composing them, happens at run time. From a performance view, this would be a drawback. Established content management systems come with extensive caching affordances to mitigate performance issues.

This pattern would work well in concrete, delineated use cases with a limited scope. It's a pattern that fits well in code that adhere to [hexagonal or clean architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) principles.