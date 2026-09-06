# Homepage Premium Motion V1

Date: 2026-09-05

## Status

Implemented locally and awaiting independent ChatGPT review. This pass is not Task 016 and has not been deployed or pushed.

The preserved pre-motion Task 015.1 build is:

- Archive: `../../backups/BLUE_WORM_TASK0151_PRE_GSAP_20260905-114210.zip`
- SHA-256: `F76D673D56AFFCBBDDEB149E7039B15CACEF447C17C7A6CCF979BA6D6B80D899`

## Scope

Motion is mounted only by `src/pages/HomePage.jsx` through `src/components/HomeMotion.jsx`. Existing Task 015.1 layout, typography, content, media, navigation, footer, routes, public visibility rules, and Standard-only strategy remain unchanged.

## Choreography

- Hero opening: Navbar, `MANTIS`, `STANDARD`, media, positioning, CTA, and value labels use a coordinated mask, displacement, compression, and reveal sequence.
- Section headers: Large English titles enter with directional clip-path reveals and scale normalization before supporting copy appears.
- Content rhythm: Technology rows, Applications stories, Progress records, and Final CTA links use bounded staggered entrances.
- Media reveal: Mantis, Real World, and Applications media use directional wipes with a temporary scale reveal.
- Parallax: Desktop-only media motion runs from `-3%` to `3%`; mobile and reduced-motion modes remain static.
- Easing: `expo.out` for entrances and `none` for scrubbed parallax. Bounce, elastic, and back easing are prohibited.

## Accessibility And Performance

- `prefers-reduced-motion: reduce` removes the premium-motion class and clears temporary GSAP presentation properties.
- All content is visible in the default DOM/CSS state; JavaScript enhances an already complete page rather than gating visibility.
- GSAP context, matchMedia registrations, ScrollTriggers, animation state, and the root class are reverted on cleanup.
- Motion uses transform, opacity, clip-path, and CSS custom properties instead of layout-driving properties.
- Parallax is disabled below 769px. No WebGL, Canvas, Lottie, font, UI library, or second animation library was added.
- Homepage keeps one active MP4; Applications continues to request posters only.

## Static-State Preservation

The 1440px Technology and Applications final screenshots were compared with the Task 015.1 Production Public references at matching states. Layout, type, spacing, borders, and media framing remain unchanged. The 390px Hero, Mantis, Real World, Technology, Applications, About, Final CTA, and reduced-motion captures show no overflow, clipping, hidden final content, or terminal transform drift.

## Verification

- `pnpm run test:v0`: 62/62 passed
- `pnpm run test:sites`: 4/4 passed
- `pnpm run build`: passed
- Production JS: 468.66 kB, gzip 153.35 kB
- Production CSS: 115.10 kB, gzip 19.41 kB
- Browser report: `screenshots/task015-motion/browser-qa.json`
- Browser result: all sections animate and settle; reduced motion passes; desktop/mobile overflow, broken images, hidden targets, console errors, page errors, bad responses, and request failures are all zero.

## Evidence

- Opening sequence: `screenshots/task015-motion/opening-1440-*.png` and `opening-390-*.png`
- Scroll sections: `screenshots/task015-motion/section-1440-*.png` and `section-390-*.png`
- Reduced motion: `screenshots/task015-motion/reduced-motion-390-full.png`
- Machine-readable QA: `screenshots/task015-motion/browser-qa.json`

## Locked Areas

No changes were made to Navbar IA, Contact IA, Footer, routes, independent pages, Standard specifications, public approval SSOT, media governance, Homepage Reel source ranges, eight independent media usages, A01644, or the Standard-only public strategy.
