import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SpeciesPhoto from '../../components/SpeciesPhoto';
import StatusPill from '../../components/StatusPill';

// Screen 1 of arborescence-ecrans.md. Public: no account, no session.
type Animal = {
  id: number;
  name: string;
  status: 'admitted' | 'in_care' | 'recovering' | 'released';
  admitted_at: string;
  admission_reason: string;
  species: { id: number; common_name: string; photo_url: string };
};

export default function HomePage() {
  const [inCare, setInCare] = useState<Animal[]>([]);
  const [inCareTotal, setInCareTotal] = useState(0);
  const [releasedTotal, setReleasedTotal] = useState(0);
  const [speciesTotal, setSpeciesTotal] = useState(0);

  // Three requests and no new API route: the numbers are the `total` the
  // paginated lists already answer with. allSettled and not all, so one failing
  // does not take the other two down.
  useEffect(() => {
    async function load() {
      const [care, released, species] = await Promise.allSettled([
        fetch('/api/animals?status=in_care'),
        fetch('/api/animals?status=released'),
        fetch('/api/species'),
      ]);

      if (care.status === 'fulfilled' && care.value.ok) {
        const page = await care.value.json();
        // The same request feeds the counter and the three cards below.
        setInCare(page.items.slice(0, 3));
        setInCareTotal(page.total);
      }

      if (released.status === 'fulfilled' && released.value.ok) {
        setReleasedTotal((await released.value.json()).total);
      }

      if (species.status === 'fulfilled' && species.value.ok) {
        setSpeciesTotal((await species.value.json()).total);
      }
    }

    load();
  }, []);

  return (
    <div>
      {/* Edge to edge: the negative margins cancel the padding PublicLayout
          puts around every page, so the banner touches the window. */}
      <div className="-mx-8 -mt-8 mb-10">
        <img
          src="/images/limpopo.jpg"
          alt="The Limpopo bushveld, the region the centre works in"
          className="h-72 w-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <p className="type-eyebrow">Limpopo · South Africa</p>

        <h1 className="type-display mx-auto mt-4 max-w-[15ch]">
          Every animal we treat is meant to go home.
        </h1>

        <p className="type-lede mx-auto mt-5 max-w-[52ch]">
          Each one here is fed, treated and released on donations alone.
        </p>

        <p className="mt-6">
          <Link
            to="/donate"
            className="inline-block rounded bg-khulula-accent px-4 py-2 font-medium text-white"
          >
            Support our work
          </Link>
        </p>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mt-12 flex flex-wrap gap-5">
          <Stat number={inCareTotal} label="Animals in our care" />
          <Stat number={releasedTotal} label="Released back to the wild" />
          <Stat number={speciesTotal} label="Species we take in" />
        </div>

        <section className="mt-[60px]">
          <p className="type-eyebrow">Our mission</p>

          <p className="type-mission mt-3 max-w-[60ch]">
            We take in wildlife that is <em>injured</em>, <em>orphaned</em> or{' '}
            <em>confiscated</em>, and we give it back to the wild.
          </p>
        </section>

        <section className="mt-12 rounded-lg bg-khulula-surface-alt p-8">
          {/* The heading is the link to the full list. The arrow is what says
              so; aria-hidden keeps it out of the reading. */}
          <h2 className="type-section mb-6">
            <Link to="/animals" className="text-khulula-accent hover:underline">
              Currently recovering <span aria-hidden="true">›</span>
            </Link>
          </h2>

          {/* Grid, not flex: the cards have to line up in both directions. They
              carry no link — there is no public animal page (RG11). */}
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inCare.map((animal) => (
              <li
                key={animal.id}
                className="overflow-hidden rounded-lg border border-khulula-line bg-khulula-surface"
              >
                <SpeciesPhoto url={animal.species.photo_url} />

                <div className="p-4">
                  <StatusPill status={animal.status} />

                  <p className="mt-2 font-heading text-lg text-khulula-ink">
                    {animal.name}{' '}
                    <span className="text-base font-normal italic text-khulula-muted">
                      · {animal.species.common_name}
                    </span>
                  </p>

                  <p className="mt-2 text-sm text-khulula-muted">{animal.admission_reason}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// The ocre rule above each number is the mockup's, and it is what makes the
// three read as one row of figures.
function Stat({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex-1 border-t-2 border-khulula-accent pt-3 text-center">
      <p className="type-stat">{number}</p>
      <p className="mt-1 text-sm text-khulula-body">{label}</p>
    </div>
  );
}
