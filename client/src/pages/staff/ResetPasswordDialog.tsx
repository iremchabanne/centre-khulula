import { useState } from 'react';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Modal from '../../components/Modal';

type Props = {
  staffId: number;
  staffName: string;
  onClose: () => void;
  onReset: () => void;
};

// RG15 — a forgotten password is reset by an administrator. No current
// password is asked for: the administrator does not know it, and that is the
// point of the rule. The centre sends no email either.
export default function ResetPasswordDialog({ staffId, staffName, onClose, onReset }: Props) {
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    const password = String(formData.get('password') ?? '');

    // Comfort check only: the server revalidates in api/src/schemas.ts.
    setPasswordError('');
    setFormError('');
    if (password.length < 12) {
      setPasswordError('The password must be at least 12 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/staff/${staffId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onReset();
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
    <Modal title={`Reset the password of ${staffName}`} onClose={onClose}>
      <form action={submit} noValidate className="flex flex-col gap-4">
        {formError !== '' && (
          <p
            role="status"
            className="rounded border border-khulula-error p-3 text-sm text-khulula-error"
          >
            {formError}
          </p>
        )}

        <FormField
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          error={passwordError}
        />

        <p className="text-sm text-khulula-muted">
          At least 12 characters. Give it to the person yourself, and ask them to change it.
        </p>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Resetting…' : 'Reset password'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
