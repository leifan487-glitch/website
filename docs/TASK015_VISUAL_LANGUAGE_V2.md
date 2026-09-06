# Task 015 - Blue Worm Visual Language V2

Date: 2026-09-05

## Scope

This prototype changes only the Home page sequence:

- Real World
- Technology
- Applications

Home Hero, navigation, routes, other pages, approved copy, media governance, and Standard-only product strategy remain unchanged.

## Before Structure

- Real World used a three-column heading followed by a full-bleed reel with overlaid metadata.
- Technology used a summary column and a compact two-column system diagram.
- Applications used three anonymous text-only project rows.

## V2 Decisions

- Establish a shared editorial header grid while giving each section a distinct heading scale.
- Use dark field, structural dark, and warm light backgrounds for a direct dark-to-light rhythm without gradients.
- Keep the Real World reel as the single dynamic media focus and move its metadata into a quiet rail below the frame.
- Present Technology as a vertical system index with Mantis as the base node and four keyboard-focusable platform rows.
- Present Applications as an uneven editorial composition using approved SSOT posters for SV035, SV037, and SV054.
- Keep motion to short link/index transitions, a 1.015 media hover scale, and a restrained major-content entrance.

## Reusable Rules

- Display heading: large system type, zero letter spacing, short line length, section-specific scale.
- Section spacing: `--v2-section-space` controls major vertical rhythm.
- Dark fields: `--v2-dark-field` for evidence and `--v2-dark-structure` for systems.
- Light field: `--v2-light-field` for real-scene editorial previews.
- Editorial borders: one-pixel low-contrast rules separate hierarchy instead of cards.
- Wide media: uncropped 16:9 desktop frames; 4:3 only for the Home reel on compact screens.
- Editorial index: low-weight numbers and metadata with the name as the primary signal.
- CTA: existing text-link system and blue underline only.
- Motion: `--v2-motion-fast`, `--v2-motion-reveal`, and `--v2-ease`; all disabled for reduced motion.

## Modified Files

- `src/components/RealWorld.jsx`
- `src/components/HomeSections.jsx`
- `src/components/StandardMediaPlayer.jsx`
- `src/styles.css`
- `scripts/capture-task015.mjs`
- `scripts/build-task015-boards.py`
- `docs/TASK015_VISUAL_LANGUAGE_V2.md`

## Media Behavior

- Home Real World continues to use only `/assets/videos/standard/home-real-world/video.mp4`.
- Autoplay, muted, loop, playsinline, reduced-motion behavior, poster fallback, and user pause/resume are preserved.
- Home Applications loads three poster images and no additional videos.

## Rollback Notes

This workspace has no Git history. To roll back Task 015:

1. Restore the previous markup in `RealWorld.jsx`, `HomeSections.jsx`, and the autoplay control content in `StandardMediaPlayer.jsx` from the Task 015 before record.
2. Remove the final `Task 015 - Blue Worm Visual Language V2 prototype` block from `styles.css`.
3. Remove the Task 015 capture and board scripts if the prototype is rejected.

The earlier component names and underlying data/media functions were retained to keep rollback localized.
