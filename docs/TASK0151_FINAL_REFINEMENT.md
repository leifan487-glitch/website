# Task 015.1 - Blue Worm Visual Language V2 Final Refinement

Date: 2026-09-05

## Scope

Task 015.1 refines only the Home Real World, Technology, and Applications sequence. It does not extend the Task 015 redesign to any independent page or locked global shell.

## Implemented

- Replaced the Home Real World public Reel with the action-first SV010 / SV018 / SV054 / SV007 compilation.
- Replaced the poster with a representative SV010 dual-arm operation frame.
- Changed the compact-screen Reel ratio from 4:3 to 16:10 after four-segment crop review.
- Removed “完整” from the Technology summary claim and ended the sentence with “技术体系”。
- Compressed Technology only at `<=600px` by adjusting header/body spacing, summary type, Mantis node height, and platform row height.
- Changed the Applications public Intro from a project claim to task-record wording while retaining the existing SV035 / SV037 / SV054 editorial grid.

## Mobile Technology Refinement

At `<=600px`:

- Header top/bottom: `84/44px` to `72/38px`
- Heading top margin: `34px` to `28px`
- Header intro top margin: `28px` to `22px`
- Body top/bottom: `48/84px` to `40/72px`
- Body gap: `44px` to `36px`
- Summary: `19px` to `18px`, line-height `1.45`
- Summary CTA top margin: `36px` to `28px`
- Mantis node: `128px / 24px` to `116px / 20px`
- Platform rows: `108px / 22px` to `96px / 18px`

The 390px Technology screenshot height changed from 1232px to 1099px, a 10.8% reduction. The 1440px screenshot changed from 1224px to 1225px, confirming the desktop composition remains effectively unchanged.

## Public Copy

Technology before:

> 从机器人本体、架构与遥操作，到具身模型和云平台，形成面向研发与任务实践的完整技术路径。

Technology after:

> 从机器人本体、架构与遥操作，到具身模型和云平台，形成面向研发与任务实践的技术体系。

Applications before:

> 从真实项目记录出发，探索商业服务、柔性制造与更多任务方向。

Applications after:

> 从真实任务记录出发，探索机器人在不同场景中的应用方向。

## QA Evidence

- Production Public QA: `screenshots/task0151/public/browser-qa.json`
- Desktop sections: `01-real-world-1440.png`, `02-technology-1440.png`, `03-applications-1440.png`
- Desktop sequence: `04-core-1440.png`
- Mobile sections: `05-real-world-390.png`, `06-technology-390.png`, `07-applications-390.png`
- Mobile sequence: `08-core-390.png`
- Four mobile Reel frames: `09-reel-sv010-390.png` through `12-reel-sv007-390.png`
- Production Public V2 board: `task0151-production-public-v2-review-board.jpg`
- 390px Reel Crop board: `task0151-mobile-reel-crop-board.jpg`

All six tested widths (1728, 1440, 1280, 1024, 768, 390) pass HTTP, overflow, image, video, accessibility-name, application-media, public-DOM, console, page-error, bad-response, and request-failure checks. Homepage autoplay, muted, loop, playsinline, pause/resume, and reduced-motion behavior pass.

## Verification

- `pnpm run test:v0`: 58/58 passed
- `pnpm run test:sites`: 4/4 passed
- `pnpm run build`: passed

## Locked Areas

Home Hero, A01644, Hero typography, Navbar, contact navigation, Footer, routes, Standard page, Technology page, Applications page, About, Progress, Inquiry, Q&A, Standard Specs, Media Governance, approval SSOT, and Standard-only public strategy were not modified. Task 016 has not started.
