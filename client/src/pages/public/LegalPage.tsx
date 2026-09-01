import type { ReactNode } from 'react';

// The photographers are named here because CC BY and CC BY-SA require it.
const PHOTO_CREDITS = [
  { species: 'Banded Mongoose', author: 'Axel Tschentscher', licence: 'CC BY-SA 4.0' },
  { species: 'Black-backed Jackal', author: 'Giles Laurent', licence: 'CC BY-SA 4.0' },
  { species: 'Cape Vulture', author: 'Timothy Whitehead', licence: 'CC BY 4.0' },
  { species: 'Common Duiker', author: 'Farid Amadou Bahleman', licence: 'CC BY-SA 4.0' },
  { species: 'Leopard Tortoise', author: 'Bernard Dupont', licence: 'CC BY-SA 2.0' },
  { species: 'Serval', author: 'Diego Delso', licence: 'CC BY-SA 4.0' },
  { species: 'Southern Ground Hornbill', author: 'Bernard Dupont', licence: 'CC BY-SA 2.0' },
  { species: 'Spotted Eagle-Owl', author: 'Charles J. Sharp', licence: 'CC BY-SA 3.0' },
  { species: "Temminck's Pangolin", author: 'U.S. Fish and Wildlife Service', licence: 'CC BY 2.0' },
];

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="type-section mb-6">Legal notice &amp; privacy policy</h1>

      <Section title="Publisher">
        Centre Khulula is a fictional organisation, created for an educational project.
      </Section>

      <Section title="What we collect">
        Only what a donation requires: an amount, and optionally a name, an email address and a
        message. We use no tracking cookies and we do not profile visitors.
      </Section>

      <Section title="Why / for how long">
        Contact details are kept solely to acknowledge your donation, on the basis of your explicit
        consent, and are erased after three years.
      </Section>

      <Section title="Your rights">
        You may ask to access, correct or delete your data at any time by writing to
        privacy@khulula.example.
      </Section>

      <Section title="Accessibility">
        <p>
          This site aims to meet RGAA level AA. Current status: partially compliant. The colour
          contrasts were measured, every image carries an alt attribute, the forms name their
          required fields and report their errors next to them, and the whole site can be used
          with a keyboard.
        </p>
        <p className="mt-2">Three limits are known and not yet fixed:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>The browser tab shows the same title on every page.</li>
          <li>A dialog can be left with the Tab key while it is still open.</li>
          <li>No audit has been run with a screen reader.</li>
        </ul>
      </Section>

      <Section title="Photographs">
        <p>The nine species photographs come from Wikimedia Commons.</p>
        <p className="mt-2">
          The pangolin photograph has been cropped, the other eight are unchanged.
        </p>

        <ul className="mt-3 grid gap-x-8 text-sm text-khulula-muted sm:grid-cols-2">
          {PHOTO_CREDITS.map((credit) => (
            <li key={credit.species}>
              {credit.species} — {credit.author} · {credit.licence}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-khulula-line py-5 sm:flex-row sm:gap-8">
      <h2 className="shrink-0 font-heading text-lg font-semibold text-khulula-ink sm:w-48">
        {title}
      </h2>
      <div className="text-khulula-body">{children}</div>
    </section>
  );
}
