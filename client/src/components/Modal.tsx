import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ title, onClose, children }: Props) {
  const dialog = useRef<HTMLDivElement>(null);

  // The keyboard is left behind the dialog otherwise: focus stays on the button
  // that opened it, and Tab walks the page underneath. tabIndex={-1} is what
  // lets a div receive focus without becoming a Tab stop of its own.
  useEffect(() => {
    dialog.current?.focus();
  }, []);

  // Escape closes the dialog — RGAA 12.x, and it is what a user expects.
  // The returned function removes the listener when the dialog disappears.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded bg-khulula-surface p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-heading text-xl text-khulula-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer">
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
