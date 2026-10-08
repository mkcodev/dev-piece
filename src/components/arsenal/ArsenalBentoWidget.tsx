import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ── Icon maps (CDN-verified slugs) ─────────────────────────────────── */
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

interface StoredTool { slug: string; category: string; name: string; accent: string; }

const FAV_KEY  = 'devpiece-favorites';
const INT_KEY  = 'devpiece-integrations';

function load(key: string): StoredTool[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}

/* ── Animated counter hook ───────────────────────────────────────────── */
function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

/* ── Single tool logo ────────────────────────────────────────────────── */
function ToolLogo({ tool, size = 36 }: { tool: StoredTool; size?: number }) {
  const [failed, setFailed] = useState(false);
  const iconSlug = SLUG_ICONS[tool.slug] ?? CATEGORY_ICONS[tool.category];
  const s = size;
  const img = Math.round(s * 0.55);
  return (
    <div
      style={{ width: s, height: s, backgroundColor: `${tool.accent}22`, borderRadius: 10, flexShrink: 0 }}
      className="flex items-center justify-center overflow-hidden"
    >
      {iconSlug && !failed ? (
        <img
          src={`https://cdn.simpleicons.org/${iconSlug}`}
          alt="" width={img} height={img}
          style={{ width: img, height: img, objectFit: 'contain' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-bold" style={{ fontSize: img * 0.7, color: tool.accent }}>
          {tool.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/* ── Floating logo (background deco) ────────────────────────────────── */
function FloatingLogo({ tool, style }: { tool: StoredTool; style: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const iconSlug = SLUG_ICONS[tool.slug] ?? CATEGORY_ICONS[tool.category];
  return (
    <div
      className="absolute pointer-events-none"
      style={style}
      aria-hidden="true"
    >
      <div
        style={{ width: 38, height: 38, backgroundColor: `${tool.accent}18`, borderRadius: 10, border: `1px solid ${tool.accent}25` }}
        className="flex items-center justify-center"
      >
        {iconSlug && !failed ? (
          <img src={`https://cdn.simpleicons.org/${iconSlug}`} alt="" width={20} height={20}
            style={{ width: 20, height: 20, objectFit: 'contain', opacity: 0.7 }}
            onError={() => setFailed(true)}
          />
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, color: tool.accent, opacity: 0.7 }}>
            {tool.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Small right card (Favoritos / Integraciones) ───────────────────── */
function SmallCard({
  href, label, icon, count, tools, emptyHint, accentColor, gradFrom, gradTo,
}: {
  href: string; label: string; icon: React.ReactNode;
  count: number; tools: StoredTool[]; emptyHint: string;
  accentColor: string; gradFrom: string; gradTo: string;
}) {
  const animCount = useCounter(count);
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-2xl border bg-surface0 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg no-underline"
      style={{ borderColor: `${accentColor}30` }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor}12 0%, transparent 70%)` }} />
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }} />

      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-semibold text-text">{label}</span>
          </div>
          <span className="text-2xl font-black tabular-nums" style={{ color: accentColor }}>{animCount}</span>
        </div>

        {tools.length > 0 ? (
          <div className="flex gap-1.5 flex-wrap">
            {tools.slice(0, 5).map((t) => (
              <div
                key={`${t.category}/${t.slug}`}
                className="transition-transform duration-200 hover:scale-110"
                title={t.name}
              >
                <ToolLogo tool={t} size={32} />
              </div>
            ))}
            {count > 5 && (
              <div className="w-8 h-8 rounded-[10px] bg-surface1 flex items-center justify-center text-xs text-subtext1 font-medium">
                +{count - 5}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-subtext1 italic">{emptyHint}</p>
        )}
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main export
══════════════════════════════════════════════════════════════════════ */
export default function ArsenalBentoWidget() {
  const [favs, setFavs]  = useState<StoredTool[]>([]);
  const [ints, setInts]  = useState<StoredTool[]>([]);
  const [mounted, setMounted] = useState(false);
  const mainRef = useRef<HTMLAnchorElement>(null);
  const titleCountTarget = useMemo(() => {
    const slugs = new Set([...favs.map(f => `${f.category}/${f.slug}`), ...ints.map(i => `${i.category}/${i.slug}`)]);
    return slugs.size;
  }, [favs, ints]);
  const animTotal = useCounter(titleCountTarget, 1600);

  useEffect(() => {
    const refresh = () => { setFavs(load(FAV_KEY)); setInts(load(INT_KEY)); };
    refresh(); setMounted(true);
    window.addEventListener('favorites-updated',    refresh);
    window.addEventListener('integrations-updated', refresh);
    return () => {
      window.removeEventListener('favorites-updated',    refresh);
      window.removeEventListener('integrations-updated', refresh);
    };
  }, []);

  /* 3-D tilt + cursor gradient */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = mainRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    const rx = ((e.clientY - r.top)  / r.height - 0.5) * -9;
    const ry = ((e.clientX - r.left) / r.width  - 0.5) *  9;
    el.style.setProperty('--gx', `${x}%`);
    el.style.setProperty('--gy', `${y}%`);
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
  }, []);
  const handleMouseLeave = useCallback(() => {
    const el = mainRef.current; if (!el) return;
    el.style.setProperty('--gx', '50%'); el.style.setProperty('--gy', '50%');
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
  }, []);

  if (!mounted) return (
    <section className="mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 h-52 rounded-2xl bg-surface0 animate-pulse" />
        <div className="flex flex-col gap-3">
          <div className="h-[98px] rounded-2xl bg-surface0 animate-pulse" />
          <div className="h-[98px] rounded-2xl bg-surface0 animate-pulse" />
        </div>
      </div>
    </section>
  );

  /* floating logo positions */
  const floatingTools = [...favs, ...ints]
    .filter((t, i, arr) => arr.findIndex(x => x.slug === t.slug && x.category === t.category) === i)
    .slice(0, 9);
  const POSITIONS = [
    { top: '12%', left: '62%' }, { top: '28%', left: '78%' }, { top: '55%', left: '68%' },
    { top: '72%', left: '55%' }, { top: '18%', left: '48%' }, { top: '62%', left: '82%' },
    { top: '42%', left: '58%' }, { top: '80%', left: '70%' }, { top: '35%', left: '88%' },
  ];

  return (
    <section className="mb-16" aria-label="Mi Arsenal">
      <style>{`
        @keyframes dp-float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-10px) rotate(2deg); }
          66%      { transform: translateY(-5px) rotate(-1.5deg); }
        }
        @keyframes dp-shimmer {
          0%   { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(320%)  skewX(-18deg); }
        }
        @keyframes dp-border-glow {
          0%,100% { opacity: 0.7; } 50% { opacity: 1; }
        }
        .dp-main {
          transform-style: preserve-3d;
          transform: perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
          transition: transform 0.12s ease-out, box-shadow 0.3s ease;
        }
        .dp-main:hover {
          transition: transform 0.06s ease-out, box-shadow 0.15s ease;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 40px rgba(138,173,244,0.1);
        }
        .dp-shimmer::before {
          content:''; position:absolute; inset:0; z-index:3;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.055) 50%, transparent 60%);
          animation: dp-shimmer 4s ease-in-out infinite;
          pointer-events:none; border-radius:inherit;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* ── Main Arsenal block (2/3) ─────────────────────────────── */}
        <a
          ref={mainRef}
          href="/arsenal"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="dp-main dp-shimmer lg:col-span-2 relative overflow-hidden rounded-2xl border border-surface1 bg-gradient-to-br from-surface0 via-surface0 to-mantle block no-underline cursor-pointer group"
          style={{ '--gx': '50%', '--gy': '50%', '--rx': '0deg', '--ry': '0deg' } as React.CSSProperties}
        >
          {/* Cursor radial glow */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle 220px at var(--gx) var(--gy), rgba(138,173,244,0.14) 0%, transparent 100%)' }}
          />
          {/* Static ambient glow */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(202,158,230,0.4) 0%, transparent 70%)' }}
          />
          {/* Animated top gradient border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: 'linear-gradient(90deg, #8caaee, #ca9ee6, #e5c890, #a6d189, #8caaee)', backgroundSize: '200% 100%', animation: 'dp-border-glow 3s ease-in-out infinite' }}
          />

          {/* Floating logos */}
          {floatingTools.map((tool, i) => (
            <FloatingLogo
              key={`${tool.category}/${tool.slug}`}
              tool={tool}
              style={{
                ...POSITIONS[i] as React.CSSProperties,
                animation: `dp-float ${3.2 + i * 0.5}s ease-in-out ${i * 0.35}s infinite`,
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 p-7 flex flex-col justify-between min-h-[210px]">
            <div>
              <p className="text-xs font-bold text-blue uppercase tracking-widest mb-2 opacity-80">
                Tu Arsenal DevPiece
              </p>
              <h2 className="text-[3.25rem] font-black text-text leading-none tracking-tight">
                Mi Arsenal
              </h2>
              <p className="text-sm text-subtext1 mt-2.5">
                {titleCountTarget === 0
                  ? 'Empieza a construir tu setup definitivo'
                  : `${animTotal} herramienta${animTotal !== 1 ? 's' : ''} en tu arsenal`
                }
              </p>
            </div>

            <div className="flex items-end justify-between mt-6">
              <div className="flex gap-6">
                <div>
                  <div className="text-4xl font-black text-red tabular-nums leading-none">
                    {favs.length}
                  </div>
                  <p className="text-xs text-subtext1 mt-1">Guardadas</p>
                </div>
                <div>
                  <div className="text-4xl font-black tabular-nums leading-none" style={{ color: '#e5c890' }}>
                    {ints.length}
                  </div>
                  <p className="text-xs text-subtext1 mt-1">Integradas</p>
                </div>
              </div>

              {/* CTA — slides in on hover */}
              <div className="flex items-center gap-1.5 text-sm font-semibold text-blue group-hover:text-lavender transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                Ver Mi Arsenal
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </a>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <SmallCard
            href="/arsenal?tab=favoritos"
            label="Favoritos"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#e78284' }}>
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            }
            count={favs.length}
            tools={favs}
            emptyHint="Pulsa ❤️ en cualquier herramienta"
            accentColor="#e78284"
            gradFrom="rgba(231,130,132,0.7)"
            gradTo="rgba(244,135,162,0.5)"
          />
          <SmallCard
            href="/arsenal?tab=integraciones"
            label="Integradas"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#e5c890' }}>
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            }
            count={ints.length}
            tools={ints}
            emptyHint="Pulsa ⚡ para marcar como integrado"
            accentColor="#e5c890"
            gradFrom="rgba(229,200,144,0.7)"
            gradTo="rgba(239,159,118,0.5)"
          />
        </div>
      </div>
    </section>
  );
}
