// The shapes GET /api/enclosures and GET /api/dashboard answer with. Shared by
// the Enclosures page and its two tabs.
export type EnclosureStatus = 'free' | 'occupied' | 'maintenance';

export type Enclosure = {
  id: number;
  code: string;
  type: string;
  status: EnclosureStatus;
  occupant: { animal_id: number; name: string; since: string } | null;
};

export type Dashboard = {
  occupied: number;
  free: number;
  maintenance: number;
  occupancy_rate: number;
  average_stay_days: number | null;
};
