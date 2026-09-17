---
version: 1
slug: "website-src-components-standardperformance-jsx"
primary_target: "website/src/components/StandardPerformance.jsx"
related_targets: ["website/src/components/standard-performance.css"]
---

# Task 019.7 — surface direction

## THESIS
Replace only the product parameter summary with a native, image-led performance board, following the owner's supplied performance slide rather than inventing a new visual identity.

## OWN-WORLD
Inherit Blue Worm typography, white/soft-gray surfaces, black figures and blue accent. Reuse original official product renders without changing robot geometry. No new fonts, icons, dependencies or generated robot images.

## STORY
Four smaller modules (control, motion, endurance, arm) support one dominant whole-machine module (dimensions, lift, freedom). All values remain readable HTML. This is a parameter presentation, not another product hero.

## FIRST VIEWPORT
At 1440, a two-row composition: four smaller cards on the left and front/side robot views spanning the right. At narrow widths, the whole-machine module comes first, then compact individual cards; never shrink the desktop board into illegible text.

## FORM
Native CSS Grid, modest corner radius, purposeful white space, large numbers. Desktop pointer hover lifts the card and emphasizes the figures with blue; mobile does not depend on hover. Reduced-motion removes movement. Images preserve their native aspect ratio.

## FINISH
One batched Edge inspection at 1440 / 1024 / 768 / 430 / 390 / 360; full section captures and hover comparison. Check overflow, text/image intersections, sources, image loading, reduced motion, console errors, existing tests and build. Only a bounded evidence-backed fix pass. Owner / ChatGPT gives final acceptance.

## Scope and source precedence
019.7 expressly replaces the earlier four-parameter restriction for this section. Reference screenshot 1 and manual page 2 supply all 14 values, including height 1400 mm (earlier site 1300 mm). Keep that discrepancy explicit in the report; do not rewrite the four published PDFs or historical source records. No channel SKU, configuration matrix or warranty material. No extra development section because the second reference repeats existing page content.

NO COMMIT / NO PUSH / NO DEPLOY.
