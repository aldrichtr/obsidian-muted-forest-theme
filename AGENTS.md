# AGENTS.md - Muted Forest Theme for Obsidian

A guide for humans and AI collaborators working in this repository. Read this
first, then look at the specific files it points to.

## Project goal

Build a functional, science-backed, muted color theme for Obsidian.

Three words drive every decision:

- Functional: the theme is a tool for people who read and write on a screen for
  hours. Legibility and low eye strain come before decoration.
- Science-backed: color choices are justified by research on visual fatigue, not
  taste alone. The working principles (see "Design principles" below) come from
  studies on luminance contrast, saturation, color temperature, and surface
  consistency.
- Muted: low-saturation, mid-spectrum (forest) tones. Saturated colors are
  reserved for small accents, never large surfaces.

Theme identity: a sage-tan to olive neutral ramp, a pastel yellow-to-brown warm
ramp, and a soft blue. Six accent hues (red, orange, pink, purple, cyan, green)
exist only as highlights.

## Design principles (the "science-backed" part)

These are constraints, not suggestions. When assigning colors, honor them.

1. Luminance contrast is the real driver of comfort, not hue. Target WCAG AA
   (4.5:1 for body text, 3:1 for large text and UI parts) as a floor. Aim for a
   comfort band of roughly 7:1 to 13:1 for primary text.
2. Avoid maximal contrast. Pure white on pure black (or near it, ~17:1+) is a
   known fatigue case. The palette has no pure white or black: the lightest step
   is --base25 and the darkest is --base975.
3. Keep surfaces close in luminance. Primary and secondary backgrounds should
   not jump far apart, so the eye does not constantly re-adapt between editor and
   sidebar. Adjacent surfaces are one ramp step apart.
4. Stay low-saturation on large areas. Muted tones reduce refocusing from
   chromatic aberration. Save saturation for accents.
5. Lean warm. Warmer tones and reduced large blue surfaces are easier in the
   evening; keep blues to small accents.
6. Ship both variants. Dark and light both exist so users can match their room;
   dark is not universally better.
7. Use perceptual lightness. All colors are oklch(). HSL lightness does not match
   perceived lightness (HSL yellow and blue at the same L look very different), so
   ramps built in HSL cannot line up.
8. Shared lightness columns. Every ramp uses the same lightness for the same step
   number (see "Palette" below), so a column looks equally light in every ramp and
   swapping one hue for another keeps contrast nearly the same. Only hue and
   chroma identify a ramp.

Any text/background pairing MUST be contrast-checked before it is committed.
Report both the WCAG 2 ratio (the compliance floor) and APCA Lc (a perceptual
check; about Lc 75+ for body text).

### Research basis

- Dark mode text color: in an eye-tracking study of negative polarity text,
  yellow text produced the least visual fatigue of the colors tested and red the
  most; yellow and white gave the best cognitive performance. Fan et al. 2024,
  Sensors 24(11):3516, doi:10.3390/s24113516. Basis for yellow dark-mode text.
- Light mode background: a light green background reduced visual fatigue (larger
  pupil diameter), reduced negative emotion and improved first-language reading
  compared with white. Effects varied by gender and task, and the wider literature
  is mixed. Li et al. 2025, Front. Psychol. 16:1627013,
  doi:10.3389/fpsyg.2025.1627013. Basis for a tinted (sage-tan) light background
  instead of white.
- Halation: very high contrast light-on-dark text appears to bleed, especially
  for readers with astigmatism. This is practitioner consensus more than
  controlled research. Basis for principle 2.
- "Nature colors are calming" is mostly learned color association, not eye
  physiology. It informs the theme's identity, not its measurements.

## Palette

All literal colors live in src/styles/palette.css as oklch() values.

### Columns

A step number is a column, and each column has one lightness for every ramp:

```
step  25   50   100  150  200  300  400  500  600  700  800  850  900  950  975
L     96%  93%  90%  86%  81%  72%  62%  54%  48%  36%  30%  27%  24%  21%  18%
```

Steps are closer together at both ends (surfaces, borders) and wider in the
middle (text). A new ramp must use these lightness values. A new step means a new
column with a fixed lightness, not a one-off value in one ramp.

### Ramps

- base (all 15 steps): the neutral ramp for both modes. Hue drifts from 104
  (sage-tan) to 123 (olive). Chroma is U-shaped: tinted at both ends (about
  0.018 to 0.022) and near neutral where text lives (0.012), so light-mode text
  reads as gray. --base950 matches the original --green70.
- yellow (50 to 200) and brown (300 to 900): one warm ramp under two names.
  Pastel chroma (about 0.040). Hue warms from 98 to 55 as it darkens, so the dark
  steps read brown instead of olive. --brown300 is the original brown10.
- blue (50 to 200, 400 to 600, 900): hue about 232, chroma 0.025 to 0.037.
  --blue400 and --blue500 are the original blue20 and blue30.
- Accents: red, orange, pink, purple, cyan and green at steps 50, 150, 200, 400,
  500, 600 and 900. They share a higher chroma tier (about 0.06 to 0.09) so the
  hues stay distinguishable; orange (x1.25), green (x1.2) and pink and purple
  (x1.1) are raised to separate them from brown, the base, red and each other.
  Red (hue 28 to 35) leans brick or maroon. Cyan (hue 180) stays 52 degrees from
  blue. Green (hue 140) sits between the olive base and cyan. Every accent step is
  capped at 90% of the sRGB gamut limit for its lightness and hue.

Accent step roles: 150 dark-mode text, 200 dark-mode hover, 400 dark-mode icons
and borders, 500 light-mode icons and borders, 600 light-mode text, 50 and 900
callout and status surfaces. Step 400 is only about 3:1 on the light background;
do not use it there.

### Role decisions locked so far

Dark mode (.theme-dark):

- Editor background --base975; code and alt surfaces --base950.
- Sidebar --base950; surfaces on the sidebar --base900.
- Body text --yellow150: 12.3:1 / Lc 78 on the editor, 11.6:1 on the sidebar.
- Muted text --yellow200: 10.4:1 / Lc 69. Faint text --base400: 5.2:1.
- Links --blue150: 12.4:1. Accent --green400: 5.3:1 as a UI color.

Light mode (.theme-light):

- Editor background --base50; code and alt surfaces --base25.
- Sidebar --base100; surfaces on the sidebar --base50.
- Body text --base700: 8.8:1 / Lc 82 on the editor, 8.1:1 on the sidebar.
- Muted text --base600: 5.3:1 / Lc 69 (4.8:1 on the sidebar).
- Faint text --base400: 3.0:1, placeholders and line numbers only.
- Links --blue600: 5.3:1. Accent --green600: 5.1:1.

Body text is matched across modes (Lc 78 dark, Lc 82 light) and muted text
nearly so (Lc 69 and 69). The full role map is in src/styles/dark/foundations.css
and src/styles/light/foundations.css.

### Known gaps

- Light: --text-muted on --background-modifier-hover (base600 on base150) is
  4.3:1, below AA.
- Both modes: --text-on-accent on --interactive-accent-hover (base25 on
  green500) is 4.3:1, below AA.
- --color-yellow and --color-blue come from the identity ramps (brown400/600,
  blue400/600), so they are lower in chroma than the other accent colors.
- Links are about as light as body text, so color alone does not mark them. Keep
  link underlines on.

## Tech stack

- Plain CSS compiled with PostCSS (postcss-cli).
- Plugins (see postcss.config.mjs):
  - postcss-import: inlines the `@import url(...)` statements into one file.
  - postcss-nested-import: supports nested imports.
  - settings-inject (custom, in postcss.config.mjs): replaces a
    `/* @settings-inject */` marker comment with an Obsidian Style Settings
    block built from the verbatim contents of src/settings.yaml.
  - postcss-nested is present in devDependencies.
- Linting: stylelint with stylelint-config-standard, stylelint-config-obsidianmd
  and stylelint-config-clean-order.
- Node ESM project ("type": "module"). Helper scripts are .mjs.

Note on terminology: the build inlines `@import url(...)` via postcss-import.
There is no `@include` / postcss-include step despite how it is sometimes
described in conversation.

## Commands

Run from the repo root.

- Build the theme:        npm run build:css
  (postcss src/styles/main.css -o theme.css)
- Lint CSS:               npm run lint:css
  (stylelint "src/**/*.css" --cache-location ./.cache/ --cache-strategy content)
- Remove the build:       npm run clean:css
- Install into the vault: npm run install:theme
- Version bump:           npm version <x.y.z> --no-git-tag-version
  (runs the "version" lifecycle script, version-bump.mjs)

install:theme (install.mjs) clones community-archive/theme-dev-vault into
theme-test-vault/ (via gh) if that folder is missing, then copies manifest.json and
theme.css into theme-test-vault/.obsidian/themes/<ThemeName>/ where <ThemeName> is
the "name" field in manifest.json. It does not rebuild; run build:css first.

Stylelint reads only `cache` from stylelint.config.mjs. cacheLocation and
cacheStrategy are CLI/API options, so they live on the lint:css command line.

## Project structure

```
obsidian-muted-forest-theme/
+-- AGENTS.md                 <- this file
+-- README.md                 <- project readme (local testing, release steps)
+-- manifest.json             <- Obsidian theme manifest (name: MutedForest)
+-- package.json              <- scripts + devDependencies
+-- postcss.config.mjs        <- build pipeline (import + settings-inject)
+-- stylelint.config.mjs      <- lint rules
+-- install.mjs               <- clone test vault if missing + copy theme in
+-- version-bump.mjs          <- manifest/versions bump helper
+-- versions.json             <- theme version -> min Obsidian version map
+-- theme.css                 <- BUILD OUTPUT (generated; do not edit by hand)
+-- obsidian-vars/            <- reference: Obsidian's own CSS variables
|   +-- foundations.css        (variable catalog, grouped as Obsidian documents it)
|   +-- components.css
|   +-- editor.css
|   +-- plugins.css
|   +-- window.css
+-- theme-test-vault/         <- local vault for visualizing/testing the build
+-- src/
    +-- settings.yaml         <- Style Settings YAML injected at build time
    +-- styles/
        +-- main.css          <- ENTRY POINT. postcss is pointed here.
        +-- preamble.css      <- compiled-file banner comment
        +-- palette.css       <- oklch color tokens (--base25 .. --green900)
        +-- foundations.css   <- COMMON foundations; imports dark + light
        +-- common/           <- shared partials
        +-- dark/
        |   +-- foundations.css   (.theme-dark variable assignments)
        +-- light/
            +-- foundations.css   (.theme-light variable assignments)
```

## CSS architecture

The import cascade is the backbone. main.css pulls in three files in order:

```
main.css
  -> preamble.css     (banner comment)
  -> palette.css      (raw color tokens)
  -> foundations.css  (common foundations)
       -> dark/foundations.css    (.theme-dark)
       -> light/foundations.css   (.theme-light)
```

Pattern: a common file at src/styles/ holds mode-independent values, then imports
the like-named file from BOTH dark/ and light/. Each of those scopes its rules
under .theme-dark or .theme-light and assigns the mode-specific colors. New
feature files follow the same shape: common at src/styles/<name>.css, which
imports dark/<name>.css and light/<name>.css.

Selectors: palette.css uses :root (the tokens are ours, so nothing competes).
Common files that override Obsidian's own variables use body, because Obsidian
sets its variables on body and a :root value would lose. Mode files use
.theme-dark and .theme-light. Never use .body: Obsidian has no element with that
class, so the rules would match nothing.

### Two layers of color indirection

1. palette.css defines raw tokens as oklch() values in ramps: base, yellow,
   brown, blue, and the red, orange, pink, purple, cyan and green accents. These
   are the only place literal colors live.
2. The dark/ and light/ foundations map Obsidian's own variables (e.g.
   --background-primary, --text-normal, --color-green) onto palette tokens using
   var(--<ramp><step>). Feature files consume Obsidian variables; they do not
   reach back into the palette directly.

Keep that separation: assign palette tokens only inside the dark/ and light/
variable maps. The obsidian-vars/ folder is a read-only catalog of every Obsidian
variable (grouped the way the Obsidian docs group them) and is the reference for
which variable names exist and what they do.

### Obsidian color slots

- --color-base-00 to --color-base-100 follow the roles: 00 is the page-background
  end, 100 the text end. In dark mode 70 and 100 are --yellow200 and --yellow150,
  because Obsidian uses those slots for text.
- --accent-h, --accent-s and --accent-l hold the accent token as HSL numbers
  (Obsidian builds --color-accent from them; users can override it under
  Settings > Appearance). Keep them in step with --interactive-accent by hand.
- Do not set the -rgb or -hsl variables (--color-*-rgb, --mono-rgb-0/100,
  --interactive-accent-hsl, --color-accent-hsl, --background-modifier-*-rgb,
  --text-highlight-bg-rgb). They are deprecated as of Obsidian 1.13, which mixes
  colors in OKLCH. For transparency use
  color-mix(in oklch, var(--color-red) 20%, transparent).
- Do not change --mono-0 or --mono-100 (Obsidian's docs advise against it).

## Conventions for collaborators

- ASCII only. No em dashes, no curly quotes, no non-ASCII punctuation anywhere in
  the repo. Clean, boring ASCII that any tool can parse.
- Never hand-edit theme.css. It is generated by the build. Edit sources under
  src/styles/ and rebuild.
- Literal colors live only in palette.css, as oklch(L% C Hdeg). Hue needs the deg
  unit (lint rule). Everywhere else references a token with var(--<ramp><step>).
- Token names are --<ramp><step> with no dash: --base950, --yellow150, --red600.
  Use the shared column lightness for any new token (see "Palette").
- Contrast-check every text/background pairing against both the primary and the
  secondary background for that mode before committing it, with the WCAG ratio
  and APCA Lc.
- Empty var() placeholders in the foundations files are intentional "to do"
  markers for slots not yet assigned; leave them unless you are filling them.
- Non-color slots are not colors: --cursor is default, --cursor-link is pointer.
- Mirror dark and light. A variable assigned in one mode should be considered in
  the other.
- Prefer small, reviewable changes and keep lint clean (npm run lint:css).

## Status

v0.2.0 is tagged: a snapshot of the original HSL palette. Since then the palette
has been rebuilt in oklch, and the core foundations roles (backgrounds, text,
borders, interactive, status, accents, --color-base-*) are assigned in both
modes. Next: individual elements (headings, callouts, tags, code), starting with
src/styles/editor.css. The GitHub lint workflow fails until package-lock.json is
committed (it is currently gitignored).
