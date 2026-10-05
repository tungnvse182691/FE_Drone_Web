---
name: Civil Field Infrastructure
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#49473a'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#7a7768'
  outline-variant: '#cac7b5'
  surface-tint: '#64601f'
  primary: '#64601f'
  on-primary: '#ffffff'
  primary-container: '#7d7935'
  on-primary-container: '#ffffff'
  inverse-primary: '#cfc97c'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#695587'
  on-tertiary: '#ffffff'
  tertiary-container: '#826da1'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebe695'
  primary-fixed-dim: '#cfc97c'
  on-primary-fixed: '#1e1c00'
  on-primary-fixed-variant: '#4c4807'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#ecdcff'
  tertiary-fixed-dim: '#d4bcf6'
  on-tertiary-fixed: '#24113f'
  on-tertiary-fixed-variant: '#513d6e'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  stationing-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is engineered for large-scale highway inspection, civil asset monitoring, and defect triage. Its users include civil engineers, highway maintenance crews, and regional operations supervisors. 

The aesthetic is grounded in modern civil engineering: disciplined, pragmatic, highly legible under direct sunlight, and devoid of superficial decoration. Visual cues borrow from topographic analysis, structural instrumentation, and roadway operations signage. Layouts favor dense data density without visual clutter, prioritizing status scanning, route coordinates, stationing markers (e.g., Km 42+150), and urgency triage.

## Colors

The palette balances utility and clarity against high-contrast field legibility.

### Core Canvas & Structure
- **Primary Olive Green** (`#7D7935`): Used for primary actions, structural emphasis, active inspection filters, and branding elements.
- **Background** (`#F3F4F6`): Neutral cool gray base for app shell, section framing, and underlying viewport.
- **Surface** (`#FFFFFF`): Isolated work surfaces, data tables, modular panels, and operational cards.
- **Border / Divider** (`#E5E7EB`): Structural containment lines for spatial partitions and tabular boundaries.
- **Text Primary** (`#1F2937`): High-contrast slate charcoal for core metrics, logs, and body typography.
- **Text Secondary** (`#6B7280`): Secondary metadata, chainage notes, timestamps, and utility captions.

### Triage Status Palette
Status tags use dedicated paired fills and high-contrast text:
- **Critical / Khẩn cấp**: `#FEE2E2` background with `#DC2626` text. Used for structural failures, carriageway blockages, and high-risk washouts.
- **Pending / Chờ xác minh**: `#FEF3C7` background with `#D97706` text. Used for incoming unverified defect tickets and citizen reports.
- **Verified / Đã xác minh**: `#EDF7ED` background with `#1B5E20` text. Used for confirmed defects ready for maintenance dispatch.
- **Watch / Merged / Theo dõi**: `#E0F2FE` background with `#0284C7` text. Used for non-urgent monitoring, seasonal expansion joint tracking, and deduplicated entries.

## Typography

Typography relies on `Inter` across all structural tiers to maximize alphanumeric differentiation in coordinates, technical metrics, and Vietnamese diacritics.

### Numerical Data & Stationing
Tabular numerals (`font-feature-settings: "tnum"`) must be enforced on all stationing markers (e.g., `Km 84+200`), geo-coordinates, tonnage calculations, and triage count widgets.

### Hierarchy Rules
- `headline-xl` and `headline-lg` are reserved for operational dashboards, route summaries, and incident commander overviews.
- `headline-md` and `headline-sm` designate ticket titles, asset identifiers, and section headers within modal split-panes.
- `label-*` styles enforce explicit upper- or sentence-case structure for field status tags, technical attributes, and table column heads.

## Layout & Spacing

The layout employs a responsive 12-column grid on desktop/tablets and a single-column stacked layout on mobile.

### Grid Parameters
- **Desktop (>= 1280px)**: 12-column grid, `margin-lg` (32px), `gutter-lg` (24px). Accommodates side-by-side triage workflows: Defect List (5 cols) + Map/GIS Inspection Plane (7 cols).
- **Tablet (768px - 1279px)**: 8-column grid, `margin-md` (24px), `gutter` (16px). Uses collapsible sub-drawers for ticket details.
- **Mobile (< 768px)**: 4-column flow, `margin` (16px), `gutter` (16px). Stacked queue view with full-bleed touch targets for field crews.

### Spatial Rhythm
Internal element spacing adheres strictly to multiples of 4px. Card interiors use `space-lg` (24px) for desktop and `space-md` (16px) for mobile. Gaps between compact input groups use `space-xs` (4px) to `space-sm` (8px) to preserve data cohesion.

## Elevation & Depth

To maintain clarity in high-glare tablet and in-vehicle environments, depth relies on clean boundary lines supplemented by low-diffusion structural shadows.

### Elevation Hierarchy
- **Level 0 (Base Canvas)**: Background `#F3F4F6`. Zero elevation.
- **Level 1 (Card & Module Surface)**: Surface `#FFFFFF` encased in a 1px solid border (`#E5E7EB`). Subtle ambient shadow: `0 1px 3px 0 rgba(0, 0, 0, 0.05)`.
- **Level 2 (Hovered Records & Floating Controls)**: Surface `#FFFFFF` with 1px border (`#E5E7EB`) and shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`.
- **Level 3 (Inspection Modals & Flyout Sheets)**: Floating viewport sheets over an overlay backdrop (`rgba(31, 41, 55, 0.4)`). Shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`.

## Shapes

The design system implements a strict component radius scale to differentiate outer containers from actionable elements:

- **Cards & Primary Panels**: `rounded-2xl` (16px). Defines independent triage modules, map overlay containers, and main list enclosures.
- **Inner Content & Sub-containers**: `rounded-xl` (12px). Applied to image inspection viewports, nested defect descriptions, map tool overlays, and grouped summary blocks.
- **Interactive Controls (Buttons & Inputs)**: `rounded-lg` (8px). Delivers a reliable, structured feel for button targets, text inputs, and filter selectors.
- **Status Tags & Badges**: Fully pill-shaped (`rounded-full` or 9999px) to contrast with geometric data fields and cards.

## Components

### Buttons
- **Primary**: Background `#7D7935`, Text `#FFFFFF`, corner radius `rounded-lg` (8px). Height `40px` (desktop), `48px` (mobile). Hover state deepens to `#6B672D`.
- **Secondary / Outline**: Surface `#FFFFFF`, Border 1px `#E5E7EB`, Text `#1F2937`. Hover state transitions background to `#F9FAFB`.
- **Danger**: Background `#DC2626`, Text `#FFFFFF`. Used strictly for irreversible triage rejections or emergency asset closures.

### Cards
- Container styled with `#FFFFFF`, 1px solid `#E5E7EB`, and `rounded-2xl` (16px).
- Internal content organized with `space-md` (16px) or `space-lg` (24px) padding.
- Defect triage cards feature a prominent left-aligned vertical indicator or paired tag specifying triage urgency.

### Status Chips & Badges
- Corner radius: `rounded-full` (9999px).
- Typography: `label-sm` or `label-md` with `font-weight: 600`.
- Padding: `4px 10px`.
- Four mandatory system states:
  - **Critical**: Background `#FEE2E2`, Text `#DC2626`
  - **Pending**: Background `#FEF3C7`, Text `#D97706`
  - **Verified**: Background `#EDF7ED`, Text `#1B5E20`
  - **Watch/Merged**: Background `#E0F2FE`, Text `#0284C7`

### Form Inputs & Selectors
- Border: 1px `#E5E7EB`, corner radius `rounded-lg` (8px), background `#FFFFFF`.
- Typography: `body-md` (`#1F2937`), placeholder `#9CA3AF`.
- Focus ring: 2px outline in `#7D7935` with a 2px offset.

### Checkboxes & Radios
- Size: `18px × 18px`.
- Corner radius: Checkboxes use `rounded` (4px); radio buttons use full circle.
- Selected state: Background `#7D7935` with white check/dot icon.
- Unselected state: 1px border `#D1D5DB` against `#FFFFFF`.

### Highway Domain Components
- **Stationing Marker (Chainage Badge)**: Monospaced numeric block with `#F3F4F6` background, 1px `#E5E7EB` border, `rounded-md` (6px), displaying chainage references (e.g., `Km 102+450`).
- **Defect Severity Bar**: Multi-segment progress indicator visualizing triage urgency directly inside table cells and ticket headers.