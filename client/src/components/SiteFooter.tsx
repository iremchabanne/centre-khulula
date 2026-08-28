import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="bg-khulula-ink px-8 py-10 text-sm text-khulula-on-dark">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <h2 className="mb-2 font-heading text-white">Khulula</h2>
          <p>
            A wildlife rehabilitation centre in Limpopo, South Africa. We treat,
            we heal, we release.
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-heading text-white">Explore</h2>
          <ul className="grid gap-2">
            <li>
              <Link to="/species">Species</Link>
            </li>
            <li>
              <Link to="/animals">Our animals</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 font-heading text-white">Support</h2>
          <ul className="grid gap-2">
            <li>
              <Link to="/donate">Donate</Link>
            </li>
            <li>
              <Link to="/staff/login">Staff login</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs text-khulula-on-dark-muted">
        <Link to="/legal">Legal notice</Link>
        <span>Accessibility: partially compliant</span>
        <span>© 2026 Centre Khulula</span>
      </div>
    </footer>
  );
}
