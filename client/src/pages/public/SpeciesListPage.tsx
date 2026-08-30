import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import IucnPill from './IucnPill';
import Pager from '../../components/Pager';
import type { IucnStatus } from './speciesLabels';

// Screen 2 of arborescence-ecrans.md. Public: no account, no session.
type Species = {
  id: number;
  common_name: string;
  scientific_name: string;
  iucn_status: IucnStatus;
  habitat: string;
  photo_url: string;
};

export default function SpeciesListPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/species?page=${page}`);

        if (!response.ok) {
          setLoadError('The species could not be loaded.');
          return;
        }

        const answer = await response.json();
        setSpecies(answer.items);
        setTotalPages(answer.total_pages);
        setTotal(answer.total);
      } catch {
        setLoadError('The server cannot be reached.');
      }
    }

    load();
  }, [page]);

  if (loadError !== '') {
    return <p className="text-khulula-error">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl text-khulula-ink">The species we take in</h1>
      <p className="mb-8 max-w-2xl text-khulula-muted">
        Khulula treats small and medium indigenous wildlife of Limpopo. Nine species, and every
        one of them lives here.
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {species.map((one) => (
          <li
            key={one.id}
            className="overflow-hidden rounded-lg border border-khulula-line bg-khulula-surface"
          >
            <Link to={`/species/${one.id}`} className="block">
              <SpeciesPhoto url={one.photo_url} />

              <div className="p-4">
                <p className="font-heading text-lg text-khulula-ink">{one.common_name}</p>
                <p className="italic text-khulula-muted">{one.scientific_name}</p>
                <p className="mt-2 text-sm text-khulula-muted">{one.habitat}</p>
                <p className="mt-3">
                  <IucnPill status={one.iucn_status} />
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Pager page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}

// The photographs are not in the repository yet. Until they are, the sand block
// shows instead of a broken-image icon; the alt is empty because the name is
// written right under it and a screen reader would say it twice.
function SpeciesPhoto({ url }: { url: string }) {
  return (
    <div className="h-40 bg-khulula-surface-alt">
      <img
        src={url}
        alt=""
        className="h-40 w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
