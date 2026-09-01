import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Modal from '../../components/Modal';
import SelectField from '../../components/SelectField';

type Species = { id: number; common_name: string };
type FreeEnclosure = { id: number; code: string; type: string };

type FieldErrors = {
  name?: string;
  admission_reason?: string;
};

type Props = {
  onClose: () => void;
  onAdmitted: () => void;
};

export default function AdmissionDialog({ onClose, onAdmitted }: Props) {
  const [species, setSpecies] = useState<Species[]>([]);
  const [freeEnclosures, setFreeEnclosures] = useState<FreeEnclosure[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  // Needed so the "centre is full" message is not shown while still loading.
  const [choicesLoaded, setChoicesLoaded] = useState(false);
  // Which species is selected. The enclosure list depends on it (RG17).
  const [speciesId, setSpeciesId] = useState('');

  // The species list never changes, so it is fetched once.
  useEffect(() => {
    async function loadSpecies() {
      const response = await fetch('/api/species');
      if (response.ok) {
        const page = await response.json();
        setSpecies(page.items);
        // The dropdown shows the first species, so that is the one selected.
        if (page.items.length > 0) {
          setSpeciesId(String(page.items[0].id));
        }
      }
    }

    loadSpecies();
  }, []);

  // Only the enclosures that suit the chosen species (RG17). Runs again when
  // the species changes, and after a 409 to refresh the list.
  async function loadFreeEnclosures() {
    if (speciesId === '') {
      return;
    }

    const response = await fetch(`/api/enclosures/free?species_id=${speciesId}`);
    if (response.ok) {
      setFreeEnclosures(await response.json());
    }
    setChoicesLoaded(true);
  }

  useEffect(() => {
    loadFreeEnclosures();
  }, [speciesId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    // Without this the browser reloads the page and the dialog disappears.
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const reason = String(formData.get('admission_reason') ?? '').trim();

    // Only two checks: the other five fields are dropdowns, which cannot hold
    // a wrong value. The server revalidates all seven anyway.
    const errors: FieldErrors = {};
    if (name === '') {
      errors.name = 'Enter a name.';
    }
    if (reason === '') {
      errors.admission_reason = 'Enter the reason for the admission.';
    }

    setFieldErrors(errors);
    setFormError('');
    if (errors.name || errors.admission_reason) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          species_id: Number(formData.get('species_id')),
          enclosure_id: Number(formData.get('enclosure_id')),
          sex: formData.get('sex'),
          age_class: formData.get('age_class'),
          found_near: String(formData.get('found_near') ?? '').trim() || null,
          admission_reason: reason,
        }),
      });

      if (response.ok) {
        onAdmitted();
        return;
      }

      // An ended session is not a form error: it gets its own screen.
      if (response.status === 401) {
        navigate('/staff/session-expired', { replace: true });
        return;
      }

      // On a 400 the server lists the fields it refused; "Invalid request"
      // alone would tell the user nothing.
      const body = await response.json();
      if (body.details && body.details.length > 0) {
        setFormError(body.details[0].message);
      } else {
        setFormError(body.error);
      }

      // Somebody took that enclosure while the form was open. The dialog stays
      // open and keeps what was typed: the admission was rolled back whole.
      if (response.status === 409) {
        loadFreeEnclosures();
      }
    } catch {
      setFormError('The server cannot be reached. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // No free enclosure: there is nothing to choose, so the form cannot be sent.
  const centreIsFull = choicesLoaded && freeEnclosures.length === 0;

  return (
    <Modal title="Admit an animal" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {formError !== '' && (
          <p
            role="status"
            className="rounded border border-khulula-error p-3 text-sm text-khulula-error"
          >
            {formError}
          </p>
        )}

        <FormField id="name" label="Name" error={fieldErrors.name} />

        <SelectField
          id="species_id"
          label="Species"
          onChange={setSpeciesId}
          options={species.map((one) => ({
            value: String(one.id),
            label: one.common_name,
          }))}
        />

        {centreIsFull ? (
          <p role="status" className="rounded border border-khulula-line-strong p-3 text-sm">
            No enclosure of the right kind is free for this species. Nothing can be admitted until
            one is released or comes out of maintenance.
          </p>
        ) : (
          <SelectField
            id="enclosure_id"
            label="Enclosure"
            options={freeEnclosures.map((one) => ({
              value: String(one.id),
              label: `${one.code} · ${one.type}`,
            }))}
          />
        )}

        <SelectField
          id="sex"
          label="Sex"
          options={[
            { value: 'unknown', label: 'Unknown' },
            { value: 'female', label: 'Female' },
            { value: 'male', label: 'Male' },
          ]}
        />

        <SelectField
          id="age_class"
          label="Age class"
          options={[
            { value: 'unknown', label: 'Unknown' },
            { value: 'juvenile', label: 'Juvenile' },
            { value: 'subadult', label: 'Subadult' },
            { value: 'adult', label: 'Adult' },
          ]}
        />

        <FormField id="found_near" label="Found near" required={false} />

        <FormField
          id="admission_reason"
          label="Reason for admission"
          multiline
          error={fieldErrors.admission_reason}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || centreIsFull}>
            {submitting ? 'Admitting…' : 'Admit'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
