import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import IucnPill from '../../components/IucnPill';
import { iucnLabel } from '../../speciesLabels';
import type { IucnStatus } from '../../speciesLabels';

// Screen 3 of arborescence-ecrans.md.
type Species = {
  id: number;
  common_name: string;
  scientific_name: string;
  iucn_status: IucnStatus;
  habitat: string;
  diet: string;
  activity: string;
  description: string;
  photo_url: string;
  treated: number;
  released: number;
};

export default function SpeciesDetailPage() {
  const { id } = useParams();
  const [species, setSpecies] = useState<Species | null>(null);
  // The names of this species currently in care. Only the names: the sentence
  // below needs nothing else.
  const [inCareNames, setInCareNames] = useState<string[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/species/${id}`);

        if (!response.ok) {
          setLoadError('This species does not exist.');
          return;
        }

        setSpecies(await response.json());

        const animalsResponse = await fetch(`/api/animals?status=in_care&species_id=${id}`);
        if (animalsResponse.ok) {
          const page = await animalsResponse.json();
          setInCareNames(page.items.map((animal: { name: string }) => animal.name));
        }
      } catch {
        setLoadError('The server cannot be reached.');
      }
    }

    load();
  }, [id]);

  if (loadError !== '') {
    return <p className="text-khulula-error">{loadError}</p>;
  }

  if (species === null) {
    return <p className="text-khulula-muted">Loading…</p>;
  }

  return (
    <article className="mx-auto max-w-5xl">
      <p className="text-sm text-khulula-muted">
        <Link to="/species" className="underline">
          Species
        </Link>
        <span className="mx-2" aria-hidden="true">
          ›
        </span>
        {species.common_name}
      </p>

      {/* Two halves: the photograph on the left, what the species is on the
          right. Below them, "At a glance" runs the full width. */}
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* A fixed height and `cover`, so all nine photographs frame the same
            way whatever their own proportions. */}
        <img
          src={species.photo_url}
          alt={`A ${species.common_name} photographed in the wild`}
          className="h-80 w-full rounded-lg bg-khulula-surface-alt object-cover object-top"
        />

        <div>
          <h1 className="font-heading text-3xl font-semibold text-khulula-ink">
            {species.common_name}
          </h1>
          <p className="mt-1 italic text-khulula-muted">{species.scientific_name}</p>

          <p className="mt-3">
            <IucnPill status={species.iucn_status} />
          </p>

          <p className="mt-5">{species.description}</p>

          {/* A sentence, not cards: naming the animals in a line of text says
              the same thing without looking like something to click. There is
              no public animal page — RG11. */}
          <p className="mt-5">
            {inCareNames.length > 0
              ? `Right now we are caring for ${nameList(inCareNames)}.`
              : `No ${species.common_name.toLowerCase()} is in our care right now.`}
          </p>

          {/* Accent colour and one step up the type scale, because the link was
              getting lost in the paragraphs above it. No permanent underline:
              RGAA 10.6 asks for one on a link sitting inside a text, and this
              one stands on its own line with an arrow. */}
          <p className="mt-4">
            <Link
              to="/animals"
              className="type-lede font-medium text-khulula-accent hover:underline"
            >
              See our rescues <span aria-hidden="true">›</span>
            </Link>
          </p>
        </div>
      </div>

      {/* No visible heading: each term labels itself. aria-label still names
          the region, which a screen reader announces when it reaches it. */}
      <aside
        aria-label="At a glance"
        className="mt-8 rounded-lg border border-khulula-line bg-khulula-surface p-5"
      >
        {/* Six columns side by side on a wide screen, stacking as it narrows.
            Each pair is a small block: the term, the value under it. */}
        <dl className="grid gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
          <Row term="Habitat" value={species.habitat} />
          <Row term="Diet" value={species.diet} />
          <Row term="Activity" value={species.activity} />
          <Row term="IUCN status" value={iucnLabel(species.iucn_status)} />
          <Row term="Treated here" value={`${species.treated} ${plural(species.treated)}`} />
          <Row term="Released" value={`${species.released} ${plural(species.released)}`} />
        </dl>
      </aside>
    </article>
  );
}

// One cell of "At a glance": the term, the value under it. HTML allows a <div>
// around a <dt>/<dd> pair inside a <dl>, which is what keeps each pair together
// as one grid cell.
function Row({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-khulula-ink">{term}</dt>
      <dd className="mt-1 text-khulula-body">{value}</dd>
    </div>
  );
}

function plural(count: number) {
  return count === 1 ? 'animal' : 'animals';
}

// ["Zola"] → "Zola" · ["Zola", "Amara"] → "Zola and Amara"
// ["Zola", "Amara", "Nala"] → "Zola, Amara and Nala"
function nameList(names: string[]) {
  if (names.length === 1) {
    return names[0];
  }

  const last = names[names.length - 1];
  const others = names.slice(0, -1);

  return `${others.join(', ')} and ${last}`;
}
