import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import AdmissionDialog from './AdmissionDialog';
import Button from '../../components/Button';
import EnclosureOverview from './EnclosureOverview';
import EnclosureTable from './EnclosureTable';
import type { Dashboard, Enclosure } from './enclosureTypes';
import type { StaffMember } from '../../types';

// Screen 8 of arborescence-ecrans.md: Overview, and Manage for administrators.

export default function EnclosuresPage() {
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showAdmission, setShowAdmission] = useState(false);
  const [tab, setTab] = useState<'overview' | 'manage'>('overview');
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();
  // The account StaffLayout looked up. Only administrators see the Manage tab.
  const staff = useOutletContext<StaffMember>();

  // Called when the page opens, and again after an admission.
  async function load() {
    try {
      const dashboardResponse = await fetch('/api/dashboard');
      const enclosuresResponse = await fetch('/api/enclosures');

      // The session died while the page was open. This is the case the
      // session-expired screen exists for.
      if (dashboardResponse.status === 401 || enclosuresResponse.status === 401) {
        navigate('/staff/session-expired', { replace: true });
        return;
      }

      if (!dashboardResponse.ok || !enclosuresResponse.ok) {
        setLoadError('The enclosures could not be loaded.');
        return;
      }

      setDashboard(await dashboardResponse.json());
      setEnclosures(await enclosuresResponse.json());
    } catch {
      setLoadError('The server cannot be reached.');
    } finally {
      setLoading(false);
    }
  }

  // The empty list means: run once, when the page opens.
  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <p className="text-khulula-muted">Loading…</p>;
  }

  if (loadError !== '') {
    return <p className="text-khulula-error">{loadError}</p>;
  }

  // Nothing can be admitted with no free enclosure, so the button is dead from
  // the start rather than opening a dialog that could go nowhere.
  const centreIsFull = dashboard !== null && dashboard.free === 0;

  // RG16 — an enclosure goes under maintenance only while it is free. The
  // server refuses the rest; the button only avoids asking for it.
  async function toggleMaintenance(enclosure: Enclosure) {
    setActionError('');

    const response = await fetch(`/api/enclosures/${enclosure.id}/maintenance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_under_maintenance: enclosure.status !== 'maintenance' }),
    });

    if (response.status === 401) {
      navigate('/staff/session-expired', { replace: true });
      return;
    }

    if (!response.ok) {
      const body = await response.json();
      setActionError(body.error);
      return;
    }

    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 font-heading text-2xl text-khulula-ink">Enclosures</h1>
          <p className="text-sm text-khulula-muted">
            Live occupancy. Status is derived automatically from current stays (RG3).
          </p>
          {centreIsFull && (
            <p role="status" className="mt-2 text-sm text-khulula-error">
              No enclosure is free. Nothing can be admitted until one is released or comes out of
              maintenance.
            </p>
          )}
        </div>
        <Button onClick={() => setShowAdmission(true)} disabled={centreIsFull}>
          Admit an animal
        </Button>
      </div>

      {/* Two buttons and a state variable. The Manage tab is administrators
          only; hiding it is comfort, the route itself is requireAdmin. */}
      {staff.is_admin && (
        <div role="tablist" aria-label="Enclosure views" className="mb-6 flex gap-2">
          <button
            role="tab"
            aria-selected={tab === 'overview'}
            onClick={() => setTab('overview')}
            className={tabClasses(tab === 'overview')}
          >
            Overview
          </button>
          <button
            role="tab"
            aria-selected={tab === 'manage'}
            onClick={() => setTab('manage')}
            className={tabClasses(tab === 'manage')}
          >
            Manage the park
          </button>
        </div>
      )}

      {actionError !== '' && (
        <p role="status" className="mb-4 text-sm text-khulula-error">
          {actionError}
        </p>
      )}

      {tab === 'manage' ? (
        <EnclosureTable enclosures={enclosures} onToggleMaintenance={toggleMaintenance} />
      ) : (
        <EnclosureOverview dashboard={dashboard} enclosures={enclosures} />
      )}

      {showAdmission && (
        <AdmissionDialog
          onClose={() => setShowAdmission(false)}
          onAdmitted={() => {
            setShowAdmission(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function tabClasses(isActive: boolean) {
  if (isActive) {
    return 'rounded border border-khulula-primary px-3 py-2 text-sm font-medium text-khulula-primary';
  }
  return 'rounded border border-khulula-line px-3 py-2 text-sm text-khulula-muted';
}
