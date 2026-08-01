# aasuka.com

Aasuka's personal site: F1 Fantasy league analysis, a podcast page, and a blog, all in one static Next.js app. Deployed as a static export (Netlify) to `aasuka.com`, with `f1fantasy.aasuka.com` kept alive as an alias to `/f1-fantasy`.

## Stack

- **Next.js 16** (App Router, `output: "export"` static build) + **React 19** + **TypeScript**
- CSS Modules for styling (no UI framework)
- MDX (`next-mdx-remote` + `gray-matter`) for blog content
- `fast-xml-parser` to read the podcast RSS feed at build time
- Bilingual UI (English / Chinese) and light/dark theme, shared site-wide via a React context and persisted to `localStorage`

## Site map

```
/                          Home — hero + cards linking into the three sections
/f1-fantasy                F1 Fantasy dashboard (standings, ownership, predictions)
  /f1-fantasy/leagues/[leagueId]/changes
  /f1-fantasy/leagues/[leagueId]/teams/[teamId]
/podcast                   Intro + latest episode + series ("album") grid
  /podcast/category/[slug] Full episode list for one series
  /podcast/episode/[slug]  Single episode, native audio player
/blog                      Post list
  /blog/[slug]             MDX post
```

Adding a future section is just: a new folder under `src/app/`, a matching content folder under `src/content/` if it needs one, and a link in `src/components/ui/SiteHeader.tsx`.

## Shared chrome

- `src/app/layout.tsx` wraps every page in `SitePreferencesProvider` (`src/lib/site-preferences.tsx`) plus a global `SiteHeader` / `SiteFooter` (`src/components/ui/`) — theme and locale are one piece of state shared across all sections, not per-page.
- Shared UI primitives (`src/components/ui/`): `Card` (home), `SectionHero` (blog), `WireframeSphere` + `FlyingParrot` (animated hero pieces), `AlbumCover` (podcast) — new sections can draw from the same building blocks rather than reinventing them.
- Site-wide chrome copy (nav, footer, home/podcast/blog hero text) lives in `src/lib/site-messages.ts`, separate from the F1-Fantasy-specific dictionary in `src/lib/messages.ts`.

## F1 Fantasy section

Reads pre-generated JSON exported by a companion "strategist" scraper repo — not fetched live from F1 Fantasy.

```
/Users/aasuka/Projects/interests/F1 Fantasy/F1-Fantasy-Strategist/build/league-site-data/
        → public/data/league-data/
```

Structure under `public/data/league-data/`:
- `manifests/league-index.json` — list of leagues, their views (races), and file pointers
- `leagues/league_<id>/views/<race>.json` — per-race team standings/lineups/chips/transfers
- `leagues/league_<id>/insights/<race>.json` — derived ownership %, pick pairs, uniqueness, momentum/prediction stats

`src/lib/league-data.ts` loads/resolves this data at runtime; `src/lib/types.ts` defines the full shape. Whenever the strategist export changes, refresh the JSON under `public/data/league-data/` and redeploy — there's no auto-sync.

Pages: `src/components/F1FantasyDashboard.tsx` (main dashboard), `LeagueChangesPage.tsx` (league-wide change log), `TeamSeasonPage.tsx` (per-team season history with points/rank trend charts). Season aggregation logic lives in `src/lib/season-data.ts`.

## Podcast section

Reads the real podcast RSS feed (`https://media.rss.com/aasuka/feed.xml`, hosted on RSS.com) at **build time** — `src/lib/podcast-rss.ts` fetches and parses it with `fast-xml-parser`, so episode data is baked into the static export and only updates on the next build/deploy (no live fetch in the browser).

**Categorization convention**: episode titles follow `EP <code>.<number> <title>` (e.g. `EP F.5 F1 2026 摩纳哥站回顾...`). `podcast-rss.ts` parses that prefix into `categoryCode` + `episodeNumber` + the cleaned display `title`, and derives a stable slug (`f-5`, `f-4`, ...) from it. Episodes whose titles don't match the pattern still show up (e.g. in "latest episode") but aren't slotted into a series.

`src/lib/podcast-categories.ts` is the hand-maintained mapping from those codes to the five series, with bilingual name/description:
| Code | Series |
|---|---|
| `F` | F1 |
| `S` | Other Sports |
| `L` | Personal Life |
| `I` | Intellectual Pleasure |
| `P` | Pulp Fiction |

Adding a new series later = add an entry to `PODCAST_CATEGORIES` with its code; new matching episodes from the feed pick it up automatically on the next build. Series with no episodes yet still render (placeholder cover + "coming soon" state) rather than being hidden.

**Pages**: the hub (`PodcastHubView.tsx`) has an intro block with a looping flying-parrot animation, a "latest episode" block, and a horizontally scrolling "album" carousel of all five series. Category pages (`CategoryPageView.tsx`) list every episode in a series. Episode pages (`EpisodePageView.tsx`) show cover, title, "listen on" platform buttons, and a plain-text description (HTML tags stripped) — the fuller episode-page design is still to be discussed.

**Headline typography**: the "AASUKA COSMOS" title uses **Raster Forge** (`src/fonts/RasterForge-Regular.woff2`, CC0 — GGBotNet; source + `LICENSE.txt` kept in `assets/fonts/raster-forge/`), loaded via `next/font/local` (`src/lib/fonts.ts`) rather than `next/font/google` since it isn't on Google Fonts. Rendered with a gunmetal neon-glow `text-shadow` stack on the dark theme; a light glow only reads as "lit" against a dark ground, so the light theme (`:global(html[data-theme="light"]) .title`) swaps to a solid gunmetal fill with a soft emboss shadow instead of trying to glow against a light background. Raster Forge has no CJK glyphs, so the `zh` locale's headline uses **Noto Sans TC Bold** instead (`.titleZh` in `PodcastHubView.module.css`) — SIL OFL, sourced from Google Fonts' `css2` API with a `text=` param subsetted to just the four glyphs actually used (`src/fonts/NotoSansTC-Bold-headline-subset.woff2`, ~1.6KB; re-subset with a wider `text=` param if this font gets reused for other Chinese copy). The zh `podcastName` is set in Traditional Chinese (`鳥舍雜俎`, not Simplified `鸟舍杂俎`) specifically to pair with this font. `.titleZh` also applies `transform: scaleX(1.18) scaleY(0.88)` (`transform-origin: left top`, not `display: inline-block` — that broke the block-level line-break before the headline, pulling it up next to the eyebrow pill) since Noto Sans TC's glyphs sit in a roughly square box by default and read closer to Raster Forge's own flat/wide proportions once squashed. Its font-size is a separate scaled-up `clamp(2.35rem, 5.15vw, 3.47rem)` rather than an `em` multiplier on top of `.title`'s own clamp — since both classes target the same element, a same-property override on `.titleZh` fully replaces `.title`'s value instead of compounding with it, so an `em` value there resolves against the *inherited* (body-level, 16px) font-size, not `.title`'s own — which is exactly the bug that first shipped this (rendered at ~18px instead of ~50px). Body copy and UI chrome are still on the system CJK fallback pending a decision on those faces.

**Flying parrot** (`src/components/ui/FlyingParrot.tsx`): a real two-frame sprite swap between the user's own wings-up and wings-down watercolor illustrations (`public/images/flying-parrot-1.{webp,png}` / `flying-parrot-2.{webp,png}`, sourced from `assets/flying_bird.png` / `flying_bird2.png`), alternated via a `steps(1)` opacity keyframe for a hard-cut flap rather than a crossfade. No CSS rotate/scale is applied to the artwork itself — that had been smearing the two eyes together into a "third eye" artifact when combined with `drop-shadow` during motion; the flight path is the only transform now. The path itself is `requestAnimationFrame`-driven rather than a fixed CSS keyframe, so every pass across the header randomizes its speed (9–11.5s, faster than the old fixed 15s), launch height, and a sine-based weave (amplitude + cycle count + phase all randomized) — no two passes fly the same line. The fast wing-flap flutter is a separate small CSS `bob` animation on a nested wrapper so it doesn't fight the JS-driven transform on the outer element. Background removal keys alpha by flood-filling background-colored pixels inward *only from the image border*, so a pixel is only ever classified as background if it's actually reachable from outside the bird through a continuous near-background-colored path — a flat global color-distance threshold had been punching tiny transparent holes straight through the bird's soft gray head-shading (color-close to the cream paper), which read as scattered black flecks/a "third eye" once composited on the site's dark navy background; the flood-fill can't touch pixels enclosed by the silhouette regardless of their own color, so that class of hole is now structurally impossible. Both frames are cropped to a shared bounding box so they stay pixel-aligned when swapped. Loops right-to-left; `prefers-reduced-motion`-aware (shows a static wings-up frame, no flap or flight).

**Platform links** (`src/lib/podcast-platforms.ts` + `PlatformIcon.tsx`): RSS.com is per-episode (real URL from the feed). Apple Podcasts, Spotify, Xiaoyuzhou, Bilibili, and YouTube are show/channel/playlist-level — the same link on every episode page, since those platforms don't expose a derivable per-episode URL from the RSS feed. Buttons use each platform's real logo (Apple/Spotify/RSS/Bilibili/YouTube via CC0-licensed [Simple Icons](https://simpleicons.org) path data with authentic brand colors; Xiaoyuzhou via their own site's mask-icon SVG in `public/icons/`, applied as a CSS `mask-image` since its ~11KB traced path isn't worth inlining). Hovering a button swaps the cursor for a small headphone glyph and triggers a pulsing accent-colored glow. `EPISODE_LEVEL_LINKS` lets a specific episode override Bilibili/YouTube with its own video link later, without needing one for every episode.

**Series carousel** (`AlbumCarousel.tsx`): horizontally scrolling track instead of a grid, with three independent behaviors layered on top of native scroll:
- The series array is rendered twice back-to-back and auto-scroll only ever increases `scrollLeft` (right-to-left, never ping-pong); once it passes the width of one full set (measured via `offsetLeft` between corresponding cards in the two copies) it subtracts that width back off, so the wrap from the end of the first copy to the start of the second is seamless — verified by comparing the two scroll positions pixel-for-pixel.
- A scroll listener measures each card's distance from the track's center and scales it up to 1.2× right at center, with a tight quadratic falloff (a fraction of one card's own width, not half the viewport) so only the card actually centered visibly enlarges rather than a broad spread of neighbors. Applied via direct DOM writes to `card.style.transform` instead of React state, since re-rendering the whole list on every scroll frame was what made the scaling look stuttery. Cards have a wide 72px gap so the enlarging card has room to grow without overlapping its neighbors. `.track` needs real top/bottom padding (60px) for this, not just `overflow-y: visible` — `overflow-x: auto` forces the browser to compute `overflow-y` as `auto` too (one axis can't scroll while the other stays truly unclipped), so without that padding the enlarged center card's top edge was getting clipped by the track's own box.
- It also drifts slowly on its own via a `requestAnimationFrame` loop nudging `scrollLeft` — paused only for actual interaction (`pointerdown` or `wheel`), not mere hovering, which had made the pause zone feel oversized; resumes automatically 450ms after the interaction ends (a wheel event both pauses and self-schedules its own resume, so it can't get stuck paused if a pointerup never fires). Deliberately has no `scroll-snap-type`: that fights small continuous programmatic increments by snapping back every frame, which is what caused an early version to look "stuck."
- Hovering a cover shows `Waveform.tsx`, seven bars animating with staggered delays to simulate a fluctuating audio visualizer (paused via `animation-play-state` until hovered, so it costs nothing at rest).

## Blog section

Posts are `.mdx` files in `src/content/blog/`, with frontmatter (`title`, `date`, `summary`, `tags`). `src/lib/blog.ts` reads and parses them via `gray-matter`; `src/app/blog/[slug]/page.tsx` renders them via `next-mdx-remote/rsc`'s `compileMDX`, statically at build time. Add a post by dropping a new `.mdx` file in that folder — no code changes needed.

## Visual design

Brand-derived, not a generic template — grounded in the actual podcast cover art (`AASUKA COSMOS`) and the parrot avatar, sourced from `assets/`. Palette is navy-indigo + red-orange only (no purple), defined as CSS custom properties in `src/app/globals.css` (`:root` = dark, `html[data-theme="light"]` = light), so every component that already references `var(--foreground)`, `var(--panel)`, `var(--accent-text)`, etc. inherits it automatically — no page had to be touched individually to reskin.

Two directions from the design-study phase, split by section per how each one is actually used:
- **"Orbit"** (Home, Podcast, Blog) — the fuller treatment: a wireframe sphere-weave hero (`src/components/ui/WireframeSphere.tsx`), grain texture, serif body copy (`--font-serif`), bold uppercase display headlines. Appropriate for marketing/reading pages, not for dense data.
- **"Telemetry"** (F1 Fantasy dashboard) — quieter and flatter, no wireframe/grain, built to stay legible across dense tables. This was already the dashboard's character from the original build; it only needed the accent hex harmonized, not a rebuild.

`WireframeSphere` is a from-scratch port of a user-supplied `assets/4d2.py` matplotlib script: ~80 Villarceau-style circles on a torus (each circle's own rotation is coupled into its own parametrization, which is what produces the interwoven "basket-weave sphere" look rather than a plain grid), reprojected in real 3D on every animation frame — not a flat CSS spin — with independent azimuth/roll/elevation rotation so it tumbles rather than spinning flat, plus depth-based line shading for the sense of a solid rotating sphere. Colors are read from CSS custom properties (`--wireframe-accent/pale/navy`) via `getComputedStyle` and re-read reactively on theme toggle through a `MutationObserver` on `<html data-theme>`, so it's correct in both themes without a page reload. Respects `prefers-reduced-motion`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Static export output goes to `out/` (`output: "export"` in `next.config.ts`).

## Deployment

- Configured for **Netlify** (`netlify.toml`: `npm run build`, publish `out`, Node 20, 5-min cache header on `/data/league-data/*`)
- Primary domain: `aasuka.com` (`public/CNAME`)
- `f1fantasy.aasuka.com` was the whole site pre-restructure (F1 Fantasy dashboard at its root); add it as an additional domain on the same Netlify site, and `netlify.toml`'s redirect rule 301s it to `aasuka.com/f1-fantasy` so old links/bookmarks keep working instead of hitting a dead or duplicate site.

## Build log

| Date | Commit | Summary |
|---|---|---|
| 2026-03-30 | `a2dd040` | Initial static dashboard: league standings, ownership insights, prediction views, first sample dataset (league 871710) |
| 2026-03-30 | `bc62552` | Add Netlify build/publish config |
| 2026-03-31 | `caab192` | Floating sidebar nav, theme toggle, bilingual (EN/ZH) UI, scrollable standings |
| 2026-03-31 | `206c09a` | Simplified hero, GitHub shortcut, standings show team numbers, removed noisy placeholder values |
| 2026-03-31 | `c09a57c` | Added league changes page and per-team season pages; refreshed exported race data (added Japanese GP) |
| 2026-03-31 | `44a7690` | Aligned team numbers with exported manager labels; added points/rank trend charts to team season page |
| 2026-07-30 | _(pending)_ | Restructured into a multi-section site: F1 Fantasy moved to `/f1-fantasy`, added `/podcast` and MDX-backed `/blog`, promoted theme/locale to a site-wide context, extracted shared `Card`/`SectionHero`/header/footer primitives |
| 2026-07-30 | _(pending)_ | Applied brand-derived visual design: navy-indigo + red-orange palette (dark + light), serif/uppercase typography and a wireframe-sphere hero on Home/Podcast/Blog, F1 Fantasy dashboard accent harmonized to match |
| 2026-07-31 | _(pending)_ | Wired the podcast page to the real RSS.com feed: series/category pages, per-episode pages, album-style hub grid, flying-parrot intro animation |
| 2026-07-31 | _(pending)_ | Replaced the episode audio player with per-platform "listen on" buttons (RSS.com/Apple/Spotify/Xiaoyuzhou/Bilibili/YouTube); rebuilt the flying parrot as a hand-coded SVG with a real wing-flap instead of a sliding image |
| 2026-07-31 | _(pending)_ | Redesigned the parrot with Wingspan-informed shading/anatomy and fixed its facing direction; added real platform logos with headphone-cursor + glow hover; rebuilt the series grid as a center-scaling horizontal carousel with hover waveform animation |
| 2026-07-31 | _(pending)_ | Swapped the hand-coded parrot SVG for real user-generated watercolor artwork (background-removed, compressed to WebP); made the series carousel auto-scroll on its own (pausing for user interaction); fixed a `scroll-snap-type` vs. programmatic-scroll conflict that had silently frozen the auto-scroll |
| 2026-07-31 | _(pending)_ | Rebuilt the parrot as a genuine two-frame sprite swap between the user's wings-up/wings-down artwork (fixing a "third eye" artifact from motion-distorted single-frame CSS transforms); shrank the carousel's pause hitbox/delay to real interaction only, switched center-scaling to direct DOM writes with a tighter falloff for a smooth single-card pop, widened card gaps, and made the auto-scroll a seamless one-direction (right-to-left) infinite loop |
| 2026-07-31 | _(pending)_ | Fixed residual black speckle on the parrot sprite (still visible against the dark theme after the "third eye" fix above): root cause was global color-distance alpha keying punching holes through soft gray head-shading; switched to border-flood-fill alpha keying so pixels enclosed by the silhouette can never be classified as background, then reprocessed both frames |
| 2026-07-31 | _(pending)_ | Replaced the parrot's fixed CSS `fly-across` keyframe with a `requestAnimationFrame`-driven flight path that randomizes speed, launch height, and a sine weave on every pass, and sped it up (~9–11.5s vs. the old fixed 15s) |
| 2026-07-31 | _(pending)_ | Restyled the podcast headline with Raster Forge (CC0 pixel font, `next/font/local`) and a gunmetal neon glow on dark theme / solid emboss on light theme; fixed the album carousel's center-scaled card getting its top clipped by `.track`'s implicit `overflow-y: auto` |
| 2026-07-31 | _(pending)_ | Gave the zh headline its own real font (Noto Sans TC Bold, subsetted) instead of the unstyled system CJK fallback; switched `podcastName` to Traditional Chinese to pair with it; squashed/widened the glyphs to read closer to Raster Forge's flat proportions |

## Open items / notes

- Only one league (`league_871710`) is currently exported into `public/data/league-data/`.
- No test suite configured yet — `npm run lint` (ESLint 9 + `eslint-config-next`) is the only checked-in quality gate.
- Podcast episode titles/descriptions come straight from the RSS feed, so they render in whatever language they were published in (currently Chinese) regardless of the site's EN/ZH toggle — only the surrounding chrome (nav, footer, series names/descriptions) is actually bilingual.
- Episode page is intentionally minimal (see Podcast section above) — revisit its design once discussed.
- Podcast series covers are placeholders generated from the site palette; swap in real cover art per series in `PODCAST_CATEGORIES` (`src/lib/podcast-categories.ts`) via `AlbumCover`'s `imageUrl` prop whenever it's ready.
- `assets/` (brand source images, the `4d2.py` wireframe script, `flying_bird.png` / `flying_bird2.png`) is not consumed at build time — only used as design reference/source material, already processed into `public/images/` and `public/icons/` or baked into component code. Safe to keep or remove from the repo.
