# Phase 3: Website Build Brief — ArchiGen AI

## Design Direction

### Color Palette (Refined)

Keep the existing blue-violet brand identity but deepen the palette for more sophistication:

| Role | Hex | Name | Usage |
|------|-----|------|-------|
| Primary | `#2563eb` | Blue-600 | CTAs, primary links, active states |
| Primary Light | `#3b82f6` | Blue-500 | Hover states, secondary emphasis |
| Secondary | `#7c3aed` | Violet-600 | Gradient endpoints, accent |
| Accent | `#06b6d4` | Cyan-500 | NEW — architectural wireframe/blueprint feel |
| Success | `#10b981` | Emerald-500 | Free tool badges, positive states |
| Warning | `#f59e0b` | Amber-500 | Ratings, stars |
| Background Dark | `#030712` | Gray-950 | Primary background (deeper than current #0a0a0a) |
| Background Alt | `#0a0f1a` | Custom Navy-Black | Alternating sections |
| Surface | `rgba(255,255,255,0.03)` | Glass base | Cards at rest |
| Surface Hover | `rgba(255,255,255,0.08)` | Glass hover | Cards on hover |
| Text Primary | `#f8fafc` | Slate-50 | Headlines |
| Text Secondary | `#94a3b8` | Slate-400 | Body copy |
| Text Muted | `#475569` | Slate-600 | Captions, meta |
| Border | `rgba(255,255,255,0.06)` | — | Subtle card borders |

**Primary Gradient:** `linear-gradient(135deg, #2563eb, #7c3aed)` (blue to violet)
**Accent Gradient:** `linear-gradient(135deg, #06b6d4, #2563eb)` (cyan to blue — for "tech" accents)
**Glow Effect:** `box-shadow: 0 0 60px rgba(37,99,235,0.15)` on hero elements

### Typography Pairing

**Heading:** `Space Grotesk` — Geometric, architectural, techy. Weights: 500, 700
**Body:** `Inter` — Keep for readability. Weights: 400, 500, 600
**Mono (optional):** `JetBrains Mono` — For stats, pricing, code-like data

**Why Space Grotesk:** It has a geometric, engineered quality that evokes architectural drafting while remaining highly legible. The angular letterforms (especially the `a`, `g`, and `t`) feel technical without being cold. Competitors almost universally use safe sans-serifs (Inter, Open Sans). This creates instant typographic differentiation.

### Photography/Asset Style Guide

- **Hero:** 3D generative art placeholder (Nano Banana asset — abstract architectural forms, wireframe-to-solid transition)
- **Section backgrounds:** Subtle gradient mesh or noise textures (not flat color)
- **Tool cards:** No images needed — clean typographic cards with colored category indicators
- **Category icons:** Custom SVG line icons replacing emoji (blueprint aesthetic)
- **Decorative:** Faint grid/dot patterns suggesting architectural plans

### Animation Recommendations

| Element | Animation | Library |
|---------|----------|---------|
| Hero headline | Split-text reveal (char-by-char) | GSAP SplitText |
| Hero stats | Counter animation on scroll entry | GSAP ScrollTrigger |
| Section headings | Fade-up + slight scale on scroll | GSAP ScrollTrigger |
| Tool cards | Staggered fade-up on scroll entry | GSAP ScrollTrigger + stagger |
| Category grid | Parallax offset between rows | GSAP ScrollTrigger |
| Navigation | Backdrop blur + shrink on scroll | CSS + GSAP |
| CTA buttons | Gradient shift on hover + scale(1.02) | CSS transitions |
| Page transitions | Smooth cross-fade | GSAP |
| Floating elements | Gentle Y-axis float (3-5px) | CSS keyframes |
| Grid lines | Draw-on SVG animation on load | GSAP DrawSVG |

### What to AVOID

- Generic stock photos of architects at computers
- Template-looking hero sections with centered text over a stock image
- Carousel/slider components (dated, low engagement)
- Overly complex 3D that slows page load (keep Three.js minimal or remove)
- Emoji as category icons (competitors do this — looks cheap at $12K level)
- White/light theme option (dark is the brand, don't dilute)

---

## Site Architecture

### Pages to Build

| Page | Purpose | Priority |
|------|---------|----------|
| `index.html` | Homepage — hero, value prop, featured tools, categories, social proof, CTA | P0 |
| `tools.html` | Full directory with search + filter | P0 |
| `categories.html` | Category overview with tool counts | P1 |
| `about.html` | Story, team, mission, trust signals | P1 |
| `404.html` | Custom error page | P2 |

**Note:** Individual tool detail pages (`/tools/[id]`) and dynamic functionality will be handled by the Next.js layer post-rebuild. The static HTML build focuses on the premium visual experience.

### Navigation Structure

```
[Logo] ArchiGen AI          Discover | Categories | About          [Search] [Submit Tool]
```

- Sticky nav with backdrop-blur
- Shrinks from 80px to 64px on scroll
- Mobile: hamburger menu with full-screen overlay
- Search: expandable search field on click

### Content Hierarchy Per Page

**Homepage:**
1. Hero (headline, subhead, search, stats) — 90vh
2. Trusted By / Marquee — thin strip
3. How It Works (3 steps) — full section
4. Featured Tools (6 cards) — full section
5. Problem/Solution (stats + categories grid) — split layout
6. Top Rated Tools (6 cards) — full section
7. Built For (4 persona cards) — full section
8. Newsletter CTA — full section
9. Footer

**Tools Page:**
1. Page header with search + filter bar
2. Category filter pills (horizontal scroll)
3. Tool cards grid (responsive 1-2-3 columns)
4. Load more / pagination

**Categories Page:**
1. Page header
2. Category cards with descriptions + tool counts
3. Link to filtered tools view

**About Page:**
1. Mission statement hero
2. What we do / why it matters
3. Team or founder story
4. Trust signals / press / metrics

### CTA Strategy

| Page | Primary CTA | Secondary CTA |
|------|------------|---------------|
| Homepage | Browse Tools | Subscribe to Newsletter |
| Tools | Visit Tool (external) | Submit a Tool |
| Categories | Explore Category | Subscribe |
| About | Browse Tools | Contact |

---

## Content Framework

### Homepage Headlines (3 Options)

1. **"AI Tools for Architects Who Actually Build"** (KEEP — it's strong, proven)
2. **"The Architect's Filter for AI Noise"** (emphasizes curation value)
3. **"20+ AI Tools. Zero Sponsored Picks. Built by Practitioners."** (specificity + trust)

**Recommendation:** Keep option 1 as primary. It's direct, differentiating, and already established.

### Value Proposition Structure

```
PROBLEM: 50+ AI tools launched this year. Most reviews are written by marketers, not architects.
BRIDGE: ArchiGen AI curates, tests, and reviews every tool from a practitioner's perspective.
SOLUTION: One directory. Honest ratings. Workflow guides that actually work on real projects.
```

### Section-by-Section Copy Direction

| Section | Headline | Copy Angle |
|---------|----------|-----------|
| Hero | "AI Tools for Architects Who Actually Build" | Bold, confident, insider |
| How It Works | "Three Steps to the Right Tool" | Simple, clear process |
| Featured Tools | "This Week's Picks" | Freshness, curation authority |
| Problem/Solution | "Cut Through the Noise" | Pain point + relief |
| Top Rated | "Highest Rated by Architects" | Social proof, peer validation |
| Built For | "Built for Practice, Not Theory" | Practitioner credibility |
| Newsletter | "Stay Ahead of the Curve" | FOMO, insider knowledge |

### SEO Keyword Targets

| Keyword | Search Intent | Target Page |
|---------|-------------|-------------|
| AI tools for architects | Discovery | Homepage |
| best AI architecture software | Comparison | Tools page |
| AI rendering tools architecture | Category | Tools (filtered) |
| AI floor plan generator | Specific tool | Tool detail pages |
| Midjourney architecture prompts | Tutorial | Blog (future) |
| AI in architecture 2026 | Trend | About / Blog |

---

## Conversion Playbook

### Primary Conversion Goal
Newsletter subscription — build the email list as the core asset

### Lead Capture Strategy
1. **Footer newsletter** — persistent on every page
2. **Exit-intent popup** (future JS enhancement) — "Get our top 5 tool picks this week"
3. **"Submit a Tool" form** — captures vendor/tool-maker leads
4. **Content upgrade** — downloadable niche analysis report (Phase 2 output)

### Social Proof Plan
- **Stats bar in hero:** "20+ Tools | 8 Categories | 100% Architect Tested"
- **Marquee strip:** Tool brand logos (Midjourney, Leonardo, etc.)
- **Testimonial section (future):** Architect quotes with firm names
- **"As featured in" bar (future):** Media/press logos

### Trust Signal Checklist
- [x] "No sponsored placements" badge
- [x] "Tested on real project phases" claim
- [x] "Built by the team behind Vista Studios" origin story
- [x] Tool count (20+) prominently displayed
- [x] Category count (8) prominently displayed
- [ ] Newsletter subscriber count (show when >500)
- [ ] Architect testimonials (collect post-launch)
- [ ] "Updated Weekly" freshness indicator
