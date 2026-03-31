export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
  content: string;
}

export const articles: Article[] = [
  {
    slug: "midjourney-vs-leonardo-architectural-rendering-2026",
    title: "Midjourney vs Leonardo.ai — Which Wins for Architectural Rendering?",
    excerpt:
      "We tested both on the same schematic design package. One excels at photorealism, the other at creative iteration. Here's what we found after 200+ renders.",
    date: "2026-03-28",
    category: "Comparisons",
    readTime: "8 min read",
    featured: true,
    tags: ["midjourney", "leonardo", "rendering", "comparison"],
    content: `## The Test

We took a 4,200 sq ft residential project — currently in schematic design — and ran the same set of prompts through both Midjourney v7 and Leonardo.ai's Architecture Fine-Tuned model. The goal: determine which tool produces more useful output for a real architectural workflow.

The project is a modern hillside residence in Malibu. We tested across three phases: exterior massing studies, interior material explorations, and client presentation renders.

## Exterior Massing — Midjourney Leads

Midjourney's strength is immediately obvious in exterior work. The atmospheric quality — the way it handles natural light hitting concrete and glass — is unmatched. Every render felt like it could go straight into a client deck.

Leonardo produced technically accurate results but they felt flat. The lighting was competent but not cinematic. For concept-phase massing where you need to *sell* a direction, Midjourney wins convincingly.

**Verdict: Midjourney 9/10, Leonardo 6/10**

## Interior Material Studies — Leonardo Catches Up

This is where Leonardo's fine-tuned architecture model earns its keep. When we needed to iterate on flooring materials, wall treatments, and fixture options, Leonardo's speed and control were superior.

Midjourney requires more prompt engineering to maintain consistency across iterations. Leonardo's image-to-image pipeline kept the spatial relationships intact while swapping materials — exactly what you need in DD phase.

**Verdict: Midjourney 7/10, Leonardo 8.5/10**

## Client Presentations — Depends on the Client

For developer clients who want photorealism, Midjourney. For design-forward clients who appreciate a more artistic interpretation, also Midjourney. Leonardo's output is more "correct" but less emotionally compelling.

The exception: if you need 20+ variations fast for an internal design review, Leonardo's batch generation and consistency tools save hours.

**Verdict: Midjourney 9/10 for final presentations, Leonardo 8/10 for internal reviews**

## The Bottom Line

Use both. Midjourney for hero shots and client-facing renders. Leonardo for rapid material iteration and internal design reviews. The $30/month combined cost is nothing compared to the hours saved.

If you can only pick one: Midjourney. The emotional quality of its output is still the best in the industry for architecture.`,
  },
  {
    slug: "comfyui-architecture-workflow-guide",
    title: "ComfyUI for Architects — A Complete Workflow Setup Guide",
    excerpt:
      "ComfyUI is the most powerful image generation tool available, but the learning curve is brutal. This guide gets you from zero to a production architecture workflow in one afternoon.",
    date: "2026-03-21",
    category: "Workflow Guides",
    readTime: "12 min read",
    featured: true,
    tags: ["comfyui", "workflow", "stable-diffusion", "advanced"],
    content: `## Why ComfyUI?

Every other AI image tool gives you a text box and a "generate" button. ComfyUI gives you a node graph — a visual programming environment where you control every step of the generation pipeline.

For architects, this means: ControlNet for maintaining spatial accuracy from your 3D models, IP-Adapter for consistent style across an entire project, and custom LoRA models trained on your firm's aesthetic.

The tradeoff is complexity. But if you're serious about integrating AI into your practice, this is the tool that scales.

## Prerequisites

- A computer with an NVIDIA GPU (8GB+ VRAM recommended)
- Basic comfort with installing software via command line
- 2-3 hours of uninterrupted setup time

## Step 1: Installation

Download ComfyUI from the official GitHub repository. On Windows, the portable version is recommended — it includes everything pre-configured.

Extract to a folder with a short path (e.g., C:\\ComfyUI). Long paths cause issues on Windows.

## Step 2: The Base Architecture Workflow

The workflow we use at Vista Studios has four key nodes:

1. **Load Checkpoint** — We use RealVisXL V4.0 as our base model. It handles architectural scenes better than any general-purpose model.

2. **ControlNet Depth** — Feed in a depth map from your Rhino/Revit viewport. This preserves the spatial structure of your design while letting the AI handle materiality and atmosphere.

3. **IP-Adapter** — Load 3-4 reference images that define the visual style you want. This is how you maintain consistency across an entire project.

4. **KSampler** — The actual generation step. We use 30 steps with the DPM++ 2M Karras sampler at 0.7 CFG for architectural work.

## Step 3: ControlNet from Your 3D Model

This is the game-changer. Export a depth map from your 3D modeling software:

- **Rhino**: Use the Arctic display mode, export as PNG
- **Revit**: Use a realistic view with white material override
- **SketchUp**: Use the Depth of Field export option

Feed this into the ControlNet Depth node. The AI will respect your geometry while generating photorealistic materials, lighting, and context.

## Step 4: Batch Generation for Design Reviews

Connect a Batch node to generate 8-16 variations at once. Each will maintain your spatial design but explore different material palettes, lighting conditions, and atmospheric moods.

This replaces hours of manual rendering setup. One click, sixteen options for your next design review.

## What's Next

Once you're comfortable with the base workflow, explore:
- **Training custom LoRAs** on your firm's past projects
- **Upscaling pipelines** for print-quality output
- **Animation workflows** for fly-through generation

ComfyUI is deep. But this base workflow will cover 80% of what you need in practice.`,
  },
  {
    slug: "ai-tools-replacing-architectural-visualization",
    title: "Is AI Replacing Architectural Visualization? A Practitioner's Honest Take",
    excerpt:
      "After a year of integrating AI into our viz pipeline, here's what actually changed — and what the hype gets wrong.",
    date: "2026-03-14",
    category: "Industry",
    readTime: "6 min read",
    featured: false,
    tags: ["opinion", "visualization", "industry", "ai-impact"],
    content: `## The Short Answer

No. But it's changing what visualization *means* in practice.

## What AI Actually Replaced

At our studio, AI tools eliminated one specific thing: the rough concept render. The 45-minute V-Ray render that you'd do at 720p just to test whether a material palette was working. That's gone. Midjourney does it in 30 seconds.

We also stopped doing moodboards by hand. IP-Adapter in ComfyUI generates style references that are more specific and useful than anything we'd assemble from Pinterest.

Time saved per project: roughly 15-20 hours in schematic design phase.

## What AI Didn't Replace

Final deliverable renders. Client-ready visualization packages. Anything that needs to be *accurate* to the actual design.

AI tools hallucinate. They add windows where there aren't any. They merge floor levels. They turn your carefully designed cantilever into a column-supported overhang. For contractual deliverables, you still need traditional rendering.

The experienced viz artists at our firm are busier than ever. They just spend less time on throwaway concept images and more time on the final package.

## The Real Shift

AI moved visualization earlier in the design process. We used to start rendering in DD phase. Now we generate AI concepts in pre-design, during the first client meeting. The conversation changed from "imagine this" to "look at this."

That's the real disruption — not replacing renderers, but making visualization a design tool rather than a presentation tool.

## What Firms Should Do

1. Train your designers to use Midjourney and Leonardo — it's a design skill now, not a viz skill
2. Keep your viz team — they're more valuable than ever for final deliverables
3. Budget for AI subscriptions ($50-100/month per designer) — the ROI is immediate
4. Don't promise clients AI-generated finals — the accuracy isn't there yet`,
  },
  {
    slug: "best-ai-floor-plan-generators-tested",
    title: "We Tested 5 AI Floor Plan Generators on a Real Residential Brief",
    excerpt:
      "Maket.ai, TestFit, Coohom, ArchiStar, and ArchitectGPT — tested against the same 3-bedroom residential program. Only two produced usable results.",
    date: "2026-03-07",
    category: "Comparisons",
    readTime: "10 min read",
    featured: false,
    tags: ["floor-planning", "comparison", "maket", "testfit", "residential"],
    content: `## The Brief

Single-family residence, 2,400 sq ft, 3 bedrooms, 2.5 bathrooms, open-concept living/dining/kitchen, home office, 2-car garage. Lot is 60x120 with a 15-foot setback requirement on all sides.

Simple enough that any competent architect could sketch it in 30 minutes. The question: can AI do it faster and better?

## Maket.ai — Best Overall

Maket understood the program immediately. Input the room list, square footages, and lot constraints, and it generated 12 layouts in under 2 minutes.

The top 3 options were genuinely usable as starting points for schematic design. Circulation made sense. The kitchen triangle worked. Bedroom sizes were appropriate. We'd still need to refine, but the bones were solid.

**Score: 8/10 — Would use in practice**

## TestFit — Best for Multi-Family

TestFit struggled with our single-family brief because it's designed for multi-family and mixed-use feasibility. When we switched to a 20-unit apartment building on the same lot, it excelled. Unit mix optimization, parking calculations, zoning compliance — all handled automatically.

Wrong tool for our test, but the right tool for developers.

**Score: 5/10 for this brief, 9/10 for its intended use case**

## Coohom — Surprisingly Good Interiors

Coohom's floor plan generation was mediocre, but its interior design AI is excellent. Once we fed in a workable plan, it generated furnished layouts with material specifications that were better than most junior designers' first attempts.

**Score: 6/10 for plans, 8/10 for interior furnishing**

## ArchiStar — Zoning Focus

ArchiStar's strength is site feasibility, not floor plan design. It told us exactly what we could build on the lot — FAR, setbacks, height limits — faster than pulling up the zoning code. The generated floor plans were generic.

**Score: 5/10 for plans, 8/10 for site analysis**

## ArchitectGPT — Not Ready Yet

ArchitectGPT produced plans that looked like plans but didn't function as architecture. Hallways to nowhere. A bathroom accessible only through a bedroom closet. Kitchen with no counter space.

It's a concept tool, not a design tool. Useful for very early ideation with non-architect clients, not for professional use.

**Score: 3/10 — Not recommended for practice**

## The Verdict

Maket.ai is the only tool we'd actually use in our workflow today. It's not replacing architects — you still need design judgment to select and refine the output — but it's a legitimate time-saver in early schematic design.`,
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getFeaturedArticles(): Article[] {
  return articles.filter((a) => a.featured);
}

export function getRecentArticles(count: number = 10): Article[] {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
