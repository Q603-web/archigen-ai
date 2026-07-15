# ArchiGen hero pipeline contract

The production hero default is Nano Banana 2 Lite:

- Model: `gemini-3.1-flash-lite-image`
- Aspect ratio: explicit `16:9`
- Output: image-only; native JPEG is preferred for the website
- Shared config: `scripts/hero-pipeline-config.mjs`

All new hero generators must import the shared config instead of copying model or format values. The former `gemini-2.5-flash-image` model is not the default; retain it only as a manual fallback for exceptional dense-small-text cases.

Approval evidence and the three-sample signage confirmation live in `projects/archigen-bench/matchup-02/` in the parent workspace.
