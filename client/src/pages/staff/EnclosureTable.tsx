import Button from '../../components/Button';
import type { Enclosure, EnclosureStatus } from './enclosureTypes';

// The Manage tab of screen 8, administrators only.
export default function EnclosureTable({
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

function statusLabel(status: EnclosureStatus) {
  if (status === 'free') {
    return 'Free';
  }
  if (status === 'maintenance') {
    return 'Maintenance';
  }
  return 'Occupied';
}
