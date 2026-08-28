import { Link } from 'react-router-dom';

// The bottom bar of the public site.
export default function SiteFooter() {
  return (
    <footer className="border-t border-khulula-line p-4 text-khulula-muted">
      <Link to="/legal">Legal notice</Link>
      <p>Khulula Wildlife Rehabilitation Centre</p>
    </footer>
  );
}
