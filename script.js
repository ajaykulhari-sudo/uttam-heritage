// ─────────────────────────────────────────────────────────────
// Hotel Uttam Heritage — nav behaviour + DigiStay booking-engine deep link
// ─────────────────────────────────────────────────────────────

// Nav scroll behavior — solid background after 60px scroll.
// Inner pages can set <nav class="nav solid"> to skip scroll-watching.
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  if (nav.classList.contains('solid')) return;

  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Mobile menu — below 980px the nav links collapse behind the ☰ button.
(function () {
  const nav = document.getElementById('nav');
  const toggle = nav && nav.querySelector('.menu-toggle');
  const links = nav && nav.querySelector('.nav-links');
  if (!toggle || !links) return;

  const setOpen = (open) => {
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  };

  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));

  // Close on Esc, and whenever the viewport grows back past the breakpoint —
  // otherwise the open state strands the desktop nav in its stacked layout.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) setOpen(false);
  });
})();

// ─────────────────────────────────────────────────────────────
// Booking engine
//
// Live rates, availability and checkout live on the DigiStay booking engine.
// This site never quotes an availability or a total — it hands the guest's
// dates over and lets the engine stay the source of truth.
//
// Verified contract (2026-09-28):
//   https://digibooking.in/hotel/<propertyId>?checkIn=DD-MM-YYYY&checkOut=DD-MM-YYYY&rooms=<adults>-<children>
//   https://digibooking.in/H179  → short code for the same property, no dates
// ─────────────────────────────────────────────────────────────
const BOOKING = {
  propertyId: 'e28c9e71-8d07-4068-99bd-8eba53e99096',
  base: 'https://digibooking.in/hotel/',
  shortLink: 'https://digibooking.in/H179',
};

// The engine expects DD-MM-YYYY; <input type="date"> gives YYYY-MM-DD.
function toEngineDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}

function bookingUrl({ checkIn, checkOut, adults, children }) {
  const url = new URL(BOOKING.base + BOOKING.propertyId);
  if (checkIn) url.searchParams.set('checkIn', toEngineDate(checkIn));
  if (checkOut) url.searchParams.set('checkOut', toEngineDate(checkOut));
  url.searchParams.set('rooms', `${adults || 2}-${children || 0}`);
  return url.toString();
}

function isoShift(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const checkin = form.querySelector('#checkin');
  const checkout = form.querySelector('#checkout');

  // Default to tonight → tomorrow, and never allow a past arrival.
  checkin.min = isoShift(0);
  checkin.value = isoShift(0);
  checkout.min = isoShift(1);
  checkout.value = isoShift(1);

  // Departure always trails arrival by at least one night.
  checkin.addEventListener('change', () => {
    const next = new Date(checkin.value);
    next.setDate(next.getDate() + 1);
    const nextIso = next.toISOString().slice(0, 10);
    checkout.min = nextIso;
    if (checkout.value <= checkin.value) checkout.value = nextIso;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    window.open(
      bookingUrl({
        checkIn: checkin.value,
        checkOut: checkout.value,
        adults: form.querySelector('#adults').value,
        children: form.querySelector('#children').value,
      }),
      '_blank',
      'noopener'
    );
  });
})();

// Pages without the date form (rooms, facilities, gallery, contact) send their
// "Book" buttons straight to the engine; the guest picks dates there.
(function () {
  document.querySelectorAll('[data-book]').forEach((el) => {
    el.setAttribute('href', BOOKING.shortLink);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
})();

// ─────────────────────────────────────────────────────────────
// Enquiry form (contact page)
//
// The site is static — there is no server to POST to. Rather than swallow an
// enquiry silently, the form composes the email in the guest's own mail app so
// they can see it leave. Bookings don't come through here; they go to the
// engine, which can actually hold a room.
// ─────────────────────────────────────────────────────────────
const ENQUIRY_TO = 'hoteluttamheritage@gmail.com';

(function () {
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  const val = (id) => (form.querySelector('#' + id)?.value || '').trim();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = `${val('name')} ${val('lname')}`.trim();
    const stay = val('checkin') && val('checkout')
      ? `${val('checkin')} to ${val('checkout')}`
      : 'Dates not fixed yet';

    const body = [
      `Name: ${name}`,
      `Email: ${val('email')}`,
      `Phone: ${val('phone') || '—'}`,
      '',
      `Stay: ${stay}`,
      `Guests: ${val('guests')}`,
      `Room preference: ${val('room')}`,
      '',
      'Message:',
      val('message') || '—',
    ].join('\n');

    window.location.href =
      `mailto:${ENQUIRY_TO}` +
      `?subject=${encodeURIComponent('Website enquiry — ' + (name || 'Hotel Uttam Heritage'))}` +
      `&body=${encodeURIComponent(body)}`;
  });
})();

// ─────────────────────────────────────────────────────────────
// Floating Book Now button
//
// One action, always in reach: straight to the DigiStay booking engine, which
// is where a room is actually held. Injected here so the markup lives in one
// place, not five HTML files.
// ─────────────────────────────────────────────────────────────
(function () {
  const wrap = document.createElement('div');
  wrap.className = 'floating-actions';
  wrap.innerHTML = `
    <a class="fab fab-book" href="${BOOKING.shortLink}" target="_blank" rel="noopener" aria-label="Book now on our booking page">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>
      <span>Book Now</span>
    </a>`;
  document.body.appendChild(wrap);
})();

// Copyright year, so the footer never goes stale.
(function () {
  const y = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = y));
})();
