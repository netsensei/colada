# Plan: Migrate colada.be from Jekyll to Hugo

## Context

The site at `/Users/netsensei/Workspace/colada/` is a small, clean Jekyll blog (www.colada.be) hosted on GitHub Pages with a custom domain. It has 35 posts (2012–2025), 3 layouts, 6 includes, a custom Bootstrap 5 + SCSS design, no custom plugins, and no third-party themes. It currently relies on GitHub Pages' built-in Jekyll builder.

The user wants to move to Hugo. Motivation isn't stated, but Hugo's appeal here is concrete: faster builds, no Ruby/Bundler dependency, no GitHub Pages plugin allowlist, and a more current toolchain. The site's small size and absence of custom plugins make this a low-risk mechanical port — mostly Liquid → Go template syntax with some directory reshuffling.

**Decisions taken (from clarifying questions):**
- Work happens on a `hugo-migration` **branch** in this repo. `main` keeps serving live Jekyll until cutover.
- URLs are **preserved exactly**: `/post-title.html` stays `/post-title.html`. No inbound links break, no redirects needed.
- The current **custom Bootstrap 5 + SCSS design is ported 1:1**. The site should look identical after migration.
- Deployment moves to a **GitHub Actions workflow** (`.github/workflows/hugo.yml`) since GitHub Pages doesn't build Hugo natively.

## How to organize the work in git

The branch approach is simpler than it might look. Hugo and Jekyll directory conventions don't collide much (`_posts/` vs `content/posts/`, `_layouts/` vs `layouts/`, `_includes/` vs `layouts/partials/`), and the few collisions (notably `assets/`, which both use) are handled by reorganizing on the branch only. Concretely:

```
git switch -c hugo-migration
# do the work on this branch
# `main` is untouched and Jekyll keeps building from it on every push to main
```

No separate working directory is needed. Local preview during the migration uses `hugo server` on the branch (running on `localhost:1313`), which is fully independent of any Jekyll setup. If at any moment you want to compare to the live Jekyll output, `git switch main && bundle exec jekyll serve` still works.

The branch lives until you're confident enough to merge it into `main` and flip the GitHub Pages source to GitHub Actions.

## Migration steps

### 1. Install Hugo locally and scaffold the new tree on the branch

Install Hugo extended (needed for SCSS processing via Hugo Pipes) via Homebrew: `brew install hugo`. Verify with `hugo version` — it must say `extended`.

On the `hugo-migration` branch, create the Hugo skeleton **alongside** the existing Jekyll tree (don't delete anything yet — Jekyll files act as the reference until the port is verified):

```
content/posts/       # was _posts/
content/about.md     # was about.html
layouts/             # was _layouts/ + _includes/
  _default/
    baseof.html      # base wrapper (was the shell of _layouts/default.html)
    single.html      # post page (was _layouts/post.html)
    list.html        # homepage / section lists
    page.html        # standalone pages (was _layouts/page.html)
  partials/          # was _includes/
    head.html
    header.html
    footer.html
    foot.html
    me.html
    open_graph.html
  index.html         # homepage (was index.html with paginator)
  404.html
assets/              # SCSS goes here for Hugo Pipes
  scss/              # contents of _sass/
static/              # everything served as-is
  assets/            # current assets/fonts, assets/js, assets/media, assets/avatar.jpg, etc.
  CNAME              # moves from root into static/ so it ends up at the site root
config.toml          # was _config.yml
```

The reason `assets/fonts/`, `assets/js/`, `assets/media/`, and the avatar images go under `static/assets/` is to keep their public URLs unchanged (`/assets/fonts/...`, `/assets/media/voxeljs.png`, `/assets/avatar.jpg`, etc.) — posts and the `me.html` JSON-LD already reference those paths and we don't want to rewrite them. The SCSS, by contrast, moves into Hugo's `assets/scss/` because it needs to flow through Hugo Pipes (`resources.Get` + `toCSS` + `fingerprint`).

### 2. Write `config.toml`

Translate `_config.yml` to Hugo. Key mappings:

```toml
baseURL = "https://www.colada.be/"
languageCode = "en-us"
title = "Matthias Vandermaesen"
paginate = 50
paginatePath = "page"
# Description goes in [params] since Hugo's top-level `description` is for OG/meta defaults
[params]
  description = "Dispatches from my digital life."

# Preserve Jekyll URL shape exactly: /post-title.html
[permalinks]
  posts = "/:slug.html"

# Markdown / syntax highlighting parity with kramdown+rouge
[markup]
  [markup.goldmark.renderer]
    unsafe = true          # allow raw HTML in posts (several posts use it)
  [markup.highlight]
    style = "github"        # or whichever Chroma style matches current rouge output
    lineNos = false
    noClasses = false       # emit CSS classes so .highlight rules in _sass/components/_syntax.scss keep working
```

Two careful points:

- **`unsafe = true` is required**. Goldmark (Hugo's Markdown engine) refuses to pass through inline HTML by default. Several posts in `_posts/` embed raw HTML (e.g. the older Drupal-era posts and the JSON-LD-flavoured ones). Without `unsafe = true` those silently lose content.
- **`noClasses = false`** makes Chroma emit `<span class="...">` instead of inline styles, so the existing custom syntax styles in `_sass/components/_syntax.scss` keep applying. The class names Chroma uses are largely compatible with Rouge's, but a visual diff on one or two code-heavy posts is worth doing.

### 3. Port the layouts and partials (Liquid → Go templates)

This is the bulk of the work but it's mechanical. The translation table:

| Liquid | Go template |
|---|---|
| `{{ site.title }}` | `{{ .Site.Title }}` |
| `{{ site.description }}` | `{{ .Site.Params.description }}` |
| `{{ site.url }}` | `{{ .Site.BaseURL }}` |
| `{{ page.title }}` | `{{ .Title }}` |
| `{{ page.url }}` | `{{ .Permalink }}` (absolute) or `{{ .RelPermalink }}` |
| `{{ page.date \| date_to_long_string }}` | `{{ .Date.Format "2 January 2006" }}` |
| `{{ page.date \| date_to_xmlschema }}` | `{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}` |
| `{% include head.html %}` | `{{ partial "head.html" . }}` |
| `{% for post in paginator.posts %}` | `{{ range (.Paginate .Site.RegularPages).Pages }}` |
| `{% if page.title %}` | `{{ with .Title }}` or `{{ if .Title }}` |
| `{{ content }}` (in layout) | `{{ .Content }}` (in `single.html`/`list.html`) or `{{ block "main" . }}{{ end }}` (in `baseof.html`) |

Concrete files to produce:

- `layouts/_default/baseof.html` — combine the current `_layouts/default.html` shell with the open/close from `_includes/head.html` and `_includes/foot.html`. Define a `{{ block "main" . }}{{ end }}` for content.
- `layouts/_default/single.html` — port `_layouts/post.html`. The `<time>` and `<h1>` block stays; `{{ page.date | date_to_long_string }}` → `{{ .Date.Format "2 January 2006" }}`; wrap in `{{ define "main" }}…{{ end }}`.
- `layouts/_default/page.html` — port `_layouts/page.html`. Same pattern.
- `layouts/index.html` — port `index.html`. The paginator block becomes `{{ $paginator := .Paginate (where .Site.RegularPages "Section" "posts") }}` then `{{ range $paginator.Pages }}`. The prev/next links use `{{ $paginator.Prev.URL }}` and `{{ $paginator.Next.URL }}`.
- `layouts/partials/` — six partials port nearly verbatim. Only `_includes/head.html` needs real changes: the CSS link becomes the Hugo Pipes incantation:
  ```go-html-template
  {{ $style := resources.Get "scss/colada.scss" | toCSS | minify | fingerprint }}
  <link rel="stylesheet" href="{{ $style.RelPermalink }}" integrity="{{ $style.Data.Integrity }}">
  ```
  `_includes/me.html` and `_includes/footer.html` are pure HTML with no Liquid — copy verbatim. `_includes/open_graph.html` is currently *defined but not included* in the Jekyll site; the port should fix that oversight by referencing it from `head.html` (one-line change, but optional — flag for the user to decide during review).
- `layouts/404.html` — port `404.html`.

### 4. Move content

Posts: copy `_posts/*.markdown` → `content/posts/`. Hugo doesn't require the date prefix in the filename (it reads `date:` from front matter), but **keep the prefix** because the Jekyll permalink `/:title.html` derives the slug by *stripping the date prefix from the filename*. Hugo's `:slug` permalink token, by default, uses the filename minus extension — which would *include* the date. Two equivalent fixes; pick one:

- **Option A (recommended):** rename files to drop the date prefix (e.g. `taming-facetapi-paths.md`). The post's `date:` front matter is the source of truth for sort order.
- **Option B:** set `slug:` in each post's front matter to the dateless title.

Option A is less invasive at the content level. Either way, **verify the resulting URL for every post matches its old URL** before declaring done (a small shell script comparing `hugo list all` output to a list of old URLs catches drift in seconds).

Existing post front matter is largely Hugo-compatible. Hugo accepts `layout:`, `title:`, `date:`, `categories:` natively. The `comments: true` field is dead code (no comment system exists) — leave as-is to keep the diff small; Hugo silently ignores unknown front matter.

`render_with_liquid: false` (present on 14 newer posts) is a Jekyll-only directive and a Hugo no-op. Don't bother stripping it.

Pages: `index.html` → `layouts/index.html` (becomes a template, not content). `about.html` → `content/about.md` with front matter `title: "About me"` and `layout: page`. `404.html` → `layouts/404.html`. `feed.xml` is **replaced** by Hugo's built-in RSS at `/index.xml`. Add an alias so the old `/feed.xml` URL keeps working:

```toml
# in config.toml
[outputs]
  home = ["HTML", "RSS"]
[outputFormats.RSS]
  mediaType = "application/rss+xml"
  baseName = "feed"     # makes the RSS file /feed.xml instead of /index.xml
```

The default Hugo RSS template is fine for parity with the current minimal `feed.xml`. If finer control is needed, override at `layouts/_default/rss.xml`.

### 5. Static files and the custom domain

Move:
- `CNAME` → `static/CNAME` (Hugo copies `static/` to the site root verbatim, preserving `www.colada.be` as the custom domain)
- `assets/avatar.jpg`, `assets/avatar_small.jpg`, `assets/kopje.jpg` → `static/assets/`
- `assets/fonts/`, `assets/js/`, `assets/media/`, `assets/likeness.ttl`, `assets/picture.ttl` → `static/assets/`
- `_sass/` → `assets/scss/` (so Hugo Pipes can process it). The entry point `assets/css/style.scss` becomes `assets/scss/colada.scss` (or keep the existing import structure; just make sure the `resources.Get` path in `head.html` matches).

### 6. GitHub Actions deployment

Add `.github/workflows/hugo.yml`. The canonical Hugo-on-Pages workflow is in Hugo's own docs; the gist:

```yaml
name: Deploy Hugo site to Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.140.0   # pin to a current extended release
    steps:
      - uses: actions/checkout@v4
        with: { submodules: recursive, fetch-depth: 0 }
      - name: Install Hugo
        run: |
          wget -q -O ${{ runner.temp }}/hugo.deb \
            https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb
          sudo dpkg -i ${{ runner.temp }}/hugo.deb
      - uses: actions/configure-pages@v5
      - run: hugo --minify --baseURL "${{ steps.pages.outputs.base_url }}/"
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./public }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

At cutover time, change the Pages source in the repo's settings from "Deploy from a branch" to "GitHub Actions". This is the one manual UI step in the whole migration.

### 7. Cleanup (after verification, before merging to main)

Delete the Jekyll files from the branch:
- `_config.yml`, `Gemfile`, `Gemfile.lock`, `.ruby-version`
- `_posts/`, `_layouts/`, `_includes/`, `_sass/`, `_drafts/`
- `index.html`, `about.html`, `404.html`, `feed.xml` (at the repo root — replaced by Hugo equivalents)
- The old top-level `assets/` directory (its contents have already been split into `static/assets/` and `assets/scss/`)

The `_drafts/simple-jekyll-with-bootstrap.markdown` is a WIP draft — port it to `content/posts/` with `draft: true` in front matter rather than deleting.

Update `_includes/footer.html`'s "Built with Jekyll" credit to "Built with Hugo" (or remove it — your call; flag for review).

## Verification

Local:
1. `hugo server -D` on the `hugo-migration` branch. Open `localhost:1313`.
2. **URL parity check**: for each post in `_posts/`, confirm the same `/slug.html` URL resolves to the same content on the Hugo dev server. A quick scripted diff:
   ```sh
   bundle exec jekyll build              # on a fresh checkout of main, into _site/
   hugo --destination /tmp/hugo-out      # on hugo-migration branch
   diff -r _site/ /tmp/hugo-out/ | head -100
   ```
   Expect noise around `feed.xml` (RSS templates differ) and minor whitespace, but post HTML should be very close. Investigate any structural diffs.
3. Spot-check 3–4 posts in the browser: at least one with code blocks (syntax highlighting parity), at least one with embedded HTML (Goldmark `unsafe` working), and the most recent post (newest authoring conventions).
4. Confirm `/feed.xml` returns a valid RSS feed and the home `<link rel="alternate">` in `head.html` points to it.
5. Confirm `/assets/avatar.jpg`, `/assets/media/voxeljs.png`, etc. load (these are referenced from posts and from `me.html`).
6. Visual diff the homepage, a post, and the about page against the live www.colada.be — should be pixel-close.

In CI / production:
7. Push `hugo-migration` to GitHub. Open a PR. The workflow will build but **not deploy** (deploy only runs on `main`). Inspect the build artifact via the Actions tab.
8. Merge to `main`. **Before the first push, switch Pages source to "GitHub Actions" in repo settings**, otherwise GitHub will still try to Jekyll-build the new tree and fail loudly.
9. After deploy: hit `https://www.colada.be/` and 3–4 deep post URLs. Confirm the CNAME is still honored.
10. Wait a day; check GitHub Pages' analytics or your own logs for any 404 spikes that would indicate a missed URL.

## Critical files to read while executing

- `_config.yml` — source of truth for what config moves to `config.toml`
- `_layouts/default.html`, `_layouts/post.html`, `_layouts/page.html` — three layouts to port
- `_includes/head.html` — the only partial needing non-trivial changes (SCSS pipeline)
- `_includes/me.html`, `_includes/open_graph.html` — copy with minimal/no edits
- `index.html` — paginator translation
- `feed.xml` — compare against Hugo's default RSS to decide if a custom template is needed
- A representative post like `_posts/2025-10-24-converting-430000-images-from-jpg2000-to-jpeg.markdown` — confirm front matter shape and any embedded HTML
- One older post like `_posts/2012-09-08-taming-facetapi-paths.markdown` — older posts tend to have more raw HTML and quirkier markdown

## Estimated scope

- **Skeleton + config:** 30 min
- **Layout/partial port:** 1–2 hours (3 layouts, 6 partials, all small)
- **Content move + URL verification:** 30 min (mostly waiting on rebuilds)
- **GitHub Actions workflow + first deploy:** 30 min
- **Visual QA and fixes:** 1–2 hours depending on syntax-highlighting fidelity

Realistic total: a focused afternoon. The biggest risk is URL drift on a handful of posts — the verification script in step 2 of "Verification" catches that early.
