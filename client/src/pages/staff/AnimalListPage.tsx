import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Pager from '../../components/Pager';
import SelectField from '../../components/SelectField';
import StatusPill from '../../components/StatusPill';

// Screen 9 of arborescence-ecrans.md: every animal the centre has ever had.
type Animal = {
  id: number;
  name: string;
  status: 'admitted' | 'in_care' | 'recovering' | 'released' | 'deceased';
  admitted_at: string;
  species: { id: number; common_name: string };
  enclosure: { id: number; code: string } | null;
};

type Species = { id: number; common_name: string };

// What the four filters and the pager currently ask for. An empty string means
// "no filter", which is how the screen opens.
type Query = {
  status: string;
  species_id: string;
  search: string;
  admitted_from: string;
  admitted_to: string;
  page: number;
};

const NO_FILTER: Query = {
  status: '',
  species_id: '',
  search: '',
  admitted_from: '',
  admitted_to: '',
  page: 1,
};

export default function AnimalListPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [species, setSpecies] = useState<Species[]>([]);
  const [query, setQuery] = useState<Query>(NO_FILTER);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  // The species dropdown never changes, so it is fetched once.
  useEffect(() => {
    async function loadSpecies() {
      const response = await fetch('/api/species');
      if (response.ok) {
        const page = await response.json();
        setSpecies(page.items);
      }
    }

    loadSpecies();
  }, []);

  // Runs again every time a filter or the page changes.
  useEffect(() => {
    async function loadAnimals() {
      const params = new URLSearchParams();
      params.set('page', String(query.page));
      if (query.status) params.set('status', query.status);
      if (query.species_id) params.set('species_id', query.species_id);
      if (query.search) params.set('search', query.search);
      if (query.admitted_from) params.set('admitted_from', query.admitted_from);
      if (query.admitted_to) params.set('admitted_to', query.admitted_to);

      try {
        const response = await fetch(`/api/animals/all?${params}`);

        if (response.status === 401) {
          navigate('/staff/session-expired', { replace: true });
          return;
        }

        if (!response.ok) {
          const body = await response.json();
          setLoadError(body.details ? body.details[0].message : body.error);
          return;
        }

        const page = await response.json();
        setAnimals(page.items);
        setTotalPages(page.total_pages);
        setTotal(page.total);
        setLoadError('');
      } catch {
        setLoadError('The server cannot be reached.');
      }
    }

    loadAnimals();
  }, [query, navigate]);

  // The filters are applied on submit rather than on every keystroke: one
  // request per search instead of one per letter (éco-conception).
  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setQuery({
      status: String(formData.get('status') ?? ''),
      species_id: String(formData.get('species_id') ?? ''),
      search: String(formData.get('search') ?? '').trim(),
      admitted_from: String(formData.get('admitted_from') ?? ''),
      admitted_to: String(formData.get('admitted_to') ?? ''),
      // Back to the first page: page 4 of the old list means nothing here.
      page: 1,
    });
  }

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl text-khulula-ink">Animals</h1>
      <p className="mb-6 text-sm text-khulula-muted">
        Every animal the centre has taken in, including those released and deceased.
      </p>

      <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-3">
        <FormField id="search" label="Name" required={false} />

        <SelectField
          id="status"
          label="Status"
          required={false}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'admitted', label: 'Admitted' },
            { value: 'in_care', label: 'In care' },
            { value: 'recovering', label: 'Recovering' },
            { value: 'released', label: 'Released' },
            { value: 'deceased', label: 'Deceased' },
          ]}
        />

        <SelectField
          id="species_id"
          label="Species"
          required={false}
          options={[
            { value: '', label: 'All species' },
            ...species.map((one) => ({
              value: String(one.id),
              label: one.common_name,
            })),
          ]}
        />

        <FormField id="admitted_from" label="Admitted from" type="date" required={false} />
        <FormField id="admitted_to" label="Admitted to" type="date" required={false} />

        <Button type="submit">Filter</Button>

        {/* type="reset" empties the fields; this puts the list back too. */}
        <Button type="reset" variant="ghost" onClick={() => setQuery(NO_FILTER)}>
          Clear filters
        </Button>
      </form>

      {loadError !== '' && (
        <p role="status" className="mb-4 text-sm text-khulula-error">
          {loadError}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-khulula-surface-alt text-left text-xs uppercase tracking-wide">
            <tr>
              <th scope="col" className="p-3">Name</th>
              <th scope="col" className="p-3">Species</th>
              <th scope="col" className="p-3">Status</th>
              <th scope="col" className="p-3">Enclosure</th>
              <th scope="col" className="p-3">Admitted</th>
            </tr>
          </thead>
          <tbody>
            {animals.map((animal) => (
              <tr key={animal.id} className="border-b border-khulula-line">
                <th scope="row" className="p-3 text-left font-medium">
                  <Link to={`/staff/animals/${animal.id}`} className="underline">
                    {animal.name}
                  </Link>
                </th>
                <td className="p-3">{animal.species.common_name}</td>
                <td className="p-3">
                  <StatusPill status={animal.status} />
                </td>
                {/* A released animal is in no enclosure at all. */}
                <td className="p-3">{animal.enclosure ? animal.enclosure.code : '—'}</td>
                <td className="p-3">{animal.admitted_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {animals.length === 0 && loadError === '' && (
        <p className="py-6 text-khulula-muted">No animal matches these filters.</p>
      )}

      <Pager
        page={query.page}
        totalPages={totalPages}
        total={total}
        onPageChange={(page) => setQuery({ ...query, page })}
      />
    </div>
  );
}
