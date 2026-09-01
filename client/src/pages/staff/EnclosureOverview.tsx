import type { Dashboard, Enclosure, EnclosureStatus } from './enclosureTypes';

// The Overview tab of screen 8: five numbers, then one card per enclosure.
export default function EnclosureOverview({
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

// The green border and the darker label are what separate the five numbers from
// the enclosure cards underneath, which keep the plain line colour. The label
// uses the same size and colour as the figures on the home page.
function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-khulula-primary bg-khulula-surface p-4">
      <p className="font-heading text-2xl text-khulula-ink">{value}</p>
      <p className="mt-1 text-sm text-khulula-body">{label}</p>
    </div>
  );
}

function dotClasses(status: EnclosureStatus) {
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
