# Amsterdam Light Festival — project status

_Last updated: 15 Sep 2026. Live site: https://iamyordan94.github.io/amsterdam-light-festival/_

---

## 1. What exists now (done)

### The website
A complete static copy of the original Runable build, rebuilt so it can be hosted anywhere and edited freely.

| Page | State |
|---|---|
| `index.html` — home | done, verified against the original |
| `artworks.html` — artworks + real map | done, map verified identical (12 pins, 4 docks, same tiles) |
| `tickets.html` — 4-step booking | done, works end to end |
| `ticket.html` — confirmation | done, reads the booking it created |
| `404.html`, `_redirects`, `README.md`, `NOTES.md`, `start-website.cmd` | extras for hosting and handover |

Verified against the live original: **pixel difference 0.08% (home), 0.38% (artworks), 0.36% (tickets)** — the residue is the removed hosting badge, the animated sponsor marquee's phase, and text anti-aliasing. Every section's position and height matches exactly.

### Hosting
- **Live:** https://iamyordan94.github.io/amsterdam-light-festival/ (public, works on any phone, link previews render)
- **Repo:** github.com/IamYordan94/amsterdam-light-festival
- **Local copy:** `Desktop/AI STUFF DIFFERENT AGENTS/In progress/Amsterdam Light Festival/`
- **Build tooling:** `C:\Users\veria\lightfestival-crawl\` (scripts + crawl artefacts)

### Booking partners (this is the part that earns money)
- **Viator:** Partner API with **Full Access** → real products, prices, departure times and commission. Every link is pre-tagged with partner id `P00296752`.
- **GetYourGuide:** partner id `KRAI3FK`. Their widget + analytics are installed on every page. Partner id is also hard-coded into every GYG offer URL (their widget only tags `<a>` links, and our offer cards are buttons — without this the clicks would earn nothing).
- **Seven real offers** across the three categories, each with its own price, rating, review count and — where the API proves it — real departure times:

| Category | Offers |
|---|---|
| Covered | Light Festival Cruise by Captain Dave (Viator, €52, nightly 16:30/17:00/18:30/19:00/20:30) · Light Festival Cruise with Live Guide (GYG/Blue Boat) · Luxury Canal Cruise + Cocktails (Viator, €29.95, every 20 min) |
| Open | Light Festival Boat + Unlimited Drinks (GYG/Starboard, €26) · Canal Cruise in Open Boat (Viator, €29.50) |
| Salon | Luxury Light Festival Cruise (GYG/HopOn HopOff) · Classic Saloon Boat Cruise (Viator, €16.99, 20 evening departures) |

### Live mode does not lie
No invented prices, no fake seat counts, no made-up add-ons, no fictional departure dock. Categories describe the real offers. A commission disclosure sits next to every hand-off, and the booking always finishes on the operator's or the platform's own page.

### Tools built (in `C:\Users\veria\lightfestival-crawl\`)
| Script | What it does |
|---|---|
| `sync_festival_offers.py` | **One command rebuilds the whole offer set** — products, prices, times, dead-product removal |
| `sync_viator.py` | Pulls Amsterdam products and buckets them into categories (candidate shortlists) |
| `apply_candidates.py` | Wires chosen product codes into the site data (`--clear` reverts to demo mode) |
| `check_links_browser.js` | Verifies every booking link in a **real browser** — plain HTTP checks are useless here (both platforms answer 403 to anything that isn't a browser, even for products that don't exist) |
| `trace_links.js` | Shows where each stored link actually lands after redirects |
| `cdp.js` | Headless/headed browser driver used for all testing |

---

## 2. What still has to be done

### Priority order

1. **Real festival content.** The page still shows 12 invented artworks, invented artist names, a "31 artworks" claim and invented sponsor names. On a page that now genuinely sells festival cruises, that is the last thing that doesn't hold up. Either replace it with the real festival information (real artists, real route, real edition — the real product pages say *"20 artworks, 15th edition"*) or label the artwork section clearly as illustration.
2. **Refresh on a schedule.** Offers, prices and times go stale. `sync_festival_offers.py` fixes that in one command — needs scheduling (weekly) together with a link-rot check.
3. **The two GetYourGuide prices** currently show "on the booking page". Can be read periodically like the rest, or left to the widget.
4. **Contact details and domain.** The site uses `hello@amsterdamlightfestival.test` and a fake phone number, and the "Supported by" row names are invented. Fine for a demo, not for a live commercial page.
5. **Consent notice.** The GetYourGuide script sets cookies; an EU-facing site should say so.
6. **Traffic.** Nothing is driving visitors yet. The only no-budget channel that compounds is search — pages that answer what people type in Nov–Jan ("amsterdam light festival cruise", "light festival route map", prices). Not started.

### Optional, bigger moves
- **Viator "Full + Booking" access** — customers would book *on this site* with Viator as merchant of record and Viator handling customer service. Free, needs authorization. This is the version where the whole booking happens on your page.
- **Adding operators directly** — any operator's own booking link is just another row in the offers list, so "sell through us" for third parties is already supported technically; it needs a commercial agreement, not code.
- **Selling this build to operators** — a separate business: the site quality is the asset, and small Amsterdam operators pay for it.

---

## 3. What you need to do

| # | Task | Why |
|---|---|---|
| 1 | **Rotate the Viator API keys and the GetYourGuide 2FA backup code** | Both were shared in chat/screenshots. They are stored locally in `hermes\viator.env` and `hermes\getyourguide.env` and are **not** in the public repo — but a key that has been pasted anywhere should be treated as spent |
| 2 | Approve or swap the offer picks | Currently the 7 listed above; swapping is one edit in `sync_festival_offers.py` |
| 3 | Decide on the artwork content | Real festival content, or clearly labelled illustration |
| 4 | Decide the business direction | affiliate only · Full+Booking on your own site · direct operator deals · or sell the build to operators |
| 5 | If going commercial: register a business (KVK in NL) and get a real domain + email | Affiliate income is taxable; operators and platforms take a .test email seriously as a red flag |

---

## 4. Things to fix / known issues

1. **Stale meta description** — it still says "15 January – 22 February" while the whole site says 26 Nov – 17 Jan. Copied verbatim from the original; should be corrected.
2. **"31 artworks"** — matches neither the dataset (12) nor the real festival (the live product pages say 20 works for the 15th edition).
3. **Invented sponsor names** in the "Supported by" marquee — on a commercial page these read as claims.
4. **Displayed "from" prices** come from the operator's retail for *evening* departures; the platform's own listing sometimes advertises a lower "from" (daytime slots). Customer could see a higher number here than on the product page — should be labelled "evening departures, from €X".
5. **Brand risk** — "Amsterdam Light Festival" belongs to the foundation that runs it. The demo line in the footer ("Demo build · not affiliated with any real festival organisation") is what keeps the current page honest; selling under that name without an agreement is a different matter.
6. **Two dead products already caught** by the link checker (one GYG festival cruise redirects to a generic page; one Viator festival product returns 404 "Product is not active"). Expect more over time — this is exactly why the weekly check matters.

---

## 5. Quick reference

```bash
# preview locally
cd "Desktop/AI STUFF DIFFERENT AGENTS/In progress/Amsterdam Light Festival" && ./start-website.cmd

# refresh offers, prices and times from the Viator API
cd ~/lightfestival-crawl && python3 sync_festival_offers.py

# check every booking link in a real browser
node check_links_browser.js links-festival.json

# back to demo mode (no partner links)
python3 sync_festival_offers.py --clear

# publish changes
cd "Desktop/AI STUFF DIFFERENT AGENTS/In progress/Amsterdam Light Festival" && git add -A && git commit -m "..." && git push
```
