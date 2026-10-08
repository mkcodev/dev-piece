// Client behaviour for the persisted sidebar (desktop) and the mobile drawer.
// Both render NavTree, so everything here works on every `.nav-tree` it finds.

const RAIL_KEY = 'devpiece-sidebar-collapsed';
const GROUPS_KEY = 'devpiece-sidebar-groups';
const FAV_KEY = 'devpiece-favorites';
const INT_KEY = 'devpiece-integrations';

const store = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch {}
  },
  json<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) ?? '') ?? fallback; } catch { return fallback; }
  },
};

const trees = () => Array.from(document.querySelectorAll<HTMLElement>('.nav-tree'));
const isRail = () => document.documentElement.dataset.sidebar === 'rail';
const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/* ---------- Active item ---------- */

function currentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function matches(href: string, path: string) {
  return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
}

function syncActive() {
  const path = currentPath();
  document.querySelectorAll<HTMLAnchorElement>('.nav-link[data-nav-href]').forEach((link) => {
    const active = matches(link.dataset.navHref ?? '', path);
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    if (active) {
      const group = link.closest<HTMLDetailsElement>('details.nav-group');
      if (group && !group.open) group.open = true;
    }
  });
}

/* ---------- Sliding pill (desktop tree only) ---------- */

function positionPill() {
  const tree = document.querySelector<HTMLElement>('.nav-tree.sidebar-pill-track');
  if (!tree) return;
  let pill = tree.querySelector<HTMLElement>('.sidebar-pill-indicator');
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'sidebar-pill-indicator';
    pill.setAttribute('aria-hidden', 'true');
    tree.prepend(pill);
  }
  const link = tree.querySelector<HTMLElement>('.nav-link.is-active');
  if (!link || link.offsetParent === null) {
    pill.style.opacity = '0';
    return;
  }
  // offsetTop ignores in-flight transforms (group reveal animation replays on swap)
  let top = 0;
  for (let el: HTMLElement | null = link; el && el !== tree; el = el.offsetParent as HTMLElement | null) {
    top += el.offsetTop;
  }
  const first = !pill.dataset.placed;
  if (first) pill.style.transition = 'none';
  pill.style.transform = `translateY(${top}px)`;
  pill.style.height = `${link.offsetHeight}px`;
  pill.style.opacity = '1';
  if (first) {
    pill.dataset.placed = '1';
    pill.getBoundingClientRect();
    pill.style.transition = '';
  }
}

function revealActive(smooth: boolean) {
  const scroller = document.querySelector<HTMLElement>('.sidebar-scroll');
  const link = scroller?.querySelector<HTMLElement>('.nav-link.is-active');
  if (!scroller || !link) return;
  const s = scroller.getBoundingClientRect();
  const l = link.getBoundingClientRect();
  if (l.top < s.top + 8 || l.bottom > s.bottom - 8) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollBy({ top: l.top - s.top - s.height / 2 + l.height / 2, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
}

/* ---------- Groups (open state persisted) ---------- */

let filtering = false;

function restoreGroups() {
  const closed = new Set(store.json<string[]>(GROUPS_KEY, []));
  document.querySelectorAll<HTMLDetailsElement>('.nav-tree details.nav-group').forEach((d) => {
    d.open = !closed.has(d.dataset.group ?? '') || !!d.querySelector('.nav-link.is-active');
  });
}

function saveGroups() {
  if (filtering || isRail()) return;
  const tree = document.querySelector('.nav-tree[data-variant="sidebar"]') ?? document.querySelector('.nav-tree');
  if (!tree) return;
  const closed = Array.from(tree.querySelectorAll<HTMLDetailsElement>('details.nav-group'))
    .filter((d) => !d.open)
    .map((d) => d.dataset.group ?? '');
  store.set(GROUPS_KEY, JSON.stringify(closed));
}

/* ---------- Inline filter ---------- */

function applyFilter(tree: HTMLElement, raw: string) {
  const q = normalize(raw);
  filtering = q.length > 0;
  let any = false;
  tree.querySelectorAll<HTMLDetailsElement>('details.nav-group').forEach((group) => {
    let hits = 0;
    group.querySelectorAll<HTMLElement>('.nav-link[data-nav-label]').forEach((link) => {
      const hit = !q || normalize(link.dataset.navLabel ?? '').includes(q);
      link.parentElement!.hidden = !hit;
      if (hit) hits++;
    });
    group.hidden = hits === 0;
    if (q && hits) group.open = true;
    if (hits) any = true;
  });
  tree.querySelector('.js-nav-empty')?.classList.toggle('hidden', any);
  if (!q) restoreGroups();
  positionPill();
}

/* ---------- Arsenal counter + recent favourites ---------- */

type SavedTool = { slug?: string; category?: string; name?: string; accent?: string };

function syncArsenal() {
  const favs = store.json<SavedTool[]>(FAV_KEY, []);
  const ints = store.json<SavedTool[]>(INT_KEY, []);
  const list = [...(Array.isArray(favs) ? favs : []), ...(Array.isArray(ints) ? ints : [])];
  const unique = new Set(list.map((t) => `${t.category}/${t.slug}`));

  document.querySelectorAll<HTMLElement>('.js-arsenal-count').forEach((badge) => {
    badge.textContent = String(unique.size);
    badge.classList.toggle('hidden', unique.size === 0);
  });

  const recent = (Array.isArray(favs) ? favs : []).filter((f) => f.slug && f.category).slice(0, 3);
  document.querySelectorAll<HTMLUListElement>('.js-arsenal-recents').forEach((ul) => {
    ul.replaceChildren(
      ...recent.map((f) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `/${f.category}/${f.slug}`;
        a.className = 'nav-recent';
        a.dataset.navHref = a.getAttribute('href') ?? '';
        const dot = document.createElement('span');
        dot.className = 'nav-recent-dot';
        dot.style.backgroundColor = f.accent ?? '#babbf1';
        dot.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        label.className = 'truncate';
        label.textContent = f.name ?? f.slug ?? '';
        a.append(dot, label);
        li.append(a);
        return li;
      }),
    );
    ul.classList.toggle('hidden', recent.length === 0);
  });
  positionPill();
}

/* ---------- Rail mode ---------- */

let openBeforeRail: Map<HTMLDetailsElement, boolean> | null = null;

function setRail(on: boolean, persist = true) {
  const root = document.documentElement;
  if (on) root.dataset.sidebar = 'rail';
  else delete root.dataset.sidebar;
  if (persist) store.set(RAIL_KEY, on ? '1' : '0');

  const groups = document.querySelectorAll<HTMLDetailsElement>('.sidebar details.nav-group');
  if (on) {
    openBeforeRail = new Map(Array.from(groups).map((d) => [d, d.open]));
    groups.forEach((d) => (d.open = true));
  } else if (openBeforeRail) {
    openBeforeRail.forEach((wasOpen, d) => (d.open = wasOpen || !!d.querySelector('.nav-link.is-active')));
    openBeforeRail = null;
  }

  document.querySelectorAll<HTMLButtonElement>('.js-rail-toggle').forEach((btn) => {
    btn.setAttribute('aria-expanded', String(!on));
    btn.setAttribute('aria-label', on ? 'Expandir barra lateral' : 'Contraer barra lateral');
  });
  hideTip();
  requestAnimationFrame(positionPill);
}

/* ---------- Rail tooltips (fixed layer: the sidebar scroller would clip them) ---------- */

let tip: HTMLElement | null = null;

function showTip(target: HTMLElement) {
  if (!isRail() || !target.closest('.sidebar')) return;
  const text = target.dataset.tip;
  if (!text) return;
  tip ??= Object.assign(document.createElement('div'), { className: 'rail-tip', role: 'tooltip' });
  if (!tip.isConnected) document.body.append(tip);
  tip.textContent = text;
  const r = target.getBoundingClientRect();
  tip.style.top = `${r.top + r.height / 2}px`;
  tip.style.left = `${r.right + 10}px`;
  tip.dataset.show = '1';
}

function hideTip() {
  if (tip) delete tip.dataset.show;
}

/* ---------- Mobile drawer ---------- */

function drawer() {
  return document.getElementById('nav-drawer') as HTMLDialogElement | null;
}

function openDrawer() {
  const d = drawer();
  if (!d || d.open) return;
  syncActive();
  d.showModal();
  document.querySelectorAll('.js-drawer-open').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  d.querySelector<HTMLElement>('.nav-link.is-active')?.scrollIntoView({ block: 'center' });
}

function closeDrawer(animate = true) {
  const d = drawer();
  if (!d || !d.open) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const done = () => {
    d.classList.remove('is-closing');
    d.close();
    const panel = d.querySelector<HTMLElement>('.js-drawer-panel');
    if (panel) panel.style.transform = '';
  };
  document.querySelectorAll('.js-drawer-open').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  if (!animate || reduce) return done();
  d.classList.add('is-closing');
  d.querySelector('.js-drawer-panel')?.addEventListener('animationend', done, { once: true });
}

function initSwipe() {
  const d = drawer();
  const panel = d?.querySelector<HTMLElement>('.js-drawer-panel');
  if (!d || !panel) return;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let tracking = false;
  panel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dx = 0;
    tracking = true;
  }, { passive: true });
  panel.addEventListener('touchmove', (e) => {
    if (!tracking) return;
    const x = e.touches[0].clientX - startX;
    const y = e.touches[0].clientY - startY;
    if (Math.abs(y) > Math.abs(x) && dx === 0) { tracking = false; return; }
    dx = Math.min(0, x);
    panel.style.transition = 'none';
    panel.style.transform = `translateX(${dx}px)`;
  }, { passive: true });
  panel.addEventListener('touchend', () => {
    if (!tracking) return;
    tracking = false;
    panel.style.transition = '';
    if (dx < -72) closeDrawer();
    else panel.style.transform = '';
  });
}

/* ---------- Wiring ---------- */

let wired = false;

function onPageLoad() {
  syncActive();
  syncArsenal();
  positionPill();
  revealActive(true);
}

export function initNav() {
  if (wired) return;
  wired = true;

  restoreGroups();
  setRail(isRail(), false);
  onPageLoad();

  document.addEventListener('astro:page-load', onPageLoad);
  document.addEventListener('astro:before-swap', () => closeDrawer(false));
  window.addEventListener('favorites-updated', syncArsenal);
  window.addEventListener('integrations-updated', syncArsenal);
  window.addEventListener('storage', syncArsenal);
  window.addEventListener('resize', () => requestAnimationFrame(positionPill));

  document.querySelectorAll<HTMLDetailsElement>('details.nav-group').forEach((d) => {
    d.addEventListener('toggle', () => {
      saveGroups();
      positionPill();
    });
  });

  trees().forEach((tree) => {
    const input = tree.querySelector<HTMLInputElement>('.js-nav-filter');
    input?.addEventListener('input', () => applyFilter(tree, input.value));
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        applyFilter(tree, '');
      }
    });
  });

  document.querySelectorAll('.js-rail-toggle').forEach((btn) => btn.addEventListener('click', () => setRail(!isRail())));

  document.addEventListener('keydown', (e) => {
    if (e.key !== '[' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    e.preventDefault();
    setRail(!isRail());
  });

  const sidebar = document.querySelector<HTMLElement>('.sidebar');
  sidebar?.addEventListener('pointerover', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]');
    if (t) showTip(t);
  });
  sidebar?.addEventListener('pointerout', (e) => {
    const t = (e.target as HTMLElement).closest('[data-tip]');
    if (t && !t.contains(e.relatedTarget as Node)) hideTip();
  });
  sidebar?.addEventListener('focusin', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]');
    if (t && t.matches(':focus-visible')) showTip(t);
  });
  sidebar?.addEventListener('focusout', hideTip);
  document.querySelector('.sidebar-scroll')?.addEventListener('scroll', hideTip, { passive: true });

  document.querySelectorAll('.js-drawer-open').forEach((b) => b.addEventListener('click', openDrawer));
  const d = drawer();
  d?.querySelector('.js-drawer-close')?.addEventListener('click', () => closeDrawer());
  d?.addEventListener('click', (e) => {
    if (e.target === d) closeDrawer();
    if ((e.target as HTMLElement).closest('a[href]')) closeDrawer(false);
  });
  d?.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDrawer();
  });
  initSwipe();
}
