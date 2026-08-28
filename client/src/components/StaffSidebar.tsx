import { NavLink } from 'react-router-dom';

// Same idea as the public header: the page being shown is highlighted.
function itemClasses({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return 'rounded px-3 py-2 bg-khulula-primary font-medium text-white';
  }
  return 'rounded px-3 py-2';
}

// Every link is visible for now. Filtering by role and by is_admin comes once
// a login gives us the account of the person signed in.
export default function StaffSidebar() {
  return (
    <aside className="w-56 bg-khulula-ink p-4 text-sm text-khulula-on-dark">
      <p className="mb-6 font-heading text-lg text-white">Khulula</p>

      <p className="mb-2 px-3 text-xs uppercase tracking-widest text-khulula-on-dark-muted">
        Care
      </p>
      <nav aria-label="Staff" className="flex flex-col gap-1">
        <NavLink to="/staff/enclosures" className={itemClasses}>
          Enclosures
        </NavLink>
        <NavLink to="/staff/animals" className={itemClasses}>
          Animals
        </NavLink>
        <NavLink to="/staff/donations" className={itemClasses}>
          Donations
        </NavLink>
        <NavLink to="/staff/accounts" className={itemClasses}>
          Staff accounts
        </NavLink>
      </nav>
    </aside>
  );
}
