import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// One message per field, so an error can be shown under the field it belongs to.
type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // React hands the form values to this function, so no field needs its own state.
  async function signIn(formData: FormData) {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    // Comfort checks only: the server revalidates everything in api/src/schemas.ts.
    const errors: FieldErrors = {};
    if (email === '') {
      errors.email = 'Enter your email address.';
    }
    if (password === '') {
      errors.password = 'Enter your password.';
    }

    setFieldErrors(errors);
    setFormError('');
    if (errors.email || errors.password) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Always the same sentence. Saying "no such account" would tell a
        // stranger which email addresses exist here.
        setFormError('Email or password is incorrect.');
        return;
      }

      navigate('/staff/enclosures');
    } catch {
      setFormError('The server cannot be reached. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-khulula-surface-alt px-5 py-16">
      <div className="w-full max-w-md rounded-lg border border-khulula-line bg-khulula-surface p-8">
        <h1 className="mb-1 text-center font-heading text-2xl text-khulula-ink">Khulula</h1>
        <p className="mb-7 text-center text-sm text-khulula-muted">Staff area</p>

        {/* noValidate: our own messages are shown instead of the browser bubbles. */}
        <form action={signIn} noValidate className="flex flex-col gap-5">
          <p className="text-sm text-khulula-muted">
            All fields are required.
          </p>

          {/* role="status" makes a screen reader announce the message when it appears. */}
          {formError !== '' && (
            <p
              role="status"
              className="rounded border border-khulula-error bg-khulula-accent-soft p-3 text-sm text-khulula-error"
            >
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-khulula-ink">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              // These two tie the field to its error message for a screen reader.
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              className={
                fieldErrors.email
                  ? 'rounded border border-khulula-error px-3 py-2'
                  : 'rounded border border-khulula-line-strong px-3 py-2'
              }
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-sm text-khulula-error">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-khulula-ink">
              Password <span aria-hidden="true">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className={
                fieldErrors.password
                  ? 'rounded border border-khulula-error px-3 py-2'
                  : 'rounded border border-khulula-line-strong px-3 py-2'
              }
            />
            {fieldErrors.password && (
              <p id="password-error" className="text-sm text-khulula-error">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-khulula-primary px-4 py-2 font-medium text-white"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-khulula-muted">
          Accounts are created by the centre administrator. There is no public sign-up.
        </p>
      </div>
    </main>
  );
}
