import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="bg-khulula-ink px-8 py-10 text-sm text-khulula-on-dark">
      {/* No menu here: the header carries it on every page. Staff login is the
          one link that exists nowhere else. */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-heading text-white">Khulula</h2>
          <p>A wildlife rehabilitation centre in Limpopo, South Africa.</p>
          <p className="mt-2">We treat, we heal, we release.</p>
        </div>

        <p>
          <Link to="/staff/login">Staff login</Link>
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs text-khulula-on-dark-muted">
        <Link to="/legal">Legal notice</Link>
        <span>Accessibility: partially compliant</span>
        <span>© 2026 Centre Khulula</span>
      </div>
    </footer>
  );
}
