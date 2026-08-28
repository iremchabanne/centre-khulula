import { Link } from 'react-router-dom';

// The side menu of the staff area.
// Every link is visible for now. Filtering by role and by is_admin comes
// later, once a login gives us the account of the person signed in.
export default function StaffSidebar() {
  return (
    <aside className="w-56 border-r border-khulula-line bg-khulula-ink p-4">
      <p className="mb-6 font-bold text-white">Khulula Staff</p>

      <nav aria-label="Staff" className="flex flex-col gap-2 text-white">
        <Link to="/staff/enclosures">Enclosures</Link>
        <Link to="/staff/animals">Animals</Link>
        <Link to="/staff/donations">Donations</Link>
        <Link to="/staff/accounts">Staff accounts</Link>
      </nav>
    </aside>
  );
}
