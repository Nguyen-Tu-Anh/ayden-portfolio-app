# Responsive and motion QA

Checked on 2026-10-31 against the running local website, using the in-app browser with explicit viewport overrides.

## Fixes

- Replaced the fixed hero height with a minimum viewport height and content-driven sizing. Short landscape screens can scroll to all profile/contact information.
- Used separate grid rows for the title, portrait and profile on phones and portrait tablets. The profile no longer overlaps the face at 768px.
- Kept the mobile navigation on one social-link row at 320px and gave navigation/footer links a minimum height of 44px.
- Improved tablet biography spacing and allowed footer links to wrap.
- Kept native scrolling on touch input and small screens. Desktop scroll smoothing starts at 1100px and requires a fine pointer without a coarse touch pointer.
- Rebuild/revert GSAP effects on relevant media changes, retain the scroll offset during those changes, reveal content once, limit compact/touch zoom to 1.04, and refresh measurements after images/fonts load.
- Respond to reduced-motion preferences with visible, untransformed content and disabled portrait transitions/zoom. Remove event listeners and pending refresh frames on unmount.

## Viewport results

All 13 cases passed: no horizontal overflow, hero title clear of the fixed header, complete profile/contact content within the hero, no portrait/profile overlap in the stacked layout, navigation within the viewport, 44px navigation/footer targets, and biography content within the viewport.

| Viewport | Scenario | Result |
| --- | --- | --- |
| 320 × 568 | Small phone portrait | Pass |
| 375 × 667 | Phone portrait | Pass |
| 390 × 844 | Phone portrait | Pass |
| 430 × 932 | Large phone portrait | Pass |
| 667 × 375 | Small phone landscape | Pass |
| 844 × 390 | Phone landscape | Pass |
| 768 × 1024 | Tablet portrait | Pass |
| 820 × 1180 | Tablet portrait | Pass |
| 1024 × 768 | Tablet landscape | Pass |
| 1024 × 1366 | Large tablet portrait | Pass |
| 1180 × 820 | Tablet landscape | Pass |
| 1366 × 1024 | Large tablet landscape | Pass |
| 1440 × 900 | Desktop regression | Pass |

Measurements: [before.json](before.json), [after.json](after.json).

## Motion and scrolling

Eight consecutive changes of viewport size/orientation were exercised while scrolled into the page, without reloading between changes. All passed: no unexpected reset to the top, no eligible visible reveal left hidden after its entrance completed, and no horizontal overflow. The browser naturally clamps the existing scroll offset when the new document becomes shorter.

Phone scrolling through the biography and footer was checked; the images loaded, previously revealed content stayed visible, and the footer remained reachable. Desktop smoothing and the native-scroll layout were exercised when crossing the 1100px breakpoint.

Details: [rotation.json](rotation.json). No console warnings/errors were recorded in the final browser checks.

## Build checks

- `npm run typecheck`: passed.
- `npm run build -- --webpack`: passed, including production compilation, TypeScript and static page generation.
- `git diff --check`: passed.

The default Turbopack production build was blocked by this execution environment's restriction on the internal port used to process CSS; Webpack completed the production validation. The running local development server continues to use Turbopack.

## Screenshots

- [Phone, 320 × 568](after-phone-small.jpg)
- [Phone, 390 × 844](after-phone.jpg)
- [Phone landscape](after-phone-landscape.jpg)
- [Tablet, 768 × 1024](after-ipad.jpg)
- [Tablet, 820 × 1180](after-ipad-air.jpg)
- [Tablet landscape](after-ipad-landscape.jpg)
- [Desktop](after-desktop.jpg)

## Verification limits

These are browser viewport tests, not tests on physical iPhones/iPads. Touch/coarse-pointer and reduced-motion behavior have explicit implementation guards, but this browser tool does not provide touch-input or operating-system motion-preference emulation. Physical iOS/iPadOS Safari, pinch zoom, device notches and dynamic browser chrome still need an on-device check.
