/* =============================================================================
   KONTABURE — landing page interactions & scroll storytelling
   Dependencies: GSAP 3 + ScrollTrigger (vendored in /assets/vendor).
   Everything degrades: without JS or GSAP the page is a readable static page,
   and with prefers-reduced-motion nothing is scroll-animated.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- CONFIG */
  const CONFIG = {
    loginUrl: 'https://kontabure.africa/login',
    // TODO(before launch): confirm this inbox exists. The previous page used an
    // old-brand address; it was replaced to keep the old name off the page.
    contactEmail: 'support@kontabure.africa',
    // Pricing data, copied verbatim from the payload of the current live page.
    // Plans render from this object; add a plan here and it appears on the page.
    pricing: {
      trialDays: 30,
      plans: [{
        id: 'f546e273-8977-47b0-ae2a-abeae6111289',
        name: 'Enterprise',
        description: 'Custom pricing for large and multi-branch businesses.',
        isCustom: true,
        currency: 'RWF',
        basePriceMonthly: 0,
        includedBranches: 1,
        extraBranchPriceMonthly: 0,
        quarterlyDiscountPct: 10,
        annualDiscountPct: 20,
        features: []
      }]
    }
  };

  /* Product screens are 1440×900 images in /assets/screens.
     Crops are [x, y, width, height] in that 1440×900 space. If you replace the
     sample screens with real screenshots, re-tune these numbers.            */
  const CROPS = {
    'full':        [0, 0, 1440, 900],
    'ov-top':      [248, 76, 1176, 491],
    'ov-kpis':     [248, 76, 592, 157],
    'ov-low':      [987, 225, 437, 342],
    'ov-best':     [832, 559, 592, 315],
    'pr-template': [500, 76, 924, 165],
    'pr-bulk':     [500, 233, 924, 611],
    'pr-bulk-sm':  [500, 233, 540, 400],
    'st-in':       [248, 76, 696, 573],
    'st-in-sm':    [248, 76, 520, 470],
    'st-count':    [936, 76, 488, 267],
    'sa-pay':      [637, 76, 397, 175],
    'sa-table':    [248, 243, 761, 446],
    'sa-receipt':  [1001, 243, 423, 446],
    'cr-table':    [248, 225, 747, 537],
    'cr-table-sm': [248, 225, 480, 420],
    'cr-repay':    [987, 225, 437, 289],
    're-ai':       [963, 216, 461, 354]
  };
  /* "Camera" framing for the pinned product frame (16:10 regions). */
  const FOCUS = {
    overview: [0, 0, 1440, 900],
    products: [470, 66, 970, 606],
    stock:    [240, 66, 1000, 625],
    sales:    [244, 66, 1190, 744],
    credit:   [244, 66, 1190, 744],
    reports:  [244, 66, 1190, 744]
  };
  /* One floating callout per chapter (sample data, from the product screens). */
  const STEPS = [
    { shot: 'products', icon: 'i-layers',  tone: 'blue',  title: 'Up to 300 items',          sub: 'added in one go' },
    { shot: 'stock',    icon: 'i-truck',   tone: 'blue',  title: 'Stock in recorded',        sub: '24 items from supplier' },
    { shot: 'sales',    icon: 'i-receipt', tone: 'amber', title: 'Sale #1042 · RWF 1,900',   sub: 'Mobile money · Aline' },
    { shot: 'credit',   icon: 'i-repay',   tone: 'green', title: '+RWF 5,000 repaid',        sub: 'Credit · Uwase M.' },
    { shot: 'reports',  icon: 'i-spark',   tone: 'blue',  title: 'AI insight',               sub: 'Sales up 12% on last week' }
  ];

  /* ---------------------------------------------------------------- helpers */
  const html = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const mq = (q) => window.matchMedia(q);
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  const reduceMQ = mq('(prefers-reduced-motion: reduce)');
  const smallMQ = mq('(max-width: 600px)');
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  window.__kontabureReady = true;

  /* ---------------------------------------------------------------- crops */
  function applyCrops() {
    $$('.shot[data-crop]').forEach((el) => {
      const key = (smallMQ.matches && el.dataset.cropSm) || el.dataset.crop;
      const r = CROPS[key];
      if (!r) return;
      el.style.setProperty('--cx', r[0]);
      el.style.setProperty('--cy', r[1]);
      el.style.setProperty('--cw', r[2]);
      el.style.setProperty('--ch', r[3]);
    });
  }
  applyCrops();
  smallMQ.addEventListener('change', () => { applyCrops(); if (hasGSAP) ScrollTrigger.refresh(); });

  /* ---------------------------------------------------------------- contact links */
  $$('[data-contact-link]').forEach((a) => { a.href = 'mailto:' + CONFIG.contactEmail; });
  $$('[data-contact-text]').forEach((a) => { a.textContent = CONFIG.contactEmail; });

  /* ---------------------------------------------------------------- word splitting (for masked reveals) */
  function splitWords(el) {
    if (el.classList.contains('is-split')) return;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          if (!child.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && child.namespaceURI !== 'http://www.w3.org/2000/svg') {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add('is-split');
  }

  /* ---------------------------------------------------------------- navigation */
  const nav = $('.nav');
  const progressBar = $('.progress__bar');
  const navLinksWrap = $('.nav__links');
  const navLinks = $$('[data-nav-link]');
  const navTargets = navLinks.map((a) => document.getElementById(a.dataset.navLink));
  let ticking = false;

  function setIndicator(link) {
    navLinksWrap.classList.toggle('has-active', !!link);
    if (!link) return;
    navLinksWrap.style.setProperty('--ix', link.offsetLeft + 'px');
    navLinksWrap.style.setProperty('--iw', link.offsetWidth + 'px');
  }
  function onScrollFrame() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    nav.classList.toggle('is-scrolled', y > 24);

    // Nav colour follows whatever section is underneath it.
    const stack = document.elementsFromPoint(window.innerWidth / 2, 34);
    for (const el of stack) {
      if (nav.contains(el)) continue;
      const s = el.closest('[data-nav]');
      if (s) { nav.dataset.theme = s.dataset.nav === 'light' ? 'light' : 'dark'; break; }
    }

    // Active section link.
    const mid = window.innerHeight * 0.45;
    let active = null;
    navTargets.forEach((t, i) => {
      if (!t) return;
      const r = t.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) active = navLinks[i];
    });
    navLinks.forEach((a) => { a.classList.toggle('is-active', a === active); if (a === active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    setIndicator(active);
  }
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); } };
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  onScrollFrame();

  /* Mobile menu */
  const menuBtn = $('.nav__menu');
  const menu = $('#mobile-menu');
  let menuTimer;
  function focusables() { return [menuBtn, ...$$('a, button', menu)]; }
  function onMenuKey(e) {
    if (e.key === 'Escape') { closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(); const first = f[0]; const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openMenu() {
    clearTimeout(menuTimer);
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    html.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    $('.sr-only', menuBtn).textContent = 'Close menu';
    document.addEventListener('keydown', onMenuKey);
    setTimeout(() => { const a = $('a', menu); if (a) a.focus({ preventScroll: true }); }, 80);
  }
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    html.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    $('.sr-only', menuBtn).textContent = 'Menu';
    document.removeEventListener('keydown', onMenuKey);
    menuTimer = setTimeout(() => { menu.hidden = true; }, reduceMQ.matches ? 0 : 700);
    if (returnFocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', () => (menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu(true) : openMenu()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a, [data-demo]')) closeMenu(false); });
  mq('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches && html.classList.contains('menu-open')) closeMenu(false); });

  /* ---------------------------------------------------------------- demo / sales dialog */
  const dialog = $('#demo-dialog');
  const DIALOG_COPY = {
    demo: { eyebrow: 'Book a demo', title: 'See KONTABURE in your shop', lead: "Tell us a little about your shop and we'll walk you through it.", subject: 'KONTABURE demo request' },
    sales: { eyebrow: 'Talk to sales', title: 'Pricing for your business', lead: "Tell us about your branches and volume, and we'll get back to you with pricing tailored to your business.", subject: 'KONTABURE Enterprise pricing' }
  };
  let dialogKind = 'demo';
  function mailto(subject, body) { return `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}${body ? '&body=' + encodeURIComponent(body) : ''}`; }
  function openDialog(kind) {
    dialogKind = DIALOG_COPY[kind] ? kind : 'demo';
    const c = DIALOG_COPY[dialogKind];
    if (!dialog || typeof dialog.showModal !== 'function') { window.location.href = mailto(c.subject); return; }
    $('[data-dialog-eyebrow]', dialog).textContent = c.eyebrow;
    $('[data-dialog-title]', dialog).textContent = c.title;
    $('[data-dialog-lead]', dialog).textContent = c.lead;
    $('[data-dialog-error]', dialog).hidden = true;
    $('[data-dialog-status]', dialog).hidden = true;
    $$('input', dialog).forEach((i) => i.removeAttribute('aria-invalid'));
    dialog.showModal();
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-demo]');
    if (!t) return;
    e.preventDefault();
    openDialog(t.dataset.demo);
  });
  if (dialog) {
    const form = $('form', dialog);
    form.addEventListener('submit', (e) => {
      const submitter = e.submitter;
      if (submitter && submitter.value === 'cancel') return; // native close
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const nameEl = form.elements.name, phoneEl = form.elements.phone;
      nameEl.setAttribute('aria-invalid', String(!name));
      phoneEl.setAttribute('aria-invalid', String(!phone));
      if (!name || !phone) {
        $('[data-dialog-error]', dialog).hidden = false;
        (!name ? nameEl : phoneEl).focus();
        return;
      }
      $('[data-dialog-error]', dialog).hidden = true;
      const c = DIALOG_COPY[dialogKind];
      const body = [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Shop: ${(data.get('shop') || '').toString().trim() || '—'}`,
        `Preferred language: ${data.get('lang') || 'English'}`,
        '',
        (data.get('message') || '').toString().trim()
      ].join('\n');
      // Mail links can be blocked (e.g. inside embedded previews), so never claim it was sent.
      try { window.location.href = mailto(c.subject, body); } catch (_) { /* fall back to the address shown below */ }
      $('[data-dialog-status]', dialog).hidden = false;
    });
    $('[data-copy-email]', dialog).addEventListener('click', async (e) => {
      const label = $('span', e.currentTarget);
      try { await navigator.clipboard.writeText(CONFIG.contactEmail); label.textContent = 'Copied'; }
      catch (_) { label.textContent = 'Select & copy'; }
      setTimeout(() => { label.textContent = 'Copy'; }, 2000);
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close('cancel'); });
  }

  /* ---------------------------------------------------------------- pricing (data-driven) */
  const P = CONFIG.pricing;
  const plansEl = $('[data-plans]');
  const periodGroup = $('.period__group');
  const periodBtns = $$('[data-period]');
  const periodHint = $('[data-period-hint]');
  const maxPct = (k) => Math.max(0, ...P.plans.map((p) => p[k] || 0));
  let period = 'monthly';

  function planHTML(p) {
    const months = period === 'quarterly' ? 3 : period === 'annual' ? 12 : 1;
    const pct = period === 'quarterly' ? p.quarterlyDiscountPct : period === 'annual' ? p.annualDiscountPct : 0;
    let price, sub;
    if (p.isCustom) {
      price = 'Custom';
      sub = 'Tailored to your branches and volume.';
    } else {
      const perMonth = p.basePriceMonthly * (1 - (pct || 0) / 100);
      price = `${p.currency} ${fmt(perMonth)}<small>/ month</small>`;
      sub = months === 1 ? 'Billed monthly' : `Billed ${p.currency} ${fmt(perMonth * months)} every ${months === 3 ? '3 months' : 'year'}`;
    }
    const branches = `${p.includedBranches} branch${p.includedBranches === 1 ? '' : 'es'} included, ` +
      (p.extraBranchPriceMonthly > 0 ? `extra branches ${p.currency} ${fmt(p.extraBranchPriceMonthly)} / month each` : 'extra branches free');
    const features = (p.features || []).length ? `<ul class="plan__features">${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>` : '';
    const cta = p.isCustom
      ? `<button class="btn btn--primary btn--block" type="button" data-demo="sales"><svg class="btn__icon" aria-hidden="true"><use href="#i-cal"/></svg><span>Talk to sales</span></button>`
      : `<a class="btn btn--primary btn--block" href="${CONFIG.loginUrl}"><span>Start ${P.trialDays}-day free trial</span><svg class="btn__icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>`;
    return `<article class="plan" data-plan="${p.id}">
      <div class="plan__head"><h3>${p.name}</h3>${p.isCustom ? '<svg class="plan__crown" role="img" aria-label="Enterprise"><use href="#i-crown"/></svg>' : ''}</div>
      <p class="plan__desc">${p.description}</p>
      <p class="plan__price" data-price>${price}</p>
      <p class="plan__sub">${sub}</p>
      <p class="plan__note"><svg aria-hidden="true"><use href="#i-building"/></svg><span>${branches}</span></p>
      ${features}${cta}
      <p class="plan__foot">Already a customer? <a href="${CONFIG.loginUrl}">Log in</a></p>
    </article>`;
  }
  function renderPricing(animate) {
    plansEl.innerHTML = P.plans.map(planHTML).join('');
    const q = maxPct('quarterlyDiscountPct'), a = maxPct('annualDiscountPct');
    periodHint.textContent = period === 'monthly' ? 'Billed monthly'
      : period === 'quarterly' ? (q ? `Pay every 3 months and save ${q}%` : 'Billed every 3 months')
      : (a ? `Pay once a year and save ${a}%` : 'Billed once a year');
    if (animate && hasGSAP && !reduceMQ.matches) {
      gsap.fromTo($$('[data-price], .plan__sub', plansEl), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out', stagger: .05 });
      gsap.fromTo(periodHint, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'expo.out' });
    }
  }
  function moveThumb() {
    const b = periodBtns.find((x) => x.getAttribute('aria-checked') === 'true');
    if (!b) return;
    periodGroup.style.setProperty('--tx', (b.offsetLeft - 4) + 'px');
    periodGroup.style.setProperty('--tw', b.offsetWidth + 'px');
    $('.period__thumb', periodGroup).style.left = '4px';
  }
  function setPeriod(p, focus) {
    period = p;
    periodBtns.forEach((b) => {
      const on = b.dataset.period === p;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    moveThumb();
    renderPricing(true);
  }
  $('[data-trial-days]').textContent = P.trialDays;
  const annualSave = $('[data-annual-save]');
  const aPct = maxPct('annualDiscountPct');
  if (aPct) annualSave.textContent = `−${aPct}%`; else annualSave.remove();
  periodBtns.forEach((b, i) => {
    b.addEventListener('click', () => setPeriod(b.dataset.period));
    b.addEventListener('keydown', (e) => {
      const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      setPeriod(periodBtns[(i + dir + periodBtns.length) % periodBtns.length].dataset.period, true);
    });
  });
  renderPricing(false);
  moveThumb();
  window.addEventListener('resize', moveThumb);
  if (document.fonts) document.fonts.ready.then(moveThumb);

  /* ---------------------------------------------------------------- "one sale, everywhere" demo */
  const ripple = $('.ripple__board');
  if (ripple) {
    const PRICE = 1500;
    const START = { stock: 6, sales: 184500, count: 38, cash: 96000, momo: 71500, owed: 62000, uwase: 8500 };
    let S = { ...START };
    const v = (k) => $(`[data-v="${k}"]`, ripple);
    const goBtn = $('[data-ripple-go]', ripple);
    const customer = $('[data-customer]', ripple);
    const flag = $('[data-flag]', ripple);
    const wires = $$('.ripple__wires path', ripple);
    const nodes = ['stock', 'sales', 'money'].map((k) => $(`[data-node="${k}"]`, ripple));
    const method = () => ($('input[name="pay"]:checked', ripple) || {}).value || 'cash';

    function moneyView() {
      const m = method();
      customer.hidden = m !== 'credit';
      if (m === 'credit') return { k: 'Owed to you', v: S.owed, s: `Uwase M. owes RWF ${fmt(S.uwase)}` };
      if (m === 'momo') return { k: 'Paid by mobile money today', v: S.momo, s: 'Payments by method' };
      return { k: 'Paid in cash today', v: S.cash, s: 'Payments by method' };
    }
    function paint() {
      v('stock').textContent = S.stock;
      v('sales').textContent = fmt(S.sales);
      v('count').textContent = S.count;
      const mv = moneyView();
      v('money-k').textContent = mv.k;
      v('money').textContent = fmt(mv.v);
      v('money-s').textContent = mv.s;
      flag.textContent = S.stock === 0 ? 'Out of stock' : 'Running low';
      goBtn.disabled = S.stock === 0;
      $('span', goBtn).textContent = S.stock === 0 ? 'Out of stock' : 'Record sale';
    }
    function layoutWires() {
      const svg = $('.ripple__wires', ripple);
      if (getComputedStyle(svg).display === 'none') return;
      const b = ripple.getBoundingClientRect();
      const sale = $('.ripple__sale', ripple).getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
      const x1 = sale.right - b.left, y1 = sale.top - b.top + sale.height / 2;
      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect();
        const x2 = r.left - b.left, y2 = r.top - b.top + r.height / 2;
        const mx = (x1 + x2) / 2;
        wires[i].setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
      });
    }
    function countTo(el, from, to) {
      if (!hasGSAP || reduceMQ.matches) { el.textContent = fmt(to); return; }
      const o = { n: from };
      gsap.to(o, { n: to, duration: .9, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.n); } });
    }
    function pulse(i, delay) {
      const path = wires[i], node = nodes[i];
      const done = () => { node.classList.add('is-hit'); setTimeout(() => node.classList.remove('is-hit'), 900); };
      if (!hasGSAP || reduceMQ.matches || !path.getTotalLength || getComputedStyle(path.parentNode).display === 'none') { setTimeout(done, delay * 1000); return; }
      const len = path.getTotalLength();
      path.classList.add('is-live');
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: .55, ease: 'power2.inOut', delay,
        onComplete: () => { done(); gsap.to(path, { opacity: .35, duration: .5, delay: .4, onComplete: () => { path.classList.remove('is-live'); gsap.set(path, { clearProps: 'all' }); } }); }
      });
    }
    function record() {
      if (S.stock === 0) return;
      const m = method();
      const prev = { ...S };
      S.stock -= 1; S.sales += PRICE; S.count += 1;
      if (m === 'credit') { S.owed += PRICE; S.uwase += PRICE; } else if (m === 'momo') S.momo += PRICE; else S.cash += PRICE;
      layoutWires();
      pulse(0, 0); pulse(1, .12); pulse(2, .24);
      setTimeout(() => {
        v('stock').textContent = S.stock;
        flag.textContent = S.stock === 0 ? 'Out of stock' : 'Running low';
      }, 450);
      setTimeout(() => { countTo(v('sales'), prev.sales, S.sales); v('count').textContent = S.count; }, 570);
      setTimeout(() => {
        const mv = moneyView();
        const before = m === 'credit' ? prev.owed : m === 'momo' ? prev.momo : prev.cash;
        countTo(v('money'), before, mv.v);
        v('money-s').textContent = mv.s;
        goBtn.disabled = S.stock === 0;
        $('span', goBtn).textContent = S.stock === 0 ? 'Out of stock' : 'Record sale';
      }, 690);
    }
    goBtn.addEventListener('click', record);
    $('[data-ripple-reset]', ripple).addEventListener('click', () => { S = { ...START }; paint(); });
    $$('input[name="pay"]', ripple).forEach((r) => r.addEventListener('change', paint));
    paint();
    layoutWires();
    window.addEventListener('resize', layoutWires);
    if (document.fonts) document.fonts.ready.then(layoutWires);
  }

  /* ---------------------------------------------------------------- feature ledger preview (desktop pointer) */
  const peek = $('.peek');
  const peekShot = $('.peek__shot');
  const peekImg = $('img', peekShot);
  const ledger = $('.ledger');
  const peekMQ = mq('(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  if (peek && ledger) {
    let mx = 0, my = 0, px = 0, py = 0, raf = 0, on = false;
    const loop = () => {
      px += (mx - px) * 0.14; py += (my - py) * 0.14;
      peek.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      raf = on || Math.abs(mx - px) > .5 ? requestAnimationFrame(loop) : 0;
    };
    const place = (e) => {
      const w = peek.offsetWidth, h = peek.offsetHeight || 260;
      mx = Math.min(window.innerWidth - w - 16, e.clientX + 28);
      my = Math.max(16, Math.min(window.innerHeight - h - 16, e.clientY - h / 2));
      if (!raf) raf = requestAnimationFrame(loop);
    };
    ledger.addEventListener('pointermove', (e) => { if (peekMQ.matches) place(e); });
    $$('.ledger__row', ledger).forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        if (!peekMQ.matches) return;
        peek.classList.add('is-ready');
        const key = row.dataset.preview;
        const isLang = key === 'lang';
        peek.classList.toggle('is-lang', isLang);
        if (!isLang) {
          const src = `assets/screens/${row.dataset.shot}.webp`;
          if (!peekImg.src.endsWith(src)) peekImg.src = src;
          peekShot.dataset.crop = key;
          const r = CROPS[key];
          peekShot.style.setProperty('--cx', r[0]); peekShot.style.setProperty('--cy', r[1]);
          peekShot.style.setProperty('--cw', r[2]); peekShot.style.setProperty('--ch', r[3]);
        }
        if (!on) { place(e); px = mx; py = my; }
        on = true;
        peek.style.visibility = 'visible';
        requestAnimationFrame(() => peek.classList.add('is-on'));
      });
    });
    ledger.addEventListener('pointerleave', () => {
      on = false;
      peek.classList.remove('is-on');
      setTimeout(() => { if (!on) peek.style.visibility = 'hidden'; }, 350);
    });
  }

  /* ================================================================= GSAP */
  if (!hasGSAP) {
    html.classList.remove('cinema');
    html.classList.add('reveal-all');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Split headings once (visual only; text stays real and selectable).
  if (!reduceMQ.matches) $$('[data-split]').forEach(splitWords);

  const mm = gsap.matchMedia();
  mm.add({
    cinema: '(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)',
    compact: '((max-width: 1023px) or (max-height: 619px)) and (prefers-reduced-motion: no-preference)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, (ctx) => {
    const { cinema, reduce } = ctx.conditions;
    html.classList.toggle('cinema', !!cinema);
    html.classList.toggle('reduced', !!reduce);
    if (reduce) return undefined;

    const cleanups = [];
    // The hero reveal waits for the brand intro's hand-off when the intro is playing.
    afterBrandIntro(ctx.add('heroIntro', () => heroIntro(cinema)));
    reveals();
    headings();
    ledgerReveal();
    shelfWords();
    wordmark();
    if (cinema) {
      cleanups.push(story(ctx));
      cleanups.push(day());
      sheets();
    } else {
      compactHero();
    }
    ScrollTrigger.sort();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cleanups.forEach((fn) => fn && fn());
  });
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* ---------------------------------------------------------------- brand intro hand-off */
  function afterBrandIntro(fn) {
    if (!html.classList.contains('intro-on') || window.__kIntroRevealed) { fn(); return; }
    let done = false;
    const go = () => { if (!done) { done = true; fn(); } };
    document.addEventListener('kontabure:intro-reveal', go, { once: true });
    setTimeout(go, 7000);
  }

  /* ---------------------------------------------------------------- hero intro (on load) */
  function heroIntro(cinema) {
    const words = $$('.hero__title .wi');
    const rv = $$('.hero [data-rv]');
    const strike = $('.strike__line path');
    const tl = gsap.timeline({ delay: .15 });
    if (words.length) tl.fromTo(words, { yPercent: 112 }, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: .05 }, 0);
    tl.to(rv, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .08 }, .35);
    if (strike && strike.getTotalLength) {
      const len = strike.getTotalLength() || 300;
      tl.fromTo(strike, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, 1.05);
    }
    if (cinema) {
      tl.fromTo('.stage__photo', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
      tl.fromTo('.device', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, .7);
      tl.fromTo('.float .chip', { opacity: 0, y: 16, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .9, ease: 'back.out(1.6)', stagger: .4 }, 1.4);
    } else {
      tl.fromTo('.hero__photo', { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
      tl.fromTo('.hero__frame', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out' }, .4);
    }
  }

  /* ---------------------------------------------------------------- generic reveals */
  function reveals() {
    const items = $$('[data-rv]').filter((el) => !el.closest('.hero'));
    const fade = items.filter((el) => el.dataset.rv !== 'clip');
    const clip = items.filter((el) => el.dataset.rv === 'clip');
    ScrollTrigger.batch(fade, {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .08, overwrite: true })
    });
    clip.forEach((el) => {
      gsap.to(el, { clipPath: 'inset(0% 0 0 0 round 16px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
  }
  function headings() {
    $$('[data-split]').forEach((h) => {
      if (h.closest('.hero')) return;
      const words = $$('.wi', h);
      if (!words.length) return;
      gsap.fromTo(words, { yPercent: 112 }, {
        yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: .035,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true }
      });
    });
  }
  function ledgerReveal() {
    const rows = $$('.ledger__row');
    gsap.set(rows, { opacity: 0, y: 30 });
    ScrollTrigger.batch(rows, {
      start: 'top 90%', once: true,
      onEnter: (batch) => {
        batch.forEach((r) => r.classList.add('is-in'));
        gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .07, overwrite: true, onComplete: () => gsap.set(batch, { clearProps: 'opacity,transform' }) });
      }
    });
  }
  function shelfWords() {
    const words = $$('.shelf__words li');
    if (!words.length) return;
    ScrollTrigger.create({
      trigger: '.shelf__words', start: 'top 82%', end: 'bottom 62%',
      onUpdate: (self) => {
        const n = Math.ceil(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle('is-lit', i < n));
      },
      onLeave: () => words.forEach((w) => w.classList.add('is-lit'))
    });
  }
  function wordmark() {
    const el = $('.wordmark');
    if (!el) return;
    if (!el.classList.contains('is-split')) {
      el.innerHTML = el.textContent.trim().split('').map((c) => `<span class="ch">${c}</span>`).join('');
      el.classList.add('is-split');
    }
    gsap.fromTo($$('.ch', el), { yPercent: 105 }, {
      yPercent: 0, ease: 'none', stagger: .06,
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: .6 }
    });
  }

  /* ---------------------------------------------------------------- compact hero (tablet / phone) */
  function compactHero() {
    gsap.fromTo('.hero__frame', { rotationX: 18, transformPerspective: 1200, scale: .96 }, {
      rotationX: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.hero__frame', start: 'top 98%', end: 'top 30%', scrub: .5 }
    });
    // Photo parallax: the background drifts slower than the copy.
    gsap.fromTo('.hero__photo img', { yPercent: 0 }, {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------------------------------------------------------------- THE STORY (cinema) */
  function story(ctx) {
    const storyEl = $('.story');
    const stage = $('.stage');
    const device = $('.device');
    const cam = $('.device__cam');
    const shotEls = $$('.device__shot');
    const shotByKey = Object.fromEntries(shotEls.map((el) => [el.dataset.shot, el]));
    const pins = $$('.pin');
    const floats = $$('.float');
    const photoInner = $('.stage__photo-inner');
    const photoImg = $('.stage__photo img');
    const dim = $('.stage__dim');
    const stepChip = $('.chip--step');
    const rail = $('.rail');
    const railBtns = $$('button', rail);
    const title = $('.stage__title');
    const glow = $('.stage__glow');
    const heroEls = $$('.hero__copy, .hero__ticks');
    const readBeat = $('.beat--read');
    const introBeat = $('.beat--intro');
    const chapters = $$('.chapter');

    /* Geometry for the three poses: hero (tilted, low), read (large, centred),
       park (right half). The device's base width is the "read" width.       */
    const G = {};
    function measure() {
      const vw = window.innerWidth, vh = window.innerHeight, chrome = 34;
      const readTop = title.offsetHeight ? (title.offsetTop + title.offsetHeight + 26) : vh * .24;
      const w = Math.min((vh - readTop - 30 - chrome) * 1.6, vw * .86, 1440);
      const h = w / 1.6 + chrome;
      const ticks = $('.hero__ticks');
      const ticksBottom = ticks ? docTop(ticks) - docTop(storyEl) + ticks.offsetHeight : vh * .5;
      const heroTop = Math.min(vh * .93, Math.max(vh * .84, ticksBottom + 30));
      const heroW = Math.min(vw * .84, 1260);
      G.heroS = heroW / w;
      G.heroY = heroTop + (h * G.heroS) / 2 - vh / 2;
      G.readY = readTop + h / 2 - vh / 2;
      const gutter = Math.min(64, Math.max(20, vw * .044));
      const content = Math.min(vw - gutter * 2, 1320);
      const right = Math.max(gutter, (vw - 1320) / 2);
      const parkW = Math.min(vw * .52, content * .6, 960);
      G.parkS = parkW / w;
      const parkCX = vw - right - parkW / 2;
      G.parkX = parkCX - vw / 2;
      G.parkY = -vh * .035;
      device.style.setProperty('--dev-w', w + 'px');
      const parkBottom = vh / 2 + G.parkY + (h * G.parkS) / 2;
      rail.style.setProperty('--rail-x', (parkCX - parkW / 2) + 'px');
      rail.style.setProperty('--rail-y', (parkBottom + 22) + 'px');
    }
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    gsap.set(cam, { transformOrigin: '0 0', scale: 1, xPercent: 0, yPercent: 0 });
    gsap.set(device, { xPercent: -50, yPercent: -50, transformPerspective: 1800, transformOrigin: '50% 50%' });

    /* Positions in "screen heights" of scroll, read from the layout. */
    const vh0 = window.innerHeight;
    const top0 = docTop(storyEl);
    const P_READ = (docTop(readBeat) - top0) / vh0;        // ≈ 1
    const P_INTRO = (docTop(introBeat) - top0) / vh0;      // ≈ 3.3
    const TOTAL = storyEl.offsetHeight / vh0 - 1;           // ≈ 8.9

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: storyEl, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = self.progress * TOTAL;
          storyEl.dataset.nav = t > P_READ - .2 ? 'light' : 'dark';
        }
      }
    });

    // A — the dashboard lifts off the counter and opens up
    tl.fromTo(device,
      { x: 0, y: () => G.heroY, scale: () => G.heroS, rotationX: 24, rotationY: 0 },
      { x: 0, y: () => G.readY, scale: 1, rotationX: 0, rotationY: 0, duration: P_READ - .05, ease: 'power1.inOut' }, 0);
    // The shop-floor activity flies into the dashboard as it rises.
    const toDash = (el, axis) => {
      const cx = el.offsetLeft + el.offsetWidth / 2, cy = el.offsetTop + el.offsetHeight / 2;
      return axis === 'x' ? (window.innerWidth / 2 - cx) * .6 : (window.innerHeight / 2 + G.readY - cy) * .6;
    };
    floats.forEach((f, i) => {
      tl.to(f, { x: () => toDash(f, 'x'), y: () => toDash(f, 'y'), scale: .7, autoAlpha: 0, duration: .44, ease: 'power2.in' }, .12 + i * .06);
    });
    // The photograph drifts, deepens and steps back so the dashboard takes focus.
    tl.fromTo(photoImg, { yPercent: 0, scale: 1 }, { yPercent: -5, scale: 1.1, duration: P_READ }, 0);
    tl.fromTo(dim, { opacity: 0 }, { opacity: .82, duration: P_READ - .4, ease: 'power1.in' }, .04);
    tl.to(heroEls, { autoAlpha: 0, y: -50, duration: .3 }, .03);
    tl.to(glow, { opacity: 0, duration: .7 }, .25);

    // B — dusk to day: ink washes to paper
    tl.fromTo(storyEl, { backgroundColor: '#06110E' }, { backgroundColor: '#F7F7F2', duration: .6 }, P_READ - .45);
    tl.fromTo(stage, { '--wash': 0 }, { '--wash': 1, duration: .6 }, P_READ - .45);
    tl.fromTo(photoInner, { opacity: 1 }, { opacity: 0, duration: .45 }, P_READ - .45);
    tl.fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .3 }, P_READ - .12);

    // C — read the dashboard: numbered annotations, one by one
    pins.forEach((p, i) => {
      tl.fromTo(p, { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .14, ease: 'back.out(2)' }, P_READ + .22 + i * .26);
    });
    tl.to(pins, { autoAlpha: 0, scale: .9, duration: .14, stagger: .02 }, P_INTRO - 1.08);
    tl.to(title, { autoAlpha: 0, y: -24, duration: .2 }, P_INTRO - 1.06);

    // D — park: the frame slides right, turning in space, as the story begins
    tl.to(device, { x: () => G.parkX, y: () => G.parkY, scale: () => G.parkS, rotationY: -9, rotationX: 3, duration: .62, ease: 'power2.inOut' }, P_INTRO - 1.0);
    tl.to(device, { rotationY: -4, rotationX: 1.5, duration: .33, ease: 'power1.out' }, P_INTRO - .38);
    tl.fromTo(rail, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .2 }, P_INTRO - .22);

    // E — recede as the next section arrives
    tl.to(device, { scale: () => G.parkS * .92, rotationY: 0, rotationX: 0, y: () => G.parkY - 30, duration: .5 }, TOTAL - .5);
    tl.to(rail, { autoAlpha: 0, duration: .2 }, TOTAL - .45);
    tl.set({}, {}, TOTAL);

    /* Chapters swap the screen and move the camera (time-based, both directions) */
    let current = -1;
    let activeShot = shotByKey.overview;
    const camVals = (r) => { const z = 1440 / r[2]; return { scale: z, xPercent: -z * r[0] / 1440 * 100, yPercent: -z * r[1] / 900 * 100 }; };

    const setStep = ctx.add('setStep', (i, dir) => {
      if (i === current) return;
      current = i;
      const key = i >= 0 ? STEPS[i].shot : 'overview';
      const next = shotByKey[key];
      if (next !== activeShot) {
        const prev = activeShot;
        activeShot = next;
        gsap.killTweensOf([next, prev]);
        shotEls.forEach((el) => { el.style.zIndex = el === next ? 3 : el === prev ? 2 : 1; });
        gsap.fromTo(next,
          { autoAlpha: 1, yPercent: 0, clipPath: dir < 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: .95, ease: 'expo.inOut',
            onComplete: () => shotEls.forEach((el) => { if (el !== activeShot) gsap.set(el, { autoAlpha: 0, yPercent: 0 }); }) });
        gsap.fromTo(prev, { yPercent: 0 }, { yPercent: dir < 0 ? 7 : -7, duration: .95, ease: 'expo.inOut' });
      }
      gsap.to(cam, { ...camVals(FOCUS[key]), duration: 1.15, ease: 'expo.inOut', overwrite: 'auto' });

      railBtns.forEach((b, k) => { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      const ab = railBtns[i];
      if (ab) { rail.style.setProperty('--rx', (ab.offsetLeft - 4) + 'px'); rail.style.setProperty('--rw', ab.offsetWidth + 'px'); $('.rail__fill', rail).style.left = '4px'; }
      $('.rail__fill', rail).style.opacity = ab ? 1 : 0;

      if (i < 0) { gsap.to(stepChip, { autoAlpha: 0, y: 10, duration: .3, overwrite: 'auto' }); return; }
      const s = STEPS[i];
      gsap.to(stepChip, {
        autoAlpha: 0, y: -10, duration: .18, overwrite: 'auto',
        onComplete: () => {
          stepChip.innerHTML = `<span class="chip__icon chip__icon--${s.tone}"><svg><use href="#${s.icon}"/></svg></span><span><b>${s.title}</b><small>${s.sub}</small></span>`;
          gsap.fromTo(stepChip, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .5, ease: 'back.out(1.6)' });
        }
      });
    });

    chapters.forEach((ch, i) => {
      ScrollTrigger.create({
        trigger: ch, start: 'top 58%', end: 'bottom 58%',
        onToggle: (self) => { if (self.isActive) setStep(i, self.direction); }
      });
    });
    ScrollTrigger.create({ trigger: chapters[0], start: 'top 58%', onLeaveBack: () => setStep(-1, -1) });

    const onRail = (e) => {
      const b = e.target.closest('button[data-goto]');
      if (!b) return;
      const ch = chapters[+b.dataset.goto];
      const y = ch.getBoundingClientRect().top + window.scrollY + ch.offsetHeight / 2 - window.innerHeight / 2;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    rail.addEventListener('click', onRail);

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      rail.removeEventListener('click', onRail);
      storyEl.dataset.nav = 'dark';
      shotEls.forEach((el) => { el.style.zIndex = ''; });
      device.style.removeProperty('--dev-w');
    };
  }

  /* ---------------------------------------------------------------- A DAY (cinema, horizontal) */
  function day() {
    const dayEl = $('.day');
    const stage = $('.day__stage');
    const track = $('.day__track');
    const moments = $$('.moment', track);
    const nowEl = $('.day__now');
    const lineEl = $('.day__line');
    const TONES = { dawn: '#E2ECE7', morning: '#F7F7F2', noon: '#F6EEDA', afternoon: '#EFD9AE', dusk: '#16302A', night: '#06110E' };
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const setHeight = () => dayEl.style.setProperty('--day-h', (dist() + window.innerHeight) + 'px');
    setHeight();
    ScrollTrigger.addEventListener('refreshInit', setHeight);

    // Key points along the track: [progress, colour, minutes]
    let keys = [];
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const buildKeys = () => {
      const d = dist() || 1;
      keys = moments.map((m) => {
        const c = (m.offsetLeft + m.offsetWidth * .32 - window.innerWidth * .5) / d;
        return [Math.max(0, Math.min(1, c)), TONES[m.dataset.tone], toMin(m.dataset.time)];
      });
      keys.unshift([0, TONES.dawn, keys[0][2]]);
    };
    buildKeys();
    ScrollTrigger.addEventListener('refresh', buildKeys);

    const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
    const update = (p) => {
      let a = keys[0], b = keys[keys.length - 1];
      for (let i = 0; i < keys.length - 1; i++) { if (p >= keys[i][0] && p <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; } }
      if (p >= keys[keys.length - 1][0]) a = b;
      const t = a === b ? 0 : (p - a[0]) / Math.max(.0001, b[0] - a[0]);
      const col = gsap.utils.interpolate(a[1], b[1], t);
      stage.style.backgroundColor = col;
      const rgb = col.match(/\d+(\.\d+)?/g);
      const L = rgb ? (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 : lum(a[1]);
      const dark = L < .45;
      stage.classList.toggle('is-dark', dark);
      dayEl.dataset.nav = dark ? 'dark' : 'light';
      const mins = Math.round((a[2] + (b[2] - a[2]) * t) / 5) * 5;
      nowEl.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      lineEl.style.setProperty('--p', p.toFixed(4));
    };

    const scroller = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: dayEl, start: 'top top', end: () => '+=' + dist(), scrub: .6, invalidateOnRefresh: true,
        onUpdate: (self) => update(self.progress), onRefresh: (self) => update(self.progress)
      }
    });
    update(0);

    // The section arrives through a window that opens to full screen.
    gsap.fromTo(stage, { clipPath: 'inset(9% 6% 9% 6% round 40px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: dayEl, start: 'top 92%', end: 'top top', scrub: .4 }
    });

    // Parallax depth inside the horizontal track.
    moments.forEach((m) => {
      const frame = $('.moment__frame', m);
      const time = $('.moment__time', m);
      gsap.fromTo(frame, { xPercent: 10 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: m, containerAnimation: scroller, start: 'left right', end: 'right left', scrub: true } });
      gsap.fromTo(time, { xPercent: -14 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: m, containerAnimation: scroller, start: 'left right', end: 'right left', scrub: true } });
    });

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', setHeight);
      ScrollTrigger.removeEventListener('refresh', buildKeys);
      dayEl.style.removeProperty('--day-h');
      stage.style.backgroundColor = '';
      stage.classList.remove('is-dark');
      dayEl.dataset.nav = 'light';
    };
  }

  /* ---------------------------------------------------------------- sheets: pages slide over pages (cinema) */
  function sheets() {
    $$('.sheet').forEach((sheet) => {
      const prev = sheet.previousElementSibling;
      if (!prev) return;
      let dim = $(':scope > .sheet-dim', prev);
      if (!dim) { dim = document.createElement('div'); dim.className = 'sheet-dim'; prev.appendChild(dim); }
      const inner = $(':scope > .container', prev) || prev.firstElementChild;
      ScrollTrigger.create({
        trigger: prev,
        start: () => (prev.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'),
        end: () => '+=' + Math.min(window.innerHeight, sheet.offsetHeight),
        pin: true, pinSpacing: false, invalidateOnRefresh: true
      });
      gsap.fromTo(dim, { opacity: 0 }, { opacity: .55, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top top', scrub: true } });
      if (inner) gsap.fromTo(inner, { scale: 1, yPercent: 0 }, { scale: .94, yPercent: -3, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top top', scrub: true } });
    });
  }
})();
