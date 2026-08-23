# Tripzy — Design System Reference

> **Single source of truth** for colours, typography, spacing, components, and
> interaction patterns across the entire Tripzy front-end.

---

## 1. Guiding Principles

| Principle | Implementation |
|---|---|
| **Midnight-luxury aesthetic** | Deep navy backdrop with gold accents; feels like a premium travel concierge |
| **Token-first styling** | All colours, radii, and shadows come from CSS custom properties in `globals.css` — never hardcode hex values in components |
| **Glassmorphism accents** | Frosted-glass surfaces for overlaid panels and cards; use the `.glass` or `.glass-dark` utilities |
| **Micro-animations** | Hover lifts (`-translate-y-1`), smooth brightness shifts, subtle scale pulses — kept under 300 ms |
| **Dark-mode ready** | Every token has a `.dark {}` counterpart; toggling the `dark` class on `<html>` re-skins the whole app |

---

## 2. Colour Tokens

All tokens are defined in `frontend/tripzy/app/globals.css`.

### Light mode (`:root`)

| Token | Value | Role |
|---|---|---|
| `--primary` | `#041627` | Midnight Navy — primary text, buttons, active states |
| `--primary-container` | `#1a2b3c` | Slightly lighter navy for containers |
| `--primary-light` | `#38485a` | Muted navy for secondary elements |
| `--primary-dim` | `#b7c8de` | Faded navy on light backgrounds |
| `--gold` | `#e9c349` | Sunrise Gold — logo, CTA icon tints, star ratings |
| `--gold-bright` | `#fed65b` | Brighter gold for hover states and overlaid labels |
| `--gold-dark` | `#735c00` | Dark gold for text on light gold backgrounds |
| `--background` | `#f8f9fa` | Full-page background |
| `--surface` | `#ffffff` | Card / panel surface |
| `--surface-low` | `#f3f4f5` | Input background, subtler surfaces |
| `--surface-mid` | `#edeeef` | Dividers, pill backgrounds |
| `--surface-high` | `#e7e8e9` | Progress track background |
| `--outline` | `#c4c6cd` | **Primary border colour** — use for all borders |
| `--text-primary` | `#191c1d` | Body copy, headings |
| `--text-secondary` | `#44474c` | Secondary paragraphs, card descriptions |
| `--text-muted` | `#74777d` | Labels, captions, placeholders |
| `--error` | `#ba1a1a` | Destructive actions, error states |
| `--success` | `#137333` | Positive / price badges |
| `--success-bg` | `#e6f4ea` | Success badge background |
| `--success-border` | `#ceead6` | Success badge border |

### Dark mode (`.dark`)

Dark mode overrides keep the same token names; primary flips to light navy,
background drops to near-black, and surfaces become slate-dark.

> **Rule:** Always reference tokens. Never write `color: '#041627'` directly in
> a component. Use `color: 'var(--text-primary)'`.

---

## 3. Typography

| Role | Family | Weight | Size |
|---|---|---|---|
| **Headings** (`h1-h3`) | Playfair Display, serif | 600 / 700 | 28–40 px |
| **Body** | Inter, sans-serif | 400 / 500 | 14–16 px |
| **Labels / caps** | Inter | 700 | 10–11 px + `letter-spacing: 0.1em` + `text-transform: uppercase` |
| **Card titles** | Inter | 600–700 | 14–18 px |
| **Captions / muted** | Inter | 400 | 10–12 px |

Use the `.label-caps` utility class for uppercase tracking labels — it sets the
correct font-size, weight, letter-spacing, and transform automatically.

---

## 4. Spacing & Radius

| Token | Value | When to use |
|---|---|---|
| `--radius-sm` | `0.25rem` | Tiny chips, status dots |
| `--radius-md` | `0.75rem` | Inputs, small buttons |
| `--radius-lg` | `1rem` | Standard cards (`.card` class) |
| `--radius-xl` | `1.5rem` | Section panels, modals |
| `--radius-full` | `9999px` | Pill badges, avatar circles |

Follow an 8-px base grid. Prefer Tailwind spacing utilities (`p-4`, `gap-6`,
`mb-8`, etc.) which map cleanly to 4/8 px increments.

---

## 5. Shadows

| Token | Usage |
|---|---|
| `--shadow-card` | Default card elevation |
| `--shadow-lg` | Card hover state, popovers |
| `--shadow-overlay` | Modals, drawers |

---

## 6. Utility Classes

Defined in `globals.css` — use these instead of repeating inline styles:

| Class | Purpose |
|---|---|
| `.card` | White surface + border + `--shadow-card` + hover lift |
| `.glass` | Frosted-glass panel (light-mode) |
| `.glass-dark` | Frosted-glass panel (always-dark, e.g. sidebar) |
| `.label-caps` | Uppercase tracking label style |
| `.tag` | Pill badge (surface-mid bg, outline border) |
| `.tab-active` | Underlined tab indicator (gold border-bottom) |
| `.shimmer` | Skeleton loading animation |
| `.progress-track` / `.progress-fill` | Budget / progress bars |
| `.no-scrollbar` | Hide scrollbar while keeping scrollability |
| `.star-fill` | Gold star colour |

---

## 7. Component Patterns

### 7.1 Cards

```
.card  ?  background: var(--surface)
          border: 1px solid var(--outline)
          border-radius: var(--radius-lg)
          box-shadow: var(--shadow-card)
          hover: translateY(-2px) + shadow-lg
```

Destination image cards add `overflow-hidden` and a `linear-gradient` overlay
(`rgba(4,22,39,0.88) ? transparent`) to ensure legible text on imagery.

### 7.2 Primary Buttons

```
background: var(--primary)   /* Midnight Navy */
color:      var(--gold)      /* Sunrise Gold text */
border-radius: var(--radius-xl) or rounded-2xl
hover: brightness(1.1)
active: scale(0.99)
```

### 7.3 Badge / Tag Pills

```
background: rgba(4,22,39,0.07)
color: var(--text-secondary) or var(--primary)
border: 1px solid var(--outline)
border-radius: var(--radius-full)
font: .label-caps
```

Success/price badges use `--success` + `--success-bg` + `--success-border`.

### 7.4 Form Controls (select, input)

```
background: var(--surface-low)
border: 1px solid var(--outline)
color: var(--text-primary)
border-radius: var(--radius-md) or rounded-xl
focus: outline-none  (rely on design border)
```

### 7.5 Section Headers

Each content section starts with:

```tsx
<div className="flex items-center gap-2 mb-4">
  <IconComponent size={18} style={{ color: 'var(--gold)' }} />
  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
    Section Title
  </h2>
</div>
```

### 7.6 Sidebar (always dark)

The sidebar always uses the dark palette regardless of theme:
- Background: `rgba(5,10,24,0.95)` (near-black navy)
- Active nav item: cyan-tinted (`#38bdf8`) with left border accent
- CTA "New Trip" button: `var(--gold)` background, `#020617` text

> The sidebar's hardcoded dark palette is intentional — it provides a strong
> visual anchor against light-mode main content.

---

## 8. Layout Architecture

```
+-----------------------------------------------------+
¦  <Sidebar>  (w-60, sticky, always dark)             ¦
¦             +-- Brand mark                          ¦
¦             +-- Nav: My Trips / Explore / Saved     ¦
¦             +-- Current Trip indicator              ¦
¦             +-- User profile + logout               ¦
+-----------------------------------------------------¦
¦  <main>  (flex-1, overflow-y-auto)                  ¦
¦    +-- <HeroSection>  (landing / search)            ¦
¦    +-- <TripSearch>   (inline chat input)           ¦
¦    +-- <LoadingScreen>                              ¦
¦    +-- <TripDetailView>                             ¦
¦    ¦     +-- Tabs: Overview / Itinerary / Hotels …  ¦
¦    ¦     +-- Tab panels                             ¦
¦    +-- <ExplorePanel>  (Explore nav)                ¦
¦    +-- <SavedTripsPanel>  (Saved nav)               ¦
+-----------------------------------------------------+
```

**Content max-width:** `max-w-6xl mx-auto` — used consistently across all
panels to keep content centred on wide screens.

**Padding:**
- Outer container: `px-4 md:px-8 py-8`
- Cards: `p-4` (compact) or `p-5` / `p-6` (standard)

---

## 9. Consistency Rules (Critical)

> Violations here cause visual fragmentation between panels.

1. **Never use inline hex colours** for anything covered by a design token.
2. **Never use undefined CSS variables.** Check `globals.css` before using any
   `var(--…)`. The only valid variable names are those listed in Section 2.
3. **Explore tab must match My Trips tab** — same surface, same card chrome,
   same button style, same typography hierarchy.
4. **Section headers** always use Playfair Display + `var(--text-primary)`.
5. **Accent icons** use `var(--gold)` — not hardcoded orange / cyan.
6. **CTA buttons** use `var(--primary)` background + `var(--gold)` text.
7. **Border colour** is always `var(--outline)` — not a custom rgba().
8. **Body text** ? `var(--text-primary)`; **descriptions** ? `var(--text-secondary)`;
   **captions/labels** ? `var(--text-muted)`.

---

## 10. Fix Applied — ExplorePanel Consistency

**File:** `frontend/tripzy/components/ExplorePanel.tsx`

The original ExplorePanel used several **undefined CSS variables** that caused
invisible / fallback rendering and broke visual consistency with the Trips panel:

| Old (broken) | Replaced with |
|---|---|
| `var(--bg-base)` | `var(--background)` |
| `var(--bg-surface)` | `var(--surface)` |
| `var(--border)` | `var(--outline)` |
| `var(--text-main)` | `var(--text-primary)` |
| `var(--accent)` | `var(--gold)` |
| `rgba(2,132,199,…)` (raw cyan) | Themed navy/gold palette |
| Hardcoded `#ffffff` button text | `var(--gold)` to match primary button pattern |

Additionally, destination cards now use the `.card` utility class (hover lift +
standard shadow) instead of duplicated inline styles, matching the card pattern
used throughout the rest of the app.

---

## 11. File Map

| File | Purpose |
|---|---|
| `app/globals.css` | Design tokens, base styles, utility classes |
| `app/layout.tsx` | Root layout, Google Fonts import |
| `app/page.tsx` | Orchestration: nav state, trip state, panel switching |
| `components/Sidebar.tsx` | Left nav — always-dark palette |
| `components/HeroSection.tsx` | Landing hero with search prompt |
| `components/TripSearch.tsx` | Inline chat / trip query input |
| `components/OverviewTab.tsx` | Trip overview + budget breakdown |
| `components/ItineraryTab.tsx` | Day-by-day itinerary |
| `components/HotelsTab.tsx` | Hotel recommendations |
| `components/PlacesTab.tsx` | Places to visit |
| `components/DiningTab.tsx` | Restaurant recommendations |
| `components/ExplorePanel.tsx` | Explore destinations + AI concierge |
| `components/SavedTripsPanel.tsx` | Saved trips grid |
| `components/LoginPage.tsx` | Google OAuth login |
| `components/AuthContext.tsx` | Auth state provider |
