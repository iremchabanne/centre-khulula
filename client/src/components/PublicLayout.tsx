import { Outlet } from 'react-router-dom';

import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

// The frame shared by the six public pages: header, page, footer.
// <Outlet /> is the hole where React Router puts the page of the current
// address, so the header and the footer are written once and not six times.
export default function PublicLayout() {
  return (
    // A column as tall as the window, where <main> takes all the space left:
    // the footer is pushed to the bottom even when the page is short.
    <div className="flex min-h-screen flex-col bg-khulula-bg text-khulula-body">
      {/* Hidden until it is focused: the first Tab of the page offers it, so
          the menu can be jumped over instead of tabbed through every time. */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:m-3 focus:rounded focus:bg-khulula-primary focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="content" className="flex-1 p-8">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
