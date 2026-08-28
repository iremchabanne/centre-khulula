import { Link } from 'react-router-dom';

// The top bar of the public site. <Link> changes the page without reloading
// the whole application, which a plain <a> would do.
export default function SiteHeader() {
  return (
    <header className="flex gap-8 border-b border-khulula-line bg-khulula-surface p-4">
      <Link to="/" className="font-bold text-khulula-ink">
        Khulula
      </Link>

      <nav aria-label="Main" className="flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/species">Species</Link>
        <Link to="/animals">Our animals</Link>
        <Link to="/donate">Donate</Link>
      </nav>
    </header>
  );
}
