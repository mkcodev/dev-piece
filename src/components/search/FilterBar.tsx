import { useState, useEffect, useCallback } from 'react';

type OS = 'windows' | 'macos' | 'linux' | 'cross';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type SortBy = 'name' | 'recent' | 'featured';

interface FilterBarProps {
  tags: string[];
  onFilterChange: (filters: {
    os: OS[];
    difficulty: Difficulty[];
    sort: SortBy;
    activeTags: string[];
    search: string;
  }) => void;
}

const OS_OPTIONS: { value: OS; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'cross', label: 'Cross-platform' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: 'beginner', label: 'Principiante', color: 'text-green border-green/30 bg-green/10' },
  { value: 'intermediate', label: 'Intermedio', color: 'text-yellow border-yellow/30 bg-yellow/10' },
  { value: 'advanced', label: 'Avanzado', color: 'text-red border-red/30 bg-red/10' },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'name', label: 'Nombre A-Z' },
  { value: 'recent', label: 'Más Recientes' },
  { value: 'featured', label: 'Destacados primero' },
];

export default function FilterBar({ tags, onFilterChange }: FilterBarProps) {
  const [selectedOS, setSelectedOS] = useState<OS[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty[]>([]);
  const [sort, setSort] = useState<SortBy>('name');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);

  // Sync from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlOS = params.getAll('os') as OS[];
    const urlDiff = params.getAll('difficulty') as Difficulty[];
    const urlSort = (params.get('sort') as SortBy) || 'name';
    const urlTags = params.getAll('tag');
    const urlSearch = params.get('q') || '';
    setSelectedOS(urlOS);
    setSelectedDifficulty(urlDiff);
    setSort(urlSort);
    setActiveTags(urlTags);
    setSearch(urlSearch);
  }, []);

  const updateURL = useCallback((
    os: OS[], diff: Difficulty[], s: SortBy, tags: string[], q: string
  ) => {
    const params = new URLSearchParams();
    os.forEach((v) => params.append('os', v));
    diff.forEach((v) => params.append('difficulty', v));
    if (s !== 'name') params.set('sort', s);
    tags.forEach((t) => params.append('tag', t));
    if (q) params.set('q', q);
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, []);

  const emit = useCallback((
    os: OS[], diff: Difficulty[], s: SortBy, tags: string[], q: string
  ) => {
    onFilterChange({ os, difficulty: diff, sort: s, activeTags: tags, search: q });
    updateURL(os, diff, s, tags, q);
  }, [onFilterChange, updateURL]);

  const toggleOS = (v: OS) => {
    const next = selectedOS.includes(v)
      ? selectedOS.filter((x) => x !== v)
      : [...selectedOS, v];
    setSelectedOS(next);
    emit(next, selectedDifficulty, sort, activeTags, search);
  };

  const toggleDifficulty = (v: Difficulty) => {
    const next = selectedDifficulty.includes(v)
      ? selectedDifficulty.filter((x) => x !== v)
      : [...selectedDifficulty, v];
    setSelectedDifficulty(next);
    emit(selectedOS, next, sort, activeTags, search);
  };

  const toggleTag = (tag: string) => {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    setActiveTags(next);
    emit(selectedOS, selectedDifficulty, sort, next, search);
  };

  const handleSort = (v: SortBy) => {
    setSort(v);
    emit(selectedOS, selectedDifficulty, v, activeTags, search);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    emit(selectedOS, selectedDifficulty, sort, activeTags, q);
  };

  const clearAll = () => {
    setSelectedOS([]);
    setSelectedDifficulty([]);
    setSort('name');
    setActiveTags([]);
    setSearch('');
    emit([], [], 'name', [], '');
  };

  const hasFilters = selectedOS.length > 0 || selectedDifficulty.length > 0 || activeTags.length > 0 || search;
  const visibleTags = showAllTags ? tags : tags.slice(0, 12);

  return (
    <div className="bg-mantle/50 border border-surface0 rounded-xl p-4 space-y-4 mb-6">
      {/* Search input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Filtrar en esta categoría..."
          className="w-full pl-9 pr-4 py-2 bg-surface0 border border-surface1 rounded-lg text-sm text-text placeholder:text-subtext0 outline-none focus:border-blue/50 transition-colors"
          aria-label="Filtrar herramientas"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {/* OS filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-overlay2 uppercase tracking-wider mr-1">OS:</span>
          <button
            onClick={() => { setSelectedOS([]); emit([], selectedDifficulty, sort, activeTags, search); }}
            className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
              selectedOS.length === 0
                ? 'bg-blue/20 text-blue border-blue/30'
                : 'text-subtext1 border-surface1 hover:border-surface2'
            }`}
          >
            Todos
          </button>
          {OS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleOS(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                selectedOS.includes(opt.value)
                  ? 'bg-blue/20 text-blue border-blue/30'
                  : 'text-subtext1 border-surface1 hover:border-surface2'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-overlay2 uppercase tracking-wider mr-1">Nivel:</span>
          <button
            onClick={() => { setSelectedDifficulty([]); emit(selectedOS, [], sort, activeTags, search); }}
            className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
              selectedDifficulty.length === 0
                ? 'bg-blue/20 text-blue border-blue/30'
                : 'text-subtext1 border-surface1 hover:border-surface2'
            }`}
          >
            Todos
          </button>
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleDifficulty(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                selectedDifficulty.includes(opt.value)
                  ? opt.color
                  : 'text-subtext1 border-surface1 hover:border-surface2'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-overlay2 uppercase tracking-wider mr-1">Orden:</span>
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value as SortBy)}
            className="px-2.5 py-1 bg-surface0 border border-surface1 rounded-lg text-xs text-subtext1 outline-none focus:border-blue/50 transition-colors cursor-pointer"
            aria-label="Ordenar por"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-2.5 py-1 rounded-lg text-xs border border-red/30 text-red bg-red/10 hover:bg-red/20 transition-all ml-auto"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-overlay2 uppercase tracking-wider mr-1">Tags:</span>
          {visibleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-0.5 rounded-full text-xs border transition-all ${
                activeTags.includes(tag)
                  ? 'bg-mauve/20 text-mauve border-mauve/30'
                  : 'text-subtext0 border-surface1 hover:border-surface2 hover:text-subtext1'
              }`}
            >
              #{tag}
            </button>
          ))}
          {tags.length > 12 && (
            <button
              onClick={() => setShowAllTags((v) => !v)}
              className="text-xs text-blue hover:text-lavender transition-colors ml-1"
            >
              {showAllTags ? 'Ver menos' : `+${tags.length - 12} más`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
