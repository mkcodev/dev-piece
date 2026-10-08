import { useState, useEffect, useMemo, useRef } from 'react';

/* ── Icon maps ───────────────────────────────────────────────────────── */
const SLUG_ICONS: Record<string, string> = {
  'claude-code': 'anthropic', 'github-copilot': 'githubcopilot', 'ollama': 'ollama',
  'bitwarden': 'bitwarden', 'ublock-origin': 'ublockorigin', 'wappalyzer': 'wappalyzer',
  'httpie': 'httpie', 'docker-compose-patterns': 'docker', 'gitconfig': 'git',
  'jetbrains-mono': 'jetbrains', 'conventional-commits': 'conventionalcommits',
  'git-bisect': 'git', 'git-reflog': 'git', 'git-worktree': 'git',
  'docker-hacks': 'docker', 'git-aliases': 'git',
  'shell-aliases': 'gnubash', 'alacritty': 'alacritty', 'ghostty': 'ghostty',
  'nushell': 'nushell', 'starship': 'starship', 'warp': 'warp', 'wezterm': 'wezterm',
  'catppuccin-vscode': 'vscodium', 'error-lens': 'vscodium', 'gitlens': 'gitkraken',
  'todo-tree': 'vscodium', 'vscode-settings': 'vscodium', 'vscodevim': 'vim',
  'roadmap-dev': 'roadmapdotsh', 'javascript-info': 'javascript',
  'mdn-web-docs': 'mdnwebdocs', 'regex101': 'gnubash',
};
const CATEGORY_ICONS: Record<string, string> = {
  neovim: 'neovim', 'scripts-ahk': 'autohotkey',
  learning: 'bookstack', 'web-resources': 'mdnwebdocs',
};

/* ── Types ───────────────────────────────────────────────────────────── */
interface StoredTool {
  slug: string; category: string; name: string;
  description: string; tags: string[]; os: string[];
  accent: string; difficulty?: string;
  install?: Record<string, string>;
}
interface Props {
  categoryCounts: Record<string, number>;
  categoryLabels: Record<string, string>;
  categoryAccents: Record<string, string>;
}
type Tab = 'favoritos' | 'integraciones' | 'core';

/* ── Storage ─────────────────────────────────────────────────────────── */
const FAV_KEY       = 'devpiece-favorites';
const INT_KEY       = 'devpiece-integrations';
const PROFILES_KEY  = 'devpiece-profiles';
const PROFILE_CUR   = 'devpiece-current-profile';

function load(key: string): StoredTool[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}
function save(key: string, data: StoredTool[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ── Arsenal Power titles ────────────────────────────────────────────── */
const RANKS = [
  { min: 0,  title: 'Rookie Dev',        sub: 'Tu viaje acaba de comenzar',       emoji: '🌱', color: '#a6d189' },
  { min: 8,  title: 'Junior Dev',        sub: 'El Grand Line te llama',           emoji: '⚓', color: '#8caaee' },
  { min: 20, title: 'Mid Dev',           sub: 'Tu arsenal toma forma',            emoji: '🗺️', color: '#85c1dc' },
  { min: 40, title: 'Senior Dev',        sub: 'Dominas las herramientas',         emoji: '⚔️', color: '#ca9ee6' },
  { min: 65, title: '10x Dev',           sub: 'Productividad de élite',           emoji: '🔱', color: '#e5c890' },
  { min: 85, title: 'Pirate King 🏴‍☠️',   sub: '¡Has encontrado el One Piece!',  emoji: '💎', color: '#ef9f76' },
];

function getRank(power: number) {
  return [...RANKS].reverse().find(r => power >= r.min) ?? RANKS[0];
}

/* ── Animated bars ───────────────────────────────────────────────────── */
function PowerBar({ power, color }: { power: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(power), 120); return () => clearTimeout(t); }, [power]);
  return (
    <div className="w-full h-2 bg-surface1 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
        style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-bar" />
      </div>
    </div>
  );
}

function CoverageBar({ label, have, total, accent }: { label: string; have: number; total: number; accent: string }) {
  const pct = total > 0 ? Math.round((have / total) * 100) : 0;
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 200); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-subtext1 flex-shrink-0 w-[90px] truncate text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-surface1 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${w}%`, backgroundColor: accent }} />
      </div>
      <span className="text-xs text-subtext1 font-mono flex-shrink-0 w-8 text-right">{have}/{total}</span>
    </div>
  );
}

/* ── Tool icon ───────────────────────────────────────────────────────── */
function ToolIcon({ tool }: { tool: StoredTool }) {
  const [failed, setFailed] = useState(false);
  const iconSlug = SLUG_ICONS[tool.slug] ?? CATEGORY_ICONS[tool.category];
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ backgroundColor: `${tool.accent}22` }} aria-hidden="true">
      {iconSlug && !failed ? (
        <img src={`https://cdn.simpleicons.org/${iconSlug}`} alt="" width={20} height={20}
          className="w-5 h-5 object-contain" onError={() => setFailed(true)} />
      ) : (
        <span className="font-bold text-sm" style={{ color: tool.accent }}>
          {tool.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/* ── OS badge ────────────────────────────────────────────────────────── */
const OS_BADGE: Record<string, { label: string; color: string }> = {
  windows: { label: 'Win',   color: 'chip chip-blue' },
  macos:   { label: 'Mac',   color: 'chip chip-mauve' },
  linux:   { label: 'Linux', color: 'chip chip-peach' },
  cross:   { label: 'Cross', color: 'chip chip-green' },
};

/* ── Arsenal card ────────────────────────────────────────────────────── */
function ArsenalCard({
  tool, isCore, isFav, isInt, draggable, onRemoveFav, onRemoveInt,
  onDragStart, onDragOver, onDrop, isDragOver,
}: {
  tool: StoredTool; isCore: boolean; isFav: boolean; isInt: boolean;
  draggable?: boolean; isDragOver?: boolean;
  onRemoveFav: () => void; onRemoveInt: () => void;
  onDragStart?: () => void; onDragOver?: (e: React.DragEvent) => void; onDrop?: () => void;
}) {
  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragOver ? 'border-lavender/60 scale-[1.01]' : ''}`}
      style={isCore
        ? { background: 'linear-gradient(135deg, rgba(138,173,244,0.06) 0%, rgba(202,158,230,0.06) 50%, rgba(229,200,144,0.06) 100%)', borderColor: isDragOver ? undefined : 'rgba(202,158,230,0.4)' }
        : { borderColor: isDragOver ? undefined : 'var(--color-surface1)', background: 'var(--color-surface0)' }
      }
    >
      {isCore ? (
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl overflow-hidden">
          <div className="h-full w-full" style={{ background: 'linear-gradient(90deg, #8caaee, #ca9ee6, #e5c890, #a6d189, #8caaee)', backgroundSize: '200% 100%', animation: 'dp-border-slide 3s linear infinite' }} />
        </div>
      ) : (
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ backgroundColor: tool.accent }} />
      )}

      {isCore && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
            style={{ background: 'rgba(202,158,230,0.15)', borderColor: 'rgba(202,158,230,0.4)', color: '#ca9ee6' }}>
            ⭐ CORE
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="flex items-start gap-2.5">
          <ToolIcon tool={tool} />
          <div className="min-w-0 flex-1">
            <a href={`/${tool.category}/${tool.slug}`}
              className="font-semibold text-text text-sm leading-snug hover:text-blue transition-colors block truncate pr-8">
              {tool.name}
            </a>
            <div className="flex gap-1 mt-1 flex-wrap">
              {tool.os.slice(0, 2).map(o => {
                const cfg = OS_BADGE[o];
                return cfg ? (
                  <span key={o} className={`text-[10px] px-1.5 py-0.5 rounded border font-mono leading-none ${cfg.color}`}>
                    {cfg.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <p className="text-xs text-subtext1 line-clamp-2 leading-relaxed flex-1">{tool.description}</p>

        {tool.install && Object.keys(tool.install).length > 0 && (
          <code className="text-[11px] text-sky bg-crust/50 px-2 py-1 rounded font-mono truncate block">
            {Object.values(tool.install)[0]}
          </code>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-surface1/50">
          <a href={`/${tool.category}/${tool.slug}`}
            className="text-xs text-lavender hover:text-text font-medium transition-colors flex items-center gap-1">
            Ver más
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6"/>
            </svg>
          </a>
          <div className="flex items-center gap-1.5">
            {isFav && (
              <button onClick={onRemoveFav}
                className="flex items-center gap-1 text-[11px] text-red/70 hover:text-red transition-colors px-1.5 py-1 rounded hover:bg-red/10"
                title="Quitar de favoritos">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            )}
            {isInt && (
              <button onClick={onRemoveInt}
                className="flex items-center gap-1 text-[11px] transition-colors px-1.5 py-1 rounded hover:bg-yellow/10"
                style={{ color: 'rgba(229,200,144,0.7)' }}
                title="Quitar integración">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Category section ────────────────────────────────────────────────── */
function CategorySection({
  category, label, accent, tools, isCore, favs, ints,
  onRemoveFav, onRemoveInt,
}: {
  category: string; label: string; accent: string; tools: StoredTool[];
  isCore: boolean; favs: StoredTool[]; ints: StoredTool[];
  onRemoveFav: (slug: string, cat: string) => void;
  onRemoveInt: (slug: string, cat: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-6">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 mb-3 w-full text-left group">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
        <span className="text-sm font-semibold text-text">{label}</span>
        <span className="text-xs text-subtext1 font-mono ml-1">({tools.length})</span>
        <svg className={`w-3.5 h-3.5 text-subtext1 ml-auto transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {tools.map(tool => {
            const toolIsFav = favs.some(f => f.slug === tool.slug && f.category === tool.category);
            const toolIsInt = ints.some(i => i.slug === tool.slug && i.category === tool.category);
            return (
              <ArsenalCard key={`${tool.category}/${tool.slug}`} tool={tool}
                isCore={isCore && toolIsFav && toolIsInt} isFav={toolIsFav} isInt={toolIsInt}
                onRemoveFav={() => onRemoveFav(tool.slug, tool.category)}
                onRemoveInt={() => onRemoveInt(tool.slug, tool.category)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Clear confirmation button ───────────────────────────────────────── */
function ClearButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const ask = () => { setConfirming(true); timerRef.current = setTimeout(() => setConfirming(false), 4000); };
  const confirm = () => { clearTimeout(timerRef.current); setConfirming(false); onConfirm(); };
  return confirming ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-subtext1">¿Seguro?</span>
      <button onClick={confirm} className="text-xs px-2.5 py-1 rounded-lg chip chip-red border border-red/30 hover:bg-red/30 transition-colors font-medium">
        Sí, vaciar
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs px-2.5 py-1 rounded-lg bg-surface1 text-subtext1 hover:bg-surface2 transition-colors">
        Cancelar
      </button>
    </div>
  ) : (
    <button onClick={ask} className="text-xs px-2.5 py-1 rounded-lg bg-surface0 hover:bg-surface1 text-subtext1 hover:text-text border border-surface1 transition-colors flex items-center gap-1.5">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
      {label}
    </button>
  );
}

/* ── Drag-to-reorder list ─────────────────────────────────────────────── */
function DragList({ tools, onReorder }: { tools: StoredTool[]; onReorder: (tools: StoredTool[]) => void }) {
  const [items, setItems] = useState(tools);
  const dragRef = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  useEffect(() => setItems(tools), [tools]);

  const handleDragStart = (i: number) => { dragRef.current = i; };
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragRef.current === null || dragRef.current === i) { setOverIdx(i); return; }
    const arr = [...items];
    const [removed] = arr.splice(dragRef.current, 1);
    arr.splice(i, 0, removed);
    dragRef.current = i;
    setOverIdx(i);
    setItems(arr);
  };
  const handleDrop = () => {
    onReorder(items);
    dragRef.current = null;
    setOverIdx(null);
  };
  const handleDragEnd = () => {
    dragRef.current = null;
    setOverIdx(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((tool, i) => (
        <div key={`${tool.category}/${tool.slug}`}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={e => handleDragOver(e, i)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none ${
            overIdx === i && dragRef.current !== i
              ? 'border-lavender/60 bg-lavender/5 scale-[1.01]'
              : 'border-surface1 bg-surface0 hover:border-surface2'
          }`}
        >
          <svg className="w-4 h-4 text-overlay0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <ToolIcon tool={tool} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">{tool.name}</p>
            <p className="text-xs text-subtext1 capitalize">{tool.category.replace(/-/g, ' ')}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {tool.os.slice(0, 2).map(o => {
              const cfg = OS_BADGE[o];
              return cfg ? (
                <span key={o} className={`text-[10px] px-1.5 py-0.5 rounded border font-mono leading-none ${cfg.color}`}>
                  {cfg.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Export script modal ─────────────────────────────────────────────── */
function ExportButton({ ints }: { ints: StoredTool[] }) {
  const [open, setOpen]   = useState(false);
  const [type, setType]   = useState<'sh' | 'ps1'>('sh');
  const [copied, setCopied] = useState(false);

  const script = useMemo(() => {
    const date = new Date().toLocaleDateString('es-ES');
    const shPref  = ['brew', 'apt', 'snap', 'linux', 'cross'];
    const ps1Pref = ['winget', 'scoop', 'choco', 'windows'];

    const header = type === 'sh'
      ? `#!/usr/bin/env bash\n# DevPiece Arsenal — Script de instalación (bash)\n# Generado: ${date}\n# Ejecutar: chmod +x devpiece-arsenal.sh && ./devpiece-arsenal.sh\n`
      : `# DevPiece Arsenal — Script de instalación (PowerShell)\n# Generado: ${date}\n# Ejecutar: Set-ExecutionPolicy RemoteSigned; .\\devpiece-arsenal.ps1\n`;

    const lines: string[] = [header];
    const withInstall = ints.filter(t => t.install && Object.keys(t.install).length > 0);

    if (withInstall.length === 0) return header + '\n# Ninguna herramienta tiene comandos de instalación registrados.';

    for (const tool of withInstall) {
      const install = tool.install!;
      lines.push(`\n# ── ${tool.name} (${tool.category}) ──`);
      const pref = type === 'sh' ? shPref : ps1Pref;
      const found = pref.map(k => install[k]).find(v => v);
      const fallback = Object.values(install)[0];
      const cmd = found ?? fallback;
      if (cmd) lines.push(cmd);
    }

    if (type === 'sh') lines.push('\necho "\\n✅ Instalación completada"');
    else lines.push('\nWrite-Host "\\n✅ Instalación completada" -ForegroundColor Green');

    return lines.join('\n');
  }, [ints, type]);

  const download = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `devpiece-arsenal.${type}`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="text-xs px-2.5 py-1 rounded-lg bg-surface0 hover:bg-surface1 text-subtext1 hover:text-text border border-surface1 transition-colors flex items-center gap-1.5">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
      Exportar script
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-crust/70 backdrop-blur-sm p-4"
      onClick={() => setOpen(false)}>
      <div className="bg-mantle border border-surface1 rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-text">Script de instalación</h3>
            <p className="text-xs text-subtext1 mt-0.5">{ints.length} herramientas · {ints.filter(t => t.install && Object.keys(t.install).length > 0).length} con comandos</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-subtext1 hover:text-text transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['sh', 'ps1'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-colors ${type === t ? 'bg-blue text-crust' : 'bg-surface0 text-subtext1 hover:bg-surface1'}`}>
              .{t}
            </button>
          ))}
          <span className="ml-auto text-xs text-subtext1 self-center">
            {type === 'sh' ? 'bash/zsh — Linux/macOS' : 'PowerShell — Windows'}
          </span>
        </div>

        <pre className="bg-crust rounded-xl p-4 text-xs font-mono text-green overflow-auto max-h-72 border border-surface0 leading-relaxed">
          {script}
        </pre>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={copyScript}
            className="text-sm px-3 py-1.5 rounded-lg bg-surface0 hover:bg-surface1 text-subtext1 border border-surface1 transition-colors flex items-center gap-1.5">
            {copied ? (
              <><svg className="w-3.5 h-3.5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>¡Copiado!</>
            ) : 'Copiar'}
          </button>
          <button onClick={download}
            className="text-sm px-3 py-1.5 rounded-lg bg-blue hover:bg-lavender text-crust font-medium transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Descargar .{type}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Share arsenal button ─────────────────────────────────────────────── */
function ShareButton({ favs, ints }: { favs: StoredTool[]; ints: StoredTool[] }) {
  const [copied, setCopied] = useState(false);

  const share = () => {
    const data = {
      v: 1,
      f: favs.map(t => ({ s: t.slug, c: t.category, n: t.name, a: t.accent, o: t.os, d: t.description.slice(0, 100) })),
      i: ints.map(t => ({ s: t.slug, c: t.category, n: t.name, a: t.accent, o: t.os, d: t.description.slice(0, 100) })),
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const url = `${window.location.origin}/arsenal?share=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button onClick={share}
      className="text-xs px-2.5 py-1 rounded-lg bg-surface0 hover:bg-surface1 text-subtext1 hover:text-text border border-surface1 transition-colors flex items-center gap-1.5">
      {copied ? (
        <><svg className="w-3 h-3 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
        </svg>¡Enlace copiado!</>
      ) : (
        <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>Compartir arsenal</>
      )}
    </button>
  );
}

/* ── Import banner (shown when ?share= in URL) ──────────────────────── */
interface ShareData {
  v: number;
  f: { s: string; c: string; n: string; a: string; o: string[]; d: string }[];
  i: { s: string; c: string; n: string; a: string; o: string[]; d: string }[];
}

function ImportBanner({ encoded, onImport, onDismiss }: {
  encoded: string; onImport: (favs: StoredTool[], ints: StoredTool[]) => void; onDismiss: () => void;
}) {
  const [data, setData] = useState<ShareData | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      if (parsed.v === 1) setData(parsed);
    } catch {}
  }, [encoded]);

  if (!data) return null;

  const toStoredTool = (t: ShareData['f'][0]): StoredTool => ({
    slug: t.s, category: t.c, name: t.n, accent: t.a, os: t.o ?? [],
    description: t.d ?? '', tags: [],
  });

  const handleImport = () => {
    const newFavs = data.f.map(toStoredTool);
    const newInts = data.i.map(toStoredTool);

    const existFavs = load(FAV_KEY);
    const existInts = load(INT_KEY);

    // Merge — don't duplicate
    const merged = (existing: StoredTool[], incoming: StoredTool[]) => {
      const next = [...existing];
      for (const tool of incoming) {
        if (!next.some(t => t.slug === tool.slug && t.category === tool.category)) {
          next.unshift(tool);
        }
      }
      return next;
    };

    const mergedFavs = merged(existFavs, newFavs);
    const mergedInts = merged(existInts, newInts);
    save(FAV_KEY, mergedFavs); save(INT_KEY, mergedInts);
    window.dispatchEvent(new CustomEvent('favorites-updated'));
    window.dispatchEvent(new CustomEvent('integrations-updated'));
    onImport(mergedFavs, mergedInts);
    onDismiss();
    window.history.replaceState({}, '', '/arsenal');
  };

  const allNames = [...data.f.map(t => t.n), ...data.i.map(t => t.n)];

  return (
    <div className="rounded-2xl border border-blue/40 bg-blue/5 p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            <p className="text-sm font-semibold text-text">Arsenal compartido contigo</p>
          </div>
          <p className="text-xs text-subtext1">
            {data.f.length} favorito{data.f.length !== 1 ? 's' : ''} · {data.i.length} integración{data.i.length !== 1 ? 'es' : ''}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {allNames.slice(0, 8).map((n, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-crust/50 text-subtext1">{n}</span>
            ))}
            {allNames.length > 8 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-crust/50 text-subtext1">+{allNames.length - 8} más</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleImport}
            className="text-sm px-4 py-2 rounded-lg bg-blue hover:bg-lavender text-crust font-semibold transition-colors">
            Añadir a mi arsenal
          </button>
          <button onClick={() => { onDismiss(); window.history.replaceState({}, '', '/arsenal'); }}
            className="text-sm px-3 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-subtext1 border border-surface1 transition-colors">
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Workspace profiles ───────────────────────────────────────────────── */
interface Profile { favs: StoredTool[]; ints: StoredTool[] }

function ProfileManager({ favs, ints }: { favs: StoredTool[]; ints: StoredTool[] }) {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [current, setCurrent]   = useState<string>('');
  const [open, setOpen]         = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setProfiles(JSON.parse(localStorage.getItem(PROFILES_KEY) ?? '{}')); } catch {}
    setCurrent(localStorage.getItem(PROFILE_CUR) ?? '');
  }, []);

  useEffect(() => {
    if (creating) setTimeout(() => inputRef.current?.focus(), 50);
  }, [creating]);

  const saveAs = (name: string) => {
    const next = { ...profiles, [name]: { favs, ints } };
    setProfiles(next);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
    localStorage.setItem(PROFILE_CUR, name);
    setCurrent(name);
  };

  const switchTo = (name: string) => {
    // Persist current profile before switching
    if (current) {
      const saved = { ...profiles, [current]: { favs, ints } };
      localStorage.setItem(PROFILES_KEY, JSON.stringify(saved));
      setProfiles(saved);
    }
    const target = name === '' ? { favs: [] as StoredTool[], ints: [] as StoredTool[] } : (profiles[name] ?? { favs: [], ints: [] });
    save(FAV_KEY, target.favs);
    save(INT_KEY, target.ints);
    localStorage.setItem(PROFILE_CUR, name);
    setCurrent(name);
    window.dispatchEvent(new CustomEvent('favorites-updated'));
    window.dispatchEvent(new CustomEvent('integrations-updated'));
    setOpen(false);
  };

  const deleteProfile = (name: string) => {
    const next = { ...profiles };
    delete next[name];
    setProfiles(next);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
    if (current === name) {
      localStorage.setItem(PROFILE_CUR, '');
      setCurrent('');
    }
  };

  const submitNew = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    saveAs(trimmed);
    setCreating(false);
    setNewName('');
    setOpen(false);
  };

  const profileNames = Object.keys(profiles);

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-surface0 hover:bg-surface1 text-subtext1 hover:text-text border border-surface1 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <span className="font-medium">{current || 'Default'}</span>
        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setCreating(false); setNewName(''); }} />
          <div className="absolute top-full right-0 mt-1.5 w-60 bg-mantle border border-surface1 rounded-xl shadow-2xl z-50 overflow-hidden p-1">
            {/* Default */}
            <button onClick={() => switchTo('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${current === '' ? 'bg-surface0 text-text font-medium' : 'text-subtext1 hover:bg-surface0/70 hover:text-text'}`}>
              <span className="w-2 h-2 rounded-full bg-blue flex-shrink-0" />
              Default
              {current === '' && <svg className="w-3 h-3 text-green ml-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            </button>

            {profileNames.map(name => (
              <div key={name} className="flex items-center group">
                <button onClick={() => switchTo(name)}
                  className={`flex-1 text-left px-3 py-2 rounded-l-lg text-sm transition-colors flex items-center gap-2 ${current === name ? 'bg-surface0 text-text font-medium' : 'text-subtext1 hover:bg-surface0/70 hover:text-text'}`}>
                  <span className="w-2 h-2 rounded-full bg-lavender flex-shrink-0" />
                  <span className="truncate flex-1">{name}</span>
                  {current === name && <svg className="w-3 h-3 text-green flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                </button>
                <button onClick={() => deleteProfile(name)}
                  className="opacity-0 group-hover:opacity-100 px-2.5 py-2 text-subtext1 hover:text-red transition-all rounded-r-lg hover:bg-surface0/70"
                  title="Eliminar perfil">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}

            <div className="border-t border-surface0 mt-1 pt-1">
              {creating ? (
                <div className="px-2 py-1.5 flex gap-1.5">
                  <input ref={inputRef}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') submitNew();
                      if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                    }}
                    placeholder="Nombre del perfil…"
                    className="flex-1 bg-surface0 text-text text-xs px-2 py-1.5 rounded-lg border border-surface1 focus:border-lavender transition-colors"
                  />
                  <button onClick={submitNew}
                    className="text-xs px-2 py-1 rounded-lg bg-lavender text-crust font-bold hover:bg-mauve transition-colors">✓</button>
                </div>
              ) : (
                <button onClick={() => setCreating(true)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-subtext1 hover:text-text hover:bg-surface0/70 transition-colors flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Guardar como nuevo perfil
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main export
══════════════════════════════════════════════════════════════════════ */
export default function ArsenalPage({ categoryCounts, categoryLabels, categoryAccents }: Props) {
  const [favs,    setFavs]    = useState<StoredTool[]>([]);
  const [ints,    setInts]    = useState<StoredTool[]>([]);
  const [tab,     setTab]     = useState<Tab>('favoritos');
  const [mounted, setMounted] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [shareParam, setShareParam]   = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('tab') as Tab | null;
    if (p && ['favoritos','integraciones','core'].includes(p)) setTab(p);
    const s = new URLSearchParams(window.location.search).get('share');
    if (s) setShareParam(s);
    setFavs(load(FAV_KEY)); setInts(load(INT_KEY)); setMounted(true);
    const onUpdate = () => { setFavs(load(FAV_KEY)); setInts(load(INT_KEY)); };
    window.addEventListener('favorites-updated',    onUpdate);
    window.addEventListener('integrations-updated', onUpdate);
    return () => {
      window.removeEventListener('favorites-updated',    onUpdate);
      window.removeEventListener('integrations-updated', onUpdate);
    };
  }, []);

  /* Core = in both */
  const core = useMemo(() =>
    favs.filter(f => ints.some(i => i.slug === f.slug && i.category === f.category)),
  [favs, ints]);

  /* Arsenal Power */
  const power = useMemo(() => {
    const pts = favs.length * 1 + ints.length * 2 + core.length * 3;
    return Math.min(Math.round((pts / 120) * 100), 100);
  }, [favs, ints, core]);
  const rank = getRank(power);

  /* Coverage bars */
  const coverageCats = useMemo(() => {
    const allTools = [...favs, ...ints].filter((t, i, arr) =>
      arr.findIndex(x => x.slug === t.slug && x.category === t.category) === i
    );
    const havePerCat: Record<string, number> = {};
    allTools.forEach(t => { havePerCat[t.category] = (havePerCat[t.category] ?? 0) + 1; });
    return Object.entries(categoryCounts)
      .filter(([, total]) => total > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat, total]) => ({
        cat, total, have: havePerCat[cat] ?? 0,
        label: categoryLabels[cat] ?? cat,
        accent: categoryAccents[cat] ?? '#8caaee',
      }));
  }, [favs, ints, categoryCounts, categoryLabels, categoryAccents]);

  /* Username */
  const username = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('devpiece-user') ?? 'null');
      return u?.name ?? null;
    } catch { return null; }
  }, [mounted]);

  /* Tab data */
  const tabTools = tab === 'favoritos' ? favs : tab === 'integraciones' ? ints : core;
  const grouped = useMemo(() => {
    const map: Record<string, StoredTool[]> = {};
    tabTools.forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return Object.entries(map).sort((a, b) =>
      (categoryLabels[a[0]] ?? a[0]).localeCompare(categoryLabels[b[0]] ?? b[0], 'es')
    );
  }, [tabTools, categoryLabels]);

  /* Mutations */
  function removeFav(slug: string, cat: string) {
    const next = favs.filter(f => !(f.slug === slug && f.category === cat));
    save(FAV_KEY, next); setFavs(next);
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  }
  function removeInt(slug: string, cat: string) {
    const next = ints.filter(i => !(i.slug === slug && i.category === cat));
    save(INT_KEY, next); setInts(next);
    window.dispatchEvent(new CustomEvent('integrations-updated'));
  }
  function clearTab() {
    if (tab === 'favoritos') {
      save(FAV_KEY, []); setFavs([]);
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    } else if (tab === 'integraciones') {
      save(INT_KEY, []); setInts([]);
      window.dispatchEvent(new CustomEvent('integrations-updated'));
    } else {
      const coreKeys = core.map(c => `${c.category}/${c.slug}`);
      const next = ints.filter(i => !coreKeys.includes(`${i.category}/${i.slug}`));
      save(INT_KEY, next); setInts(next);
      window.dispatchEvent(new CustomEvent('integrations-updated'));
    }
  }
  function handleReorder(newTools: StoredTool[]) {
    save(FAV_KEY, newTools); setFavs(newTools);
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  }

  if (!mounted) return (
    <div className="px-4 md:px-6 py-8 max-w-content mx-auto">
      <div className="h-48 rounded-2xl bg-surface0 animate-pulse mb-8" />
      <div className="h-12 rounded-xl bg-surface0 animate-pulse mb-8 max-w-sm" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-36 rounded-xl bg-surface0 animate-pulse" />)}
      </div>
    </div>
  );

  const TAB_CONFIG = {
    favoritos:     { label: 'Favoritos',     count: favs.length, icon: '❤️',  color: '#e78284' },
    integraciones: { label: 'Integraciones', count: ints.length, icon: '⚡',  color: '#e5c890' },
    core:          { label: 'Core Setup',    count: core.length, icon: '⭐',  color: '#ca9ee6' },
  } as const;

  return (
    <div className="px-4 md:px-6 py-8 max-w-content mx-auto">
      <style>{`
        @keyframes dp-border-slide {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes shimmer-bar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer-bar { animation: shimmer-bar 2s ease-in-out infinite; }
      `}</style>

      {/* Share import banner */}
      {shareParam && (
        <ImportBanner
          encoded={shareParam}
          onImport={(f, i) => { setFavs(f); setInts(i); }}
          onDismiss={() => setShareParam(null)}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-surface1 bg-gradient-to-br from-surface0 to-mantle p-6 md:p-8 mb-8">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 60% at 80% 0%, ${rank.color}14 0%, transparent 70%)` }} />
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, #8caaee, #ca9ee6, #e5c890, #a6d189, #8caaee)', backgroundSize: '200% 100%', animation: 'dp-border-slide 3s linear infinite' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: rank.color, opacity: 0.8 }}>
              DevPiece
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-text leading-tight">
              {username ? `Arsenal de ${username}` : 'Mi Arsenal'}
            </h1>

            <div className="mt-4 max-w-sm">
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rank.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: rank.color }}>{rank.title}</span>
                </div>
                <span className="text-xs font-mono text-subtext1">{power}%</span>
              </div>
              <PowerBar power={power} color={rank.color} />
              <p className="text-xs text-subtext1 mt-1.5 italic">{rank.sub}</p>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-black text-red leading-none">{favs.length}</div>
                <div className="text-xs text-subtext1 mt-0.5">Favoritas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black leading-none" style={{ color: '#e5c890' }}>{ints.length}</div>
                <div className="text-xs text-subtext1 mt-0.5">Integradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-mauve leading-none">{core.length}</div>
                <div className="text-xs text-subtext1 mt-0.5">Core</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-5">
              <ShareButton favs={favs} ints={ints} />
              <ProfileManager favs={favs} ints={ints} />
            </div>
          </div>

          {coverageCats.some(c => c.have > 0) && (
            <div className="md:w-64 flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-subtext1 uppercase tracking-wider mb-1">Cobertura</p>
              {coverageCats.map(c => (
                <CoverageBar key={c.cat} label={c.label} have={c.have} total={c.total} accent={c.accent} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 bg-surface0 rounded-xl p-1 w-fit max-w-full overflow-x-auto border border-surface1">
        {(Object.entries(TAB_CONFIG) as [Tab, typeof TAB_CONFIG[Tab]][]).map(([key, cfg]) => (
          <button key={key} onClick={() => { setTab(key); setReorderMode(false); }}
            className={`flex flex-shrink-0 items-center gap-2 px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all duration-200 ${
              tab === key ? 'bg-mantle text-text shadow-sm' : 'text-subtext1 hover:text-text hover:bg-surface1/50'
            }`}>
            <span className="text-base leading-none">{cfg.icon}</span>
            <span>{cfg.label}</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded-full"
              style={tab === key
                ? { backgroundColor: `${cfg.color}22`, color: cfg.color }
                : { backgroundColor: 'rgba(198,208,245,0.1)', color: '#b5bfe2' }}>
              {cfg.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}
      {tabTools.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-surface2 rounded-2xl">
          <div className="text-4xl mb-4">{TAB_CONFIG[tab].icon}</div>
          <p className="font-semibold text-text mb-1">
            {tab === 'favoritos' ? 'Sin favoritos aún' : tab === 'integraciones' ? 'Sin integraciones aún' : 'Core Setup vacío'}
          </p>
          <p className="text-sm text-subtext1 max-w-xs mx-auto">
            {tab === 'favoritos'
              ? 'Pulsa ❤️ en cualquier herramienta para guardarla'
              : tab === 'integraciones'
              ? 'Pulsa ⚡ en una herramienta para marcarla como integrada'
              : 'Las herramientas que tengas en Favoritos e Integraciones a la vez aparecerán aquí'}
          </p>
          <a href="/" className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-blue hover:bg-lavender text-crust text-sm font-semibold rounded-lg transition-colors">
            Explorar herramientas
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6"/>
            </svg>
          </a>
        </div>
      ) : (
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              {tab === 'favoritos' && (
                <button onClick={() => setReorderMode(v => !v)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                    reorderMode
                      ? 'chip chip-lavender font-medium'
                      : 'bg-surface0 hover:bg-surface1 text-subtext1 hover:text-text border-surface1'
                  }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                  {reorderMode ? 'Salir de reordenar' : 'Reordenar'}
                </button>
              )}
              {tab === 'integraciones' && <ExportButton ints={ints} />}
            </div>
            <ClearButton label={`Vaciar ${TAB_CONFIG[tab].label}`} onConfirm={clearTab} />
          </div>

          {/* Content */}
          {tab === 'favoritos' && reorderMode ? (
            <div>
              <p className="text-xs text-subtext1 mb-4">Arrastra para reordenar. El orden se guarda automáticamente.</p>
              <DragList tools={favs} onReorder={handleReorder} />
            </div>
          ) : (
            grouped.map(([cat, tools]) => (
              <CategorySection key={cat} category={cat}
                label={categoryLabels[cat] ?? cat}
                accent={categoryAccents[cat] ?? '#8caaee'}
                tools={tools} isCore={tab === 'core'} favs={favs} ints={ints}
                onRemoveFav={removeFav} onRemoveInt={removeInt}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
