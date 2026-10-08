import { useState, useEffect, useRef, useMemo } from 'react';

/* ── Types ───────────────────────────────────────────────────────────── */
interface StepTool { slug: string; category: string }
interface Step { id: string; title: string; description: string; quickCommands: string[]; tools: StepTool[] }
interface Props {
  slug: string;
  steps: Step[];
  isFavoriteable?: boolean;
}

const FAV_GUIDES_KEY   = 'devpiece-guides-favorites';
const DONE_GUIDES_KEY  = 'devpiece-guides-completed';
const STEPS_PREFIX     = 'devpiece-guide-steps-';
const FAV_TOOLS_KEY    = 'devpiece-favorites';
const INT_TOOLS_KEY    = 'devpiece-integrations';

function loadSteps(slug: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STEPS_PREFIX + slug) ?? '{}'); } catch { return {}; }
}
function saveSteps(slug: string, data: Record<string, boolean>) {
  localStorage.setItem(STEPS_PREFIX + slug, JSON.stringify(data));
}
function isGuideFav(slug: string): boolean {
  try { return (JSON.parse(localStorage.getItem(FAV_GUIDES_KEY) ?? '[]') as string[]).includes(slug); } catch { return false; }
}
function isGuideDone(slug: string): boolean {
  try { return (JSON.parse(localStorage.getItem(DONE_GUIDES_KEY) ?? '[]') as string[]).includes(slug); } catch { return false; }
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function GuideIsland({ slug, steps }: Props) {
  const [stepsDone, setStepsDone] = useState<Record<string, boolean>>({});
  const [fav,       setFav]       = useState(false);
  const [done,      setDone]      = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setStepsDone(loadSteps(slug));
    setFav(isGuideFav(slug));
    setDone(isGuideDone(slug));
    setMounted(true);
  }, [slug]);

  const completedCount = useMemo(() =>
    steps.filter(s => stepsDone[s.id]).length,
  [steps, stepsDone]);
  const allDone = completedCount === steps.length;

  const toggleStep = (id: string) => {
    const next = { ...stepsDone, [id]: !stepsDone[id] };
    setStepsDone(next);
    saveSteps(slug, next);
  };

  const toggleFav = () => {
    const favs: string[] = JSON.parse(localStorage.getItem(FAV_GUIDES_KEY) ?? '[]');
    const next = fav
      ? favs.filter(s => s !== slug)
      : [...favs, slug];
    localStorage.setItem(FAV_GUIDES_KEY, JSON.stringify(next));
    setFav(!fav);
    window.dispatchEvent(new CustomEvent('guide-favorites-updated'));
  };

  const completeGuide = () => {
    // Mark all steps as done
    const allDone: Record<string, boolean> = {};
    steps.forEach(s => { allDone[s.id] = true; });
    setStepsDone(allDone);
    saveSteps(slug, allDone);

    // Mark guide as completed
    const completed: string[] = JSON.parse(localStorage.getItem(DONE_GUIDES_KEY) ?? '[]');
    if (!completed.includes(slug)) {
      completed.unshift(slug);
      localStorage.setItem(DONE_GUIDES_KEY, JSON.stringify(completed));
    }
    setDone(true);

    // Add all tools to favorites + integrations
    const allTools = steps.flatMap(s => s.tools);
    const favs:   any[] = JSON.parse(localStorage.getItem(FAV_TOOLS_KEY)  ?? '[]');
    const ints:   any[] = JSON.parse(localStorage.getItem(INT_TOOLS_KEY)  ?? '[]');

    // We only have slug + category — add with placeholder data
    for (const tool of allTools) {
      const key = `${tool.category}/${tool.slug}`;
      const placeholder = { slug: tool.slug, category: tool.category, name: tool.slug, description: '', tags: [], os: [], accent: '#8caaee' };
      if (!favs.some((f: any) => f.slug === tool.slug && f.category === tool.category)) {
        favs.unshift(placeholder);
      }
      if (!ints.some((i: any) => i.slug === tool.slug && i.category === tool.category)) {
        ints.unshift(placeholder);
      }
    }

    localStorage.setItem(FAV_TOOLS_KEY, JSON.stringify(favs));
    localStorage.setItem(INT_TOOLS_KEY, JSON.stringify(ints));
    window.dispatchEvent(new CustomEvent('favorites-updated'));
    window.dispatchEvent(new CustomEvent('integrations-updated'));

    setCompleting(true);
    setTimeout(() => setCompleting(false), 3000);
  };

  if (!mounted) return (
    <div className="rounded-2xl border border-surface1 bg-surface0 p-5 mb-8 animate-pulse h-32" />
  );

  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <>
      {/* ── Progress panel ────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-5 mb-8 transition-all duration-500 ${done ? 'border-green/40 bg-green/5' : 'border-surface1 bg-surface0'}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {done && <span className="text-green text-lg">✅</span>}
              <span className="text-sm font-semibold text-text">
                {done ? '¡Guía completada!' : `Progreso: ${completedCount}/${steps.length} pasos`}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-surface1 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%`, background: done ? '#a6d189' : 'linear-gradient(90deg, #8caaee, #ca9ee6)' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Favorite button */}
            <button onClick={toggleFav}
              className={`p-2 rounded-lg border transition-all ${fav ? 'text-red border-red/30 bg-red/10' : 'text-subtext1 border-surface1 hover:text-red hover:border-red/30 hover:bg-red/5'}`}
              title={fav ? 'Quitar de favoritos' : 'Guardar guía como favorita'}>
              <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>

            {/* Quick guide toggle */}
            <button onClick={() => setShowQuick(v => !v)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showQuick ? 'chip chip-lavender' : 'bg-surface0 text-subtext1 border-surface1 hover:bg-surface1'}`}>
              ⚡ Guía rápida
            </button>
          </div>
        </div>

        {/* Quick guide accordion */}
        {showQuick && (
          <div className="border border-surface1 rounded-xl bg-crust/50 p-4 mb-4">
            <p className="text-xs font-bold text-subtext1 uppercase tracking-wider mb-3">Solo los comandos</p>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.id}>
                  <p className="text-xs font-semibold text-text mb-1.5">
                    <span className="text-subtext1 mr-1">{i + 1}.</span> {step.title}
                  </p>
                  {step.quickCommands.length > 0 ? (
                    <div className="space-y-1">
                      {step.quickCommands.map((cmd, ci) => (
                        <div key={ci} className="flex items-center gap-2 group">
                          <code className={`flex-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border ${cmd.startsWith('#') ? 'text-subtext1 bg-transparent border-transparent italic' : 'text-green bg-surface0 border-surface1'}`}>
                            {cmd}
                          </code>
                          {!cmd.startsWith('#') && (
                            <button
                              onClick={() => navigator.clipboard.writeText(cmd)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-subtext1 hover:text-text transition-all"
                              title="Copiar">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-subtext1 italic">Ver artículo para detalles</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps list */}
        <div className="space-y-2">
          {steps.map((step, i) => {
            const isComplete = !!stepsDone[step.id];
            return (
              <button key={step.id} onClick={() => toggleStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left group ${
                  isComplete
                    ? 'border-green/30 bg-green/5'
                    : 'border-surface1 hover:border-lavender/40 hover:bg-surface1/30'
                }`}>
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isComplete ? 'border-green bg-green' : 'border-surface2 group-hover:border-lavender'
                }`}>
                  {isComplete && (
                    <svg className="w-3 h-3 text-crust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                {/* Step number */}
                <span className={`text-xs font-mono font-bold flex-shrink-0 ${isComplete ? 'text-green' : 'text-subtext1'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Title */}
                <span className={`text-sm font-medium flex-1 ${isComplete ? 'text-subtext1 line-through decoration-green/50' : 'text-text'}`}>
                  {step.title}
                </span>
                {/* Tools count */}
                {step.tools.length > 0 && (
                  <span className="text-[10px] text-subtext1 font-mono flex-shrink-0">
                    {step.tools.length} tool{step.tools.length > 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Complete guide button */}
        {allDone && !done && (
          <div className="mt-4 pt-4 border-t border-surface1">
            <button onClick={completeGuide}
              className="w-full py-3 rounded-xl bg-green hover:bg-green/80 text-crust font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <span className="text-base">🏆</span>
              Completar guía — añadir tools al arsenal
            </button>
          </div>
        )}

        {completing && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-green/10 border border-green/30 flex items-center gap-2">
            <svg className="w-4 h-4 text-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            <span className="text-sm text-green font-medium">
              ✅ ¡Guía completada! Todas las herramientas añadidas a tu arsenal. +15 puntos de Arsenal Power.
            </span>
          </div>
        )}
      </div>

      {/* ── Sticky bottom progress bar ────────────────────────────── */}
      <BottomProgressBar steps={steps} stepsDone={stepsDone} onToggle={toggleStep} done={done} />
    </>
  );
}

/* ── Sticky bottom bar ──────────────────────────────────────────────── */
function BottomProgressBar({ steps, stepsDone, onToggle, done }: {
  steps: Step[]; stepsDone: Record<string, boolean>;
  onToggle: (id: string) => void; done: boolean;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-advance current step to first incomplete
  useEffect(() => {
    const firstIncomplete = steps.findIndex(s => !stepsDone[s.id]);
    setCurrentIdx(firstIncomplete === -1 ? steps.length - 1 : firstIncomplete);
  }, [steps, stepsDone]);

  const completedCount = steps.filter(s => stepsDone[s.id]).length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const currentStep = steps[currentIdx];

  const prev = () => setCurrentIdx(i => Math.max(0, i - 1));
  const next = () => setCurrentIdx(i => Math.min(steps.length - 1, i + 1));

  const scrollToStep = (idx: number) => {
    const el = document.getElementById(steps[idx]?.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!visible || steps.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:left-[240px]">
      {/* Progress fill */}
      <div className="h-0.5 bg-surface0">
        <div className="h-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: done ? '#a6d189' : 'linear-gradient(90deg, #8caaee, #ca9ee6)' }} />
      </div>

      <div className="bg-mantle/95 backdrop-blur-sm border-t border-surface0 px-4 py-2.5 flex items-center gap-4">
        {/* Step nav */}
        <button onClick={() => { prev(); scrollToStep(currentIdx - 1); }}
          disabled={currentIdx === 0}
          className="p-1.5 rounded-lg text-subtext1 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Current step */}
        {currentStep && (
          <button
            onClick={() => onToggle(currentStep.id)}
            className={`flex items-center gap-2 flex-1 min-w-0 group ${stepsDone[currentStep.id] ? 'text-green' : 'text-subtext1 hover:text-text'}`}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              stepsDone[currentStep.id] ? 'border-green bg-green' : 'border-subtext0 group-hover:border-lavender'
            }`}>
              {stepsDone[currentStep.id] && (
                <svg className="w-2.5 h-2.5 text-crust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </div>
            <span className="text-xs font-medium truncate">
              <span className="text-subtext1 mr-1">Paso {currentIdx + 1}/{steps.length}:</span>
              {currentStep.title}
            </span>
          </button>
        )}

        {/* Progress text */}
        <span className="text-xs text-subtext1 font-mono flex-shrink-0">{progressPct}%</span>

        <button onClick={() => { next(); scrollToStep(currentIdx + 1); }}
          disabled={currentIdx === steps.length - 1}
          className="p-1.5 rounded-lg text-subtext1 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
