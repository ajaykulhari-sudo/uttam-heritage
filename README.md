# Hotel Uttam Heritage — website

The website for **Hotel Uttam Heritage**, Clock Tower, Ambala Road (opposite
V-Mart), Saharanpur, Uttar Pradesh 247001.

Static HTML/CSS/JS. No build step, no framework, no dependencies. Open
`index.html` in a browser and it runs.

Built from [`ajaykulhari-sudo/ramdev`](https://github.com/ajaykulhari-sudo/ramdev)
(template-1, the boutique/heritage design), re-skinned and re-written for this
property.

## Structure

```
├── index.html          Home — hero, booking bar, rooms, facilities, location
├── rooms.html          All four room types with specs and amenities
├── facilities.html     Facilities grouped by theme + house rules
├── gallery.html        Photographs, grouped by room type
├── contact.html        Enquiry form, phone, address, map, getting here
├── styles.css          Design system + all page styles
├── script.js           Nav, booking-engine deep link, enquiry form, Book Now button
└── images/             13 photographs of the property
```

## Booking

The site does not hold rooms, quote totals, or take payment. It hands the
guest's dates to the **DigiStay booking engine**, which owns availability,
rates, taxes and checkout.

```
https://digibooking.in/hotel/<propertyId>?checkIn=DD-MM-YYYY&checkOut=DD-MM-YYYY&rooms=<adults>-<children>
https://digibooking.in/H179    short code, same property, no dates
```

| Thing | Value |
|---|---|
| Property ID | `e28c9e71-8d07-4068-99bd-8eba53e99096` |
| Short code | `H179` |
| Date format | `DD-MM-YYYY` (converted in `toEngineDate`) |
| `rooms` param | `<adults>-<children>` — **not** a room count |

All of this lives in the `BOOKING` object at the top of `script.js`. The date
form on the homepage builds a full deep link; every other `Book Now` button
carries `data-book` and is pointed at the short code at runtime.

The floating button in the corner is **Book Now only** — there is deliberately
no WhatsApp button.

## Content provenance

Every fact comes from the property's own booking-engine record
(`GET api.digistay.co.in/booking-engine/public/property/H179`): name,
description, address and coordinates, phone, email, check-in/out times, the
19 property amenities, per-room amenities, occupancy, room counts
(7 Deluxe, 9 Executive, 8 Standard A/C, 15 Basic = 39), and the house,
cancellation and child policies.

Deliberate omissions:

- **No prices.** Rates vary by date; the booking engine is the source of truth.
- **No reviews or testimonials.** The record has none; the site links to Google
  instead of inventing any.
- **No "smoking rooms".** The amenity list says smoking rooms exist but the
  hotel policy says strict non-smoking — the site states only the policy.
- **No restaurant.** The record lists a kitchen and room service, not a
  restaurant, so the site says exactly that.

## Images

The record only contains room photographs (no exterior or lobby), so the site
is built around the strongest of them. 18 source images → 13 used:

- 2 exact duplicates and 1 low-resolution copy of the hero shot removed.
- 2 bathroom shots dropped for looking cluttered (a plastic bucket in frame).
- The hero (`hero-executive.jpg`) is the only 5120px original — the marble-floor
  Executive Room — resized to 2400px; the rest to max 1800px.

Total image weight: ~2.8 MB. To replace a photo, keep the filename and drop the
new file in `images/`. An exterior or lobby photo, when one exists, would make a
good addition to the gallery and the home-page location block.

## Local preview

```bash
python3 -m http.server 4509
# → http://localhost:4509
```

## Deploying

Pure static — any host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages,
S3 + CloudFront).

## Design

Inherited from template-1: Fraunces (headings) + Inter (body), 1280px container,
breakpoints at 980px and 580px.

The palette is taken from the rooms themselves — warm ivory for the marble
(`--bg: #F8F4EE`), a heritage oxblood accent (`--accent: #6B2C2A`), and brass
(`--brass-light: #E4CB9C`) for the italic hero lines, matching the pendant
lamps. The hero wears a deep walnut veil. Tokens are at the top of `styles.css`.

## Credits

- Template-1 design by Dhruv (DigiStay marketing lead)
- Photographs: the property's own
