import { Outlet } from 'react-router-dom';

import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

// The frame shared by the six public pages: header, page, footer.
// <Outlet /> is the hole where React Router puts the page of the current
// address, so the header and the footer are written once and not six times.
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-khulula-bg text-khulula-body">
      <SiteHeader />

      <main className="p-8">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
