import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import AdmissionDialog from './AdmissionDialog';
import Button from '../../components/Button';
import type { StaffMember } from '../../types';

// Screen 8 of arborescence-ecrans.md: Overview, and Manage for administrators.
type Enclosure = {
  id: number;
  code: string;
  type: string;
  status: 'free' | 'occupied' | 'maintenance';
  occupant: { animal_id: number; name: string; since: string } | null;
};

type Dashboard = {
  occupied: number;
  free: number;
  maintenance: number;
  occupancy_rate: number;
  average_stay_days: number | null;
};

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
          <h1 className="font-heading text-2xl text-khulula-ink">Enclosures</h1>
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
        <ManageTable enclosures={enclosures} onToggleMaintenance={toggleMaintenance} />
      ) : (
        <Overview
          dashboard={dashboard}
          enclosures={enclosures}
        />
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

function Overview({
  dashboard,
  enclosures,
}: {
  dashboard: Dashboard | null;
  enclosures: Enclosure[];
}) {
  return (
    <div>
      {dashboard && (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi value={String(dashboard.occupied)} label="Occupied" />
          <Kpi value={String(dashboard.free)} label="Free" />
          <Kpi value={String(dashboard.maintenance)} label="Maintenance" />
          <Kpi value={`${dashboard.occupancy_rate}%`} label="Occupancy rate" />
          <Kpi
            // null means no stay has ended yet, which is not the same as zero.
            value={dashboard.average_stay_days === null ? '—' : `${dashboard.average_stay_days} d`}
            label="Average stay"
          />
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {enclosures.map((enclosure) => (
          <li
            key={enclosure.id}
            className="rounded-md border border-khulula-line bg-khulula-surface p-4"
          >
            <p className="font-heading text-lg text-khulula-ink">{enclosure.code}</p>
            <p className="text-sm">
              {/* The dot is decorative: the words next to it carry the
                  information on their own (RGAA 3.1). */}
              <span aria-hidden="true" className={`mr-2 ${dotClasses(enclosure.status)}`}>
                ●
              </span>
              {occupantLabel(enclosure)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The administrators' table. Only the maintenance action is here: the API has
// no route to create or edit an enclosure, and no CP asks for one.
function ManageTable({
  enclosures,
  onToggleMaintenance,
}: {
  enclosures: Enclosure[];
  onToggleMaintenance: (enclosure: Enclosure) => void;
}) {
  return (
    // The table scrolls inside its own box rather than pushing the page wide.
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-khulula-surface-alt text-left text-xs uppercase tracking-wide">
          <tr>
            <th scope="col" className="p-3">Code</th>
            <th scope="col" className="p-3">Type</th>
            <th scope="col" className="p-3">Status</th>
            <th scope="col" className="p-3">Current occupant</th>
            <th scope="col" className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {enclosures.map((enclosure) => (
            <tr key={enclosure.id} className="border-b border-khulula-line">
              <th scope="row" className="p-3 text-left font-heading text-base text-khulula-ink">
                {enclosure.code}
              </th>
              <td className="p-3">{enclosure.type}</td>
              <td className="p-3">{statusLabel(enclosure.status)}</td>
              <td className="p-3">{enclosure.occupant ? enclosure.occupant.name : '—'}</td>
              <td className="p-3">
                <Button
                  variant="ghost"
                  // RG16: an occupied enclosure cannot go under maintenance.
                  disabled={enclosure.status === 'occupied'}
                  onClick={() => onToggleMaintenance(enclosure)}
                >
                  {enclosure.status === 'maintenance' ? 'Return to service' : 'Maintenance'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusLabel(status: Enclosure['status']) {
  if (status === 'free') {
    return 'Free';
  }
  if (status === 'maintenance') {
    return 'Maintenance';
  }
  return 'Occupied';
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-khulula-line bg-khulula-surface p-4">
      <p className="font-heading text-2xl text-khulula-ink">{value}</p>
      <p className="mt-1 text-xs text-khulula-muted">{label}</p>
    </div>
  );
}

function dotClasses(status: Enclosure['status']) {
  if (status === 'free') {
    return 'text-enclosure-free';
  }
  if (status === 'maintenance') {
    return 'text-enclosure-maintenance';
  }
  return 'text-khulula-accent';
}

function occupantLabel(enclosure: Enclosure) {
  if (enclosure.status === 'maintenance') {
    return 'Maintenance';
  }
  if (enclosure.occupant) {
    return enclosure.occupant.name;
  }
  return 'Free';
}
