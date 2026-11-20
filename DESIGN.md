# Design

How this site looks, and the rules every UI change follows. The tokens live in
`app/globals.css`; use them instead of new colors, sizes or fonts.

## The idea

A small-batch roaster in the Utah foothills, named for a juniper-covered ridge.
The page has no photos and says nothing that is not in `content/company.json`,
so type, color and one landscape shape carry the identity:

- **The name is the hero.** Archivo at its widest and heaviest, like the stamp
  on a coffee bag. Nothing else on the page competes with it.
- **The ridge** under the name is the one decorative element. Do not add others.
- **Everything else is quiet:** normal-width Archivo, generous spacing, thin rules.

## Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#e9ece4` | `#141c1b` | Page background |
| `--surface` | `#dce2d3` | `#1f2a28` | Panels and other raised areas |
| `--ink` | `#1c2826` | `#e6ebe2` | Text |
| `--muted` | `#55625e` | `#a2aea8` | Secondary text, closed days, footer |
| `--rule` | `#c3ccbb` | `#33403d` | Dividers |
| `--juniper` | `#3d5f7a` | `#9dbad3` | Links, buttons, focus, the visitor's side of the chat |
| `--on-juniper` | `#ffffff` | `#12212c` | Text on juniper |
| `--ridge-near`, `--ridge-far` | | | The ridge only |

Every pairing above meets WCAG AA contrast. Dark mode follows the visitor's
system setting.

## Type

One family, Archivo (`app/fonts`, OFL), varied by width and weight:

- Display (the name): `--display`, width 125%, weight 850, tight leading
- Headings: width 112%, weight 700; `h2` is `--step-1`, panel headings `--step-0`
- Tagline: `--step-1`, width 85%, muted
- Body: `--step-0`, width 100%, line height 1.6, lines at most `--measure`

Sentence case everywhere. No all-caps labels, no labels above headings.

## Layout

- One page width, `--page`, with a `--space-2` gutter; the hero uses the same
  so the name lines up with the content.
- Phones: one column, hours and contact first (what people come for), then
  about, questions, chat.
- From 52rem: content on the left, hours and contact in a sticky 20rem column.
- Spacing comes from `--space-1` to `--space-5`; corners from `--radius`.
- Tables of times use tabular numbers and never wrap a time.

## Components

- **Panel** (`.panel`): `--surface` background, `--radius`, `--space-3` padding.
  For grouped facts, not for every section.
- **Buttons:** `--juniper` with `--on-juniper` text; disabled at reduced opacity.
- **Text boxes:** `--paper` background, `--muted` border, `--radius`.
- **Focus:** always visible, a 2px `--juniper` outline.

## Checks

The home page has no serious or critical axe violations, in light and dark
mode, and no horizontal scroll at 375 pixels wide.
