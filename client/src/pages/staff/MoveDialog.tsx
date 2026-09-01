import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Modal from '../../components/Modal';
import SelectField from '../../components/SelectField';

type FreeEnclosure = { id: number; code: string; type: string };

type Props = {
  animalId: number;
  // Needed so only the enclosures that suit this species are offered (RG17).
  speciesId: number;
  onClose: () => void;
  onMoved: () => void;
};

// RG8 — moving an animal closes one stay and opens another, in one
// transaction. The same free-enclosure race as an admission, so the same 409.
export default function MoveDialog({ animalId, speciesId, onClose, onMoved }: Props) {
  const [freeEnclosures, setFreeEnclosures] = useState<FreeEnclosure[]>([]);
  const [choicesLoaded, setChoicesLoaded] = useState(false);
  const [reasonError, setReasonError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function loadFreeEnclosures() {
    const response = await fetch(`/api/enclosures/free?species_id=${speciesId}`);
    if (response.ok) {
      setFreeEnclosures(await response.json());
    }
    setChoicesLoaded(true);
  }

  useEffect(() => {
    loadFreeEnclosures();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get('move_reason') ?? '').trim();

    setReasonError('');
    setFormError('');
    if (reason === '') {
      setReasonError('Say why the animal is being moved.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${animalId}/enclosure`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enclosure_id: Number(formData.get('enclosure_id')),
          move_reason: reason,
        }),
      });

      if (response.ok) {
        onMoved();
        return;
      }

      // An ended session is not a form error: it gets its own screen.
      if (response.status === 401) {
        navigate('/staff/session-expired', { replace: true });
        return;
      }

      const body = await response.json();
      setFormError(body.details ? body.details[0].message : body.error);

      // Someone took the destination while the dialog was open.
      if (response.status === 409) {
        loadFreeEnclosures();
      }
    } catch {
      setFormError('The server cannot be reached.');
    } finally {
      setSubmitting(false);
    }
  }

  const noEnclosureFree = choicesLoaded && freeEnclosures.length === 0;

  return (
    <Modal title="Move to another enclosure" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {formError !== '' && (
          <p
            role="status"
            className="rounded border border-khulula-error p-3 text-sm text-khulula-error"
          >
            {formError}
          </p>
        )}

        {noEnclosureFree ? (
          <p role="status" className="rounded border border-khulula-line-strong p-3 text-sm">
            No enclosure of the right kind is free. This animal cannot be moved right now.
          </p>
        ) : (
          <SelectField
            id="enclosure_id"
            label="New enclosure"
            options={freeEnclosures.map((one) => ({
              value: String(one.id),
              label: `${one.code} · ${one.type}`,
            }))}
          />
        )}

        <FormField id="move_reason" label="Reason" multiline error={reasonError} />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || noEnclosureFree}>
            {submitting ? 'Moving…' : 'Move'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
