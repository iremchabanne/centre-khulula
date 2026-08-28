import { Link, NavLink } from 'react-router-dom';

// NavLink tells us whether its address is the one on screen, so the current
// page gets the ocre underline. The transparent border keeps the width equal.
function linkClasses({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return 'border-b border-khulula-accent font-medium text-khulula-ink';
  }
  return 'border-b border-transparent text-khulula-body';
}

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-khulula-line bg-khulula-surface px-8 py-4">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-khulula-primary font-heading text-white">
          K
        </span>
        <span>
          <span className="block font-heading text-lg font-semibold text-khulula-ink">
            Khulula
          </span>
          <span className="block text-xs uppercase tracking-widest text-khulula-muted">
            Wildlife Rehabilitation
          </span>
        </span>
      </Link>

      <nav aria-label="Main" className="flex gap-7 text-sm">
        <NavLink to="/" className={linkClasses} end>
          Home
        </NavLink>
        <NavLink to="/species" className={linkClasses}>
          Species
        </NavLink>
        <NavLink to="/animals" className={linkClasses}>
          Our animals
        </NavLink>
      </nav>

      <Link
        to="/donate"
        className="rounded bg-khulula-accent px-5 py-2 text-sm font-medium text-white"
      >
        Donate
      </Link>
    </header>
  );
}
