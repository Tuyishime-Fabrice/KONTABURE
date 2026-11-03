# KONTABURE: landing page redesign

A complete, working HTML prototype of the new public landing page for **KONTABURE for Boutiques**.
It has scroll-driven storytelling on desktop, a separately designed touch layout, and a fully static
version for people who prefer reduced motion.

```
index.html                 the page
assets/css/kontabure.css   all styles (tokens at the top)
assets/js/kontabure.js     interactions + scroll choreography (config at the top)
assets/vendor/             GSAP 3.15 + ScrollTrigger (vendored, no CDN needed)
assets/fonts/              Poppins 300–700 (self-hosted, OFL); Arial is a system font
assets/img/                hero photograph (1672px and 960px)
assets/screens/            product screens used in every frame (see "Screenshots" below)
tools/                     source + script that generated the sample screens
```

**To view it:** open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`)
and visit `http://localhost:8000`. It works offline. The only external URLs are the existing
`https://kontabure.africa/login` links and the favicon/manifest.

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

The existing headline, *"Run your boutique without the notebook"*, is the brand's best idea, so the
identity is built around it.

- **Motif:** faint ruled ledger lines and an amber "margin rule" (the vertical red line of an exercise
  book) recur from the hero to the footer. The hero crosses out the word *notebook* with a drawn amber stroke.
  The placeholder logo mark is a ledger page with the same amber margin line.
- **Colour as time of day:** the page starts at **ink** (dusk, closing the shop), washes to **paper** (day)
  for the product story, runs through an actual day in the horizontal section, and returns to **ink**
  (night) for features, pricing and the close. The existing dark navy + blue + warm-amber palette is kept,
  but given a job: **blue = the product**, **amber = action and money**.
- **Type:** **Poppins** is the main typeface (headlines, labels, navigation, buttons, figures) and **Arial**
  the second (running text). Emphasis inside headlines uses Poppins Light in the product blue, not italics.
- **Photography:** the hero is a boutique counter at dusk with the Kigali skyline beyond, under a layered
  dark grade with a faint navy tint, so it sets the scene without competing with the product.
- **Restraint:** one hero glow, no decorative blobs, no grid of identical rounded cards. Features are a
  typographic ledger, local strengths a two-column manifesto, categories a lit word wall.

## 3. The scroll experience, section by section

| # | Section | What happens |
|---|---|---|
| 1 | **Hero** | Full-bleed photograph under a dark grade, with the headline anchored bottom-left so the cashier and skyline stay visible. Word-mask reveal, a strike drawn across *notebook*, two activity notifications floating in the scene, and the dashboard's top edge peeking up from the counter. |
| 2 | **Signature transition** *(pinned)* | Scrolling lifts and flattens the dashboard and expands it to near full screen. The photo drifts and slowly zooms (parallax) while an ink layer deepens over it, so the interface takes focus. The notifications fly into the dashboard, then the photo dissolves as the page washes from ink to paper. |
| 3 | **Read the dashboard** *(pinned)* | "One screen. *Your whole shop.*" Four numbered annotations appear one by one: Sales today, Owed to you, This week, Running low. This answers "what does the dashboard tell me?" |
| 4 | **One connected system** *(pinned)* | The frame slides right and turns in 3D as "Your entire boutique. *One connected system.*" rises on the left. |
| 5 | **How it works: five chapters** *(pinned frame, scrolling text)* | Set up → Inventory → Sales → Credit → Understand. Each chapter swaps the real screen with a clip-path wipe (direction-aware on reverse scroll) and **moves a camera** to the relevant part of the UI. A chapter-specific callout chip and a clickable step rail update with it. |
| 6 | **One sale, everywhere** | Interactive: choose Cash / Mobile money / On credit and press *Record sale*. Pulses travel to Stock (6 → 5, running low), Sales today (+RWF 1,500) and Payments or the customer's credit balance. Stock eventually runs out; *Reset* restores it. |
| 7 | **A day in your shop** *(horizontal)* | Vertical scroll drives a horizontal day from 07:00 to 21:00: before opening, supplier delivery, lunchtime rush, credit, repayment, closing report. A live clock counts the time, the background moves dawn → noon → warm afternoon → dusk → night, and frames move in parallax. The section opens through a window that expands to full screen. |
| 8 | **Features ledger** | The eight capabilities from the current page as ledger rows. On desktop, hovering a row shows a cursor-following crop of the matching screen. |
| 9 | **Designed for local businesses** | English & Kinyarwanda, RWF, credit for regulars, same-day setup, then the 11 default categories light up word by word as you scroll. |
| 10 | **Pricing** *(sheet transition)* | Slides up over the previous section like a new page while that section sinks and dims. The billing toggle (Monthly / Quarterly / Annual −20%) is keyboard-accessible and renders from the pricing data. |
| 11 | **Close + footer** *(sheet transition)* | "Put your boutique on KONTABURE *today*." Request a demo / Get started. The giant KONTABURE wordmark rises letter by letter at the very end. |

**Compact layout (below 1024px wide or 620px tall):** a deliberately vertical version, not a scaled-down
desktop. On phones the photograph becomes a band above the copy (with parallax), and the hero frame flattens as it scrolls in. Each chapter carries its own **phone-specific crop**
(single cards that stay legible at 390px), the day becomes a vertical timeline with night cards, the
sale demo stacks with a connector, and navigation moves into a full-screen menu.

**Reduced motion:** nothing is scroll-animated or hidden. You get the compact layout with every element visible.

## 4. Product screens

**No dashboard screenshots were received with the brief** (only the existing page and the video). So the
prototype uses six **sample screens** (`assets/screens/*.webp`, 2880×1800) rendered from
`tools/screens/screens.html`. They use **only content that already appears on the current landing page**:
Kimironko shop, RWF 184,500 sales today, RWF 62,000 owed, Uwase M.'s RWF 5,000 repayment, the three
running-low items, 24 items stocked in, +12% this week, and the 11 default categories. Supporting rows are
clearly sample data. The main product frame carries a visible "Sample data" tag, every screenshot's alt
text says "(sample data)", and the interactive sale demo is labelled as an illustration.

The sample screens are layout stand-ins only: their sidebar and page structure do not match the real
app, whose navigation is Stock, Suppliers, Customers, Branches, Reports, Books of account, AI,
Users & Permissions and Company Profile. Replace them before launch.

**What to capture.** Use a demo account filled with realistic sample data, never a live customer's account
(the repository is public). Keep the browser window at about 1440×900, capture only the app (no browser bar
or tabs), and keep personal names out of frame.

| File | Screen to capture | Used for |
|---|---|---|
| `overview.webp` | Books of account › Dashboard | Hero, annotated dashboard, "Best sellers" preview |
| `products.webp` | Products / adding products from a template | Chapter 01 "Set up your shop" |
| `stock.webp` | Stock: a supplier delivery (stock in) and a stock count | Chapter 02, 10:00 moment, ledger previews |
| `sales.webp` | Sales with payment methods and cashiers | Chapter 03, 13:00 moment |
| `credit.webp` | Customers: balances, repayments, credit limits | Chapter 04, 16:00 and 18:30 moments |
| `reports.webp` | AI business intelligence | Chapter 05, 21:00 moment, "Reports with AI insights" |

**Replace them with real screenshots before launch:**

1. Save real screenshots over the files in `assets/screens/` with the same names
   (`overview`, `products`, `stock`, `sales`, `credit`, `reports`), 16:10, ideally 2880×1800.
2. Re-tune the crop and camera rectangles at the top of `assets/js/kontabure.js` (`CROPS`, `FOCUS`). They are
   `[x, y, width, height]` in 1440×900 space.
3. Re-position the four dashboard annotations (`--px` / `--py` on the `.pin` items in `index.html`).
4. Delete `tools/`.

All frames are real `<img>` elements cropped with CSS, so nothing is redrawn or faked once real screenshots
are in place.

## 5. Technical notes

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

## 6. Decisions that need your confirmation

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
4. **Logo.** The original logo file was not included. A placeholder ledger-page mark lives in one SVG symbol
   (`#logo-mark` in `index.html`). Swap in the real mark there.
5. **Web app manifest.** `https://kontabure.africa/manifest.webmanifest` is linked as before. If it still
   carries the old app name, update it on the server.

## 7. QA performed

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

Not covered: real-device Safari/iOS, Firefox, and frame-rate profiling on low-end Android hardware. These
are worth a pass before launch.
