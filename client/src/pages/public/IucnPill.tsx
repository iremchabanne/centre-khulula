import { iucnLabel } from './speciesLabels';
import type { IucnStatus } from './speciesLabels';

// The conservation status, on the species list and on the species page.
// The five colours of charte-graphique.md §2.2 go from least to most
// threatened. The label is always written: the colour ranks, it does not
// inform on its own (RGAA 3.1).
const colours = {
  least_concern: 'bg-iucn-least-bg text-iucn-least',
  near_threatened: 'bg-iucn-near-bg text-iucn-near',
  vulnerable: 'bg-iucn-vulnerable-bg text-iucn-vulnerable',
  endangered: 'bg-iucn-endangered-bg text-iucn-endangered',
  critically_endangered: 'bg-iucn-critical-bg text-iucn-critical',
};

export default function IucnPill({ status }: { status: IucnStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colours[status]}`}
    >
      {iucnLabel(status)}
    </span>
  );
}
