// One field of a form: the label, the input, and the error under it. It exists
// so the accessibility wiring — label, aria-invalid, aria-describedby — is
// written once instead of once per field.
type Props = {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  error?: string;
  defaultValue?: string;
  autoComplete?: string;
  // Most fields are required, so the asterisk is the default. aria-required
  // says the same thing to a screen reader, which cannot see the asterisk.
  required?: boolean;
  // A textarea instead of a one-line input, for long text.
  multiline?: boolean;
};

export default function FormField({
  id,
  label,
  type = 'text',
  error,
  defaultValue,
  autoComplete,
  required = true,
  multiline = false,
}: Props) {
  // The input name is the id: the form is read with FormData, which uses names.
  const boxClasses = error
    ? 'min-h-11 rounded border border-khulula-error px-3 py-2'
    : 'min-h-11 rounded border border-khulula-line-strong px-3 py-2';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-khulula-ink">
        {label} {required && <span aria-hidden="true">*</span>}
      </label>

      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          defaultValue={defaultValue}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={boxClasses}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={boxClasses}
        />
      )}

      {error && (
        <p id={`${id}-error`} className="text-sm text-khulula-error">
          {error}
        </p>
      )}
    </div>
  );
}
