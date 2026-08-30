import { NavLink, useNavigate } from 'react-router-dom';

import type { StaffMember } from '../types';

// Same idea as the public header: the page being shown is highlighted.
function itemClasses({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return 'rounded px-3 py-2 bg-khulula-primary font-medium text-white';
  }
  return 'rounded px-3 py-2';
}

type Props = {
  staff: StaffMember;
};

export default function StaffSidebar({ staff }: Props) {
  const navigate = useNavigate();

  async function signOut() {
    // Deletes the session in Redis, not only the cookie in the browser.
    await fetch('/api/auth/logout', { method: 'POST' });
    navigate('/staff/login', { replace: true });
  }

  return (
    <aside className="flex w-56 flex-col bg-khulula-ink p-4 text-sm text-khulula-on-dark">
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

        {/* Both routes behind these links are requireAdmin on the server.
            Hiding them is tidiness; the refusal is the server's. */}
        {staff.is_admin && (
          <NavLink to="/staff/donations" className={itemClasses}>
            Donations
          </NavLink>
        )}
        {staff.is_admin && (
          <NavLink to="/staff/accounts" className={itemClasses}>
            Staff accounts
          </NavLink>
        )}
      </nav>

      {/* mt-auto pushes this block to the bottom of the menu. */}
      <div className="mt-auto border-t border-khulula-on-dark-muted pt-4">
        <p className="px-3 text-white">{staff.full_name}</p>
        <p className="mb-3 px-3 text-xs text-khulula-on-dark-muted">
          {staff.role === 'veterinarian' ? 'Veterinarian' : 'Keeper'}
          {staff.is_admin && ' · Administrator'}
        </p>
        <button
          type="button"
          onClick={signOut}
          className="rounded px-3 py-2 text-left underline"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
