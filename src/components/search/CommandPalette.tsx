import { useState, useEffect, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';
import type { SearchItem } from '../../lib/search';
import { fuseOptions } from '../../lib/search';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selected, setSelected] = useState(0);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load search index
  useEffect(() => {
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchItem[]) => {
        setItems(data);
        setFuse(new Fuse(data, fuseOptions));
      })
      .catch(() => {});
  }, []);

  // Open/close
  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelected(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? closePalette() : openPalette();
      }
      if (e.key === 'Escape' && open) closePalette();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, openPalette, closePalette]);

  // Custom event from header button
  useEffect(() => {
    const handler = () => openPalette();
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, [openPalette]);

  // Search
  useEffect(() => {
    if (!fuse) return;
    if (!query.trim()) {
      setResults(items.filter((i) => i.featured).slice(0, 10));
      setSelected(0);
      return;
    }
    const r = fuse.search(query).map((r) => r.item);
    setResults(r.slice(0, 15));
    setSelected(0);
  }, [query, fuse, items]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && results[selected]) {
      window.location.href = results[selected].href;
      closePalette();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  // Group results by category
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-crust/70 backdrop-blur-md"
        onClick={closePalette}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-mantle border border-surface1 rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface0">
          <svg className="w-4 h-4 text-lavender flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar herramientas, comandos, configs..."
            className="flex-1 bg-transparent text-text placeholder:text-subtext1 outline-none text-sm"
            aria-autocomplete="list"
            aria-controls="palette-results"
          />
          <kbd className="text-xs bg-surface0 text-subtext1 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="palette-results"
          role="listbox"
          className="max-h-[400px] overflow-y-auto py-2"
        >
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-subtext1 text-sm">
              {query ? 'No se encontraron resultados' : 'Empieza a escribir para buscar...'}
            </div>
          )}

          {!query && results.length > 0 && (
            <div className="px-3 pb-1">
              <span className="text-xs font-semibold text-overlay2 uppercase tracking-wider">
                Destacados
              </span>
            </div>
          )}

          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              {query && (
                <div className="px-3 py-1 mt-2">
                  <span className="text-xs font-semibold text-overlay2 uppercase tracking-wider">
                    {catItems[0]?.categoryLabel ?? cat}
                  </span>
                </div>
              )}
              {catItems.map((item) => {
                const idx = flatIndex++;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    data-index={idx}
                    role="option"
                    aria-selected={selected === idx}
                    onClick={closePalette}
                    className={`flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors ${
                      selected === idx
                        ? 'bg-surface0 text-text'
                        : 'text-subtext1 hover:bg-surface0/50 hover:text-text'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text truncate">
                          {item.name}
                        </span>
                        {item.featured && (
                          <span className="text-xs chip chip-blue px-1.5 py-0.5 rounded-full flex-shrink-0">
                            Destacado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-subtext1 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    {!query && (
                      <span className="text-xs text-overlay1 flex-shrink-0">
                        {item.categoryLabel}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-surface0 px-4 py-2 flex items-center gap-4 text-xs text-subtext1">
          <span className="flex items-center gap-1">
            <kbd className="bg-surface0 px-1 rounded font-mono">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-surface0 px-1 rounded font-mono">↵</kbd> abrir
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-surface0 px-1 rounded font-mono">Esc</kbd> cerrar
          </span>
          <span className="ml-auto">{results.length} resultados</span>
        </div>
      </div>
    </div>
  );
}
