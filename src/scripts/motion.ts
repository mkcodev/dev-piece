// Page-level motion: staggered reveal of card grids and the pointer spotlight/tilt
// on tool cards. Everything is skipped under prefers-reduced-motion; the inline
// script in BaseLayout only hides `.reveal` once it knows this module will run.

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Staggered reveal ---------- */

const STAGGER_CAP = 8;
let observer: IntersectionObserver | null = null;

function reveal(el: HTMLElement, index: number) {
  el.style.setProperty('--reveal-i', String(Math.min(index, STAGGER_CAP)));
  el.classList.add('is-in');
}

function observeReveals() {
  const pending = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)'));
  if (pending.length === 0) return;

  if (reduceMotion() || !('IntersectionObserver' in window)) {
    pending.forEach((el) => reveal(el, 0));
    return;
  }

  observer ??= new IntersectionObserver((entries) => {
    // Cards entering together form one batch, staggered in document order
    const batch = entries
      .filter((e) => e.isIntersecting)
      .map((e) => e.target as HTMLElement)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    batch.forEach((el, i) => {
      observer?.unobserve(el);
      reveal(el, i);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  pending.forEach((el) => observer?.observe(el));
}

/* ---------- Spotlight + tilt ---------- */

const MAX_TILT = 3; // degrees
let current: HTMLElement | null = null;
let frame = 0;
let last: PointerEvent | null = null;

function resetCard(card: HTMLElement) {
  card.style.removeProperty('--rx');
  card.style.removeProperty('--ry');
}

function paint() {
  frame = 0;
  if (!current || !last) return;
  const r = current.getBoundingClientRect();
  const x = last.clientX - r.left;
  const y = last.clientY - r.top;
  current.style.setProperty('--mx', `${x}px`);
  current.style.setProperty('--my', `${y}px`);
  if (reduceMotion()) return;
  const px = x / r.width - 0.5;
  const py = y / r.height - 0.5;
  current.style.setProperty('--rx', `${(-py * MAX_TILT * 2).toFixed(2)}deg`);
  current.style.setProperty('--ry', `${(px * MAX_TILT * 2).toFixed(2)}deg`);
}

function onPointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return;
  const card = (e.target as Element | null)?.closest<HTMLElement>('.tool-card') ?? null;
  if (card !== current) {
    if (current) resetCard(current);
    current = card;
  }
  if (!current) return;
  last = e;
  if (!frame) frame = requestAnimationFrame(paint);
}

function onPointerLeaveDocument() {
  if (current) resetCard(current);
  current = null;
}

/* ---------- Init ---------- */

export function initMotion() {
  window.__dpMotionLive = true;
  observeReveals();
  document.addEventListener('astro:page-load', () => {
    current = null;
    observeReveals();
  });

  // Islands mount new cards after load (filters, hydration): pick them up too
  let queued = false;
  new MutationObserver((records) => {
    if (queued) return;
    const added = records.some((r) => Array.from(r.addedNodes).some((n) =>
      n instanceof HTMLElement && (n.matches('.reveal') || n.querySelector('.reveal'))));
    if (!added) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; observeReveals(); });
  }).observe(document.body, { childList: true, subtree: true });

  if (finePointer()) {
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeaveDocument);
  }
}

declare global {
  interface Window { __dpMotionLive?: boolean }
}
