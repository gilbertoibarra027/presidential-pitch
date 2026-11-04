# Presidential Aviation: pitch concept v2

This is a static preview. Open `index.html` through any local server, for example `python3 -m http.server`. It works offline: the fonts, GSAP, ScrollTrigger and Lenis are all included in the folder. Nothing here has been deployed.

## Facts used and where they come from
- Address, phone numbers, email, services list and the empty-legs description come from presidential-aviation.com (home, fleet and empty-leg pages). The address is 1725 NW 51 Place, Fort Lauderdale, FL 33309, at Fort Lauderdale Executive Airport (FXE). The numbers are charter +1 954.481.0344, office +1 954.772.8622, toll-free 1.888.772.8622, and the email is sales@presidential-aviation.com. Note that flypresidential.com is only a GoDaddy placeholder.
- Gulfstream G650ER specs (up to 19 passengers, 7,500 nm, Mach 0.85 long-range cruise, Mach 0.925 maximum operating speed, 46 ft 10 in cabin, 51,000 ft, sleeps 10, 16 oval windows, 100% fresh air, Rolls-Royce BR725) come from Gulfstream's published G650ER specifications.
- We feature the G650ER because the FAA registry, through aeropattern and flightladder, lists N650MV, a G650ER, on their certificate. The page labels it "Featured aircraft", not "our fleet".
- The FXE coordinates are 26.20°N, 80.17°W.
- The marketing copy is Rex's.

## Placeholders still showing on the page
- `[STAT]` × 3 in the statement panel: years in operation, aircraft in fleet, flights flown
- `[X]+ flights` on the globe card

## Claims to confirm with the client
- "Private FXE terminal" (perk 02, from Rex's copy) needs confirming.
- The destination cities are used as examples, not as a list of routes.

## v3 (lead capture + runway intro)
- Opening: jet on the runway (img/tarmac.webp). As you scroll, the camera pushes into a lit cabin window, which becomes the porthole hero. This all runs inside the existing sticky `.flight` stage, scrubbed by the same GSAP timeline. Reduced motion gets a static runway screen instead.
- Always-visible primary CTA, "Schedule Your Flight": in the header, the intro route bar, and the mobile sticky bar. All of them open the quote modal.
- Quote forms (the #quote section, the modal, and the footer) validate on the client only. **No backend yet:** see the `<!-- TODO: connect form endpoint (FormSubmit/CRM) after client approval -->` comments.
- The trust row ("Response within 15 minutes", "24/7 charter desk") is SAMPLE copy until the client confirms it.
- Backup of the pre-v3 site: ../v2-backup-pre-v3/
