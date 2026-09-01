import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Modal from '../../components/Modal';
import SelectField from '../../components/SelectField';

type FieldErrors = {
  full_name?: string;
  email?: string;
  password?: string;
};

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

// RG13 — there is no "administrator" choice here, and the API ignores one:
// is_admin is granted by the seed only. The role dropdown cannot be wrong,
// so it needs no check.
export default function CreateStaffDialog({ onClose, onCreated }: Props) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function submit(formData: FormData) {
    const fullName = String(formData.get('full_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    // Comfort checks only: the server revalidates everything in api/src/schemas.ts.
    const errors: FieldErrors = {};
    if (fullName === '') {
      errors.full_name = 'Enter the full name.';
    }
    if (email === '') {
      errors.email = 'Enter an email address.';
    }
    if (password.length < 12) {
      errors.password = 'The password must be at least 12 characters long.';
    }

    setFieldErrors(errors);
    setFormError('');
    if (errors.full_name || errors.email || errors.password) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          role: String(formData.get('role')),
          password,
        }),
      });

      if (response.ok) {
        onCreated();
        return;
      }

      // An ended session is not a form error: it gets its own screen.
      if (response.status === 401) {
        navigate('/staff/session-expired', { replace: true });
        return;
      }

      // 409 when the email is already taken, 400 when Zod refused a field.
      const body = await response.json();
      setFormError(body.details ? body.details[0].message : body.error);
    } catch {
      setFormError('The server cannot be reached.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New staff account" onClose={onClose}>
      <form action={submit} noValidate className="flex flex-col gap-4">
        {formError !== '' && (
          <p
            role="status"
            className="rounded border border-khulula-error p-3 text-sm text-khulula-error"
          >
            {formError}
          </p>
        )}

        <FormField id="full_name" label="Full name" error={fieldErrors.full_name} />

        <FormField id="email" label="Email" type="email" error={fieldErrors.email} />

        <SelectField
          id="role"
          label="Role"
          options={[
            { value: 'keeper', label: 'Keeper' },
            { value: 'veterinarian', label: 'Veterinarian' },
          ]}
        />

        <FormField
          id="password"
          label="First password"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.password}
        />

        <p className="text-sm text-khulula-muted">
          At least 12 characters. Give it to the person yourself: the centre sends no email.
        </p>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
