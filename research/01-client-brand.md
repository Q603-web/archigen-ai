# Phase 1: Client Brand Extraction — ArchiGen AI

## Brand Snapshot
- **Company:** ArchiGen AI (by Vista Studios)
- **Primary Color:** #3b82f6 (Blue-500)
- **Secondary Color:** #8b5cf6 (Violet-500)
- **Accent Color:** #10b981 (Emerald-500, used for badges/success states)
- **Background:** #0a0a0a (near-black)
- **Fonts:** Inter (heading + body — single font family via Google Fonts)
- **Tone:** Authoritative-practitioner — speaks as insiders, not marketers
- **Core Message:** "AI Tools for Architects Who Actually Build" — curated, practitioner-tested directory

---

## 1. Logo

- **Current logo:** Gradient square icon (`A` letter) with `bg-gradient-to-tr from-blue-500 to-violet-600`
- **Shape:** 32x32px rounded-lg square
- **Text lockup:** "ArchiGen AI" in bold Inter, white, tracking-tight
- **Favicon:** Standard Next.js favicon.ico in /src/app/
- **No standalone logo image file exists** — logo is purely CSS/component-based

## 2. Brand Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Blue-500 | #3b82f6 | CTAs, links, accents, 3D hero sphere |
| Secondary | Violet-500/600 | #8b5cf6 / #7c3aed | Gradient endpoints, logo |
| Accent | Emerald-500 | #10b981 | Success badges, "Popular" tags |
| Destructive | Red (Tailwind default) | — | Problem/pain-point callout borders |
| Background | Near-black | #0a0a0a | Page background |
| Surface | White/5-10% | rgba(255,255,255,0.05-0.10) | Glass cards |
| Text Primary | White | #ffffff | Headings |
| Text Secondary | Gray-400 | #9ca3af | Body text, descriptions |
| Text Muted | Gray-500 | #737373 | Footer, meta text |
| Border | White/10% | rgba(255,255,255,0.10) | Card borders, dividers |

**Gradient used:** `from-blue-400 to-violet-500` for text gradient effect
**Shadow accent:** `shadow-blue-500/20` on hover states

## 3. Fonts

- **Heading font:** Inter (variable, --font-inter)
- **Body font:** Inter (same)
- **Weights used:** Regular (400), Medium (500), Semibold (600), Bold (700), Extrabold (800)
- **Source:** Google Fonts via `next/font/google`
- **Rendering:** `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale`

## 4. Tone of Voice

**One-word:** Authoritative
**Expanded:** Practitioner-first, anti-marketing, no-BS. Speaks directly to architects as peers. Uses phrases like "Who Actually Build," "not marketers," "No sponsored placements," "Tested on real project phases." Positions itself as the trusted insider filter against tool overload.

**Key phrases that define the voice:**
- "AI Tools for Architects Who Actually Build"
- "Curated by practitioners — not marketers"
- "Cut Through the Noise"
- "The single source of truth"
- "Architect Tested"

## 5. Key Messaging

- **Headline:** "AI Tools for Architects Who Actually Build"
- **Subheadline:** "Discover, compare, and master 20+ AI tools curated by practitioners — not marketers."
- **Value Prop:** Single source of truth for AI architecture tools — curated reviews, workflow guides, practical prompt libraries
- **Differentiators:**
  1. No sponsored placements
  2. Tested on real project phases
  3. Clear pricing breakdowns
- **Stats:** 20+ Curated Tools | 8 Categories | 100% Architect Tested
- **Newsletter pitch:** "Join architects getting our top 5 tool picks + one deep-dive tutorial every week."

## 6. Existing Content

### Pages:
1. **Homepage** (`/`) — Hero with 3D sphere, search, stats bar, marquee, how-it-works (3 steps), featured tools grid, problem/solution + categories, top rated grid, "Built For Practice" personas, footer with newsletter
2. **Tools** (`/tools`) — Full directory listing
3. **Tool Detail** (`/tools/[id]`) — Individual tool pages
4. **Categories** (`/categories`) — Category listing
5. **About** (`/about`) — About page

### Tool Database: 24 tools across 8 categories
- Image Generation (6): Leonardo.ai, Midjourney, FLUX, Dzine.ai, KREA, Stable Diffusion
- Rendering (3): Chaos Veras, Rendair AI, ReRender AI
- Architecture-Specific (7): PromeAI, ArchitectGPT, Archistar, TestFit, MyArchitectAI, ArchiVinci, mnml.ai
- 3D Generation (3): Meshy.ai, 3D AI Studio, Kaedim
- Floor Planning (2): Maket.ai, Coohom
- Advanced Workflows (1): ComfyUI
- Video & Animation (3): Kling AI, Luma Dream Machine, Nim.video
- Concept Art (0 listed, category exists)

### Target Personas:
1. Architects — design visualization & concept iteration
2. Interior Designers — materials, lighting, moodboards
3. Students — learn industry-standard AI tools
4. Firms — evaluate and adopt the right tech stack

## 7. Site Architecture

```
/ (Homepage)
├── /tools (Directory listing)
│   └── /tools/[id] (Tool detail — dynamic route)
├── /categories (Category listing)
└── /about (About page)
```

**Navigation:** Discover | Categories | About + Search icon + "Submit Tool" CTA
**Footer sections:** Directory links, Resources links, Newsletter signup, Social (Twitter, GitHub)

## 8. Technical Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3 + Tailwind CSS 4 + Radix UI primitives
- **3D:** React Three Fiber + Three.js + Drei
- **Animations:** Framer Motion (installed but lightly used)
- **Icons:** Lucide React
- **Design pattern:** Glass morphism (backdrop-blur, white/5-10% backgrounds, white/10% borders)
- **Theme:** Dark only (hardcoded `<html class="dark">`)

## 9. What's Working

- Strong, opinionated positioning ("not marketers")
- Clean dark aesthetic with glass morphism
- Good data model for tools (ratings, pricing, categories, badges)
- Newsletter capture in footer

## 10. What Needs Improvement

- **No scroll animations** — Framer Motion installed but barely used, no GSAP
- **Generic 3D hero** — Distorted blue sphere has no architectural identity
- **No real images** — Entirely text-based cards, no tool screenshots or architectural imagery
- **Static feel** — No parallax, no scroll-triggered reveals, no micro-interactions
- **Missing pages** — Workflow Guides, Submit a Tool, Contact are all `href="#"`
- **No SEO** — Missing Open Graph images, schema markup, sitemap
- **Single font** — Inter is safe but not premium; no typographic contrast
- **No social proof** — No testimonials, client logos, or usage stats from real architects
