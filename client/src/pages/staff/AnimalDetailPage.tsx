import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import MoveDialog from './MoveDialog';
import OutcomeDialog from './OutcomeDialog';
import SelectField from '../../components/SelectField';
import StatusPill from '../../components/StatusPill';
import type { StaffMember } from '../../types';

// Screen 10 of arborescence-ecrans.md. Staff only: it carries the enclosure,
// the clinical notes and the names of the staff, none of which a visitor sees.
type Observation = {
  id: number;
  observed_at: string;
  body: string;
  status_after: string | null;
  author: { id: number; full_name: string };
};

type Stay = {
  id: number;
  started_at: string;
  ended_at: string | null;
  move_reason: string | null;
  enclosure: { id: number; code: string };
};

type Animal = {
  id: number;
  name: string;
  sex: string;
  age_class: string;
  found_near: string | null;
  admission_reason: string;
  status: 'admitted' | 'in_care' | 'recovering' | 'released' | 'deceased';
  admitted_at: string;
  outcome_at: string | null;
  outcome_note: string | null;
  species: { id: number; common_name: string; scientific_name: string };
  stays: Stay[];
  observations: Observation[];
};

export default function AnimalDetailPage() {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [bodyError, setBodyError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const navigate = useNavigate();
  const staff = useOutletContext<StaffMember>();

  async function load() {
    try {
      const response = await fetch(`/api/animals/${id}`);

      if (response.status === 401) {
        navigate('/staff/session-expired', { replace: true });
        return;
      }

      if (!response.ok) {
        setLoadError('This animal does not exist.');
        return;
      }

      setAnimal(await response.json());
    } catch {
      setLoadError('The server cannot be reached.');
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addObservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get('body') ?? '').trim();
    const statusAfter = String(formData.get('status_after') ?? '');

    setBodyError('');
    setFormError('');
    if (body === '') {
      setBodyError('Write what you observed.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${id}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The field is left out entirely when no status change is asked for.
        body: JSON.stringify(statusAfter ? { body, status_after: statusAfter } : { body }),
      });

      // Same as load(): a session that has ended is not a form error, so it
      // gets its own screen rather than a red line under the field.
      if (response.status === 401) {
        navigate('/staff/session-expired', { replace: true });
        return;
      }

      if (!response.ok) {
        const answer = await response.json();
        setFormError(answer.details ? answer.details[0].message : answer.error);
        return;
      }

      form.reset();
      load();
    } catch {
      setFormError('The server cannot be reached.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError !== '') {
    return <p className="text-khulula-error">{loadError}</p>;
  }

  if (animal === null) {
    return <p className="text-khulula-muted">Loading…</p>;
  }

  const currentStay = animal.stays.find((stay) => stay.ended_at === null);
  // RG5 — nothing is written on an animal that has been released or has died.
  const isClosed = animal.status === 'released' || animal.status === 'deceased';

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl text-khulula-ink">{animal.name}</h1>
        <StatusPill status={animal.status} />
      </div>

      {/* The action row, like the other two staff screens. Nothing is done to an
          animal whose file is closed (RG5), so it disappears entirely. */}
      {!isClosed && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Button variant="accent" onClick={() => setShowMove(true)}>
            Move
          </Button>

          {/* RG6 — the outcome belongs to a veterinarian. A keeper who calls
              the route anyway is refused by the server with a 403. */}
          {staff.role === 'veterinarian' && (
            <Button onClick={() => setShowOutcome(true)}>Record the outcome</Button>
          )}
        </div>
      )}

      {/* Two columns on a wide screen, one underneath the other on a narrow one.
          The identity and the stays barely change, so they take a fixed width on
          the left; the observations grow, so they take the rest. */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="lg:w-96 lg:shrink-0">
          <section className="rounded-md border border-khulula-line bg-khulula-surface p-5">
            <h2 className="mb-3 font-heading text-lg text-khulula-ink">Identity</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Line term="Species" value={animal.species.common_name} />
              <Line term="Scientific name" value={animal.species.scientific_name} italic />
              <Line term="Sex" value={animal.sex} />
              <Line term="Age class" value={animal.age_class} />
              <Line term="Found near" value={animal.found_near ?? '—'} />
              <Line term="Admitted" value={animal.admitted_at.slice(0, 10)} />
              <Line term="Enclosure" value={currentStay ? currentStay.enclosure.code : '—'} />

              {/* Rows of the same list rather than paragraphs underneath it, so
                  they line up with the dates and keep the same spacing. */}
              <Line term="Reason for admission" value={animal.admission_reason} />
              {animal.outcome_note && <Line term="Outcome note" value={animal.outcome_note} />}
            </dl>

            {/* The stays live in the same box, under a rule: they say where this
                same animal has been, so they belong with its identity rather
                than in a box of their own. */}
            <hr className="my-5 border-khulula-line" />

            <h2 className="mb-3 font-heading text-lg text-khulula-ink">Stays</h2>
            <ul className="text-sm">
              {animal.stays.map((stay) => (
                <li key={stay.id} className="border-b border-khulula-line py-2 last:border-b-0">
                  <span className="font-medium">{stay.enclosure.code}</span>{' '}
                  <span className="text-khulula-muted">
                    {/* No end date means the animal has not left this enclosure. */}
                    {stay.started_at.slice(0, 10)} →{' '}
                    {stay.ended_at ? stay.ended_at.slice(0, 10) : 'still there'}
                  </span>
                  {stay.move_reason && (
                    <span className="text-khulula-muted"> · {stay.move_reason}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Built like the identity card, so the two boxes start on the same
            line: the heading lives inside the box, not above it. */}
        <section className="rounded-md border border-khulula-line bg-khulula-surface p-5 lg:flex-1">
          <h2 className="mb-3 font-heading text-lg text-khulula-ink">Observations</h2>

          {isClosed ? (
            <p className="mb-4 text-sm text-khulula-muted">
              This animal has been {animal.status}. Nothing more can be written on its file.
            </p>
          ) : (
            // No border of its own: it would be a box inside a box.
            <form onSubmit={addObservation} className="flex flex-col gap-3">
              {formError !== '' && (
                <p role="status" className="text-sm text-khulula-error">
                  {formError}
                </p>
              )}

              <FormField id="body" label="New observation" multiline error={bodyError} />

              <SelectField
                id="status_after"
                label="Change the status"
                required={false}
                options={statusChoices(animal.status)}
              />

              <div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Add the observation'}
                </Button>
              </div>
            </form>
          )}

          {/* The same rule as in the identity card, between the form above and
              the notes already written. */}
          <hr className="my-5 border-khulula-line" />

          <ul>
            {animal.observations.map((observation) => (
              <li
                key={observation.id}
                className="border-b border-khulula-line py-3 text-sm last:border-b-0"
              >
                <p className="text-khulula-muted">
                  {observation.observed_at.slice(0, 10)} · {observation.author.full_name}
                  {observation.status_after && ` · status set to ${observation.status_after}`}
                </p>
                <p>{observation.body}</p>
              </li>
            ))}
          </ul>

          {animal.observations.length === 0 && (
            <p className="text-khulula-muted">Nothing has been written on this animal yet.</p>
          )}
        </section>
      </div>

      {showMove && (
        <MoveDialog
          animalId={animal.id}
          speciesId={animal.species.id}
          onClose={() => setShowMove(false)}
          onMoved={() => {
            setShowMove(false);
            load();
          }}
        />
      )}

      {showOutcome && (
        <OutcomeDialog
          animalId={animal.id}
          animalName={animal.name}
          onClose={() => setShowOutcome(false)}
          onRecorded={() => {
            setShowOutcome(false);
            load();
          }}
        />
      )}
    </div>
  );
}

// RG4 — the two states of care, minus the one the animal is already in. Care
// goes both ways: an animal that is recovering can relapse and go back in care.
function statusChoices(status: Animal['status']) {
  const choices = [{ value: '', label: 'Leave it unchanged' }];

  if (status !== 'in_care') {
    choices.push({ value: 'in_care', label: 'In care' });
  }

  if (status !== 'recovering') {
    choices.push({ value: 'recovering', label: 'Recovering' });
  }

  return choices;
}

// One <dl> row. It returns the two tags loose, with no wrapper, because a <dl>
// only accepts <dt> and <dd> as its direct children.
function Line({ term, value, italic }: { term: string; value: string; italic?: boolean }) {
  return (
    <>
      <dt className="text-khulula-muted">{term}</dt>
      <dd className={italic ? 'italic' : undefined}>{value}</dd>
    </>
  );
}
