# bensampica.com

Personal portfolio and software engineering blog built with [Eleventy](https://www.11ty.dev/).

## Requirements

- Node.js 22
- pnpm 10.14.0

## Local development

Install dependencies and start Eleventy's development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The local site runs at `http://localhost:8080` by default.

## Production build

```bash
pnpm build
```

Eleventy writes the static site to `_site/`, Pagefind creates the search index in `_site/pagefind/`, and the site checker validates metadata, internal references, feeds, sitemap entries, posts, and callouts.

## Repository structure

```text
src/
  content/
    blog/               Markdown articles and adjacent article assets
    library/            Library page content
  _data/                Site identity, navigation, and experience data
  _includes/
    components/         Reusable Nunjucks components
    feeds/              RSS templates
    layouts/            Page and article layouts
  assets/               CSS and JavaScript source
  pages/                Generated page, archive, search, and feed templates
  static/
    albums/              Computer gallery
    media/               Shared images
    uploads/             Downloadable files
```

## Writing a blog post

Create `src/content/blog/<slug>/index.md` with the existing front matter shape:

```yaml
---
title: Example title
subtitle: Short supporting title
summary: Search and social description.
authors:
  - me
tags:
  - DotNet
date: "2026-01-01T00:00:00Z"
lastmod: "2026-01-01T00:00:00Z"
featured: false
draft: false
toc: true
---
```

Place article images beside the post or in an `images/` folder. Relative Markdown references continue to work:

```markdown
![Description](images/example.png)
```

Callouts support GitHub-style syntax:

```markdown
> [!TIP]
> Useful advice goes here.
```

Supported types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`, and `INFO`.

## Site configuration

- Identity, biography, navigation, experience, and social links: `src/_data/site.js`
- Global styling: `src/assets/css/site.css`
- Client enhancements: `src/assets/js/site.js`
- Markdown behavior, collections, routes, and filters: `.eleventy.js`
- Netlify build and headers: `netlify.toml`

## Publishing

Netlify installs the pinned dependencies, runs `pnpm build`, and publishes `_site/`. Pagefind, RSS feeds, sitemap, robots.txt, redirects, JSON-LD, canonical metadata, and social metadata are generated during the build.
