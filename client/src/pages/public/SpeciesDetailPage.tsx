import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import IucnPill from './IucnPill';
import StatusPill from '../../components/StatusPill';
import { iucnLabel } from './speciesLabels';
import type { IucnStatus } from './speciesLabels';

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

// The animals of this species the centre has had. `deceased` is never among
// them: the API does not return it publicly.
type Animal = {
  id: number;
  name: string;
  status: 'admitted' | 'in_care' | 'recovering' | 'released';
  admitted_at: string;
  outcome_at: string | null;
};

export default function SpeciesDetailPage() {
  const { id } = useParams();
  const [species, setSpecies] = useState<Species | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
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

        const animalsResponse = await fetch(`/api/animals?species_id=${id}`);
        if (animalsResponse.ok) {
          const page = await animalsResponse.json();
          setAnimals(page.items);
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
      {/* A fixed height so all nine frame the same way, and `contain` rather
          than `cover`: the whole photograph is shown, never cropped. */}
      <img
        src={species.photo_url}
        alt={`A ${species.common_name} photographed in the wild`}
        className="h-72 w-full rounded-lg bg-khulula-surface-alt object-contain"
      />

      <p className="mt-5 text-sm text-khulula-muted">
        <Link to="/species" className="underline">
          Species
        </Link>
        <span className="mx-2" aria-hidden="true">
          ›
        </span>
        {species.common_name}
      </p>

      <div className="mt-4 grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <IucnPill status={species.iucn_status} />

          <h1 className="mt-3 font-heading text-3xl font-semibold text-khulula-ink">
            {species.common_name}
          </h1>
          <p className="mt-1 italic text-khulula-muted">{species.scientific_name}</p>

          <p className="mt-5">{species.description}</p>
        </div>

        <aside className="rounded-lg border border-khulula-line bg-khulula-surface p-5">
          <h2 className="mb-4 font-heading text-lg font-semibold text-khulula-ink">At a glance</h2>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Row term="Habitat" value={species.habitat} />
            <Row term="Diet" value={species.diet} />
            <Row term="Activity" value={species.activity} />
            <Row term="IUCN status" value={iucnLabel(species.iucn_status)} />
            <Row term="Treated here" value={`${species.treated} ${plural(species.treated)}`} />
            <Row term="Released" value={`${species.released} ${plural(species.released)}`} />
          </dl>
        </aside>
      </div>

      {animals.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-heading text-2xl font-semibold text-khulula-ink">
            Animals we have cared for
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {animals.map((animal) => (
              <li
                key={animal.id}
                className="rounded-lg border border-khulula-line bg-khulula-surface p-4"
              >
                <StatusPill status={animal.status} />
                <p className="mt-2 font-heading text-lg text-khulula-ink">{animal.name}</p>
                <p className="text-sm text-khulula-muted">
                  {animal.outcome_at
                    ? `Released ${animal.outcome_at.slice(0, 10)}`
                    : `Admitted ${animal.admitted_at.slice(0, 10)}`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

// One <dl> row. The two tags are returned loose, with no wrapper, because a
// <dl> only accepts <dt> and <dd> as its direct children.
function Row({ term, value }: { term: string; value: string }) {
  return (
    <>
      <dt className="font-semibold text-khulula-ink">{term}</dt>
      <dd className="text-khulula-body">{value}</dd>
    </>
  );
}

function plural(count: number) {
  return count === 1 ? 'animal' : 'animals';
}
