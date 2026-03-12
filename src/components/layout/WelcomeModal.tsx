import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';

export function WelcomeModal() {
  const welcomeDismissed = useAppStore((s) => s.welcomeDismissed);
  const dismissWelcome = useAppStore((s) => s.dismissWelcome);

  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Show on mount if not dismissed
  useEffect(() => {
    if (!welcomeDismissed) {
      setIsOpen(true);
    }
  }, [welcomeDismissed]);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      dismissWelcome();
    }
    setIsOpen(false);
  }, [dontShowAgain, dismissWelcome]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="font-mono text-xs"
        style={{
          width: '420px',
          maxWidth: '90vw',
          backgroundColor: 'var(--color-terminal-bg)',
          border: '1px solid var(--color-terminal-border)',
          boxShadow:
            '0 4px 24px rgba(0, 0, 0, 0.8), 0 0 12px color-mix(in srgb, var(--color-terminal-primary) 15%, transparent)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: '1px solid var(--color-terminal-border)' }}
        >
          <span className="text-terminal-primary text-[11px] tracking-widest text-glow">
            [ WELCOME TO GLOBEOPS ]
          </span>
          <button
            className="text-[9px] text-terminal-primary-dim hover:text-terminal-primary cursor-pointer transition-colors"
            onClick={handleClose}
          >
            [x]
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-3 space-y-3 text-terminal-primary-dim leading-relaxed">
          <p>
            Thank you for using <span className="text-terminal-primary">GlobeOps</span>.
          </p>

          <p>
            GlobeOps is a real-time open-source intelligence (OSINT) platform
            that aggregates global events — conflict, seismic activity, weather,
            markets, and more — into a unified terminal-style dashboard. Data is
            pulled from public feeds and rendered on an interactive ASCII world
            map with live overlays.
          </p>

          <p>
            Use the <span className="text-terminal-primary">[CFG]</span> menu to
            toggle modules, <span className="text-terminal-primary">[LAYOUT]</span> to
            switch views, and the map controls to zoom and filter event layers.
          </p>

          <div
            className="px-2 py-1.5"
            style={{
              border: '1px dashed var(--color-terminal-border)',
            }}
          >
            <p>
              This platform is maintained independently and runs on community
              donations. If you find GlobeOps useful, please consider supporting
              the project via the developer's{' '}
              <a
                href="https://github.com/Kahooty"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-primary hover:text-glow underline"
              >
                GitHub profile
              </a>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderTop: '1px solid var(--color-terminal-border)' }}
        >
          <button
            className="flex items-center gap-1.5 cursor-pointer text-terminal-primary-dim hover:text-terminal-primary transition-colors"
            onClick={() => setDontShowAgain((v) => !v)}
          >
            <span className="text-[10px]">{dontShowAgain ? '\u2611' : '\u2610'}</span>
            <span className="text-[9px]">Don't show again</span>
          </button>

          <button
            className="text-terminal-primary-dim hover:text-terminal-primary px-2 py-0.5 cursor-pointer transition-colors"
            style={{ border: '1px solid var(--color-terminal-border)' }}
            onClick={handleClose}
          >
            [ OK ]
          </button>
        </div>
      </div>
    </div>
  );
}
