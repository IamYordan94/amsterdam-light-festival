# Amsterdam Light Festival — project status

_Updated 16 Sep 2026. Live site: https://iamyordan94.github.io/amsterdam-light-festival/_
_Build tooling: `C:\Users\veria\lightfestival-crawl\` · Project copy: `Desktop/AI STUFF DIFFERENT AGENTS/In progress/Amsterdam Light Festival/`_

---

## 1. DONE

### The site
Your Runable build, rebuilt as a standalone static site — hostable anywhere, editable freely, no dependency on Runable.

| Page | State |
|---|---|
| `index.html` — home | done (**programme section rebuilt** — see below) |
| `artworks.html` — artworks + real map | done; map identical to the original (12 pins, 4 docks) |
| `tickets.html` — 4-step booking | done, works end to end |
| `ticket.html` — confirmation | done |
| `404.html`, `_redirects`, `README.md`, `NOTES.md`, `STATUS.md`, `start-website.cmd` | done |

Verified against the original: **pixel difference 0.08% home / 0.38% artworks / 0.36% tickets.** Mobile 0.22%.

### Hosting
- **Live:** https://iamyordan94.github.io/amsterdam-light-festival/ (public, works on any phone, share card renders)
- **Repo:** github.com/IamYordan94/amsterdam-light-festival

### Booking partners — the part that earns
- **Viator: Full Access.** Real products, prices, departure times, commission. All links tagged `pid=P00296752`.
- **GetYourGuide:** partner `KRAI3FK`, written directly into every GYG offer URL (their widget only tags `<a>` links; our cards are buttons). Analytics script installed on every page.
- **7 real offers** in three categories, with real departure times where the API proves them:

| Category | Offers |
|---|---|
| Covered | Light Festival Cruise by Captain Dave (Viator, €52, nightly 16:30/17:00/18:30/19:00/20:30) · Light Festival Cruise with Live Guide (GYG/Blue Boat) · Luxury Canal Cruise + Cocktails (Viator, €29.95, every 20 min) |
| Open | Light Festival Boat + Unlimited Drinks (GYG/Starboard, €26) · Canal Cruise in Open Boat (Viator, €29.50) |
| Salon | Luxury Light Festival Cruise (GYG/HopOn HopOff) · Classic Saloon Boat Cruise (Viator, €16.99, 20 evening departures) |

### The page does not lie any more
No invented prices, seat counts, add-ons or docks in live mode. Categories describe the real offers. Commission disclosure sits next to every hand-off. Dead products are dropped automatically (23507P14 is not bookable; it looks alive as a web page).

### Imagery — all twelve artworks regenerated
Every artwork has its own generated image: distinct form, placement and camera angle (boat-level, aerial, quay-side, through-the-work framing, low angle…). Generated with a locked recipe — light spill, visible supports, film grain, real optics — after the first pass showed floating, over-clean, fake-photography faults. **Labelled as AI-generated illustrations** in the footer of every page and on the artworks grid.

### The home carousel is gone
It moved on its own, could not be stopped on a touch screen (hover-to-pause is meaningless there), fought the visitor's swipe, and its images stalled behind lazy loading. Replaced with a **programme index + stage**: the twelve works listed on one side, one large image on the other, driven by click, tap, arrow keys, Home/End. Crossfade on switch, tint follows the work, nothing moves by itself. Built from the artwork data so it cannot drift out of sync, with a `<noscript>` grid so all twelve works stay linked without JS.

### The GetYourGuide stray block is gone
Their `auto` widget, finding no links to enhance, rendered a generic activities advert (1425×495) under the footer of every page. Removed. Tracking and analytics untouched.

### Tooling built
| Script | What it does |
|---|---|
| `sync_festival_offers.py` | one command rebuilds the whole offer set — products, prices, times, dead-product removal |
| `sync_viator.py` | pulls Amsterdam products, buckets them into categories |
| `check_links_browser.js` | verifies every booking link in a **real browser** (plain HTTP gets 403 from both platforms, even for products that don't exist) |
| `gen_art.py` / `install_art.py` | generate the artwork set / contact sheet, install, revert |
| `build_programme.py` | rebuilds the home programme section from the artwork data |
| `cdp.js` / `cdp_view.js` | browser driver + viewport screenshots (handles this site's smooth scroll and reveal animations) |

---

## 2. WHAT'S LEFT TO BUILD

In the order I'd do it:

1. **The four remaining scene images** — hero, cruise-under-arch, onboard, boat-spheres. Same rights question the artwork images had; same fix, about **$0.40**.
2. **The invented artist names** — twelve artists who don't exist, now paired with illustrations. Your call: keep as labelled fiction, replace with "what you'll see", or leave.
3. **The "Supported by" row** — invented organisations (Stadsfonds Amsterdam, Rederij Waterlijn, Noordlicht Energie…). Fake sponsorship is a claim about real-sounding bodies; I'd remove it.
4. **"31 artworks" vs the 12 shown** — one number has to give (footer + home copy).
5. **Weekly refresh** — offers, prices, times and link checks on a schedule so nothing goes stale and no link rots (your Pinterest lesson). I can set this up as a scheduled job.
6. **The two GYG prices** that currently read "on the booking page" — read them periodically, or let the widget surface them.
7. **Traffic pages** — the growth work: pages that answer what people type in Nov–Jan (cruise prices, route map, what it costs, with kids, from which dock). Nothing drives visitors yet.
8. **Optional upgrades** — GetYourGuide product widgets inside step 3; Viator **Full + Booking** so people book on your own site with Viator as merchant of record.

---

## 3. YOUR RESPONSIBILITIES

| # | Task | Why it matters |
|---|---|---|
| 1 | **Rotate the Viator API keys and the GetYourGuide 2FA backup code** | both passed through chat/screenshots. Stored locally in `hermes\viator.env` and `hermes\getyourguide.env`, never in the public repo — but treat them as spent |
| 2 | Approve or swap the 7 offer picks | one edit in `sync_festival_offers.py`, one command to apply |
| 3 | Decide the fiction question (artist names) and the sponsors row | the last invented things on a page that now sells real cruises |
| 4 | Decide the business direction | affiliate only · Full+Booking on your own site · direct operator deals · or sell this build to operators |
| 5 | If going commercial: KVK registration + a real domain and email | affiliate income is taxable; a `.test` email gets read as a red flag |
| 6 | Optional: ask the foundation for permission | no longer required for the site to exist — it would upgrade the imagery and let you drop the "not affiliated" line |
| 7 | Optional: add $5 of OpenAI credit | only if you want to compare their image models against the current set; my balance covers generation otherwise |

---

## 4. AFTER THE BUILDING STAGE

The site is not the business — traffic is. In order:

1. **Decide the direction** (item 4 above). Everything below changes with it.
2. **Traffic.** The only no-budget channel that compounds: pages that answer festival-season questions, plus whatever channels you already post to. Light festival traffic is seasonal — it spikes from late November and dies mid-January, so the pages need to exist *before* then.
3. **Distribution of the link.** Wherever people plan Amsterdam trips: forums, groups, your own channels, and the cruise operators themselves (they can share a page that sends them bookings).
4. **Measure.** GYG and Viator dashboards: clicks → bookings → commission. That tells you which category to push and which offers to drop. Nothing else in this project is guesswork once those numbers exist.
5. **Iterate on offers, not on design.** Add an operator who says yes = one row in the config. Drop the ones that never convert. Re-run the refresh.
6. **Keep it honest and it stays alive.** The demo line, the AI-illustration label and the commission disclosure are what let this page exist without permission from anyone. Keep them until you have an agreement that says otherwise.

---

## 5. KNOWN ISSUES

1. **Meta description** still says "15 January – 22 February" while the site says 26 Nov – 17 Jan (copied verbatim from the original).
2. **"31 artworks"** in the footer and home copy vs 12 on the page.
3. **Invented sponsor names** in the "Supported by" marquee.
4. **Displayed "from" prices** are the operator's retail for *evening* departures; the platform's listing can advertise a lower daytime "from".
5. **Brand risk** — "Amsterdam Light Festival" belongs to the foundation that runs it. The demo line covers the current page; selling under that name needs an agreement.
6. **Link rot** — two dead products already caught. That is why the weekly check matters.

---

## 6. QUICK REFERENCE

```bash
# preview locally
cd "Desktop/AI STUFF DIFFERENT AGENTS/In progress/Amsterdam Light Festival" && ./start-website.cmd

# refresh offers, prices, times from the Viator API
cd ~/lightfestival-crawl && python3 sync_festival_offers.py

# check every booking link in a real browser
node check_links_browser.js links-festival.json

# artworks: rebuild the contact sheet / install / revert to the originals
python3 install_art.py --sheet | --apply | --revert

# home programme section (from the artwork data)
python3 build_programme.py

# publish
cd "Desktop/AI STUFF DIFFERENT AGENTS/In progress/Amsterdam Light Festival" && git add -A && git commit -m "..." && git push
```
