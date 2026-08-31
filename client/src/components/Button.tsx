import type { ReactNode } from 'react';

// The three variants of charte-graphique.md §5. No other button style exists.
// min-h-11 is the 44 px minimum click area the same section asks for.
type Props = {
  children: ReactNode;
  // "reset" empties the fields of the form it sits in, without any code.
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'accent' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
}: Props) {
  let variantClasses = 'bg-khulula-primary text-white';

  if (variant === 'accent') {
    variantClasses = 'bg-khulula-accent text-white';
  }

  if (variant === 'ghost') {
    variantClasses = 'border border-khulula-line-strong bg-khulula-surface-alt text-khulula-ink';
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 rounded px-3 py-2 font-medium disabled:opacity-60 ${variantClasses}`}
    >
      {children}
    </button>
  );
}
