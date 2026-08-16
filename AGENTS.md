# AGENTS.md - bensampica.com

These instructions apply to the whole repository unless a closer `AGENTS.md` overrides them.

## Purpose

Personal portfolio and software engineering blog built with Eleventy. Content, site data, templates, styles, and client enhancements are repository-owned; generated output is not.

## Commands

Use the pinned package manager from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

`pnpm build` runs the production Eleventy build and Pagefind indexing. `pnpm check` crawls generated output for missing SEO metadata, broken internal references, missing routes, and content parity failures.

## Editing Rules

- Edit articles and library content under `src/content/`, site identity and experience data under `src/_data/`, templates under `src/_includes/` and `src/pages/`, source assets under `src/assets/`, and public files under `src/static/`.
- Prefer normal Markdown, Nunjucks, CSS, and small local JavaScript enhancements over adding a frontend framework or large theme dependency.
- Do not hand-edit generated `_site/` or Pagefind output.
- Preserve front matter, internal links, image references, and content taxonomy when moving pages.
- Keep personal facts grounded in repository content or user-provided information; do not invent biography, employment, dates, or contact details.
- Do not publish or deploy unless explicitly requested.
- Update `README.md` when setup, prerequisites, structure, or publishing workflow changes.

## Completion

- Run `pnpm build` for content, configuration, template, or asset changes.
- Run `pnpm check` and resolve generated-page, SEO, content-parity, and broken-reference failures.
- Do not commit generated output unless the repository already tracks that exact artifact intentionally.
