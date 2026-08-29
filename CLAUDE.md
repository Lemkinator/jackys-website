# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Jaqueline Lemke's harp website (`www.jackys-harfe.de`) — built with **Astro 7**, deployed to GitHub
Pages via GitHub Actions (`.github/workflows/deploy.yml`, `withastro/action`). Rebuilt on Astro in
2026, replacing a hand-written static HTML/jQuery site (see git history before the `astro-rebuild`
branch).

## Language

**German only — no i18n.** There is no `src/i18n/`, no `/de/` route tree, no language toggle. All URL
paths, code, class names, and comments are English; all UI-visible strings are German, hardcoded
directly in components/pages.

## Theming — light and dark mode

This site supports both light and dark mode on a pink/rose palette behind a toggle. Colors live in
`src/styles/tokens.css` as a three-block pattern:

```css
:root { /* light values, always the fallback */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { /* dark values, system default */ }
}
:root[data-theme='dark'] { /* same dark values, explicit choice wins */ }
```

`[data-theme]` is set by an `is:inline` script at the top of `BaseLayout.astro`'s `<head>` (reads
`localStorage`, falls back to `matchMedia`) so there's no flash of the wrong theme — this runs on
every page load, since the site uses native cross-document view transitions
(`@view-transition { navigation: auto }` in `motion.css`), not `<ClientRouter />`, so there's no SPA
lifecycle to hook into instead. `src/scripts/theme.ts` handles what has to run after hydration:
syncing the toggle, persisting a change, re-following the OS setting only while nothing is stored,
and pushing the theme into the giscus iframe via `postMessage`.

`--color-on-media` and `--scrim-strong`/`--scrim-soft` are theme-independent, white-on-dark-scrim
tokens for `Card` titles, since a card's background photo isn't guaranteed to contrast with whichever
theme is active. `Banner` titles use themed tokens instead (`--color-fg` over a `--color-bg`-based
scrim, see the `.banner::after` comment in `Banner.astro`) — the two components intentionally follow
different rules, so don't unify them.

**`ThemeToggle.astro`** is adapted from `uiverse.io/Galahhad/strong-squid-82`
(`Toggle-switches/Galahhad_strong-squid-82.html` in `github.com/uiverse-io/galaxy`) — a day/night sky
toggle, recolored to rose/plum with sun and sky separated by *value* not hue (a same-hue sun on a
same-hue sky loses its focal point). The source component hid its checkbox with `display: none`,
which drops it from the tab order entirely — this version uses a visually-hidden clip instead, plus
`aria-label` and a `:focus-visible` ring.

## Banner artwork — one image per slot

`Banner.astro` takes a single `image` prop; there is no dark-mode variant and no `imageDark` prop.
Because banner/card text stays white-on-dark-scrim in both themes (see above), the banner itself
never has to hold text against a *light* ground, so one mid-tone image works passably in both themes
without any theme-specific asset.

`home/hero.jpg`, `about/banner.jpg`, `audio/banner.jpg`, and `contact/banner.jpg` are real photos.
`404/banner.jpg` and `imprint/banner.jpg` are AI-generated art.

`imageAlt` must describe the actual image. For an AI-generated banner (and all `tracks` cover
images), it starts with "KI-generiertes…" (EU AI Act Art. 50(4) disclosure); for a real photo it just
describes the photo. Image generation/sourcing is a manual step — write the prompt or pick the photo
and wire the resulting file in, never generate it here.

## Content collections (`src/content.config.ts`)

One collection, **`tracks`** — the Hörproben cards on `/audio`. Frontmatter: `title`, `composer`,
`audio` (a `public/audio/*.mp3` path string, not an image()-style import), `coverImage`,
`coverImageAlt`, `order`. Adding a track is a new `.mdx` file plus an MP3 in `public/audio/` — no
markup changes needed on `/audio` itself.

`public/audio/wrapped.mp3` is **not** a collection entry and must never become one — an external app
fetches it at that exact URL, so it has to stay a plain `public/` passthrough file, invisible to the
site itself.

## Design system

Hand-written CSS with `@layer` + BEM (no Tailwind), scoped to what this site actually uses:

- `src/styles/tokens.css` / `site.css` / `motion.css` / `base.css` — design tokens, component
  classes, and motion/view-transition rules. No timeline/Vita styling, video-embed, or
  mobile-screenshot rules — there is no Vita page and no app/media MDX content here, so don't
  reintroduce them speculatively.

Component-specific conventions live in `src/components/CLAUDE.md`.
