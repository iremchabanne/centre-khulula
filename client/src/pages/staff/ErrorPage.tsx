import { Link } from 'react-router-dom';

// Screen 13 of arborescence-ecrans.md: one page, three states. None of the
// three says anything technical — no stack trace, no table name. A talkative
// error message helps an attacker (OWASP A05).
type Props = {
  kind?: 'not-found' | 'denied' | 'session-expired';
};

export default function ErrorPage({ kind = 'not-found' }: Props) {
  let title = 'Page not found';
  let text = 'This page does not exist, or the animal you are looking for has been removed.';
  let linkTo = '/staff/enclosures';
  let linkLabel = 'Back to enclosures';

  if (kind === 'denied') {
    title = 'You do not have access to this page';
    text =
      "Staff accounts are managed by the centre's administrators. If you need an account created or a password reset, ask an administrator.";
  }

  if (kind === 'session-expired') {
    title = 'Your session has expired';
    text = 'You have been signed out after a period of inactivity. Please sign in again.';
    linkTo = '/staff/login';
    linkLabel = 'Sign in';
  }

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="mb-3 font-heading text-xl text-khulula-ink">{title}</h1>
      <p className="mb-6 text-khulula-muted">{text}</p>
      <Link
        to={linkTo}
        className="inline-block rounded bg-khulula-primary px-4 py-2 font-medium text-white"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
