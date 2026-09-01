import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Pager from '../../components/Pager';
import SpeciesPhoto from '../../components/SpeciesPhoto';
import StatusPill from '../../components/StatusPill';

// Screen 4 of arborescence-ecrans.md. Public: no account, no session.
//
// The API never returns a deceased animal here: the centre communicates on
// what it does, not on the animals it loses.
type Animal = {
  id: number;
  name: string;
  status: 'admitted' | 'in_care' | 'recovering' | 'released';
  admitted_at: string;
  outcome_at: string | null;
  admission_reason: string;
  // The photograph is the species one: the centre keeps none per animal.
  species: { id: number; common_name: string; photo_url: string };
};

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [tab, setTab] = useState<'in_care' | 'released'>('in_care');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/animals?status=${tab}&page=${page}`);

        if (!response.ok) {
          setLoadError('The animals could not be loaded.');
          return;
        }

        const answer = await response.json();
        setAnimals(answer.items);
        setTotalPages(answer.total_pages);
        setTotal(answer.total);
        setLoadError('');
      } catch {
        setLoadError('The server cannot be reached.');
      }
    }

    load();
  }, [tab, page]);

  // Changing tab starts a new list, so page 3 of the old one means nothing.
  function openTab(name: 'in_care' | 'released') {
    setTab(name);
    setPage(1);
  }

  if (loadError !== '') {
    return <p className="text-khulula-error">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 font-heading text-3xl text-khulula-ink">Rescues</h1>
      <p className="mb-8 text-khulula-muted">
        Who we are treating today, and who has already gone home. Every animal here was found
        injured, orphaned or confiscated somewhere in Limpopo, and every one of them is meant to
        go back home.
      </p>

      <div className="mb-8 rounded-lg bg-khulula-accent-soft p-8 text-center">
        <h2 className="font-heading text-2xl text-khulula-ink">Help us reach the next one.</h2>
        <p className="mt-3 text-khulula-body">
          Feeding, medication and enclosure upkeep are paid for entirely by donations.
        </p>
        <Link
          to="/donate"
          className="mt-6 inline-block rounded bg-khulula-accent px-4 py-2 font-medium text-white"
        >
          Make a donation
        </Link>
      </div>

      <div role="tablist" aria-label="Animal status" className="mb-6 flex gap-2">
        <button
          role="tab"
          aria-selected={tab === 'in_care'}
          onClick={() => openTab('in_care')}
          className={tabClasses(tab === 'in_care')}
        >
          In our care
        </button>
        <button
          role="tab"
          aria-selected={tab === 'released'}
          onClick={() => openTab('released')}
          className={tabClasses(tab === 'released')}
        >
          Released
        </button>
      </div>

      {/* The cards carry no link on purpose: there is no public animal page,
          because the file holds the enclosure, the notes and the staff names
          that RG11 keeps private. So a card must not look clickable either —
          no hover, no pointer, no Tab stop. */}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {animals.map((animal) => (
          <li
            key={animal.id}
            className="overflow-hidden rounded-lg border border-khulula-line bg-khulula-surface"
          >
            <SpeciesPhoto url={animal.species.photo_url} />

            <div className="p-4">
              <StatusPill status={animal.status} />

              {/* The name and the species on one line, the species a size
                  smaller so the name still reads as the title. */}
              <p className="mt-2 font-heading text-lg text-khulula-ink">
                {animal.name}{' '}
                <span className="text-base font-normal italic text-khulula-muted">
                  · {animal.species.common_name}
                </span>
              </p>

              <p className="mt-2 text-sm text-khulula-muted">
                {animal.status === 'released'
                  ? `${daysInCare(animal)} days in care · released ${longDate(animal.outcome_at)}`
                  : `Admitted ${longDate(animal.admitted_at)}`}
              </p>

              {/* Why the animal was brought in, on its own line: it is a
                  sentence, not a date, and it is what a visitor reads. */}
              <p className="mt-1 text-sm text-khulula-muted">{animal.admission_reason}</p>
            </div>
          </li>
        ))}
      </ul>

      {animals.length === 0 && (
        <p className="py-6 text-khulula-muted">
          {tab === 'released'
            ? 'No animal has been released yet.'
            : 'No animal is in care right now.'}
        </p>
      )}

      <Pager page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}

// "2026-06-12T…" → "12 June 2026", the format the mockup uses.
function longDate(value: string | null) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Whole days between the admission and the release. 86_400_000 is the number
// of milliseconds in a day.
function daysInCare(animal: Animal) {
  if (!animal.outcome_at) {
    return 0;
  }

  const start = new Date(animal.admitted_at).getTime();
  const end = new Date(animal.outcome_at).getTime();

  return Math.round((end - start) / 86_400_000);
}

function tabClasses(isActive: boolean) {
  if (isActive) {
    return 'cursor-pointer rounded border border-khulula-primary px-3 py-2 text-sm font-medium text-khulula-primary';
  }
  return 'cursor-pointer rounded border border-khulula-line px-3 py-2 text-sm text-khulula-muted';
}
