import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { siChocolatey, siDebian, siHomebrew, siNpm, siPnpm, siPypi, siRust } from 'simple-icons';

export type InstallMap = Partial<Record<PmKey, string | undefined>>;
type PmKey = 'winget' | 'scoop' | 'choco' | 'brew' | 'apt' | 'cargo' | 'npm' | 'pnpm' | 'pip' | 'manual';
type OS = 'windows' | 'macos' | 'linux';

const PREF_KEY = 'devpiece-preferred-pm';
const PREF_EVENT = 'preferred-pm-changed';

// Lucide "package" / "download" paths for managers without a brand mark
const PACKAGE_GLYPH = 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12M3.29 7 12 12l8.71-5M7.5 4.27l9 5.15';
const DOWNLOAD_GLYPH = 'M12 15V3M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5';

const PMS: Record<PmKey, { label: string; path: string; stroke?: boolean; os: OS[] }> = {
  winget: { label: 'winget', path: PACKAGE_GLYPH, stroke: true, os: ['windows'] },
  scoop: { label: 'scoop', path: PACKAGE_GLYPH, stroke: true, os: ['windows'] },
  choco: { label: 'choco', path: siChocolatey.path, os: ['windows'] },
  brew: { label: 'brew', path: siHomebrew.path, os: ['macos', 'linux'] },
  apt: { label: 'apt', path: siDebian.path, os: ['linux'] },
  cargo: { label: 'cargo', path: siRust.path, os: ['windows', 'macos', 'linux'] },
  npm: { label: 'npm', path: siNpm.path, os: ['windows', 'macos', 'linux'] },
  pnpm: { label: 'pnpm', path: siPnpm.path, os: ['windows', 'macos', 'linux'] },
  pip: { label: 'pip', path: siPypi.path, os: ['windows', 'macos', 'linux'] },
  manual: { label: 'Manual', path: DOWNLOAD_GLYPH, stroke: true, os: ['windows', 'macos', 'linux'] },
};

const ORDER_BY_OS: Record<OS, PmKey[]> = {
  windows: ['winget', 'scoop', 'choco', 'npm', 'pnpm', 'pip', 'cargo', 'brew', 'apt', 'manual'],
  macos: ['brew', 'npm', 'pnpm', 'pip', 'cargo', 'manual', 'apt', 'winget', 'scoop', 'choco'],
  linux: ['apt', 'brew', 'cargo', 'npm', 'pnpm', 'pip', 'manual', 'winget', 'scoop', 'choco'],
};
const DEFAULT_ORDER: PmKey[] = ['winget', 'scoop', 'choco', 'brew', 'apt', 'cargo', 'npm', 'pnpm', 'pip', 'manual'];

function detectOS(): OS | null {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = (nav.userAgentData?.platform || nav.platform || nav.userAgent || '').toLowerCase();
  if (p.includes('win')) return 'windows';
  if (p.includes('mac') || /iphone|ipad/.test(p)) return 'macos';
  if (p.includes('linux') || p.includes('x11') || p.includes('android')) return 'linux';
  return null;
}

function readPref(): PmKey | null {
  try { return (localStorage.getItem(PREF_KEY) as PmKey | null) ?? null; } catch { return null; }
}

function kindOf(pm: PmKey, value: string): 'command' | 'link' | 'note' {
  if (pm !== 'manual') return 'command';
  if (/^https?:\/\//.test(value)) return 'link';
  return /^(curl|wget|sh|bash|iwr|irm|ext|npx|git|brew|winget|scoop|cargo|go)\b/.test(value) ? 'command' : 'note';
}

function Glyph({ pm }: { pm: PmKey }) {
  const cfg = PMS[pm];
  return cfg.stroke ? (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={cfg.path} />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" aria-hidden="true">
      <path d={cfg.path} />
    </svg>
  );
}

interface Props {
  name: string;
  install?: InstallMap;
  accent?: string;
}

export default function InstallMenu({ name, install, accent = '#babbf1' }: Props) {
  const methods = (Object.keys(PMS) as PmKey[]).filter((k) => install?.[k]);
  const [open, setOpen] = useState(false);
  const [os, setOs] = useState<OS | null>(null);
  const [pref, setPref] = useState<PmKey | null>(null);
  const [copied, setCopied] = useState<PmKey | null>(null);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);

  useEffect(() => {
    setOs(detectOS());
    setPref(readPref());
    const sync = () => setPref(readPref());
    window.addEventListener(PREF_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PREF_EVENT, sync);
      window.removeEventListener('storage', sync);
      window.clearTimeout(timer.current);
    };
  }, []);

  // Close when clicking anywhere outside this menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  if (methods.length === 0) return null;

  const order = os ? ORDER_BY_OS[os] : DEFAULT_ORDER;
  const sorted = [...methods].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const selected: PmKey = pref && methods.includes(pref) ? pref : sorted[0];
  const list = [selected, ...sorted.filter((m) => m !== selected)];
  const recommended = os ? sorted.find((m) => PMS[m].os.includes(os)) : undefined;

  const choose = (pm: PmKey) => {
    try { localStorage.setItem(PREF_KEY, pm); } catch {}
    setPref(pm);
    window.dispatchEvent(new CustomEvent(PREF_EVENT));
  };

  const copy = async (pm: PmKey) => {
    const value = install?.[pm] ?? '';
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value });
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    choose(pm);
    setCopied(pm);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1600);
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[data-install-action]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i === -1) return;
    e.preventDefault();
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
  };

  return (
    <div ref={rootRef} className="install-menu relative" style={{ ['--install-accent' as string]: accent }}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className="install-trigger group/inst inline-flex items-center gap-1.5 min-h-7 rounded-md border border-surface1 bg-crust/50 pl-2 pr-1.5 text-xs font-medium text-subtext1 transition-colors hover:border-surface2 hover:text-text aria-expanded:border-[color:var(--install-accent)] aria-expanded:text-text"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={DOWNLOAD_GLYPH} />
        </svg>
        Instalar
        <span className="font-mono text-2xs text-subtext1 group-hover/inst:text-text">
          {methods.length === 1 ? PMS[methods[0]].label : `${methods.length} métodos`}
        </span>
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 transition-transform duration-base ease-out-expo group-aria-expanded/inst:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        role="region"
        aria-label={`Métodos de instalación de ${name}`}
        onKeyDown={onPanelKey}
        className="install-panel absolute left-0 right-0 top-full z-20 mt-1.5 grid transition-[grid-template-rows,opacity] duration-base ease-out-quart"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
        inert={!open}
      >
        <div className="min-h-0 overflow-hidden rounded-lg border border-surface1 bg-mantle shadow-e3">
          <ul className="max-h-56 space-y-1 overflow-y-auto p-1.5" role="list">
            {list.map((pm) => {
              const value = install?.[pm] ?? '';
              const kind = kindOf(pm, value);
              const isSel = pm === selected;
              return (
                <li
                  key={pm}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors ${isSel ? 'bg-crust/70' : 'border-surface1/60 bg-crust/40'}`}
                  style={isSel ? { borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` } : undefined}
                >
                  <span className="flex w-[4.5rem] flex-shrink-0 items-center gap-1.5 text-2xs font-semibold text-subtext1">
                    <span style={{ color: isSel ? accent : undefined }}><Glyph pm={pm} /></span>
                    {PMS[pm].label}
                  </span>
                  {kind === 'note' ? (
                    <span className="min-w-0 flex-1 truncate text-xs italic text-subtext1">{value}</span>
                  ) : kind === 'link' ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-install-action
                      className="min-w-0 flex-1 truncate text-xs text-lavender underline-offset-2 hover:text-text hover:underline"
                    >
                      Descargar desde {new URL(value).hostname.replace(/^www\./, '')}
                    </a>
                  ) : (
                    <code className="min-w-0 flex-1 truncate bg-transparent p-0 font-mono text-xs text-sky" title={value}>
                      {value}
                    </code>
                  )}
                  {pm === recommended && !isSel && (
                    <span className="hidden flex-shrink-0 text-2xs text-overlay2 sm:inline">tu SO</span>
                  )}
                  {kind === 'command' && (
                    <button
                      type="button"
                      data-install-action
                      onClick={() => copy(pm)}
                      aria-label={copied === pm ? `Copiado comando de ${PMS[pm].label}` : `Copiar comando de ${PMS[pm].label}`}
                      className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors ${
                        copied === pm ? 'text-green' : 'text-subtext1 hover:bg-surface0 hover:text-text'
                      }`}
                    >
                      {copied === pm ? (
                        <svg viewBox="0 0 24 24" className="copy-pop w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="14" height="14" x="8" y="8" rx="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{copied ? 'Comando copiado al portapapeles' : ''}</span>
    </div>
  );
}
