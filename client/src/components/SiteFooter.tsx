import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="bg-khulula-ink px-8 py-8 text-sm text-khulula-on-dark">
      {/* Three blocks of equal width: flex-1 gives each a third, so the two
          hairlines fall exactly at a third and two thirds. */}
      <div className="mx-auto flex max-w-5xl items-center">
        <div className="flex-1 px-8">
          <h2 className="mb-2 font-heading text-white">Khulula</h2>
          <p>A wildlife rehabilitation centre in Limpopo, South Africa.</p>
          <p className="mt-2">We treat, we heal, we release.</p>
        </div>

        <div className="flex-1 border-l border-white/10 px-8 text-khulula-on-dark-muted">
          <p>
            <Link to="/legal">Legal notice</Link>
          </p>
          <p className="mt-2">Accessibility: partially compliant</p>
          <p className="mt-2">© 2026 Centre Khulula</p>
        </div>

        <div className="flex-1 border-l border-white/10 px-8">
          <Link to="/staff/login" className="underline decoration-1 underline-offset-4">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
