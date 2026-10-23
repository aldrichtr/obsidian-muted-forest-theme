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

Theme identity: warm greens and browns with desaturated blues and a neutral gray
ramp. Accent hues (orange, cyan, pink, red, purple) exist only as highlights.

## Design principles (the "science-backed" part)

These are constraints, not suggestions. When assigning colors, honor them.

1. Luminance contrast is the real driver of comfort, not hue. Target WCAG AA
   (4.5:1 for body text, 3:1 for large text) as a floor. Aim for a comfort band
   of roughly 7:1 to 13:1 for primary text.
2. Avoid maximal contrast. Pure white on pure black (or near it, ~17:1+) is a
   known fatigue case. Do not use the absolute anchors (black40 / white00) for
   large text surfaces; use the ramp steps instead.
3. Keep surfaces close in luminance. Primary and secondary backgrounds should
   not jump far apart, so the eye does not constantly re-adapt between editor and
   sidebar.
4. Stay low-saturation on large areas. Muted tones reduce refocusing from
   chromatic aberration. Save saturation for accents.
5. Lean warm. Warmer tones and reduced large blue surfaces are easier in the
   evening; keep bright blues to small accents.
6. Ship both variants. Dark and light both exist so users can match their room;
   dark is not universally better.

Any text/background pairing MUST be contrast-checked before it is committed.

### Color decisions locked so far

- Dark theme body text: var(--yellow10) on var(--green70) (~9.2:1).
- Light theme body text: var(--gray70) on var(--brown00) (~6.5:1).

## Tech stack

- Plain CSS compiled with PostCSS (postcss-cli).
- Plugins (see postcss.config.mjs):
  - postcss-import: inlines the `@import url(...)` statements into one file.
  - postcss-nested-import: supports nested imports.
  - settings-inject (custom, in postcss.config.mjs): replaces a
    `/* @settings-inject */` marker comment with an Obsidian Style Settings
    block built from the verbatim contents of src/settings.yaml.
  - postcss-nested is present in devDependencies.
- Linting: stylelint with stylelint-config-obsidianmd and stylelint-order.
- Node ESM project ("type": "module"). Helper scripts are .mjs.

Note on terminology: the build inlines `@import url(...)` via postcss-import.
There is no `@include` / postcss-include step despite how it is sometimes
described in conversation.

## Commands

Run from the repo root.

- Build the theme:        npm run build:css
  (postcss src/styles/main.css -o theme.css)
- Lint CSS:               npm run lint
  (stylelint "src/**/*.css")
- Install into a vault:   npm run install:vault -- "C:\path\to\TestVault"
  or set OBSIDIAN_TEST_VAULT once, then: npm run install:vault
- Version bump:           npm run version

install:vault (install.mjs) rebuilds theme.css if it is missing or older than any
file under src/styles/, then copies manifest.json and theme.css into
<vault>/.obsidian/themes/<ThemeName>/ where <ThemeName> is the "name" field in
manifest.json.

## Project structure

```
obsidian-muted-forest-theme/
+-- AGENTS.md                 <- this file
+-- README.md                 <- upstream template readme (publish/release steps)
+-- manifest.json             <- Obsidian theme manifest (name: MutedForest)
+-- package.json              <- scripts + devDependencies
+-- postcss.config.mjs        <- build pipeline (import + settings-inject)
+-- stylelint.config.mjs      <- lint rules
+-- install.mjs               <- build-if-stale + copy into a test vault
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
        +-- palette.css       <- raw color tokens (--green00..--purple40), hsl()
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

### Two layers of color indirection

1. palette.css defines raw tokens as hsl() values: --green00 through --green70,
   plus brown, blue, gray, yellow, and accent ramps. These are the only place
   literal colors live.
2. The dark/ and light/ foundations map Obsidian's own variables (e.g.
   --background-primary, --text-normal, --color-green) onto palette tokens using
   var(--<colorNN>). Feature files consume Obsidian variables; they do not reach
   back into the palette directly.

Keep that separation: assign palette tokens only inside the dark/ and light/
variable maps. The obsidian-vars/ folder is a read-only catalog of every Obsidian
variable (grouped the way the Obsidian docs group them) and is the reference for
which variable names exist and what they do.

## Conventions for collaborators

- ASCII only. No em dashes, no curly quotes, no non-ASCII punctuation anywhere in
  the repo. Clean, boring ASCII that any tool can parse.
- Never hand-edit theme.css. It is generated by the build. Edit sources under
  src/styles/ and rebuild.
- Literal colors live only in palette.css, as hsl(). Everywhere else references a
  token with var(--<colorNN>).
- Match palette.css style when adding tokens: hsl(), existing ramp naming.
- Contrast-check every text/background pairing against both the primary and the
  secondary background for that mode before committing it.
- Empty var() placeholders in the foundations files are intentional "to do"
  markers for slots not yet assigned; leave them unless you are filling them.
- Non-color slots are not colors: --cursor is default, --cursor-link is pointer.
- Mirror dark and light. A variable assigned in one mode should be considered in
  the other.
- Prefer small, reviewable changes and keep lint clean (npm run lint).

## Status

Early (v0.1.0). common/foundations.css is in place. dark/foundations.css is in
progress (colors being assigned). light/foundations.css is still largely the
obsidian-vars reference comments awaiting assignments.
