// The five states of an animal, as the database spells them.
type AnimalStatus =
  | 'admitted'
  | 'in_care'
  | 'recovering'
  | 'released'
  | 'deceased';

// Colour never carries the information on its own: the label is always
// written next to it (RGAA 3.1).
const styles = {
  admitted: { label: 'Admitted', colours: 'bg-admitted-bg text-admitted' },
  in_care: { label: 'In care', colours: 'bg-incare-bg text-incare' },
  recovering: {
    label: 'Recovering',
    colours: 'bg-recovering-bg text-recovering',
  },
  released: { label: 'Released', colours: 'bg-released-bg text-released' },
  deceased: { label: 'Deceased', colours: 'bg-deceased-bg text-deceased' },
};

export default function StatusPill({ status }: { status: AnimalStatus }) {
  const style = styles[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${style.colours}`}
    >
      {style.label}
    </span>
  );
}
