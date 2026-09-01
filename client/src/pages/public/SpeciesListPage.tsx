import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import IucnPill from '../../components/IucnPill';
import Pager from '../../components/Pager';
import SpeciesPhoto from '../../components/SpeciesPhoto';
import type { IucnStatus } from '../../speciesLabels';

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
      <h1 className="mb-2 font-heading text-3xl text-khulula-ink">The species we take in</h1>
      <p className="mb-8 text-khulula-muted">
        Khulula treats small and medium indigenous wildlife. All nine species are native to
        Limpopo, and our centre only takes in animals we can return to the province they came
        from. None of them is the animal on the poster. They’re overlooked species, but each
        plays a vital role in the ecosystem.
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {species.map((one) => (
          <li
            key={one.id}
            className="overflow-hidden rounded-lg border border-khulula-line bg-khulula-surface"
          >
            <Link to={`/species/${one.id}`} className="block">
              <SpeciesPhoto url={one.photo_url} />

              {/* The pill sits on top, where the home page puts the status pill
                  of an animal card. The two pages carry the same kind of card,
                  so they are read the same way. */}
              <div className="p-4">
                <IucnPill status={one.iucn_status} />

                <p className="mt-2 font-heading text-lg text-khulula-ink">{one.common_name}</p>
                <p className="italic text-khulula-muted">{one.scientific_name}</p>
                <p className="mt-2 text-sm text-khulula-muted">{one.habitat}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Pager page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}
