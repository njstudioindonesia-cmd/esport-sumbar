import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';

export interface CommandAction {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  icon?: React.ReactNode;
  badge?: string;
  onSelect?: () => void;
  href?: string;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandAction[];
  placeholder?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  actions,
  placeholder = 'Ketik perintah atau cari menu...',
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter actions
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q))
    );
  }, [actions, query]);

  // Group actions by category
  const categories = useMemo(() => {
    const map = new Map<string, CommandAction[]>();
    for (const a of filteredActions) {
      const cat = a.category || 'Umum';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    }
    return Array.from(map.entries());
  }, [filteredActions]);

  // Reset selectedIndex on filter change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredActions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredActions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = filteredActions[selectedIndex];
        if (action) {
          if (action.onSelect) action.onSelect();
          else if (action.href) window.location.href = action.href;
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-neutral-800 bg-neutral-950/60">
          <Search className="w-5 h-5 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent px-3 py-4 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Results */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-800/40">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Tidak ada perintah atau menu yang cocok dengan "{query}"
            </div>
          ) : (
            categories.map(([category, items]) => (
              <div key={category} className="py-2 first:pt-0 last:pb-0">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  {category}
                </div>
                <div className="space-y-0.5 mt-1">
                  {items.map((action) => {
                    const currentIndex = flatIndex++;
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <div
                        key={action.id}
                        onClick={() => {
                          if (action.onSelect) action.onSelect();
                          else if (action.href) window.location.href = action.href;
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'text-neutral-300 hover:bg-neutral-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {action.icon && (
                            <span
                              className={`shrink-0 ${
                                isSelected ? 'text-amber-400' : 'text-neutral-500'
                              }`}
                            >
                              {action.icon}
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{action.title}</div>
                            {action.subtitle && (
                              <div className="text-[11px] text-neutral-500 truncate">
                                {action.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {action.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                              {action.badge}
                            </span>
                          )}
                          {isSelected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950 text-[11px] text-neutral-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-neutral-400">↑↓</kbd> Navigasi
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-neutral-400">↵</kbd> Pilih
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-neutral-400">Esc</kbd> Tutup
            </span>
          </div>
          <span className="text-amber-500/80 font-semibold text-[10px]">
            ESPORT SUMBAR
          </span>
        </div>
      </div>
    </div>
  );
};
