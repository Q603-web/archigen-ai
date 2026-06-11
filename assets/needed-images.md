# Needed images — drop-in manifest

Interim imagery shipped in Phase 1 reuses existing site assets. Each slot below
can be upgraded by dropping a file at the suggested path — no HTML changes needed
unless noted.

| Slot | Page / location | Current interim | Suggested replacement | Dimensions |
|---|---|---|---|---|
| Hero featured-story card | `index.html` `.feat-card` background | `assets/hero-architects-in-charge.jpg` | A dedicated cover render for the current issue (`assets/cover-issue-047.jpg`, update CSS url) | ≥1600×1400, 5:4.2 crop |
| Tool-of-the-week strip | `index.html` `.tool-card.feature .render-strip` | `images/render-interior.jpg` | An actual Vista output frame (`images/vista-output-north-light.jpg`, update CSS url) | ≥1200×525, 16:7 |
| Bento render card ("showing your seed") | `index.html` `.art-card.render .inner` | `images/render-exterior.jpg` (reused from outputs row) | A dedicated elevation render (`images/render-elevation-04.jpg`, update CSS url) | ≥900×660, 3:2.2 |

Notes
- `images/render-detail.jpg` exists but is a residential interior photo, not an
  architectural render — do not use it for render slots.
- All five "Selected outputs" gallery cards already use real images
  (`images/render-interior.jpg`, `render-exterior.jpg`, `render-night.jpg`,
  `render-concept.jpg`, `render-chapel.jpg`).
