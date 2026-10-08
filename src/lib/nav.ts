import { getCollection } from 'astro:content';
import { CATEGORY_CONFIG } from './utils';
import { ROADMAPS } from '../data/roadmaps';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  count?: number;
  accent?: string;
  /** Index in CATEGORY_CONFIG order, used for up/down page transitions. */
  catIndex: number;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Sidebar grouping. Categories missing here land in "Más" so a new one is never hidden. */
const GROUPS: { id: string; label: string; categories: string[] }[] = [
  { id: 'terminal', label: 'Terminal y CLI', categories: ['terminales', 'cli-tools', 'snippets', 'dotfiles', 'git-hacks', 'docker'] },
  { id: 'editores', label: 'Editores e IA', categories: ['neovim', 'vscode', 'ai-tools', 'fonts'] },
  { id: 'web', label: 'Navegador y web', categories: ['browser-extensions', 'userscripts', 'web-resources', 'apis-datos', 'learning'] },
  { id: 'sistema', label: 'Sistema', categories: ['windows-tools', 'scripts-ahk', 'macos-tools', 'productividad'] },
];

let navPromise: Promise<{ explore: NavItem[]; groups: NavGroup[] }> | null = null;

async function build() {
  const order = Object.keys(CATEGORY_CONFIG);
  const counts: Record<string, number> = {};
  for (const cat of order) {
    try {
      counts[cat] = (await getCollection(cat as any)).length;
    } catch {
      counts[cat] = 0;
    }
  }
  let guides = 0;
  try {
    guides = (await getCollection('guias')).length;
  } catch {}

  const toItem = (cat: string): NavItem => ({
    href: `/${cat}`,
    label: CATEGORY_CONFIG[cat].label,
    icon: CATEGORY_CONFIG[cat].icon,
    accent: CATEGORY_CONFIG[cat].accent,
    count: counts[cat],
    catIndex: order.indexOf(cat),
  });

  const grouped = new Set(GROUPS.flatMap((g) => g.categories));
  const groups: NavGroup[] = GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    items: g.categories.filter((c) => c in CATEGORY_CONFIG).map(toItem),
  }));
  const rest = order.filter((c) => !grouped.has(c));
  if (rest.length) groups.push({ id: 'mas', label: 'Más', items: rest.map(toItem) });

  const explore: NavItem[] = [
    { href: '/', label: 'Inicio', icon: 'house', catIndex: -1 },
    { href: '/roadmaps', label: 'Roadmaps', icon: 'map', count: ROADMAPS.length, catIndex: -1 },
    { href: '/guias', label: 'Guías', icon: 'book-marked', count: guides, catIndex: -1 },
    { href: '/arsenal', label: 'Mi Arsenal', icon: 'swords', catIndex: -1 },
  ];

  return { explore, groups: groups.filter((g) => g.items.length) };
}

/** Navigation model shared by the desktop sidebar and the mobile drawer (built once per build). */
export function getNav() {
  navPromise ??= build();
  return navPromise;
}
