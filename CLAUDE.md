# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DevPiece (formerly DevVault; an inline script in `BaseLayout.astro` migrates old `devvault-*` localStorage keys to `devpiece-*`). Demo: https://devpiece.vercel.app: a 100% static Spanish-language hub of curated developer tools, interactive guides and roadmaps. No backend, no auth server, no DB — all user state lives in `localStorage`. All UI copy and content is in Spanish.

## Commands

Package manager is pnpm, Node >= 22.12.0.

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # static build to ./dist — also the only validation step (Zod content schemas + TS types)
pnpm preview
```

There is no test suite, linter or formatter configured. `pnpm build` is the check to run before a PR: invalid MDX frontmatter fails the build.

## Stack

Astro 6 (`output: 'static'`) + MDX + React 19 islands + Tailwind CSS **3.4** (`tailwind.config.mjs`; the README badge saying v4 is wrong) + `@xyflow/react` for roadmaps + Fuse.js for search. TS strict, path alias `@/*` → `src/*`. Shiki theme `catppuccin-frappe`; new code-block languages must be added to `markdown.shikiConfig.langs` in `astro.config.mjs`.

## Architecture

**Content = Astro Content Collections.** `src/content.config.ts` defines one collection per category folder under `src/content/<category>/` (all share `toolSchema`), plus `guias` (`guiaSchema`, with `steps[]` that reference tools by `{slug, category}`). Entry `id` is the filename and becomes the URL slug.

**`CATEGORY_CONFIG` in `src/lib/utils.ts` is the category registry.** Routing (`src/pages/[category]/index.astro`, `[category]/[slug].astro` via `getStaticPaths`), the sidebar, `getAllTools()` in `src/lib/content.ts` and the search index all iterate its keys. Adding a category requires both a collection in `content.config.ts` and an entry in `CATEGORY_CONFIG` (label, accent color, etc.); a missing collection is silently swallowed by try/catch and yields an empty category. `guias` is deliberately not in `CATEGORY_CONFIG` — it has its own routes under `src/pages/guias/` and is not in the search index.

**Search:** `src/pages/search-index.json.ts` emits `/search-index.json` at build time from `buildSearchIndex()`; `CommandPalette.tsx` (Ctrl/⌘+K, mounted in `BaseLayout`) fetches it and runs Fuse.js client-side.

**Roadmaps** are not MDX: they are hardcoded node/edge data in `src/data/roadmaps.ts` (`ROADMAPS`, `getRoadmapBySlug`), rendered by `RoadmapCanvas.tsx`.

**Interactivity = React islands with `client:load`/`client:visible`** (CommandPalette, ArsenalPage, ArsenalBentoWidget, GuideIsland, RoadmapCanvas, LoginModal, CopyButton, filter islands). Astro pages/components are static; any state must go through an island.

**Client state contract (localStorage keys, shared across islands — keep names stable or users lose data):**
`devpiece-favorites`, `devpiece-integrations`, `devpiece-alternatives`, `devpiece-profiles`, `devpiece-current-profile`, `devpiece-guide-steps-{slug}`, `devpiece-guides-completed`, `devpiece-guides-favorites`, `devpiece-roadmap-{slug}`, `devpiece-user`, `devpiece-sidebar-collapsed`, `devpiece-sidebar-groups`, `devpiece-preferred-pm`, `devpiece-arsenal-rank`. Tools are stored as objects keyed by `category` + `slug` (deduped as `${category}/${slug}`), and each island/inline `<script>` (ToolCard, Sidebar, GuideIsland, ArsenalPage…) redeclares the key string itself — grep before renaming. Renaming an MDX file or category breaks saved arsenals.

**Arsenal Power** (gamified rank in `ArsenalPage`): `(favorites × 1 + integrations × 2 + core × 3) / 120 × 100`, capped at 100, mapped to 6 One Piece-themed ranks (Rookie Dev → Pirate King). `devpiece-arsenal-rank` stores the last rank index seen so a rank-up toast fires only on a real increase.

**Motion:** `src/scripts/motion.ts` (loaded from `TransitionController`) staggers `.reveal` cards in with an IntersectionObserver and drives the pointer spotlight/tilt on `.tool-card`; an inline script in `BaseLayout` sets `html[data-motion]` so CSS can hide cards before first paint. Both `ToolCard.astro` and the React cards in `CategoryFilterIsland` must keep `tool-card reveal`, `data-fav-slug`/`data-fav-cat`, `card-icon-wrap` and `card-title-el`: the card ↔ detail morph depends on them.

## Styling

Catppuccin Frappé palette defined as CSS variables in `src/styles/globals.css` and Tailwind theme; each category has its own accent color from `CATEGORY_CONFIG`. View transitions in `src/styles/transitions.css` + `TransitionController.astro`.

## Adding content

New tool: create `src/content/<category>/<slug>.mdx` with frontmatter matching `toolSchema` (required: `name`, `description` ≤200 chars, `category`, `tags`, `os` from `windows|macos|linux|cross`, `addedAt`). Body is Markdown/MDX shown on the tool page. Run `pnpm build` to validate.

`related` is a list of `category/slug` refs rendered as the "Relacionadas" block on the tool page; an unknown ref throws at build time. Brand icons for a new slug go in `SLUG_BRANDS` (`src/lib/tool-icons.ts`), otherwise the category's Lucide icon is used.
