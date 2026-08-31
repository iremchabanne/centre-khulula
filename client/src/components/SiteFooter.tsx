import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="bg-khulula-ink px-8 py-8 text-sm text-khulula-on-dark">
      {/* The three blocks sit in their own row, and that row is centred in the
          footer rather than stretched across it. */}
      <div className="flex justify-center">
        <div className="flex gap-12">
          <div>
            <h2 className="mb-2 font-heading text-white">Khulula</h2>
            <p>A wildlife rehabilitation centre in Limpopo, South Africa.</p>
            <p className="mt-2">We treat, we heal, we release.</p>
          </div>

          <div className="border-l border-white/10 pl-12 text-khulula-on-dark-muted">
            <p>
              <Link to="/legal">Legal notice</Link>
            </p>
            <p className="mt-2">Accessibility: partially compliant</p>
            <p className="mt-2">© 2026 Centre Khulula</p>
          </div>

          <div className="flex items-center border-l border-white/10 pl-12">
            <Link to="/staff/login" className="underline decoration-1 underline-offset-4">
              Staff login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
