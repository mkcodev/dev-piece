import { useState, useEffect, useMemo, useCallback } from 'react';
import FilterBar from './FilterBar';
import InstallMenu from '../tools/InstallMenu';

interface ToolEntry {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  os: string[];
  featured: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  install?: Record<string, string | undefined>;
  links?: { repo?: string; docs?: string; website?: string };
  iconSvg: string;
  addedAt: string;
}

const GITHUB_PATH = 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z';

function OutboundLink({ entry }: { entry: ToolEntry }) {
  const l = entry.links;
  const target = l?.repo
    ? { href: l.repo, label: 'Repo', github: true }
    : l?.website
      ? { href: l.website, label: 'Web', github: false }
      : l?.docs
        ? { href: l.docs, label: 'Docs', github: false }
        : null;
  if (!target) return <span />;
  return (
    <a
      href={target.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${target.label} de ${entry.name} (pestaña nueva)`}
      className="inline-flex items-center gap-1.5 min-h-7 -ml-1.5 px-1.5 rounded-md text-xs text-subtext1 transition-colors hover:text-text hover:bg-crust/50"
    >
      {target.github ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={GITHUB_PATH} /></svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></svg>
      )}
      {target.label}
    </a>
  );
}

interface Props {
  tags: string[];
  entries: ToolEntry[];
  category: string;
  accent: string;
}

type OS = 'windows' | 'macos' | 'linux' | 'cross';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type SortBy = 'name' | 'recent' | 'featured';

const DIFF_ORDER: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

const OS_BADGE: Record<string, { label: string; color: string }> = {
  windows: { label: 'Win', color: 'chip chip-blue' },
  macos: { label: 'Mac', color: 'chip chip-mauve' },
  linux: { label: 'Linux', color: 'chip chip-peach' },
  cross: { label: 'Cross', color: 'chip chip-green' },
};

const DIFF_CONFIG: Record<string, { label: string; dotColor: string }> = {
  beginner: { label: 'Principiante', dotColor: 'bg-green' },
  intermediate: { label: 'Intermedio', dotColor: 'bg-yellow' },
  advanced: { label: 'Avanzado', dotColor: 'bg-red' },
};

const FAV_KEY = 'devpiece-favorites';
const INT_KEY = 'devpiece-integrations';
const ALT_KEY = 'devpiece-alternatives';

function getFavs(): Array<Record<string, unknown>> {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]'); } catch { return []; }
}
function getInts(): Array<Record<string, unknown>> {
  try { return JSON.parse(localStorage.getItem(INT_KEY) ?? '[]'); } catch { return []; }
}
function getAlts(): Array<Record<string, unknown>> {
  try { return JSON.parse(localStorage.getItem(ALT_KEY) ?? '[]'); } catch { return []; }
}

function FavoriteButton({ entry, category, accent }: { entry: ToolEntry; category: string; accent: string }) {
  const [isFav, setIsFav] = useState(() =>
    getFavs().some((f) => f.slug === entry.slug && f.category === category)
  );
  useEffect(() => {
    const onUpdate = () => setIsFav(getFavs().some((f) => f.slug === entry.slug && f.category === category));
    window.addEventListener('favorites-updated', onUpdate);
    return () => window.removeEventListener('favorites-updated', onUpdate);
  }, [entry.slug, category]);
  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    let favs = getFavs();
    if (isFav) {
      favs = favs.filter((f) => !(f.slug === entry.slug && f.category === category));
    } else {
      favs.unshift({ slug: entry.slug, category, name: entry.name, description: entry.description, tags: entry.tags, os: entry.os, accent, difficulty: entry.difficulty });
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent('favorites-updated'));
    setIsFav(!isFav);
  }, [isFav, entry, category, accent]);
  return (
    <button onClick={toggle}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-crust/50 transition-colors ${isFav ? 'text-red' : 'text-subtext1 hover:text-red'}`}
      aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
      <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </button>
  );
}

function AlternativeButton({ entry, category }: { entry: ToolEntry; category: string }) {
  const [isAlt, setIsAlt] = useState(() =>
    getAlts().some((a) => a.slug === entry.slug && a.category === category)
  );
  useEffect(() => {
    const onUpdate = () => setIsAlt(getAlts().some((a) => a.slug === entry.slug && a.category === category));
    window.addEventListener('alternatives-updated', onUpdate);
    return () => window.removeEventListener('alternatives-updated', onUpdate);
  }, [entry.slug, category]);
  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    let alts = getAlts();
    if (isAlt) {
      alts = alts.filter((a) => !(a.slug === entry.slug && a.category === category));
    } else {
      alts.unshift({ slug: entry.slug, category, name: entry.name, description: entry.description, tags: entry.tags, os: entry.os });
    }
    localStorage.setItem(ALT_KEY, JSON.stringify(alts));
    window.dispatchEvent(new CustomEvent('alternatives-updated'));
    setIsAlt(!isAlt);
  }, [isAlt, entry, category]);
  return (
    <button onClick={toggle}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-crust/50 transition-colors ${isAlt ? 'text-peach' : 'text-subtext1 hover:text-peach'}`}
      aria-label={isAlt ? 'Quitar alternativa' : 'Marcar como alternativa conocida'}
      title={isAlt ? 'Quitar alternativa' : 'Marcar como alternativa'}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
      </svg>
    </button>
  );
}

function IntegrationButton({ entry, category, accent }: { entry: ToolEntry; category: string; accent: string }) {
  const [isInt, setIsInt] = useState(() =>
    getInts().some((i) => i.slug === entry.slug && i.category === category)
  );
  useEffect(() => {
    const onUpdate = () => setIsInt(getInts().some((i) => i.slug === entry.slug && i.category === category));
    window.addEventListener('integrations-updated', onUpdate);
    return () => window.removeEventListener('integrations-updated', onUpdate);
  }, [entry.slug, category]);
  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    let ints = getInts();
    if (isInt) {
      ints = ints.filter((i) => !(i.slug === entry.slug && i.category === category));
    } else {
      const install = entry.install
        ? Object.fromEntries(Object.entries(entry.install).filter((kv): kv is [string, string] => kv[1] != null))
        : undefined;
      ints.unshift({ slug: entry.slug, category, name: entry.name, description: entry.description, tags: entry.tags, os: entry.os, accent, difficulty: entry.difficulty, install });
    }
    localStorage.setItem(INT_KEY, JSON.stringify(ints));
    window.dispatchEvent(new CustomEvent('integrations-updated'));
    setIsInt(!isInt);
  }, [isInt, entry, category, accent]);
  return (
    <button onClick={toggle}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-crust/50 transition-colors ${isInt ? '' : 'text-subtext1 hover:text-yellow'}`}
      style={isInt ? { color: '#e5c890' } : {}}
      aria-label={isInt ? 'Quitar integración' : 'Marcar como integrado'}
      title={isInt ? 'Quitar integración' : 'Marcar como integrado'}>
      <svg className="w-4 h-4" fill={isInt ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    </button>
  );
}

function InUseBadge({ slug, category }: { slug: string; category: string }) {
  const [show, setShow] = useState(() => getInts().some((i) => i.slug === slug && i.category === category));
  useEffect(() => {
    const onUpdate = () => setShow(getInts().some((i) => i.slug === slug && i.category === category));
    window.addEventListener('integrations-updated', onUpdate);
    return () => window.removeEventListener('integrations-updated', onUpdate);
  }, [slug, category]);
  if (!show) return null;
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
      style={{ background: 'rgba(229,200,144,0.15)', borderColor: 'rgba(229,200,144,0.35)', color: '#e5c890' }}>
      EN USO
    </span>
  );
}

function AltBadge({ slug, category }: { slug: string; category: string }) {
  const check = () => {
    const ints = getInts();
    const catHasInt = ints.some((i) => i.category === category);
    const isInt     = ints.some((i) => i.slug === slug && i.category === category);
    return catHasInt && !isInt;
  };
  const [show, setShow] = useState(check);
  useEffect(() => {
    const onUpdate = () => setShow(check());
    window.addEventListener('integrations-updated', onUpdate);
    return () => window.removeEventListener('integrations-updated', onUpdate);
  }, [slug, category]);
  if (!show) return null;
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
      style={{ background: 'rgba(239,159,118,0.15)', borderColor: 'rgba(239,159,118,0.35)', color: '#ef9f76' }}>
      ALTERNATIVA
    </span>
  );
}

export default function CategoryFilterIsland({ tags, entries, category, accent }: Props) {
  const [filters, setFilters] = useState({
    os: [] as OS[],
    difficulty: [] as Difficulty[],
    sort: 'name' as SortBy,
    activeTags: [] as string[],
    search: '',
  });

  const filtered = useMemo(() => {
    let result = [...entries];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.os.length > 0) {
      result = result.filter((e) =>
        filters.os.some((o) => e.os.includes(o))
      );
    }

    if (filters.difficulty.length > 0) {
      result = result.filter((e) =>
        e.difficulty && filters.difficulty.includes(e.difficulty)
      );
    }

    if (filters.activeTags.length > 0) {
      result = result.filter((e) =>
        filters.activeTags.every((t) => e.tags.includes(t))
      );
    }

    switch (filters.sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'featured':
        result.sort((a, b) => {
          if (a.featured !== b.featured) return b.featured ? 1 : -1;
          return a.name.localeCompare(b.name, 'es');
        });
        break;
    }

    return result;
  }, [entries, filters]);


  return (
    <div>
      <FilterBar tags={tags} onFilterChange={setFilters} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-subtext1">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="font-medium text-subtext1">No se encontraron herramientas</p>
          <p className="text-sm mt-1">Prueba ajustando los filtros</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-subtext1 mb-4">
            Mostrando {filtered.length} de {entries.length} herramienta{entries.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((entry) => (
              <article
                key={entry.slug}
                className="group relative bg-surface0 rounded-xl border border-surface1 hover:border-lavender/40 transition-all duration-200 flex flex-col overflow-hidden"
                style={{ ['--accent' as string]: accent }}
              >
                {entry.featured && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue via-lavender to-mauve" aria-hidden="true" />
                )}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${accent}20`, color: accent }}
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: entry.iconSvg }}
                      />
                      <h2 className="font-semibold text-text text-base leading-tight truncate">{entry.name}</h2>
                      <InUseBadge slug={entry.slug} category={category} />
                      <AltBadge slug={entry.slug} category={category} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex gap-1">
                        {entry.os.slice(0, 3).map((o) => {
                          const cfg = OS_BADGE[o];
                          return cfg ? (
                            <span key={o} className={`text-xs px-1.5 py-0.5 rounded border font-mono leading-none ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                      {entry.difficulty && DIFF_CONFIG[entry.difficulty] && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DIFF_CONFIG[entry.difficulty].dotColor}`}
                          title={`Nivel: ${DIFF_CONFIG[entry.difficulty].label}`}
                          role="img"
                          aria-label={`Nivel: ${DIFF_CONFIG[entry.difficulty].label}`}
                        />
                      )}
                    </div>
                  </div>
                  {entry.install && <InstallMenu name={entry.name} install={entry.install} accent={accent} />}
                  <p className="text-sm text-subtext1 line-clamp-2 leading-relaxed flex-1">
                    {entry.description}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 overflow-hidden max-h-6">
                      {entry.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-crust/50 text-subtext1 border border-surface1 flex-shrink-0">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface1/50">
                    <OutboundLink entry={entry} />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AlternativeButton entry={entry} category={category} />
                      <IntegrationButton entry={entry} category={category} accent={accent} />
                      <FavoriteButton entry={entry} category={category} accent={accent} />
                      <a
                        href={`/${category}/${entry.slug}`}
                        className="text-xs text-lavender hover:text-text font-medium transition-colors flex items-center gap-1"
                      >
                        Ver más
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
