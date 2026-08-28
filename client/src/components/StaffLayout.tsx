import { Outlet } from 'react-router-dom';

import StaffSidebar from './StaffSidebar';

// The frame shared by the staff pages: the side menu on the left, the page
// on the right. The login page does not use it — there is no menu before
// signing in.
export default function StaffLayout() {
  return (
    <div className="flex min-h-screen bg-khulula-bg text-khulula-body">
      <StaffSidebar />

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
