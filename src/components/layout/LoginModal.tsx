import { useState, useEffect, useRef } from 'react';

interface UserData {
  name: string;
  photo: string;
}

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [preview, setPreview] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('devpiece-user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    const handler = () => { setIsOpen(true); setIsEditing(false); };
    window.addEventListener('open-login-modal', handler);
    return () => window.removeEventListener('open-login-modal', handler);
  }, []);

  // Sync form fields when opening edit form
  useEffect(() => {
    if (isOpen && isEditing && user) {
      setFormName(user.name);
      setFormPhoto(user.photo);
      setPreview(user.photo);
    } else if (isOpen && !user) {
      setFormName('');
      setFormPhoto('');
      setPreview('');
    }
  }, [isOpen, isEditing]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setIsEditing(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormPhoto(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    const userData: UserData = { name: formName.trim(), photo: formPhoto };
    localStorage.setItem('devpiece-user', JSON.stringify(userData));
    setUser(userData);
    close();
    window.dispatchEvent(new CustomEvent('user-updated', { detail: userData }));
  };

  const handleLogout = () => {
    localStorage.removeItem('devpiece-user');
    setUser(null);
    close();
    window.dispatchEvent(new CustomEvent('user-updated', { detail: null }));
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  // Which panel to show
  const showForm = !user || isEditing;

  return (
    <div className="relative" ref={containerRef}>
      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .dv-dropdown {
          animation: dropdown-in 180ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      {/* ── Trigger ── */}
      {user ? (
        <button
          onClick={() => { setIsOpen((v) => !v); setIsEditing(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface0 transition-colors"
          aria-label="Perfil de usuario"
          aria-expanded={isOpen}
        >
          {user.photo ? (
            <img src={user.photo} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-surface1" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue to-lavender flex items-center justify-center text-crust font-bold text-xs">
              {initials}
            </div>
          )}
          <span className="text-sm font-medium text-text hidden sm:block max-w-[120px] truncate">{user.name}</span>
          <svg
            className={`w-3 h-3 text-subtext0 hidden sm:block transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue hover:bg-lavender text-crust font-semibold text-sm rounded-lg transition-colors"
          aria-expanded={isOpen}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Login
        </button>
      )}

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          key={`${showForm}`}
          className="dv-dropdown absolute right-0 top-full mt-2 z-50 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={showForm ? 'Tu perfil' : 'Menú de usuario'}
        >
          {!showForm ? (
            /* Logged-in menu */
            <div className="w-48 bg-mantle border border-surface1 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-surface0">
                <p className="text-xs text-subtext0">Sesión local</p>
                <p className="text-sm font-semibold text-text truncate">{user!.name}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full text-left px-4 py-2.5 text-sm text-subtext1 hover:text-text hover:bg-surface0 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red hover:bg-surface0 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          ) : (
            /* Login / edit form */
            <div className="w-80 bg-mantle border border-surface1 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4 pb-1">
                <div>
                  <h2 className="text-base font-bold text-text">
                    {user ? 'Editar perfil' : 'Tu perfil'}
                  </h2>
                  <p className="text-xs text-subtext0 mt-0.5">Guardado en tu navegador</p>
                </div>
                <button
                  onClick={close}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface0 text-subtext0 hover:text-text transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Photo + name inline */}
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer group/photo flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-surface0 border-2 border-surface1 group-hover/photo:border-blue transition-colors flex items-center justify-center relative">
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-subtext0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      <div className="absolute inset-0 bg-crust/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                  </label>

                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-subtext1 mb-1">Tu nombre</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      placeholder="Ej: Carlos Dev"
                      className="w-full bg-surface0 border border-surface1 focus:border-blue rounded-lg px-3 py-2 text-sm text-text placeholder-subtext0 outline-none transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={close}
                    className="flex-1 px-3 py-2 bg-surface0 hover:bg-surface1 text-subtext1 hover:text-text text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formName.trim()}
                    className="flex-1 px-3 py-2 bg-blue hover:bg-lavender disabled:opacity-40 disabled:cursor-not-allowed text-crust text-sm font-semibold rounded-lg transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
