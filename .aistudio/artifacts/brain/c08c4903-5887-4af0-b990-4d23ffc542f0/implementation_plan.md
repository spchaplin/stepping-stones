# Landing Page Palette Restyle: Color Swatches & Options

A cohesive visual redesign for the **Stepping Stones** landing page (`src/landing/LandingPage.tsx`), replacing fragmented candy gradients (cyan, purple, emerald) with a high-contrast neutral grayscale foundation (black, charcoal, white) accented by the signature warm amber-orange (`#f59e0b` / `amber-500`) drawn from the "Define Life Baseline" button on *The Expanding Edge*.

---

## Color Swatch Comparisons & Visual Samples

Below are detailed color swatches, exact hex codes, contrast ratios, and simulated card previews for the three design options:

---

### Option 1: Monolithic Obsidian & Warm Amber (Recommended)

> **Mood**: Modern architectural glass, deep space serenity, premium aerospace instrument aesthetics.

#### Palette Swatches

| Role | Swatch Preview | Name | Hex Code | Tailwind Token | Usage in Interface |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Canvas (60%)** | ⬛ | Deep Obsidian | `#09090b` | `bg-zinc-950` | Full page backdrop |
| **Card Surface (25%)** | ⬛ | Matte Carbon | `#18181b` (85%) | `bg-zinc-900/85` | Frosted glass card bodies |
| **Borders & Lines** | ◽ | Hairline Zinc | `#27272a` | `border-zinc-800` | Subtle 1px structural borders |
| **Primary Text** | ⬜ | Crisp Snow White | `#fafafa` | `text-zinc-50` | App titles & headlines |
| **Secondary Text** | ◽ | Pewter Gray | `#a1a1aa` | `text-zinc-400` | Taglines & descriptions |
| **Primary Accent (10%)** | 🟧 | Expanding Edge Amber | `#f59e0b` | `bg-amber-500` | "Open app" CTA & brand spark |
| **Accent Hover** | 🟨 | Sunlit Amber | `#fbbf24` | `hover:bg-amber-400` | Button hover & active glows |
| **Glow Aura** | 🟧 | Amber Ambient Glow | `rgba(245,158,11,0.20)` | `shadow-amber-500/20` | Card hover radiance |

#### Card Component Visual Mockup (Option 1)
```
┌────────────────────────────────────────────────────────┐
│  [bg-zinc-900/85, border-zinc-800, hover:border-amber-500/40]
│                                                        │
│  ┌──────────┐                                          │
│  │ ⚡ Icon  │  (bg-zinc-800, text-zinc-200, hover:text-amber-400)
│  └──────────┘                                          │
│                                                        │
│  PLANK                                      (#fafafa)  │
│  Build your future, one step at a time      (#fbbf24)  │
│                                                        │
│  Lay down seven planks across the gorge.    (#a1a1aa)  │
│  Each plank is a concrete, achievable goal...          │
│                                                        │
│  ┌────────────────────────┐                            │
│  │ Open app  →            │ (bg-amber-500 text-zinc-950 font-bold)
│  └────────────────────────┘ (shadow-[0_0_15px_rgba(245,158,11,0.25)])
└────────────────────────────────────────────────────────┘
```

---

### Option 2: High-Contrast Stark Monochrome with Punchy Amber Action

> **Mood**: Utilitarian Swiss typography, stark black-and-white contrast, zero blur, surgical orange CTAs.

#### Palette Swatches

| Role | Swatch Preview | Name | Hex Code | Tailwind Token | Usage in Interface |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Canvas (60%)** | ⬛ | Jet Black (Zero) | `#050505` | `bg-neutral-950` | Void black page backdrop |
| **Card Surface (25%)** | ⬛ | Dark Graphite | `#121214` | `bg-neutral-900` | Solid opaque card surface |
| **Borders & Lines** | ◽ | Ghost White Hairline | `rgba(255,255,255,0.12)`| `border-white/10` | High-contrast razor-thin line |
| **Primary Text** | ⬜ | Pure White | `#ffffff` | `text-white` | Sharp high-contrast headlines |
| **Secondary Text** | ◽ | Architectural Gray | `#737373` | `text-neutral-500` | Quiet body copy |
| **Primary Accent (10%)** | 🟧 | Punchy Amber | `#f59e0b` | `bg-amber-500` | Crisp solid button with no glow |
| **Accent Text** | 🟨 | Sharp Gold | `#fbbf24` | `text-amber-400` | Inline kicker / index marker |
| **Glow Aura** | 🚫 | None | `none` | `shadow-none` | Deliberately unblurred edges |

#### Card Component Visual Mockup (Option 2)
```
┌────────────────────────────────────────────────────────┐
│  [bg-neutral-900, border border-white/10]              │
│                                                        │
│  01 · PLANK                                 (#ffffff)  │
│  Build your future, one step at a time      (#737373)  │
│                                                        │
│  Lay down seven planks across the gorge.    (#a3a3a3)  │
│  Each plank is a concrete, achievable goal...          │
│                                                        │
│  ┌────────────────────────┐                            │
│  │ Open app  →            │ (bg-amber-500 text-neutral-950 font-bold)
│  └────────────────────────┘ (border border-amber-400/30)
└────────────────────────────────────────────────────────┘
```

---

### Option 3: Warm Stone Gallery with Amber Horizon Edge

> **Mood**: Tactile stone texture, museum gallery editorial, subtle warm basalt tones with top amber piping.

#### Palette Swatches

| Role | Swatch Preview | Name | Hex Code | Tailwind Token | Usage in Interface |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Canvas (60%)** | ⬛ | Warm Basalt | `#0c0a09` | `bg-stone-950` | Earthy dark backdrop |
| **Card Surface (25%)** | ⬛ | Dark Travertine | `#1c1917` (90%) | `bg-stone-900/90` | Textured dark stone cards |
| **Top Horizon Accent**| 🟧 | Burnished Amber Pipe | `#f59e0b` | `border-t-2 border-amber-500` | Top edge accent on cards |
| **Borders & Dividers**| ◽ | Basalt Seam | `#292524` | `border-stone-800` | Subtle side/bottom borders |
| **Primary Text** | ⬜ | Soft Linen White | `#f5f5f4` | `text-stone-100` | Warm editorial titles |
| **Secondary Text** | ◽ | Warm Ash Gray | `#a8a29e` | `text-stone-400` | Descriptions and body |
| **Primary Accent (10%)**| 🟧 | Burnished Amber | `#d97706` → `#f59e0b`| `bg-gradient-to-r` | Warm gradient button fill |
| **Glow Aura** | 🟧 | Hearth Amber Glow | `rgba(217,119,6,0.18)` | `shadow-amber-600/20` | Subtle bottom-edge reflection |

#### Card Component Visual Mockup (Option 3)
```
┌════════════════════════════════════════════════════════┐  <= 2px Amber Horizon Top Border (#f59e0b)
│  [bg-stone-900/90, border-x border-b border-stone-800] │
│                                                        │
│  [Stone Icon]                                          │
│  PLANK                                      (#f5f5f4)  │
│  BUILD YOUR FUTURE                          (#a8a29e)  │
│                                                        │
│  Lay down seven planks across the gorge...  (#78716c)  │
│                                                        │
│  ┌────────────────────────┐                            │
│  │ Open app  →            │ (bg-gradient-to-r from-amber-600 to-amber-500)
│  └────────────────────────┘                            │
└────────────────────────────────────────────────────────┘
```

---

## Recommendation & Next Step

**Option 1 (Monolithic Obsidian & Warm Amber)** is recommended because:
1. It perfectly bridges the deep cosmic black of *The Expanding Edge*, the sleek dashboard styling of *Strategizer*, and the natural depth of *Plank*.
2. The button style (`bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]`) is a 1:1 match with the "Define Life Baseline" button in The Expanding Edge.
3. It completely purges the clashing rainbow gradients from the landing page while providing clean, accessible contrast across all viewports.

Please let me know which option you prefer (Option 1, 2, or 3), or click **Proceed** to implement Option 1!
