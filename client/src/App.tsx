import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout';
import StaffLayout from './components/StaffLayout';

import HomePage from './pages/public/HomePage';
import SpeciesListPage from './pages/public/SpeciesListPage';
import SpeciesDetailPage from './pages/public/SpeciesDetailPage';
import AnimalsPage from './pages/public/AnimalsPage';
import DonatePage from './pages/public/DonatePage';
import LegalPage from './pages/public/LegalPage';

import LoginPage from './pages/staff/LoginPage';
import EnclosuresPage from './pages/staff/EnclosuresPage';
import AnimalListPage from './pages/staff/AnimalListPage';
import AnimalDetailPage from './pages/staff/AnimalDetailPage';
import DonationListPage from './pages/staff/DonationListPage';
import StaffAccountsPage from './pages/staff/StaffAccountsPage';
import ErrorPage from './pages/staff/ErrorPage';

// The whole address map of the application, in one place.
// A <Route> reads: this address shows this page.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site — no account needed. The six pages are inside
            PublicLayout, so they all get the same header and footer. */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/species" element={<SpeciesListPage />} />
          <Route path="/species/:id" element={<SpeciesDetailPage />} />
          <Route path="/animals" element={<AnimalsPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/legal" element={<LegalPage />} />
        </Route>

        {/* Login has no side menu, so it stays outside StaffLayout */}
        <Route path="/staff/login" element={<LoginPage />} />

        {/* Staff area — will require a session later */}
        <Route element={<StaffLayout />}>
          <Route path="/staff/enclosures" element={<EnclosuresPage />} />
          <Route path="/staff/animals" element={<AnimalListPage />} />
          <Route path="/staff/animals/:id" element={<AnimalDetailPage />} />
          <Route path="/staff/donations" element={<DonationListPage />} />
          <Route path="/staff/accounts" element={<StaffAccountsPage />} />
        </Route>

        {/* Any address that matches nothing above */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
