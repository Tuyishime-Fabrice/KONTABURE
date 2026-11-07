# KONTABURE: landing page redesign

A complete, working HTML prototype of the new public landing page for **KONTABURE for Businesses**.
It has scroll-driven storytelling on desktop, a separately designed touch layout, and a fully static
version for people who prefer reduced motion.

```
index.html                 the page (includes the brand intro markup)
assets/css/kontabure.css   all styles (tokens at the top)
assets/js/kontabure.js     interactions + scroll choreography (config at the top)
assets/css/intro.css       brand intro, scenes 1-3 (self-contained)
assets/js/intro.js         brand intro, hand-off to the page (no dependencies)
assets/brand/              official logo as SVG (light + reverse), mark, favicons
tools/brand/build-logo.py  draws the logo artwork from geometry + Poppins outlines
assets/vendor/             GSAP 3.15 + ScrollTrigger (vendored, no CDN needed)
assets/fonts/              Poppins 300–700 (self-hosted, OFL); Arial is a system font
assets/img/                hero photograph (1672px and 960px)
assets/screens/            product screens used in every frame (see "Screenshots" below)
tools/screens/app/         render source + build script for the product screens
```

**To view it:** open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`)
and visit `http://localhost:8000`. It works offline. The only external URLs are the existing
`https://kontabure.africa/login` links and the manifest. Add `?intro` to the URL to replay the brand intro.

---

## 1. Reference study

**Reference video.** A pinned product visual carries the story across section boundaries.
The headline sits above a dashboard. On scroll, the headline leaves while the dashboard rises
and scales to almost full width. The sky background then washes to a pale surface, and the
dashboard shrinks to the right with a 3D tilt while the next section's copy fades in on the left.
Finally it exits in perspective as the following section rises. The essentials are: **one visual
that never cuts**, **a background colour change that marks the chapter change**, and **text
choreographed to the visual's position**.

**Existing page.** The content, links and pricing behaviour were carried over. Pricing is
data-driven: the live page renders plans from a payload, and today that payload holds one custom
*Enterprise* plan (1 branch included, extra branches free, 10% quarterly / 20% annual discounts)
with a 30-day trial. The old brand name was removed everywhere.

## 2. Visual direction: "the notebook becomes the system"

The headline, *"Run your business without the notebook & Excel"*, is the brand's best idea, so the
identity is built around it.

- **Motif:** faint ruled ledger lines and an amber "margin rule" (the vertical red line of an exercise
  book) recur from the hero to the footer. The hero crosses out *notebook*, then *Excel*, with drawn amber strokes.
- **Brand colours:** deep forest `#123C34`, emerald `#00B88A`, warm ivory `#F7F7F2`. Dark sections use a
  forest-tinted black, light sections use the ivory, and emerald carries the product accent, headline
  emphasis and every primary button. Amber survives only as a small warm accent (the pen stroke, the margin
  rule, the clock's sun). All of this lives in the tokens at the top of `kontabure.css`.
- **Colour as time of day:** the page starts dark (dusk, closing the shop), washes to ivory (day)
  for the product story, runs through an actual day in the horizontal section, and returns to dark
  (night) for features, pricing and the close.
- **Type:** **Poppins** is the main typeface (headlines, labels, navigation, buttons, figures) and **Arial**
  the second (running text). Emphasis inside headlines uses Poppins Light in emerald, not italics.
- **Photography:** the hero is a shop counter at dusk with the Kigali skyline beyond, under a layered
  dark grade with a faint forest tint, so it sets the scene without competing with the product.
- **Restraint:** one hero glow, no decorative blobs, no grid of identical rounded cards. Features are a
  typographic ledger, local strengths a two-column manifesto, categories a lit word wall.

## 3. Logo and brand intro

**Logo.** The supplied logo was redrawn as clean vector artwork (`tools/brand/build-logo.py`), keeping
its structure and proportions: the K's stem and arm with a notch at the top, the separate triangular leg,
and three rising emerald bars set into the K like a sales chart. The white channel around the bars is
derived by offsetting the bars, so it has a constant width and concentric curves. The wordmark is drawn
from Poppins ExtraBold outlines (the site's typeface) and keeps the logo's signature crossbar-less **Λ**,
made from Poppins' V turned upside down so its strokes match the other letters. Files in `assets/brand/`:
`kontabure-logo.svg` (light backgrounds), `kontabure-logo-reverse.svg` (dark backgrounds), the mark on
its own, `favicon.svg`, and PNG favicons (32, 180, 512). On the page the logo is one SVG symbol
(`#logo-lockup`), used in the navigation, footer and intro.

**Brand intro.** On a fresh visit the page opens on a short brand sequence and then becomes the page
itself. There's no video: it's live SVG and CSS, about 4 seconds long.

| Time | Scene |
|---|---|
| 0.0 s | Deep forest. A faint emerald light settles on the floor. |
| 0.15 s | The K drops in from above and lands with one soft rebound. |
| 0.8 s | The three bars rise inside the K, one after another, like a chart. |
| 1.15 s | The K steps aside as **KONTABURE** is drawn: each letter is traced as a fine emerald outline, then inked in ivory. |
| 2.25 s | One emerald accent travels across the logo; a swoosh draws beneath it. |
| 3.05 s | Hand-off: the logo flies into its exact place in the navigation while the scene opens from the centre onto the hero photograph, and the headline and buttons rise. |

- **When it plays:** once per browser session (`sessionStorage`), on fresh visits only. It does not play on
  reload or back/forward, on deep links (`/#pricing`), or with *reduce motion* switched on. `?intro` replays it.
- **Never in the way:** a *Skip intro* button (the first Tab stop), and any scroll, swipe, key press or click
  skips straight to the hand-off. The page is loaded and rendered behind the intro the whole time.
- **Robust by design:** scenes 1-3 are pure CSS on inline SVG, so they start at first paint without waiting
  for any script. The hand-off uses the browser's own animation API, not GSAP. If scripts fail, CSS and
  head-script safety nets clear the intro and restore scrolling by about 7 seconds.
- **To remove it:** delete the `brand-intro` block in `index.html`, the two `intro` files and the intro lines
  in the head script.

## 4. The scroll experience, section by section

| # | Section | What happens |
|---|---|---|
| 1 | **Hero** | Full-bleed photograph under a dark grade, with the headline anchored bottom-left so the cashier and skyline stay visible. Word-mask reveal, strikes drawn across *notebook* and *Excel*, a lead that frames the product as business intelligence (profit and loss, cash flow, AI insights), two activity notifications floating in the scene, and the dashboard's top edge peeking up from the counter. |
| 2 | **Signature transition** *(pinned)* | Scrolling lifts and flattens the dashboard and expands it to near full screen. The photo drifts and slowly zooms (parallax) while an ink layer deepens over it, so the interface takes focus. The notifications fly into the dashboard, then the photo dissolves as the page washes from ink to paper. |
| 3 | **Read the dashboard** *(pinned)* | "One screen. *Your whole business.*" Four numbered annotations appear one by one on the Books of account dashboard: Today sales, Today profit, 6-month trend, This month mix. This answers "what does the dashboard tell me?" |
| 4 | **One connected system** *(pinned)* | The frame slides right and turns in 3D as "Your entire business. *One connected system.*" rises on the left. |
| 5 | **How it works: five chapters** *(pinned frame, scrolling text)* | Set up → Inventory → Credit → Books (financial reports) → Insights (AI business intelligence). The order builds from daily operations to the profit and the explanation behind it. Each chapter swaps the real screen with a clip-path wipe (direction-aware on reverse scroll) and **moves a camera** to the relevant part of the UI. A chapter-specific callout chip and a clickable step rail update with it. |
| 6 | **One sale, everywhere** | Interactive: choose Cash / Mobile money / On credit and press *Record sale*. Pulses travel to Stock (6 → 5, running low), Sales today (+RWF 1,500) and Payments or the customer's credit balance. Stock eventually runs out; *Reset* restores it. |
| 7 | **A day in your shop** *(horizontal)* | Vertical scroll drives a horizontal day from 07:00 to 21:00: running low before opening, supplier delivery, lunchtime rush (payment mix), credit, repayment, and AI business intelligence at closing. A live clock counts the time, the background moves dawn → noon → warm afternoon → dusk → night, and frames move in parallax. The section opens through a window that expands to full screen. |
| 8 | **Features ledger** | The capabilities from the current page as ledger rows, plus Books of account and AI business intelligence from the app. On desktop, hovering a row shows a cursor-following crop of the matching screen. |
| 9 | **Designed for local businesses** | English & Kinyarwanda, RWF, credit for regulars, same-day setup, then the 11 default categories light up word by word as you scroll. |
| 10 | **Pricing** *(sheet transition)* | Slides up over the previous section like a new page while that section sinks and dims. The billing toggle (Monthly / Quarterly / Annual −20%) is keyboard-accessible and renders from the pricing data. |
| 11 | **Close + footer** *(sheet transition)* | "Put your business on KONTABURE *today*." Request a demo / Get started. The giant KONTABURE wordmark rises letter by letter at the very end. |

**Compact layout (below 1024px wide or 620px tall):** a deliberately vertical version, not a scaled-down
desktop. The hero frame flattens as it scrolls in, chapters alternate text and screen, the day becomes a
vertical timeline with night cards, the sale demo stacks with a connector, and navigation moves into a
full-screen menu.

**Phones (640px and below): less to read, more to tap.** The page is about 11 screens long on an
iPhone 13 (it was 24). One idea per screen; detail moves behind a swipe or a tap:

- Hero: photo band, headline, one paragraph, and the two buttons side by side. The ticks and the small
  dashboard are left out (the next section shows the dashboard at a readable size).
- Dashboard: one readable crop of the KPI tiles, without the numbered list.
- How it works: the five chapters are **cards you swipe** (CSS scroll-snap, equal 5:4 phone crops, progress
  dots, keyboard-reachable strip). Each card keeps its screen, title and one sentence.
- One sale: the results are compact rows.
- A day in your shop: a **short timeline** (time, title, one line) with no screenshots, since the cards
  already show them.
- Features: **titles only; tap one to open it** (real buttons with `aria-expanded`, added by script on
  phones only, so desktop and no-JS keep the full ledger).
- Your business: four short lines, smaller category words; tighter spacing for pricing, close and footer.

**Reduced motion:** nothing is scroll-animated or hidden by animation. You get the compact layout (or the phone layout on phones) with every element shown at once.

## 5. Product screens

The six screens in `assets/screens/` are rebuilt on the **real app's shell**: the sidebar navigation,
header, KPI tiles, tabs and statement rows use the same Tailwind classes and icons as a saved copy of the
live app (Financial Reports page), compiled with Tailwind v3. The source is `tools/screens/app/screens.html`.

| File | Screen | Reference | Used for |
|---|---|---|---|
| `overview.webp` (1440×900) | Books of account › Dashboard | layout from a screenshot of the app | Hero, annotated dashboard |
| `finance.webp` (1440×1030) | Reports › Financial Reports, income statement | markup from the saved page | Chapter 04, 13:00 moment, "Sales & payments", "Books of account" |
| `ai.webp` (1440×1230) | AI business intelligence | layout from a screenshot of the app | Chapter 05, 21:00 moment, "AI business intelligence" |
| `stock.webp` (1440×1000) | Stock: stock in, stock count, running low, best sellers | approximation, no reference yet | Chapter 02, 07:00 and 10:00 moments, ledger |
| `products.webp` (1440×900) | Stock › Add products | approximation, no reference yet | Chapter 01, "Products in minutes" |
| `credit.webp` (1440×900) | Customers | approximation, no reference yet | Chapter 03, 16:00 and 18:30 moments, "Customers on credit" |

**Sample data only.** Every figure belongs to a demo shop ("Kimironko Shop"). No data from a live account
was used or committed (the repository is public). The main frame carries a "Sample data" tag and every
alt text says "(sample data)". Three details to know:

- The real app's sidebar footer shows a version line with the old product name. It is left out of the screens.
- Where the app prints its business type (the income statement subtitle and the AI summary), the screens
  say "business".
- The payment mix shows Cash and Mobile money as sample methods.

**Rebuild the screens** (needs Playwright; Tailwind 3.4.17 is fetched with npx, or set `TAILWIND_BIN`):

```bash
node tools/screens/app/build.cjs
```

The build writes `assets/screens/*.webp` (2x) and `tools/screens/app/crops.json`, the measured box of every
`[data-crop]` element. The crop table (`CROPS`) and camera table (`FOCUS`) at the top of
`assets/js/kontabure.js` use those boxes with about 12px of padding, as `[x, y, width, height]` in the
1440-wide image. Images taller than 900 are shown from the top inside the 16:10 product frame. The four
dashboard annotations are positioned with `--px` / `--py` on the `.pin` items in `index.html`.

**To make the approximations exact:** from a demo account, save the Stock, Customers and Add products pages
(and ideally AI and the Books of account dashboard) with "Save page as, complete", including the `_files`
folder. Their markup can then replace the approximations in `screens.html` the same way the Financial
Reports page did.

## 6. Technical notes

- **Dependencies:** GSAP 3.15 + ScrollTrigger (free "standard no-charge" licence), vendored. Nothing else.
  No build step.
- **Pinning uses CSS `position: sticky`** for the two long sequences (story and day). ScrollTrigger only
  *scrubs* those timelines (`scrub: .6–.8`), so native scrolling is never hijacked and every sequence runs
  identically backwards. GSAP pins are used only for the two short "sheet" transitions.
- **Responsive modes** use `gsap.matchMedia()` (cinema / compact / reduced). An inline head script picks
  the layout class before first paint, so there is no layout flash. Crossing a breakpoint reverts and
  rebuilds the animations.
- **Transforms and opacity only** in scrubbed animations. The product frame is sized once to its "read" pose
  and moved with transforms, so there is no layout thrash. Image dimensions are declared, so there is no layout shift.
- **Accessibility:** skip link, semantic landmarks, real text throughout (headings are split into words
  visually only), `aria-current` on nav and step rail, a keyboard radiogroup for billing, a native `<dialog>`
  with a focus trap and Esc, a focus-trapped mobile menu, and visible focus rings. Annotations duplicated
  as an ordered list for screen readers.
- **Fail-safes:** with no JavaScript or no GSAP, the page is a complete static page. A 3-second safety net
  un-hides content if scripts fail to load.

## 7. Decisions that need your confirmation

1. **Contact email.** The previous page's contact address used the old brand domain. It was replaced with
   `support@kontabure.africa`, set once as `contactEmail` in `assets/js/kontabure.js`. **Please confirm
   that inbox exists before launch.**
2. **Book a demo / Talk to sales.** The old page's demo buttons depended on scripts that were not
   included in the saved file, and no demo-booking endpoint was provided. Rather than inventing one, the buttons open a short
   form that composes an email to the contact address (plus a copy-address fallback). If you have a booking
   endpoint, wire it into the dialog's submit handler.
3. **Removed dead links.** Social icons and Company/Legal links on the old page all pointed to `#`, and
   footer anchors pointed to sections that did not exist. Those were dropped. All remaining links work:
   `/login` (unchanged journeys, including Help Center / Documentation / Training) and the section anchors
   `#features`, `#how-it-works`, `#shop`, `#pricing` (same anchors as before, so existing deep links still work).
4. **Brand palette.** The page's colours were moved onto the brand palette (see section 2). The layout,
   type and motion are unchanged; reverting is a matter of the tokens at the top of `kontabure.css`.
5. **Web app manifest.** `https://kontabure.africa/manifest.webmanifest` is linked as before. If it still
   carries the old app name or icons, update it on the server (the new icons are in `assets/brand/`).

## 8. QA performed

Latest pass (business-intelligence copy and rebuilt screens): desktop story frame by frame at 1440×900
(annotations, all five chapters, day panels, ledger hover previews), iPhone 13 and reduced-motion full-page
captures, interaction suite (22 checks) and brand intro suite, all passing with no console errors.


Automated with Playwright (Chromium), all with **zero console errors**:

- **Desktop** 1280×720, 1440×900 and 1920×1080: the full story sequence, chapters, day section, sheets and
  footer, checked frame by frame. Text and frame never overlap at any of these sizes.
- **Reverse scrolling:** scrolled deep into the chapters and back. Screens, camera, rail, annotations, wash
  and hero activity chips all restore correctly.
- **Interactions:** step-rail jumps, nav anchors (land at section top, active link and nav colour update),
  pricing toggle by mouse and arrow keys, dialog validation, the composed email (subject and body
  verified), Esc to close, the sale demo (credit sale updates stock, sales and the customer balance, then
  stock-out disables the button, then reset), and the mobile menu (focus moves in, link closes it and lands on target).
- **Link audit:** 29 links, none empty, `#` or old-brand. Every anchor target exists. Every button has a handler.
  No old brand name anywhere in the repository or rendered DOM.
- **Mobile** (iPhone 13), **tablet** (820×1180) and **reduced motion** (desktop and mobile): full-page
  captures, no horizontal overflow, all content visible.
- Opens correctly from `file://` and over http.
- **Brand intro:** playback recorded as video from navigation to fully revealed page on desktop and
  iPhone 13 and checked frame by frame (hand-off starts at about 3.2 s, page fully revealed by 4.5 s).
  Checked: Skip (page ready in under a second, focus lands on the nav logo), the first Tab stop is Skip,
  Enter skips, mouse wheel skips and the page then scrolls, no replay in the same session or on reload,
  no intro on a deep link, `?intro` replays, no intro with reduced motion, and with every script blocked
  the intro still clears itself and scrolling works.

Not covered: real-device Safari/iOS, Firefox, and frame-rate profiling on low-end Android hardware. These
are worth a pass before launch.
