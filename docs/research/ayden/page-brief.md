# Ayden — homepage brief

Local route: `/` (`src/app/page.tsx` → `src/components/sites/ayden/home-page.tsx`).
Styles: `src/components/sites/ayden/ayden.css`, scoped under the `.ayden` body class.
Content and contact links: `src/components/sites/ayden/content.ts`.

## Visible sections

1. Fixed navigation with the Ayden logo, Facebook, Instagram, SoundCloud and phone contact.
2. Hero with the DJ · PRODUCER title, Open Format tagline, portrait and profile of Nguyễn Tú Anh (Ayden).
3. Portfolio with four coordinated charcoal-background portraits, two columns on desktop and one column on mobile.
4. Biography with a natural-color portrait, Vietnamese introduction and the “Amplify Your Deepest Energy Now!” quote.
5. Footer with Ayden branding, social links, email and phone contact.

The CONNECT, ON TOUR and THE LIST sections, including the signup form, remain available in `HiddenSections` but are not rendered on the homepage. The demo vinyl player is also inactive.

## Design tokens

- Backgrounds: `#0e0e0e`, `#141414`, `#1a1a1a`.
- Text: `#fff`, `#b0b0b0`, `#707070`, `#3a3a3a`.
- Accent: `#f35a38`, `#f6765a`.
- Fonts: Barlow Condensed 500–700 for headings; Helvetica Neue / Inter 300–500 for body text.
- Main mobile breakpoint: 768px.

## Assets

All website assets live in `public/sites/ayden/`:

- `ayden-logo.png`, `ayden-logo-gradient.png`, `ayden-logo-silver.png`, `favicon.png`.
- `hero-photo.jpg`, `bio-photo.jpg`.
- `portfolio/portrait-23521.jpg`, `portfolio/portrait-23451.jpg`, `portfolio/portrait-23536.jpg`, `portfolio/portrait-23440.jpg`.
- `tour-bg.jpg` for the inactive tour section; `audio/demo-*.m4a` for the inactive demo player.

Portrait sources, edit prompts and asset mappings are documented in `portfolio-image-edit.md` and `bio-image-edit.md` in this directory.

## Contact

- Phone: `0889 117 861` (`tel:+84889117861`).
- Email: `aydenmusix@gmail.com`.
- Facebook: `https://www.facebook.com/ayden.musix/`.
- Instagram: `https://www.instagram.com/ayden.musix/`.
- SoundCloud: `https://soundcloud.com/ayden_musix`.
