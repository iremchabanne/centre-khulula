import { useState } from 'react';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Modal from '../../components/Modal';
import SelectField from '../../components/SelectField';

type Props = {
  animalId: number;
  animalName: string;
  onClose: () => void;
  onRecorded: () => void;
};

// RG6 — only a veterinarian may pronounce an outcome, and the server is what
// enforces it. RG5 — the outcome is final, so this dialog is used once.
export default function OutcomeDialog({ animalId, animalName, onClose, onRecorded }: Props) {
  const [noteError, setNoteError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const note = String(formData.get('outcome_note') ?? '').trim();

    setNoteError('');
    setFormError('');
    if (note === '') {
      setNoteError('A note is required: this closes the animal file for good.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${animalId}/outcome`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome: formData.get('outcome'),
          outcome_note: note,
        }),
      });

      if (response.ok) {
        onRecorded();
        return;
      }

      const body = await response.json();
      setFormError(body.details ? body.details[0].message : body.error);
    } catch {
      setFormError('The server cannot be reached.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Close the file of ${animalName}`} onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-khulula-muted">
          This cannot be undone. Once an outcome is recorded, nothing more is written on this
          animal.
        </p>

        {formError !== '' && (
          <p
            role="status"
            className="rounded border border-khulula-error p-3 text-sm text-khulula-error"
          >
            {formError}
          </p>
        )}

        <SelectField
          id="outcome"
          label="Outcome"
          options={[
            { value: 'released', label: 'Released' },
            { value: 'deceased', label: 'Deceased' },
          ]}
        />

        <FormField id="outcome_note" label="Note" multiline error={noteError} />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Recording…' : 'Record the outcome'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
