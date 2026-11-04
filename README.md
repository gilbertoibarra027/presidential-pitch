# Presidential Aviation · v4 (lean pitch build)

Static, no build step. Open `index.html` via any static server (`python3 -m http.server`).
Not deployed. v2 is untouched.

## Structure (~5.3 screens desktop / ~7 screens mobile)
1. Header (logo, nav, phone, Schedule Your Flight) + 1.7s airplane-window intro (CSS, plays once on load)
2. Hero: Ken Burns CSS loop on tarmac-day(-m).webp + booking bar (step 1)
3. Trust strip (text badges, UNVERIFIED)
4. Fleet: G650ER / N650MV, signature "Fly Private. Arrive Ready." jet reveal (plays once in view)
5. Why Us: stats (SAMPLE) + 4 perks
6. Global: light canvas globe, FXE to 6 example cities (land.js lazy-loaded)
7. Empty Legs band
8. Closing CTA + contact form + footer
Step 2 = modal (desktop) / bottom sheet (mobile). Mobile sticky Call / Schedule bar.

## Changes from v2
No GSAP, ScrollTrigger, or Lenis, no custom cursor, no pinned scroll. CSS animations + IntersectionObserver only.
JS ~12 KB, CSS ~24 KB. Below-fold images lazy-loaded, hero image + fonts preloaded.

## Check with Presidential before publishing
- Certifications in the trust strip (ARGUS Platinum, Wyvern Wingman, IS-BAO Stage 2)
- Lead phone: 954.481.0344 used everywhere; live site also lists 954.772.8622
- Stats (25+ yrs, 12 aircraft, 15,000+ flights) are samples
- "Private FXE terminal" perk
- Cities are examples; imagery is AI placeholder
- Forms have no backend: see `TODO: connect form endpoint` comments
- `noindex` meta is on purpose for the preview (it's why Lighthouse SEO shows 63)
