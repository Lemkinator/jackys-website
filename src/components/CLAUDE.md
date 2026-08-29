# src/components/CLAUDE.md

- `Banner.astro`: full-bleed photo + gradient scrim + overlaid title. Don't hand-roll a new banner
  treatment.
- `Card.astro`: deliberately minimal: no `icon`, `date`, `interactionIcon`/counter, or
  `previewVideo` props (none of that exists on this site). Takes an optional `href`; when absent, it
  renders as a `<div>` instead of an `<a>` and exposes a `media` slot, used by the `/audio` track
  cards to embed a native `<audio>` player without nesting interactive controls inside a link.
- `Icon.astro`: trimmed to `instagram` / `email` / `chevron`, the only icons this site uses. Add new
  ones here rather than pulling in an icon font/CDN.
- `Logo.astro`: inline SVG (not an `<img>`), specifically so `currentColor` picks up the surrounding
  text color and the mark flips with the theme for free. Keep its path data in sync with
  `src/assets/logo/mark.svg` (the favicon-generation source), same "J as the harp's pillar and neck"
  mark, just `currentColor` vs. a fixed hex.
