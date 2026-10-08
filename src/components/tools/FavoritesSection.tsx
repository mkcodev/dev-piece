import { useState, useEffect } from 'react';

interface FavoriteTool {
  slug: string;
  category: string;
  name: string;
  description: string;
  tags: string[];
  os: string[];
  accent: string;
  difficulty?: string;
}

const STORAGE_KEY = 'devpiece-favorites';

function loadFavorites(): FavoriteTool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function removeFavorite(slug: string, category: string) {
  const favs = loadFavorites().filter((f) => !(f.slug === slug && f.category === category));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  window.dispatchEvent(new CustomEvent('favorites-updated'));
}

const OS_BADGE: Record<string, { label: string; color: string }> = {
  windows: { label: 'Win', color: 'bg-blue/20 text-blue border-blue/30' },
  macos: { label: 'Mac', color: 'bg-mauve/20 text-mauve border-mauve/30' },
  linux: { label: 'Linux', color: 'bg-peach/20 text-peach border-peach/30' },
  cross: { label: 'Cross', color: 'bg-green/20 text-green border-green/30' },
};

export default function FavoritesSection() {
  const [favorites, setFavorites] = useState<FavoriteTool[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    setMounted(true);

    const onUpdate = () => setFavorites(loadFavorites());
    window.addEventListener('favorites-updated', onUpdate);
    return () => window.removeEventListener('favorites-updated', onUpdate);
  }, []);

  if (!mounted) return null;

  const displayed = showAll ? favorites : favorites.slice(0, 6);

  return (
    <section className="mb-16" aria-labelledby="favorites-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="favorites-heading" className="text-xl font-bold text-text flex items-center gap-2">
          <svg className="w-5 h-5 text-red" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          Mis Favoritos
        </h2>
        {favorites.length > 0 && (
          <span className="text-xs text-subtext0">{favorites.length} guardada{favorites.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="relative overflow-hidden bg-surface0/50 border border-dashed border-surface2 rounded-2xl p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-red/5 via-transparent to-pink/5 pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface1 flex items-center justify-center">
              <svg className="w-7 h-7 text-subtext0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <p className="font-semibold text-text mb-1">Sin favoritos aún</p>
            <p className="text-sm text-subtext0 mb-6 max-w-xs mx-auto">
              Pulsa el <span className="text-red">❤</span> en cualquier herramienta para guardarla aquí
            </p>
            <a
              href="/cli-tools"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue hover:bg-lavender text-crust text-sm font-semibold rounded-lg transition-colors"
            >
              Explorar herramientas
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6"/>
              </svg>
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map((tool) => (
              <article
                key={`${tool.category}/${tool.slug}`}
                className="relative bg-surface0 rounded-xl border border-surface1 hover:border-red/30 transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: tool.accent }} aria-hidden="true" />
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <a
                        href={`/${tool.category}/${tool.slug}`}
                        className="font-semibold text-text text-base leading-tight hover:text-blue transition-colors block truncate"
                      >
                        {tool.name}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {tool.os.slice(0, 2).map((o) => {
                        const cfg = OS_BADGE[o];
                        return cfg ? (
                          <span key={o} className={`text-xs px-1.5 py-0.5 rounded border font-mono leading-none ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-subtext1 line-clamp-2 leading-relaxed flex-1">{tool.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-surface1/50">
                    <a
                      href={`/${tool.category}/${tool.slug}`}
                      className="text-xs text-blue hover:text-lavender font-medium transition-colors flex items-center gap-1"
                    >
                      Ver más
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6"/>
                      </svg>
                    </a>
                    <button
                      onClick={() => removeFavorite(tool.slug, tool.category)}
                      className="flex items-center gap-1 text-xs text-red/70 hover:text-red transition-colors"
                      aria-label={`Eliminar ${tool.name} de favoritos`}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {favorites.length > 6 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-sm text-blue hover:text-lavender transition-colors font-medium"
              >
                {showAll ? 'Ver menos' : `Ver ${favorites.length - 6} más`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
