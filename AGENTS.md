# AGENTS.md - bensampica.com

These instructions apply to the whole repository unless a closer `AGENTS.md` overrides them.

## Purpose

Personal portfolio built with HugoBlox and Hugo. Content, site data, configuration, and local layout overrides are repository-owned; generated output and module caches are not.

## Commands

Use the pinned package manager from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

`pnpm build` runs the production Hugo build and Pagefind indexing. The site expects Hugo `0.156.0` per `hugoblox.yaml`.

## Editing Rules

- Edit content under `content/`, author data under `data/authors/`, settings under `config/_default/`, and repository-owned overrides under `layouts/`, `assets/`, or `static/`.
- Prefer content/configuration and local overrides over changing HugoBlox module source or cached dependencies.
- Do not hand-edit generated `public/`, `resources/`, Pagefind output, or `.hugo_build.lock`.
- Preserve front matter, internal links, image references, and content taxonomy when moving pages.
- Keep personal facts grounded in repository content or user-provided information; do not invent biography, employment, dates, or contact details.
- Do not publish or deploy unless explicitly requested.
- Update `README.md` when setup, prerequisites, structure, or publishing workflow changes.

## Completion

- Run `pnpm build` for content, configuration, template, or asset changes.
- Check generated-page errors and broken references reported by Hugo/Pagefind.
- Do not commit generated output unless the repository already tracks that exact artifact intentionally.
