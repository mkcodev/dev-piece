// Build-time tool icons. Brand marks come from the `simple-icons` package (no
// runtime CDN); tools without a brand fall back to their category's Lucide icon.
// Everything is rendered monochrome (currentColor) so the category accent drives it.
import * as simpleIcons from 'simple-icons';
import * as lucide from 'lucide-static';
import { CATEGORY_CONFIG } from './utils';

/** Tool slug → simple-icons slug. One source of truth for every card and page. */
const SLUG_BRANDS: Record<string, string> = {
  'claude-code': 'anthropic',
  'github-copilot': 'githubcopilot',
  ollama: 'ollama',
  cursor: 'cursor',
  bitwarden: 'bitwarden',
  'ublock-origin': 'ublockorigin',
  wappalyzer: 'wappalyzer',
  httpie: 'httpie',
  'docker-compose-patterns': 'docker',
  'dockerfile-patterns': 'docker',
  'docker-hacks': 'docker',
  gitconfig: 'git',
  'git-aliases': 'git',
  'git-bisect': 'git',
  'git-reflog': 'git',
  'git-worktree': 'git',
  'conventional-commits': 'conventionalcommits',
  'jetbrains-mono': 'jetbrains',
  'shell-aliases': 'gnubash',
  'bash-functions': 'gnubash',
  alacritty: 'alacritty',
  ghostty: 'ghostty',
  nushell: 'nushell',
  starship: 'starship',
  warp: 'warp',
  wezterm: 'wezterm',
  tmux: 'tmux',
  'catppuccin-vscode': 'vscodium',
  'error-lens': 'vscodium',
  'todo-tree': 'vscodium',
  'vscode-settings': 'vscodium',
  gitlens: 'gitkraken',
  vscodevim: 'vim',
  'roadmap-dev': 'roadmapdotsh',
  'javascript-info': 'javascript',
  'mdn-web-docs': 'mdnwebdocs',
  exercism: 'exercism',
  frontendmentor: 'frontendmentor',
  'odin-project': 'theodinproject',
  fireship: 'youtube',
  excalidraw: 'excalidraw',
};

/** Category-wide brand when a tool has none of its own. */
const CATEGORY_BRANDS: Record<string, string> = {
  neovim: 'neovim',
  'scripts-ahk': 'autohotkey',
  userscripts: 'tampermonkey',
};

type SimpleIcon = { path: string; title: string };

function brand(slug: string): SimpleIcon | null {
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  const icon = (simpleIcons as unknown as Record<string, SimpleIcon | undefined>)[key];
  return icon?.path ? icon : null;
}

function lucideSvg(name: string, className: string): string {
  const pascal = name.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  const raw = (lucide as Record<string, unknown>)[pascal];
  const svg = typeof raw === 'string' ? raw : (lucide as Record<string, string>).Box;
  return svg
    .replace(/<svg[^>]*>/, (tag) =>
      tag.replace(/\s(class|width|height)="[^"]*"/g, '').replace('<svg', `<svg class="${className}" aria-hidden="true" focusable="false"`),
    )
    .replace(/\n\s*/g, ' ');
}

/** Inline SVG markup for a tool (brand mark or category glyph), sized by `className`. */
export function toolIconSvg(slug: string, category: string, className = 'w-[18px] h-[18px]'): string {
  const icon = brand(SLUG_BRANDS[slug] ?? '') ?? brand(CATEGORY_BRANDS[category] ?? '');
  if (icon) {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${icon.path}"/></svg>`;
  }
  return lucideSvg(CATEGORY_CONFIG[category]?.icon ?? 'box', className);
}

/** Inline SVG for a category header (brand when the whole category is one product). */
export function categoryIconSvg(category: string, className = 'w-7 h-7', brandSlug?: string): string {
  const icon = brand(brandSlug ?? '') ?? brand(CATEGORY_BRANDS[category] ?? '');
  if (icon) {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${icon.path}"/></svg>`;
  }
  return lucideSvg(CATEGORY_CONFIG[category]?.icon ?? 'box', className);
}
