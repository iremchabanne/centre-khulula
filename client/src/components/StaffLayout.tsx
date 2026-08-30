import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import StaffSidebar from './StaffSidebar';
import type { StaffMember } from '../types';

// The frame shared by the staff pages: the side menu on the left, the page
// on the right. The login page does not use it — there is no menu before
// signing in.
//
// It is also the gate: every staff page is inside it, so asking the server
// "who am I?" here protects all of them at once.
export default function StaffLayout() {
  // null while the answer has not arrived yet — that is not the same as
  // "nobody is signed in", so the two cases need two different values.
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function loadCurrentStaff() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setStaff(await response.json());
        }
      } catch {
        // The server is unreachable. Treated as "not signed in": the staff
        // pages have nothing to show without it anyway.
      } finally {
        setChecked(true);
      }
    }

    loadCurrentStaff();
  }, []);

  if (!checked) {
    return <p className="p-8 text-khulula-muted">Loading…</p>;
  }

  // No session, or one the server no longer accepts — a deactivated account,
  // or a session that expired. replace: the staff page must not stay in the
  // browser history, or the back button would return to it.
  if (staff === null) {
    return <Navigate to="/staff/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-khulula-bg text-khulula-body">
      <StaffSidebar staff={staff} />

      <main className="flex-1 p-8">
        {/* context hands the account down to whichever page is shown. */}
        <Outlet context={staff} />
      </main>
    </div>
  );
}
