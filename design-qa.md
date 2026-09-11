# Design QA — Task 019 Applications Hero Video Replacement

Date: 2026-09-11

## Scope

- User-directed replacement of the `/applications` hero video only; page structure, typography, interaction and the three existing scene records remain unchanged.
- Candidate source folder `E:\标准版视频网页` was read only. Existing website media and provenance were checked first to exclude every already-published source.

## Selection and derivative

- Selected unused `SV019 / C0176.MP4`: a stable, low-privacy-risk paper-bag grasp and lift sequence with a clear approach → grasp → lift action arc.
- Rejected the stronger industrial-box candidates because visible third-party box branding creates avoidable publication risk; rejected corridor mobility because a person enters frame and the robot body is largely obscured.
- Web derivative uses source `00:06.6–00:24.8`, 18.2 seconds, 1920×1080, H.264, yuv420p, 30fps, no audio and fast-start metadata. Output is 4,575,417 bytes; the poster is 68,350 bytes.
- The new `applicationsHero` usage is exclusive to this hero. It is not added to Home, Standard Real Tasks, the Applications scene list or Video Center.

## Visual evidence

- One batched pass covered 1440×900 and 390×844. Both loaded the new source to readyState 4, autoplayed unpaused and reported `scrollWidth === clientWidth`.
- No Console or page errors were observed. Captures: `output/task019-selection/applications-hero-desktop.png` and `applications-hero-mobile.png`.
- The Impeccable detector returned no findings for the changed application-page, media-data and test files.

final result: passed

---

# Design QA — Task 018 Editorial Type System & Final CTA Fit

Date: 2026-09-11

## Scope

- User evidence: 22 annotated screenshots plus the read-only reference set under `经验素材取地/逐际动力参考字体和ui/`.
- Updated surfaces: homepage section masthead and Final CTA, Mantis Standard modular / capability / real-task headings, Technology, Applications, Document Center, Video Center and About section typography.
- Locked: homepage second screen, Home Hero media and motion, public facts, approved media, Standard-only policy, navigation behavior, inquiry availability and original source assets.

## Design system changes

- Added one reusable `EditorialHeading` component with stable meta, title and explanation roles.
- Standardized desktop headings to a three-column editorial grid, tablet to two columns and mobile to a single reading order.
- Reduced inconsistent display extremes to a 48–76px fluid range, 42–44px on mobile, with 600 weight, 1.06–1.08 line height and restrained negative tracking.
- Rewrote only non-factual positioning copy to be shorter and more concrete; no parameter, client, deployment or performance claim was added.
- Final CTA now height-contains the full A01644 product family on wide desktops, so robot heads remain visible after the section was shortened.

## Visual evidence

- First batched pass exposed legacy cascade conflicts in the Standard capability heading, Document Center columns and mobile metadata.
- One confirmation pass covered 1440×900, 2559×932 and 390×844. All three reported `scrollWidth === clientWidth`, with zero console or page errors.
- Representative captures: `output/task018/home-final-2559.png`, `standard-system-1440.png`, `technology-intro-1440.png`, `documents-heading-1440.png`, `home-final-390.png`.
- The reference folder was read only; no reference or original media file was copied, renamed, edited or overwritten.

## Mechanical review

- Impeccable detector was run once after the UI pass. It reported only historical Arial declarations and pre-existing layout-property transitions outside this change; the shared heading component and Task 018 rules added no new detector category.
- Production build, route tests, upload integrity and live deployment evidence are recorded in the current handoff.

final result: passed

---

# Design QA — Ultra-wide Hero Shadow Edge Correction

Date: 2026-09-11

## Scope

- User evidence: `C:/Users/99770/AppData/Local/Temp/codex-clipboard-aa3f46b3-b2c4-4bc4-a093-922d2db06828.png` and focused crop `codex-clipboard-3ed97609-edf1-4dca-a143-eee1280ab67c.png`.
- Defect: at approximately 2554×1291, `object-fit: contain` left the 16:9 source image edge inside the wider media stage. The source's pale ground shadow ended abruptly at that internal edge.
- Locked: A01644 source and web derivative files, robot scale, center alignment, copy, navigation, motion and mobile compositions.

## Fix and evidence

- Wide, landscape desktop stages keep the image at its prior height and centered position, but the image element now matches the rendered source bounds rather than the full stage bounds.
- A right-edge alpha mask remains fully opaque through 86% of the image, after the rightmost robot, then fades only the remaining ground-shadow area to the white Hero background.
- The first candidate used `object-fit: cover`; QA rejected it because it enlarged the product composition by roughly 20% at 2554×1291. It was replaced before shipping.
- Final captures: `output/hero-shadow-fix/hero-2554-final.png`, `hero-1440-final.png`, `hero-1024-final.png`, and `hero-390-final.png`.
- At 2554×1291 the internal vertical image boundary is no longer visible and the robot scale matches the user's original composition. At 1440×900 the shadow fades cleanly; 1024×768 and 390×844 retain the pre-existing responsive sources and geometry.

## Validation

- Chrome captures use `deviceScaleFactor: 1` and reduced-motion static state to avoid judging an intermediate opening-animation frame.
- No source bitmap was edited, regenerated or overwritten.
- Product Hero config tests include the wide-stage fade contract.
- Impeccable detector found only existing out-of-scope font and historical layout-transition warnings; this patch adds neither.

final result: passed

---

# Design QA — Task 015.2 Local Effects Integration

Date: 2026-09-05

## Scope

- Reference set: `../特效与动画模板资料合集`, reviewed read-only.
- Integrated concepts: `组成部分/行边栏.txt` and `组成部分/聚光灯卡.txt`.
- Target: `/products/mantis-standard` only.
- Locked: Homepage, Product Hero, Visual Direction 2, opening animation, copy, media, data governance, routing and dependencies.

## Selection Findings

- The line sidebar adds real wayfinding value to the long Standard page and was rebuilt as a fixed editorial section rail rather than copied as a menu widget.
- The spotlight behavior improves row-level scanning on Core Capabilities and Development Platform without converting the existing rule-based layout into cards.
- Accordion Gallery and carousel patterns were rejected because the Video Center already supports direct scanning and playback.
- Scroll Expand, Border Glow, WebGL text / button effects, Three.js viewers and Motion-based components were rejected for structural cost, visual competition or duplicate runtime concerns.

## Visual Review

- `screenshots/task0152-effects/capabilities-hover-1440.png`: light-row spotlight remains localized, preserves the warm paper field and shifts only the active heading by 7px.
- `screenshots/task0152-effects/development-hover-1440.png`: dark-row variant uses the same blue accent without lifting the row into a card or obscuring tools and body copy.
- `screenshots/task0152-effects/section-rail-specifications-1440.png`: the active rail item remains readable across black sections through difference blending and does not displace page content.
- `screenshots/task0152-effects/capabilities-1024.png`, `capabilities-768.png`, and `capabilities-390.png`: the enhancement disappears below 1240px and the original responsive composition remains intact.

## Browser Checks

- Edge / Playwright: 1440, 1024, 768 and 390 widths.
- No horizontal overflow, broken image, Console error or Page error.
- 1440 rail: 12 links; active section follows scroll; `SPECS` anchor lands at the Specifications section and updates `aria-current`.
- Homepage rail count: 0.
- Reduced motion: spotlight and rail transition duration both resolve to `0s`.
- Evidence: `screenshots/task0152-effects/browser-qa.json`.

final result: passed

---

# Design QA — Post-deploy Navigation, Documents and Hero Edge Refinement

Date: 2026-09-11

## Scope and visual sources

- User references: `C:/Users/99770/AppData/Local/Temp/codex-clipboard-843566bc-6661-4ea9-80bf-567e9fe84ef6.png`, `codex-clipboard-f08b0365-d1dc-4321-9944-10fe3adf3218.png`, `codex-clipboard-c895e63c-49e0-49a4-9eb2-819596ec1a6f.png`, `codex-clipboard-e1de4729-cb4a-4e71-8839-1a29b3d1d2e4.png`, and `codex-clipboard-1964036b-2d7b-4e08-b7e3-857a6f195ca7.png`.
- Implementation captures: ignored local QA output under `output/post-deploy-qa/` for 1440×900, 1024×768 and 390×844.
- Combined source-and-implementation evidence: `output/post-deploy-qa/design-comparison.png`.
- Locked boundaries: Standard-only strategy, approved media, inquiry disabled state, product claims and source media.

## Findings

- Homepage hero: the A01644 desktop image now renders at its native configured scale and zero horizontal translation. The rightmost robot and ground shadow fade within the image field without the prior hard boundary. The 1440px and 1024px captures have no horizontal overflow or broken media.
- Navigation: “支持” now contains “文档中心 / 视频中心” in the existing dropdown and mobile accordion language. “采购/合作” is visually separated as a compact black pill, remains visible at 1440px, 1024px and 390px, and reuses the existing blue accent for hover/focus feedback.
- Document Center: the reference's search + category + document-card information architecture is retained, while typography, spacing, neutral palette, radii and density are adapted to the existing Blue Worm system. No third-party copy, product line, date or document claim was imported.
- Empty content: one deliberate Mantis Standard placeholder makes the future population point obvious without exposing a fake file link. Search and category controls are functional; a non-matching query shows a clear empty state.
- Responsive behavior: 1024px retains the desktop navigation without clipping. At 390px the menu, Support accordion, procurement button, search, categories and placeholder card form one readable vertical flow with no horizontal overflow.
- Accessibility and motion: Support exposes `aria-expanded` / `aria-controls`, closes through the existing outside-click and Escape behavior, returns focus, and removes non-essential transitions under reduced motion. Search has a programmatic label and results announce updates through `aria-live`.

## Comparison history

- Pass 1 found one P1 issue: the procurement link existed in the DOM but appeared white-on-white because the existing direct-child navigation selector overrode its pill background.
- Fix: increased the intended pill selector specificity, rebuilt the production bundle and repeated all captures.
- Pass 2 found no remaining actionable P0, P1 or P2 visual issue. The procurement pill is visible in desktop and mobile screenshots; Support and document states remain intact.

## Browser evidence

- `output/post-deploy-qa/report.json`: zero broken images, zero console errors, no horizontal overflow at 1440 / 1024 / 390.
- Desktop and mobile Support states both contain exactly “文档中心 / 视频中心”.
- The document placeholder is present for an empty catalog; a non-matching search hides it and shows the explicit empty result.
- Final production build: 104 modules; CSS 236.55 kB / gzip 38.14 kB; JS 467.76 kB / gzip 153.58 kB.

final result: passed

---

# Design QA — Task 014.3 Homepage Motion & Contact IA Refinement

Date: 2026-09-04

## Comparison target

- Task truth: `C:/Users/99770/.codex/attachments/3b9176d1-5255-4d0e-9e05-2ccc87a2f057/pasted-text.txt`.
- Home source visuals: `screenshots/task0142b/home-1440.png`, `home-390.png`, `details/home-1440.png`, and `details/home-390.png`.
- Contact source pattern: `screenshots/task010-support-dropdown-1440.png` and `task010-support-accordion-390.png`.
- Inquiry source visuals: `screenshots/task0141/inquiry-1440.png` and `inquiry-390.png`.
- Implementation visuals: `screenshots/task0143/home-1440.png`, `home-390.png`, `home-real-world-1440.png`, `home-real-world-390.png`, `contact-dropdown-1440.png`, `contact-accordion-390.png`, `inquiry-1440.png`, and `inquiry-390.png`.
- Locked scope: A01644 Hero, Hero typography, Standard-only strategy, main page IA, Support architecture, Q&A, specification baseline, and the other seven independent public video edits.

## Capture normalization

All captures use Microsoft Edge / Playwright at `deviceScaleFactor: 1`; screenshot pixels therefore map 1:1 to CSS pixels before the documented board-only downsampling. Browser chrome and device frames are absent.

| Surface / state | Source pixels | Implementation pixels | CSS viewport or element size | Comparison normalization |
|---|---:|---:|---:|---|
| Home full page, desktop, Production Public | 1440x6908 | 1440x6908 | 1440x900 viewport | Both downsampled to 480x2303 on `design-qa-full-home-desktop.png` |
| Home full page, mobile, Production Public | 390x7578 | 390x7578 | 390x844 viewport | Both downsampled to 195x3789 on `design-qa-full-home-mobile.png` |
| Real World, desktop, normal-motion representative frame | 1440x1080 | 1440x1080 | 1440x1080 section | Both downsampled to 720x540 on `design-qa-focus-home.png` |
| Real World, mobile, normal-motion representative frame | 390x889 | 390x871 | 390x889 / 390x871 section | Compared at 1:1; the 18px height difference is intentional copy wrapping, while full-page height remains unchanged |
| Desktop navigation, expanded state | 1440x900 | 1440x900 | 1440x900 viewport | Focused menu crops enlarged on `design-qa-focus-contact.png`; different crop heights reflect five Support rows versus two Contact rows |
| Mobile navigation, menu and Accordion expanded | 390x844 | 390x844 | 390x844 viewport | Compared at 1:1 on `design-qa-focus-contact.png` |
| Inquiry full page, desktop, backend disabled | 1440x1917 | 1440x1917 | 1440x900 viewport | Both downsampled to 600x799 on `design-qa-focus-inquiry.png` |
| Inquiry full page, mobile, backend disabled | 390x2561 | 390x2561 | 390x844 viewport | Both downsampled to 260x1707 on `design-qa-focus-inquiry.png` |

## Full-view comparison evidence

- `screenshots/task0143/design-qa-full-home-desktop.png`: the complete desktop page remains compositionally identical outside the intentional Real World media and copy change. Hero, section order, Technology, Applications, Progress, About, CTA, and Footer show no density or alignment drift.
- `screenshots/task0143/design-qa-full-home-mobile.png`: the complete mobile page preserves the same responsive collapse, section rhythm, and total page height. No adjacent section moves or overlaps.
- `screenshots/task0143/design-qa-focus-inquiry.png`: desktop and mobile preserve the complete form and Footer topology; only the approved visitor-facing title and Footer label change to “商务询盘”.

## Focused-region comparison evidence

- `screenshots/task0143/design-qa-focus-home.png`: Real World keeps the same black header, large editorial title, sparse right-side copy, full-width media stage, caption, and low-weight playback control. The media change is intentional: one household task becomes a broader multi-task proof Reel.
- `screenshots/task0143/design-qa-focus-contact.png`: Contact visibly reuses the Support dropdown / Accordion language. Surface color, thin rules, shadow, typography hierarchy, arrow treatment, row rhythm, active state, and mobile indentation remain consistent; only item count and labels differ.
- `screenshots/task0143/design-qa-focus-inquiry.png`: the title replacement does not alter wrapping, hero height, form spacing, disabled action, or responsive structure.

## Findings

No actionable P0, P1, or P2 visual difference remains.

- Fonts and typography: passed. Existing family, optical weight, display/body hierarchy, line height, zero letter-spacing policy, wrapping, and small navigation text remain unchanged. “商务询盘” fits the same hero and mobile title bounds as the prior title.
- Spacing and layout rhythm: passed. Desktop Real World is exactly 1440x1080 before and after; the mobile section is 18px shorter because the approved copy occupies a slightly different line box, but the complete page remains 390x7578 and adjacent sections do not shift or collide. Dropdown and Accordion spacing follows the existing navigation classes.
- Colors and tokens: passed. Warm paper, black field, restrained blue arrow / focus accent, dropdown opacity, border, shadow, and disabled form styling map to the existing tokens. No new palette or decorative effect was added.
- Image quality and asset fidelity: passed. The Reel uses the approved 1920x1080 public derivatives and retains visible robot / task context on both crops. No blur, masking halo, placeholder, CSS drawing, custom SVG substitute, black frame, or broken media is visible.
- Copy and content: passed. Real World copy now communicates breadth without adding unsupported claims; Contact contains “联系我们 / 商务询盘”; Inquiry changes only its visitor-facing name. Form fields, validation copy, and backend-disabled disclosure remain intact.
- Icons and controls: passed. Existing chevrons, arrows, focus treatment, and low-weight Pause / Play control are preserved; no new icon family is introduced.
- States and accessibility: passed. Normal autoplay, pause / resume, reduced-motion poster plus native controls, failed-media poster fallback, desktop keyboard / hover / outside-click closure, and mobile 44px route rows were all exercised.

## Comparison history

- Pass 1: the combined full-view and focused-region boards found no actionable P0 / P1 / P2 mismatch. The visual changes matched the task card and existing design system, so no post-comparison code or CSS fix was required.
- Earlier implementation work is not counted as a Design QA iteration. The files above are the first normalized source-versus-implementation comparison set.

## Residual limits

- A still image can validate crop, hierarchy, controls, and loop boundary frames but cannot prove temporal pacing alone. Temporal behavior is covered by `screenshots/task0143/browser-qa.json` and the media probe evidence in `../docs/media-review/standard-video-0143-audit/FINAL_AUDIT.md`.
- Task 014.3 intentionally changes video subject matter, so pixel identity is neither expected nor used as a fidelity criterion; the comparison target is the locked section structure and approved editorial behavior.

## Implementation checklist

- Source and implementation captured at matching desktop and mobile viewports.
- Full-view and focused-region boards visually inspected.
- Typography, spacing, tokens, image quality, copy, controls, responsive behavior, and accessibility states checked.
- Browser report, media audit, build, Node tests, and Sites tests passed.

final result: passed

---

# Design QA — Task 015 Visual Direction 2 / Homepage Mantis + Real World

Date: 2026-09-05

## Comparison target

- Source visual truth: `output/imagegen/task015-visual-directions/selected-v2-hero-preserved.png` (905x1738).
- Desktop implementation evidence: `screenshots/task015-motion/section-1440-mantis-final.png` (1440x739) and `screenshots/task015-motion/section-1440-real-world-media-final.png` (1440x810).
- Mobile implementation evidence: `screenshots/task015-motion/section-390-mantis-final.png` (390x791) and `screenshots/task015-motion/section-390-real-world-media-final.png` (390x488).
- Full-view comparison: `screenshots/task015-direction2/design-qa-source-vs-implementation.jpg` (2280x1410).
- Responsive focused comparison: `screenshots/task015-direction2/design-qa-responsive.jpg` (860x850).
- Locked scope: Product Hero layout, media, copy and GSAP opening animation; all sections outside Home Mantis Standard and Real World; verified copy, public-media governance, routes and Standard-only strategy.

## Capture normalization

- Microsoft Edge through Playwright, `deviceScaleFactor: 1`.
- Desktop captures use a 1440x900 CSS viewport and element screenshots at their rendered 1440px width.
- Mobile captures use a 390x844 CSS viewport and element screenshots at their rendered 390px width.
- The source Mantis and Real World bands were cropped from the selected 905x1738 visual target, then proportionally contained beside the implementation captures. Browser chrome and device frames are absent.
- Real World uses the approved Reel at a representative bag-manipulation frame. Different source and implementation video frames are expected; composition, hierarchy, overlay behavior and task legibility are the fidelity target.

## Findings

No actionable P0, P1 or P2 difference remains.

- Fonts and typography: passed. The existing family and bilingual hierarchy remain intact. Desktop Real World now uses the final `clamp(68px, 6.4vw, 108px)` scale, keeping the title dominant without obscuring the task subject; mobile wraps remain clean.
- Spacing and layout rhythm: passed. Mantis retains the lower-left editorial copy block and gives the product the intended oversized right-side presence. Real World is a single full-width cinematic field rather than a framed card. Both sections collapse coherently at 390px.
- Colors and visual tokens: passed. The warm gallery paper, black/white typography, thin blue action rule and dark media overlay remain consistent with the established Blue Worm system. No new palette, gradient decoration or card language was introduced.
- Image quality and asset fidelity: passed. The existing approved product render and task Reel remain sharp at all checked breakpoints. Product crop, focal point and video readability match the selected direction without placeholders, CSS drawings, synthetic icons or new unapproved media.
- Copy and content: passed. Existing verified copy is unchanged. No new product model, metric, customer, claim, route or internal status is exposed.
- Interaction and accessibility: passed. Autoplay, pause, resume, loop and plays-inline behavior pass; reduced motion shows the poster with native controls and no autoplay. Image alternatives and button names remain present.

## Comparison history

- Pass 1 found two P2 fidelity gaps: the desktop Mantis crop was too conservative, and the Real World title competed too strongly with the task image.
- Fixes: desktop Mantis product scale increased from 132% to 160%; desktop Real World title scale reduced from 7.6vw to 6.4vw.
- Pass 2 evidence: the regenerated `design-qa-source-vs-implementation.jpg` and `design-qa-responsive.jpg` show the revised proportions. No P0, P1 or P2 issue remains.

## Hero lock verification

- Baseline: `screenshots/task015-direction2/baseline-hero-1440.png`.
- Current: `screenshots/task015-motion/opening-1440-1600ms.png`.
- `screenshots/task015-direction2/hero-pixel-check.json` passed. The 0.174151% differing raster channels and maximum channel delta of 82 are limited to antialiasing between separate browser captures; visual inspection confirms unchanged Hero composition, media, copy and opening end state.

## Browser and motion checks

- `screenshots/task0151/public/browser-qa.json`: six Production Public widths passed, with zero horizontal overflow, broken images, missing alt attributes, unnamed buttons, public-status leakage, console errors, page errors, bad responses or request failures.
- `screenshots/task015-motion/browser-qa.json`: desktop/mobile opening, section motion, settled final states and reduced-motion fallback passed on the final public preview.
- Homepage still requests one MP4; Applications requests zero videos.
- Mobile Real World is 4:5; all four Reel scenes remain understandable in `screenshots/task0151/public/task0151-mobile-reel-crop-board.jpg`.

## Residual limits

- Browser automation validates layout and behavior, not sustained frame rate on low-end physical devices. A real-device performance spot check remains appropriate before public deployment.
- Exact subject position changes as the approved Reel advances; the overlay was checked against representative frames rather than every decoded frame.

final result: passed

---

# Design QA — Task 010 Support & Website Infrastructure V1

Date: 2026-09-03

## Visual target

- Source of truth: Task 010 information architecture and the existing Blue Worm `Premium Industrial Editorial` design system established by the Technology and About pages.
- Rendered evidence: `screenshots/task010-qa-board.jpg`, with individual 1440px and 390px screenshots in the same directory.
- Scope: Support, resource empty states, Service / Inquiry forms, Legal skeletons, Support navigation and expanded Footer. Home and product content are excluded from this visual change.

## Findings

- Support Overview uses a large editorial heading, numbered text navigation, thin rules and restrained blue accents; it avoids SaaS cards and icon walls.
- Documents, Downloads, Videos and Knowledge Base use a deliberate empty state. Empty data does not create fake cards, buttons or broken-looking gaps.
- Service and Inquiry forms preserve visible labels, clear required states, readable field rhythm and a visibly disabled pending action.
- The 260px Desktop Support Dropdown remains visually subordinate to the existing Product panel and uses the same navigation language.
- The 390px Mobile Support Accordion remains inside the existing menu system; child links are readable and do not overflow.
- Footer content is balanced across Products / Company / Support / Legal on desktop and reduces to two readable columns on mobile.
- No unexpected gradient, glass, decorative icon, synthetic illustration or new animation system was introduced.

## Browser checks

- All nine new routes return the app shell on direct navigation and refresh with the expected document title.
- 1440×900 Support, Documents, Videos and Inquiry: no horizontal overflow, broken images or console errors.
- 390px Support and Inquiry: no horizontal overflow; navigation, form fields and Footer remain usable.
- Desktop Support Dropdown opens by hover / click, remains reachable across the trigger boundary and closes with Escape.
- Mobile Support Accordion opens and closes; choosing a child route closes both the accordion and the main menu.
- Inquiry validation exposes four accessible error messages for the tested invalid state; submit remains disabled and sends no request.
- Internal link crawl reports zero dead links; unknown routes retain the existing Minimal 404.

## Follow-up

- Visual content can only be populated after real Standard resources and public approval arrive.
- Legal copy, support operations and form submission infrastructure remain intentionally pending.

final result: passed

---

# Design QA — Task 014.1 Public Content Completion V1

Date: 2026-09-04

## Visual target

- Source of truth: Task 014.1, Task 014 Production Public screenshots, and the existing Blue Worm `Premium Industrial Editorial` system.
- Combined comparison evidence: `screenshots/task0141/task0141-before-after-board.jpg`.
- Focused evidence: `home-technology-1440.png`, `home-applications-1440.png`, `standard-specifications-1440.png`, `standard-specifications-390.png`, and `applications-projects-1440.png`.
- Locked scope: Product Hero, A01644, Navbar, Footer IA, Q&A, Technology page main IA, Product IA and Support were not redesigned.

## Comparison findings

- Home removed the unapproved Real World void instead of filling it with a generic visual. The story now continues directly from product framing into Technology.
- Technology replaced its empty black media region with a semantic five-entity editorial diagram. The layout uses text hierarchy and rules, not cards, icon walls, gradients or decorative effects.
- Home Applications replaced blank media cells with three anonymous project summaries; the Applications page expands the same evidence boundary into five detailed Project Record V1 entries.
- Standard adds six compact specification groups while preserving the long-form product story and Q&A. Conflict-dependent facts remain visibly non-numeric.
- About replaces the unapproved A00706 activity image with a typography-led Blue Worm identity composition and gives Research & Engineering actual public content.

## Fidelity review

- Typography: passed — existing display scale, bilingual labels, weights and editorial casing remain consistent.
- Spacing and grid: passed — 1440 uses two-column relationships; 1024 / 768 collapse progressively; 390 uses one readable column.
- Colors and borders: passed — warm paper, black fields, thin rules and restrained blue accents remain within the established system.
- Images: passed — no new image was introduced; source media remains unchanged and no empty media shell is rendered publicly.
- Copy: passed — public content is traceable to Task 014 / 014.1 approvals, while internal governance and unresolved claims remain hidden.

## Responsive and accessibility findings

- Edge / Playwright checked 1728, 1440, 1280, 1024, 768 and 390 widths across seven public routes.
- No horizontal overflow, broken image, missing image alt, unnamed button, console error, page error or 4xx resource was found.
- Standard specifications use semantic `section` and `dl` structures; Applications project metadata also uses `dl`.
- Standard Q&A remains keyboard-operable, and public pages retain one H1 and a visible main content route.

## Public safety findings

- Internal statuses, SOURCE / TODO labels, governance copy, customer / school identities, internal configuration names, price and warranty are absent from public rendering.
- Pro, Ultra, Boston Dynamics and P00001–P00005 are absent.
- Empty media containers, fixed-height empty sections and public placeholder copy all report zero.
- Browser evidence: `screenshots/task0141/browser-qa.json`.

final result: passed

---

# Design QA — Task 013 Company Content Integration & Evidence Framework V1

Date: 2026-09-03

## Visual target

- Source of truth: Task 013 IA, the existing Blue Worm `Premium Industrial Editorial` system, and the four V0 page screenshots from Task 008.
- Combined comparison evidence: `screenshots/task013/task013-design-qa-board.jpg`.
- Final render evidence: eight long screenshots under `screenshots/task013/`, covering Technology, Applications, About and Progress at 1440px and 390px.
- Locked scope: Home, Product Hero, Standard Product Page, Support, Inquiry, Navbar behavior and Footer architecture were not redesigned.

## Comparison findings

- Technology replaces the V0 product-render filler with a black HTML/CSS system field, a visible textual equivalent, four large editorial platform records and one existing engineering image used only as context.
- Applications replaces product-gallery cards with a project-source ledger, a distinct research record, a dark direction index and an explicit future case approval pipeline.
- About replaces generic placeholder rows with identity, mission, leadership, research, IP and progress positions while avoiding a portrait wall, fabricated biographies or unsupported company metrics.
- Progress replaces placeholder media cards with an evidence-first ledger. The page shows records and verification state without publishing result, rank or endorsement claims.
- All pages retain the same typography, warm white / black palette, fine rules, minimal blue accent and existing CTA language, while each page has a different content rhythm.

## Responsive findings

- 1440px uses wide two-column editorial compositions and keeps long English platform names legible.
- 1280px and 1024px preserve the two-column evidence / content relationship without clipping.
- 768px collapses major content areas to one column while keeping navigation and content order intact.
- 390px converts diagrams and ledgers into readable vertical sequences; no horizontal table, oversized timeline or off-canvas content remains.
- Mobile headings retain hierarchy without forcing desktop line breaks. Project and evidence metadata move above body copy rather than shrinking to unreadable columns.

## Accessibility and content safety

- Every page has one H1 and a stable main landmark.
- The Technology diagram has a visible figcaption containing every entity and role; meaning does not depend on connecting lines or color.
- Images retain descriptive alt text; no unnamed buttons or missing alt attributes were found.
- InternalStatus ON exposes restrained SOURCE / risk context. InternalStatus OFF removes all review badges and hides unapproved customer, leadership, mission and competition sections.
- Production runtime and bundle checks found no prohibited product narrative, competitor comparison, unapproved award / ranking phrase, media endorsement wording or unsafe patent-count claim.

## Browser checks

- 24 route / viewport / mode checks returned HTTP 200.
- No horizontal overflow, broken visible images, Console errors or page errors.
- Public and internal screenshots use Microsoft Edge through the existing Playwright installation.
- Report: `screenshots/task013/report.json`.

final result: passed

---

# Design QA — Task 011 Global UI Consistency & Release Hygiene V1

Date: 2026-09-03

## Visual target

- Source of truth: the existing Blue Worm `Premium Industrial Editorial` system and the Task 011 consistency requirements.
- Comparison evidence: `screenshots/task011-design-qa-board.jpg`; before captures remain under `screenshots/task011-before/`.
- Locked scope: Home Hero, A01644, page IA and business content were not redesigned.

## Findings

- Product and Support navigation now share surface, border, shadow, timing, focus and mobile row-height rules without forcing identical content layouts.
- Chinese is the primary action language in Footer, forms, empty states and 404; product names and editorial eyebrows retain their intended English role.
- Page Hero, content shells, forms and Footer keep one gutter system across 1280, 1024, 768 and 390 widths.
- Inquiry and Service share field rhythm, input semantics, accessible inline errors and an explicitly disabled backend-pending action.
- Resource, content and disabled-module states use one restrained EmptyState system.
- No new gradient treatment, decorative effect, UI framework, font, animation library or page structure was introduced.

## Browser checks

- 45 route / viewport combinations passed: HTTP 200 app shell, one H1, no horizontal overflow, visible broken images, missing alt text, unnamed buttons, Console errors or Pro exposure.
- Desktop Product / Support dropdowns remain keyboard-operable and close with Escape while returning focus.
- 768px uses the existing mobile navigation breakpoint; 1024px retains a readable desktop Navbar with a dedicated intermediate spacing rule.
- `prefers-reduced-motion` removes Hero and dropdown motion.
- Public mode hides InternalStatus and configured Support modules from Navbar, Overview and Footer while preserving a clear direct-route empty state.

final result: passed
