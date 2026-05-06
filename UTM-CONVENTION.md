# UTM Convention — archigenai.com

**Effective:** 2026-05-06
**Owner:** Hermes (workflow), Nora (posting cadence), Claude (digest)
**Why:** Without UTMs, all twitter.com traffic shows up in analytics as "twitter / referral" with no way to tell which X post drove it. UTMs make every promoted URL self-describe its source, campaign, and variant. This is non-negotiable for the daily digest to actually answer "which post worked?"

---

## Format

```
https://archigenai.com/{article-slug}.html?utm_source={source}&utm_medium={medium}&utm_campaign={article-slug}&utm_content={variant}
```

### Required parameters

| Param | Allowed values | Notes |
|---|---|---|
| `utm_source` | `twitter`, `linkedin`, `reddit`, `instagram`, `facebook`, `email`, `direct` | Lowercase, no spaces. The platform the link sits on. |
| `utm_medium` | `social`, `email`, `paid`, `partner` | Almost always `social` for our use. `email` for newsletters. |
| `utm_campaign` | The article slug (without `.html`) | Example: `what-actually-works-ai-architecture-2026`. Lets us aggregate all promotion of one article across platforms. |
| `utm_content` | A short, kebab-case variant tag | Example: `hook-1`, `hook-2`, `quote-pull-leonardo`, `thread-veras`. Distinguishes which version of the post drove the click. |

`utm_term` is unused (legacy paid-search field).

---

## Examples

**Tweet 1 (hook variant A) for the 2026-05-06 listicle:**
```
https://archigenai.com/what-actually-works-ai-architecture-2026.html?utm_source=twitter&utm_medium=social&utm_campaign=what-actually-works-ai-architecture-2026&utm_content=hook-leonardo-electrician
```

**Tweet 2 (different angle, same article):**
```
https://archigenai.com/what-actually-works-ai-architecture-2026.html?utm_source=twitter&utm_medium=social&utm_campaign=what-actually-works-ai-architecture-2026&utm_content=hook-veras-gym-membership
```

**LinkedIn cross-post:**
```
https://archigenai.com/what-actually-works-ai-architecture-2026.html?utm_source=linkedin&utm_medium=social&utm_campaign=what-actually-works-ai-architecture-2026&utm_content=long-form
```

---

## Naming rules for `utm_content`

Keep it short, kebab-case, descriptive of the *post angle*, not the URL.

Good:
- `hook-finch-narrow-niche`
- `quote-pull-midjourney`
- `thread-veras-vs-rendair`
- `image-comparison-renders`

Bad:
- `Tweet1` (uppercase, opaque)
- `tweet from tuesday` (spaces, not durable)
- `version-2-final-final-revised-NORA` (sloppy)

The goal: when the digest says "post X drove 47 clicks," the `utm_content` value alone tells you which post that was without having to look at the X timeline.

---

## When to make a new `utm_campaign`

One campaign per article. Don't split. The whole point of `utm_campaign` is to roll up every promotion of one article across every channel and date.

Re-promotions later (e.g., re-tweeting the same article 3 weeks later) keep the same `utm_campaign` but use a new `utm_content` to distinguish the second push.

---

## Helper

If you're hand-typing URLs, use `utm-builder.js` in this repo (run via `node utm-builder.js`). It prompts for slug + source + content and returns a fully-formed URL.

Or use this one-liner template, replacing `<slug>` and `<variant>`:

```
https://archigenai.com/<slug>.html?utm_source=twitter&utm_medium=social&utm_campaign=<slug>&utm_content=<variant>
```
