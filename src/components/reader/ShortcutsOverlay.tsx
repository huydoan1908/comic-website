'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShortcutsOverlayProps {
  viewMode: 'single' | 'continuous';
  onClose: () => void;
}

const SHARED_SHORTCUTS: Array<[string, string]> = [
  ['V', 'Switch page / scroll view'],
  ['W', 'Cycle page width'],
  ['C or M', 'Chapter list'],
  ['H', 'Hide or show the controls'],
  ['T', 'Back to top'],
  ['Esc', 'Close this and other overlays'],
  ['?', 'This list'],
];

/** Keyboard reference, reachable with `?` and from the controls. */
export function ShortcutsOverlay({ viewMode, onClose }: ShortcutsOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const navigation: Array<[string, string]> =
    viewMode === 'single'
      ? [
          ['Left / Right', 'Previous or next page'],
          ['Shift + Left / Right', 'Previous or next chapter'],
        ]
      : [
          ['Left / Right', 'Previous or next chapter'],
          ['Space, Up / Down', 'Scroll the chapter'],
        ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-heading"
        tabIndex={-1}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/20 p-4">
          <h2 id="shortcuts-heading" className="text-lg font-semibold text-foreground">
            Keyboard shortcuts
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0"
            aria-label="Close keyboard shortcuts"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <dl className="divide-y divide-border">
          {[...navigation, ...SHARED_SHORTCUTS].map(([keys, description]) => (
            <div key={keys} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <dt className="shrink-0 rounded border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground">
                {keys}
              </dt>
              <dd className="text-right text-sm text-muted-foreground">{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
