import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Button from '../../components/Button';
import FormField from '../../components/FormField';

// Screen 5 of arborescence-ecrans.md, in two states: the form, then the
// acknowledgement. The second is not another page — it is what this one shows
// once the API has answered.
//
// No payment, ever. The form records an intention to give: no card field, no
// payment provider. That is an explicit decision of the cahier des charges.
type FieldErrors = {
  amount?: string;
  consent?: string;
};

// The three amounts of the mockup. Buttons that fill the field, not a second
// way of choosing: the input below is always the one that is submitted.
const SUGGESTED = [250, 500, 1000];

export default function DonatePage() {
  const [amount, setAmount] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // The amount that was recorded, or null while the form is still showing.
  const [recorded, setRecorded] = useState<string | null>(null);
  const location = useLocation();

  // Clicking "Donate" while already on this page does not rebuild the
  // component, so the thank-you screen would stay. React Router gives each
  // navigation a new key, which is what tells us to start a fresh form.
  useEffect(() => {
    setRecorded(null);
    setAmount('');
    setFieldErrors({});
    setFormError('');
  }, [location.key]);

  async function submit(formData: FormData) {
    const name = String(formData.get('donor_name') ?? '').trim();
    const email = String(formData.get('donor_email') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const consent = formData.get('consent_given') === 'on';

    // Comfort checks only: the server revalidates everything in api/src/schemas.ts.
    const errors: FieldErrors = {};
    if (amount === '' || Number(amount) <= 0) {
      errors.amount = 'Enter an amount greater than 0.';
    }
    // RGPD: contact details are only stored if the donor agreed to it.
    if (email !== '' && !consent) {
      errors.consent = 'Tick the box, or leave the email field empty.';
    }

    setFieldErrors(errors);
    setFormError('');
    if (errors.amount || errors.consent) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          // An empty field is sent as null, not as "": the column is optional
          // and an empty string is not the same thing as no answer.
          donor_name: name === '' ? null : name,
          donor_email: email === '' ? null : email,
          message: message === '' ? null : message,
          consent_given: consent,
        }),
      });

      if (response.ok) {
        setRecorded(amount);
        return;
      }

      // The public form is rate limited in Redis: five an hour.
      if (response.status === 429) {
        setFormError('Several forms have already been sent from here. Please try again later.');
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

  if (recorded !== null) {
    return <ThankYou amount={recorded} />;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
      <div>
        <h1 className="mb-2 font-heading text-3xl text-khulula-ink">Make a donation</h1>
        <p className="text-khulula-muted">
          Every donation goes directly into food, medication and enclosure upkeep.
        </p>

        <div className="mt-6 rounded-lg border border-khulula-line bg-khulula-accent-soft p-4 text-sm">
          <p className="font-semibold text-khulula-ink">Registering an intention.</p>
          <p className="mt-1">
            This form records your intention to give. No card details are collected here and no
            payment is taken. If you leave your email, the centre will send you transfer details.
          </p>
        </div>

        <div className="mt-6 rounded-lg bg-khulula-surface-alt p-5">
          <h2 className="mb-3 font-heading text-khulula-ink">What your gift covers</h2>
          <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-semibold text-khulula-ink">R 250</dt>
            <dd>One week of food for a mongoose</dd>
            <dt className="font-semibold text-khulula-ink">R 500</dt>
            <dd>Medication for a fractured wing</dd>
            <dt className="font-semibold text-khulula-ink">R 1 000</dt>
            <dd>One month of enclosure upkeep</dd>
          </dl>
        </div>
      </div>

      <form action={submit} noValidate className="flex flex-col gap-4 self-start">
        {formError !== '' && (
          <p
            role="status"
            className="rounded border border-khulula-error p-3 text-sm text-khulula-error"
          >
            {formError}
          </p>
        )}

        <div className="flex gap-2">
          {SUGGESTED.map((one) => (
            <Button key={one} variant="ghost" onClick={() => setAmount(String(one))}>
              R {one}
            </Button>
          ))}
        </div>

        {/* Controlled, because the buttons above write into it. Every other
            field is read from the FormData and needs no state. */}
        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-sm font-medium text-khulula-ink">
            Amount in rand <span aria-hidden="true">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={fieldErrors.amount ? true : undefined}
            aria-describedby={fieldErrors.amount ? 'amount-error' : 'amount-hint'}
            className="min-h-11 rounded border border-khulula-line-strong px-3 py-2"
          />
          <p id="amount-hint" className="text-sm text-khulula-muted">
            Between R 1 and R 10 000.
          </p>
          {fieldErrors.amount && (
            <p id="amount-error" className="text-sm text-khulula-error">
              {fieldErrors.amount}
            </p>
          )}
        </div>

        <FormField id="donor_name" label="Your name — optional" required={false} />
        <FormField id="donor_email" label="Email — optional" type="email" required={false} />
        <FormField id="message" label="Message — optional" multiline required={false} />

        <div className="flex gap-3">
          <input id="consent_given" name="consent_given" type="checkbox" className="mt-1" />
          <label htmlFor="consent_given" className="text-sm text-khulula-muted">
            I agree that Khulula may store my name and email for this donation.{' '}
            <Link to="/legal" className="underline decoration-1 underline-offset-4">
              Privacy policy
            </Link>
          </label>
        </div>

        {fieldErrors.consent && (
          <p className="text-sm text-khulula-error">{fieldErrors.consent}</p>
        )}

        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting ? 'Recording…' : 'Confirm my donation'}
        </Button>
      </form>
    </div>
  );
}

function ThankYou({ amount }: { amount: string }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="font-heading text-3xl text-khulula-ink">Thank you.</h1>

      <p className="mt-3 text-khulula-muted">
        Your intention to give <strong className="text-khulula-ink">R {amount}</strong> has been
        recorded.
      </p>

      <p className="mt-6 rounded-lg border border-khulula-line bg-khulula-accent-soft p-4 text-left text-sm">
        No payment has been taken. Nothing has been charged to any card or account.
      </p>

      <p className="mt-8">
        <Link to="/animals" className="underline decoration-1 underline-offset-4">
          See what donations make possible
        </Link>
      </p>
    </div>
  );
}
