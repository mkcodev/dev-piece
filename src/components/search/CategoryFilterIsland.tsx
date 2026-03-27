import { useState, useEffect, useMemo } from 'react';
import FilterBar from './FilterBar';

interface ToolEntry {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  os: string[];
  featured: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  install?: Record<string, string | undefined>;
  addedAt: string;
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
  windows: { label: 'Win', color: 'bg-blue/20 text-blue border-blue/30' },
  macos: { label: 'Mac', color: 'bg-mauve/20 text-mauve border-mauve/30' },
  linux: { label: 'Linux', color: 'bg-peach/20 text-peach border-peach/30' },
  cross: { label: 'Cross', color: 'bg-green/20 text-green border-green/30' },
};

const DIFF_CONFIG: Record<string, { label: string; dotColor: string }> = {
  beginner: { label: 'Principiante', dotColor: 'bg-green' },
  intermediate: { label: 'Intermedio', dotColor: 'bg-yellow' },
  advanced: { label: 'Avanzado', dotColor: 'bg-red' },
};

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

  const firstInstall = (install?: Record<string, string | undefined>) => {
    if (!install) return null;
    const entry = Object.entries(install).find(([, v]) => v);
    return entry ? entry[1] : null;
  };

  return (
    <div>
      <FilterBar tags={tags} onFilterChange={setFilters} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-subtext0">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="font-medium text-subtext1">No se encontraron herramientas</p>
          <p className="text-sm mt-1">Prueba ajustando los filtros</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-subtext0 mb-4">
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
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: `${accent}30`, color: accent }}
                        aria-hidden="true"
                      >
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-text text-base leading-tight truncate">{entry.name}</h3>
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
                  <p className="text-sm text-subtext1 line-clamp-2 leading-relaxed flex-1">
                    {entry.description}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 overflow-hidden max-h-6">
                      {entry.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-surface1 text-subtext0 border border-surface1 flex-shrink-0">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface1/50">
                    {firstInstall(entry.install) ? (
                      <code className="text-xs text-sky bg-crust/50 px-2 py-1 rounded font-mono truncate max-w-[60%]">
                        {firstInstall(entry.install)}
                      </code>
                    ) : <span />}
                    <a
                      href={`/${category}/${entry.slug}`}
                      className="text-xs text-blue hover:text-lavender font-medium transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      Ver más
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6"/>
                      </svg>
                    </a>
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
