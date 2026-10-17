---
name: Warm Honeycomb & Mocha
colors:
  surface: '#fff8f4'
  surface-dim: '#e5d8cc'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e5'
  surface-container: '#f9ecdf'
  surface-container-high: '#f3e6da'
  surface-container-highest: '#ede0d4'
  on-surface: '#211b13'
  on-surface-variant: '#504440'
  inverse-surface: '#362f27'
  inverse-on-surface: '#fceee2'
  outline: '#82746f'
  outline-variant: '#d4c3bd'
  surface-tint: '#765749'
  primary: '#432a1e'
  on-primary: '#ffffff'
  primary-container: '#5c4033'
  on-primary-container: '#d3ac9c'
  inverse-primary: '#e6bead'
  secondary: '#8a4d4e'
  on-secondary: '#ffffff'
  secondary-container: '#fdb0b0'
  on-secondary-container: '#794041'
  tertiary: '#452a10'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e4024'
  on-tertiary-container: '#d7ac89'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#e6bead'
  on-primary-fixed: '#2c160b'
  on-primary-fixed-variant: '#5c4033'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#ffb3b3'
  on-secondary-fixed: '#380c0f'
  on-secondary-fixed-variant: '#6d3638'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#eabe9a'
  on-tertiary-fixed: '#2d1601'
  on-tertiary-fixed-variant: '#5f4025'
  background: '#fff8f4'
  on-background: '#211b13'
  surface-variant: '#ede0d4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Quicksand
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 26px
  body-md:
    fontFamily: Quicksand
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-sm:
    fontFamily: Quicksand
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system embodies an intimate, comforting sanctuary for couples. Inspired by wholesome, round-featured companion characters, the experience evokes the feeling of wrapped wool blankets, steaming cups of milk tea, and handwritten bedside notes. The visual tone is soft-tactile, cute (kawaii), and deeply affectionate without tipping into juvenile chaos.

### Design Movements & Visual Language
- **Soft Neomorphism & Tactile Plushness:** Controls and surfaces mimic cushiony, pressable pads with warm, multi-layered ambient diffusion rather than harsh technical drop shadows.
- **Whimsical Organic Geometry:** Heavy use of squircles, soft pills, and continuous curvature eliminates visual friction.
- **Warm Domestic Comfort:** Interfaces feel like curated physical stationery, featuring milky backdrops, biscuit-toned cards, and subtle strawberry-pink accents.

## Colors

The palette is rooted in cozy warmth, relying on sweet pastry neutrals, rich beverage browns, and romantic strawberry undertones.

- **Primary (`#5C4033` - Deep Mocha):** Anchors high-priority actions, critical icons, and dominant headline typography. Provides grounded, sturdy reassurance.
- **Secondary (`#F2A6A6` - Strawberry Cream):** Reserved for love counters, shared reaction hearts, emotional indicators, and active mutual states.
- **Tertiary (`#B08968` - Warm Cinnamon):** Sub-actions, auxiliary badges, warm highlights, and toggled container accents.
- **Neutral Canvas (`#FDF8F5` to `#EDE0D4`):** Base canvas is warm milk foam (`#FDF8F5`), rising to steamy milk tea (`#EDE0D4`) and toasted biscuit (`#E6CCB2`) for layered card hierarchies.
- **Surface & Text Pairing:** Dark text relies on `#4A3326` (Espresso Bean) for maximum legibility while avoiding stark synthetic blacks.

## Typography

The type system blends the structured warmth of `Plus Jakarta Sans` for headers and buttons with the gentle, friendly stroke endings of `Quicksand` for continuous body reading and loving micro-notes. 

- Use `headline-xl` and `headline-lg` strictly for milestone anniversaries, partner nicknames, and landing warm welcomes.
- Use `Quicksand` weights of 500 and 600 across body texts to maintain cozy legibility without thin, spindly strokes that break the plush aesthetic.
- Punctuation and emojis sit naturally alongside these metrics; always vertically center-align affection glyphs (hearts, paws, sparkles).

## Layout & Spacing

The layout is built around a mobile-first fluid model intended for intimate hand-held interactions.

- **Grid Alignment:** 4-column layout on mobile devices (`360px` to `480px`), expanding to a centered 6-column reading frame (`640px` max-width container) on larger screens to keep intimacy tight and thumb-accessible.
- **Rhythm:** Spacing tokens prioritize breathing room around plush elements. Use `space-md` (`1rem`) internally for card padding and `space-lg` (`1.5rem`) for separating shared relational updates (e.g., mood updates, shared wishlists).
- **Edge Cushioning:** Canvas margins never touch zero. Every view maintains `margin-mobile` (`1rem`) to keep interface elements cushioned from device bezels.

## Elevation & Depth

Visual hierarchy uses warm, pillowy tonal layers paired with ambient colored drop shadows rather than cold grays or sharp bevels.

- **Base Layer (Canvas):** Soft Milk `#FDF8F5`. Flat and matte.
- **Tier 1 (Surface Cards):** Biscuit Cream `#EDE0D4`. Casts an ambient shadow: `0 8px 24px -4px rgba(92, 64, 51, 0.07)`.
- **Tier 2 (Floating Touchpoints & Modals):** White-Frosted Milk Tea `#FFFFFF` with 90% opacity over `#EDE0D4`. Shadow: `0 12px 32px -4px rgba(92, 64, 51, 0.12), 0 2px 6px 0 rgba(242, 166, 166, 0.15)`.
- **Plush Press Interaction (Pressed State):** Shifts y-translation downward by `2px`, collapsing the outer shadow into a subtle inner tone: `inset 0 2px 4px rgba(92, 64, 51, 0.1)`.
- **Borders:** No harsh 1px solid lines. Boundary lines are soft milk-tea tints (`#E6CCB2` at 60% opacity) applied only when separation from identical backgrounds is needed.

## Shapes

The interface embraces full roundness (Pill-shaped, Level 3). Every touchpoint conveys softness, invoking the plush paws and snout silhouettes of the companion aesthetic.

- **Squircle Cards:** Large cards employ continuous corner radii (`2rem` / `rounded-lg` up to `3rem` / `rounded-xl`).
- **Pill Elements:** Interactive components (buttons, badges, inputs, status tags) utilize `border-radius: 9999px` to remain completely round at the caps.
- **Avatars & Icons:** Housed within circular or soft squircle frames with subtle, puffed border rings.

## Components

### Buttons
- **Plush Primary Button:** Full pill shape (`border-radius: 9999px`). Background: Mocha Brown (`#5C4033`) with Cream text (`#FDF8F5`). Shadow: `0 6px 16px rgba(92, 64, 51, 0.24)`. Minimum touch target: 48px height. Active state introduces slight depression scale (`scale(0.97)`).
- **Affection Secondary Button:** Soft Strawberry (`#F2A6A6`) background with deep mocha text (`#4A3326`). Used for loving nudges, sending virtual kisses, and celebratory triggers.
- **Ghost/Tertiary Button:** Transparent background, Biscuit border (`1.5px solid #E6CCB2`), warm Cinnamon text (`#9C6644`).

### Chips & Badges
- Pill-shaped tags with `0.375rem` vertical and `0.875rem` horizontal padding.
- Filled with pale milk tea tone (`#EDE0D4`) accompanied by tiny rounded emoji or icon indicators (e.g., sleeping, eating, cuddling statuses).

### Input Fields
- Deeply rounded pill enclosures (`border-radius: 9999px`) or `rounded-xl` rounded rectangles for multiline sweet notes.
- Surface fill: `#FFFFFF` against canvas background. Border: `1.5px solid #EDE0D4`. 
- Focus state: Border transitions to `#B08968` with an ambient glow of `0 0 0 4px rgba(242, 166, 166, 0.25)`.
- Placeholder text: Soft cinnamon-beige (`#B08968` at 70% opacity).

### Cards
- Squircle silhouettes (`rounded-xl` or `2rem` border radius).
- Background: Soft milk tea surface (`#EDE0D4` or `#FFFFFF`).
- Padding: `space-lg` (`1.5rem`).
- Internal layout combines asymmetric friendly typography with cozy badge clusters.

### Checkboxes & Radio Buttons
- **Radio Buttons:** Resemble soft biscuit cookies; when checked, an inner solid chocolate circle pops with a spring-like ease.
- **Checkboxes:** Rounded squircle boxes (`8px` radius). Active state fills with Strawberry Pink (`#F2A6A6`) displaying a thick, rounded, chocolate-brown checkmark.

### Bespoke Companion Components
- **Couple Sync Capsule:** A horizontal pill container displaying both partner avatars linked by a floating pulsating heart icon in the center.
- **Nudge Bubble (Miss You Pad):** An oversized squishy floating circle with a custom character stamp that ripples when tapped to send instant haptic buzzes to the partner.
- **Daily Mood Nest:** A carousel of warm character mood stickers enclosed in soft, cream-colored, elevated discs.