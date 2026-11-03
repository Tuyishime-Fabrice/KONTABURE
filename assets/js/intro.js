/* =============================================================================
   KONTABURE — brand intro: scene 4 (hand-off to the landing page)
   No dependencies (Web Animations API). Scenes 1-3 run in CSS (intro.css).
   The <head> script decides whether to show the intro (once per session,
   fresh visits only, never with reduced motion or a deep link).
   ========================================================================== */
(() => {
  'use strict';
  const html = document.documentElement;
  const intro = document.getElementById('brand-intro');
  if (!html.classList.contains('intro-on') || !intro) {
    if (intro) intro.remove();
    return;
  }

  const REVEAL_AT = 3050;      // ms into the intro when the hand-off starts
  const FLIGHT = 1050;         // logo → navigation
  const OPEN = 1150;           // scene opens onto the hero
  const logo = intro.querySelector('.brand-intro__logo');
  const bg = intro.querySelector('.brand-intro__bg');
  const skip = intro.querySelector('.brand-intro__skip');
  let revealed = false;
  let finished = false;

  // Align with the CSS timeline, which started at first paint.
  let elapsed = 0;
  try {
    const anims = intro.getAnimations ? intro.getAnimations({ subtree: true }) : [];
    const start = Math.min(...anims.map((a) => (a.startTime == null ? Infinity : a.startTime)));
    if (isFinite(start) && document.timeline) elapsed = Math.max(0, document.timeline.currentTime - start);
  } catch (_) { /* older browsers: assume we are at the start */ }
  const timer = setTimeout(() => reveal(false), Math.max(0, REVEAL_AT - elapsed));

  function finish() {
    if (finished) return;
    finished = true;
    html.classList.remove('intro-on');
    window.__kIntroDone = true;
    const hadFocus = intro.contains(document.activeElement);
    intro.remove();
    if (hadFocus) { const brand = document.querySelector('.nav .brand'); if (brand) brand.focus({ preventScroll: true }); }
    // scrollbars return once the intro is gone; let ScrollTrigger re-measure
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function reveal(fast) {
    if (revealed) return;
    revealed = true;
    clearTimeout(timer);
    removeListeners();
    if (fast) intro.classList.add('is-skipped');
    intro.classList.add('is-leaving');
    window.__kIntroRevealed = true;
    document.dispatchEvent(new CustomEvent('kontabure:intro-reveal'));

    const flight = fast ? 700 : FLIGHT;
    const open = fast ? 760 : OPEN;
    const target = document.querySelector('.nav .brand__logo');
    const from = logo.getBoundingClientRect();
    const to = target ? target.getBoundingClientRect() : null;
    const ease = 'cubic-bezier(.7, 0, .2, 1)';
    const anims = [];

    if (to && to.width && from.width && logo.animate) {
      const s = to.width / from.width;
      const dx = to.left - from.left;
      const dy = to.top - from.top;
      anims.push(logo.animate(
        [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }],
        { duration: flight, easing: ease, fill: 'forwards' }
      ).finished);
    }
    if (bg.animate) {
      anims.push(bg.animate([{ '--hole': '-20%' }, { '--hole': '125%' }], { duration: open, easing: 'cubic-bezier(.6, 0, .25, 1)', fill: 'forwards' }).finished);
      // where masks or @property are unsupported, the fade alone does the job
      anims.push(bg.animate([{ opacity: 1 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration: open, easing: 'ease-in', fill: 'forwards' }).finished);
    }
    Promise.all(anims).catch(() => {}).then(finish);
    setTimeout(finish, Math.max(flight, open) + 400); // never wait on a stalled animation
  }

  // Skip: the button, or any attempt to use the page.
  const onKey = (e) => { if (!['Tab', 'Shift', 'Alt', 'Control', 'Meta'].includes(e.key)) reveal(true); };
  const onAny = () => reveal(true);
  const onPointer = (e) => { if (!skip.contains(e.target)) reveal(true); };
  function removeListeners() {
    window.removeEventListener('wheel', onAny);
    window.removeEventListener('touchmove', onAny);
    window.removeEventListener('keydown', onKey);
    intro.removeEventListener('pointerdown', onPointer);
  }
  skip.addEventListener('click', (e) => { e.stopPropagation(); reveal(true); });
  window.addEventListener('wheel', onAny, { passive: true });
  window.addEventListener('touchmove', onAny, { passive: true });
  window.addEventListener('keydown', onKey);
  intro.addEventListener('pointerdown', onPointer);
})();
