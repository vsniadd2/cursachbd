---
version: alpha
name: Keitaro
description: "Light monochrome interface measured from keitaro.io: Inter type with Permanent Marker, flat surfaces and 16px corners."
colors:
  background: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#443E4D"
  on-background: "#443E4D"
  on-surface-variant: "#4A3F5D"
  on-surface-muted: "#4A4E69"
  on-surface-subtle: "#636785"
  outline: "#E8E8E8"
  primary: "#443E4D"
  on-primary: "#FFFFFF"
  secondary: "#5C06AA"
  tertiary: "#57128C"
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 41.5px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 17.5px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.01em
  caption:
    fontFamily: Permanent Marker
    fontSize: 15px
    fontWeight: 400
    lineHeight: 0.87
    letterSpacing: -0.04em
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 0.92
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1
  headline-display-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
rounded:
  sm: 12px
  md: 16px
  lg: 32px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 24px
  gutter: 8px
components:
  button-primary:
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 48px
  button-secondary:
    textColor: "{colors.tertiary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 48px
  button-secondary-hover:
    textColor: "#7300FF"
  button-tertiary:
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: 8px
    height: 33px
  link:
    textColor: "{colors.on-surface-subtle}"
---

# Keitaro Design System

## Overview

Keitaro describes itself as: “Stop the chaos of media buying — track what works, cut what doesn't, and scale results in real time.” The interface is light, built on **White (#FFFFFF)** with **Cool Graphite (#443E4D)** text and almost no color: actions are carried by contrast, not hue.

Type is set in **Inter** and **Permanent Marker**. Headlines run large with tight negative tracking; body text is 17.5px. The surface language is flat. Corners are mostly 16px.

Measured from [keitaro.io](https://keitaro.io/en/) on November 9, 2026 at 1440×900 and 390×844 from 309 rendered elements. Values are computed styles from the live page, not the original source files.

## Colors

The palette has 10 roles, plus gradient stops #841FFF, #BA19FA, #C713F0.

- **White (#FFFFFF):** Page background, seen 6 times. Token `background`.
- **Cool Graphite (#443E4D):** Primary text and headings, seen 53 times. Token `on-surface`.
- **Dark Violet (#4A3F5D):** Secondary text, seen 21 times. Token `on-surface-variant`.
- **Dark Indigo (#4A4E69):** Muted text and metadata, seen 27 times. Token `on-surface-muted`.
- **Indigo (#636785):** Subtle text and placeholders, seen 20 times. Token `on-surface-subtle`.
- **Mist (#E8E8E8):** Borders and dividers, seen 4 times. Token `outline`.
- **Cool Graphite (#443E4D):** Primary actions (the main text color; the palette is monochrome), seen 53 times. Token `primary`.
- **White (#FFFFFF):** Text and icons on primary. Token `on-primary`.
- **Dark Violet (#5C06AA):** Accent in text, fills and borders, seen 4 times. Token `secondary`.
- **Dark Violet (#57128C):** Accent in text, fills and borders, seen 3 times. Token `tertiary`.

## Typography

**Inter** and **Permanent Marker** share the interface. Fallback stack: `Inter, Inter Placeholder, sans-serif`.

- **headline-display:** Inter 48px at weight 700, line height 1.1, tracking -0.02em (24px on mobile). Page title (h1).
- **headline-lg:** Inter 41.5px at weight 700, line height 1.2, tracking -0.01em. Section headings (h2).
- **body-md:** Inter 17.5px at weight 700, line height 1.2, tracking -0.01em. Body text.
- **body-sm:** Inter 16px at weight 400, line height 1.4, tracking -0.01em. Secondary and small text.
- **caption:** Permanent Marker 15px at weight 400, line height 0.87, tracking -0.04em. Captions and fine print.
- **label-lg:** Inter 16px at weight 500, line height 1.4, tracking -0.01em. Large buttons and tabs.
- **label-md:** Inter 13px at weight 500, line height 0.92. Buttons, navigation and labels.
- **label-sm:** Inter 12px at weight 700, line height 1. Small labels and badges.

## Layout

Spacing follows a 4px grid: 100% of measured gaps and paddings are multiples of 4px.

- **Scale:** xs 4px, sm 8px, md 12px, lg 24px.
- **Gaps:** 8px is the most common gap in flex and grid layouts.
- **Breakpoints:** 450px, 809px, 809.98px, 810px, 1199px, 1199.98px.

## Elevation & Depth

The design is flat: no shadows were measured. Hierarchy comes from color contrast and #E8E8E8 borders.

## Shapes

Most elements use 16px corners. Measured radii, most used first:

- **md (16px):** 40 elements.
- **sm (12px):** 32 elements.
- **lg (32px):** 12 elements.

## Components

Measured from the rendered page. Token values reference the tokens above.

- **button-primary (“Start tracking”):** transparent fill, #FFFFFF text, 12px/400, 16px radius, padding 12px 24px.
- **button-secondary (“Live demo”):** transparent fill, #57128C text, 12px/400, 16px radius, padding 12px 24px.
- **button-secondary-hover:** background #00000000, text #7300FF on hover.
- **button-tertiary (“Log in”):** transparent fill, #443E4D text, 12px/400, 12px radius, padding 8px.
- **link:** transparent fill, #636785 text, padding 0px.

## Do's and Don'ts

- Do use #FFFFFF for the page.
- Do keep text in 4 levels: #443E4D, #4A3F5D, #4A4E69, #636785.
- Do let contrast carry emphasis; primary actions use #443E4D on #FFFFFF.
- Do set headlines in Inter with tight tracking (-0.02em).
- Do keep spacing on the 4px grid.
- Do use 16px corners on most elements; larger surfaces also use 12px and 32px.
- Don't add drop shadows for depth; use borders and contrast.
- Don't introduce new font families beyond Inter and Permanent Marker.
- Don't add saturated accent colors; the measured palette is almost entirely neutral.

Generated by [Sitepeel](https://sitepeel.dev/design-md/keitaro.io/en/), the free DESIGN.md generator (engine 2026.10.29+b828a475ee10).
