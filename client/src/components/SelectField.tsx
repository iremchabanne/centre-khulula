// A dropdown, built like FormField so the two look and behave the same.
type Option = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  label: string;
  options: Option[];
  error?: string;
  defaultValue?: string;
};

export default function SelectField({ id, label, options, error, defaultValue }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-khulula-ink">
        {label} <span aria-hidden="true">*</span>
      </label>

      <select
        id={id}
        name={id}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={
          error
            ? 'min-h-11 rounded border border-khulula-error px-3 py-2'
            : 'min-h-11 rounded border border-khulula-line-strong px-3 py-2'
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${id}-error`} className="text-sm text-khulula-error">
          {error}
        </p>
      )}
    </div>
  );
}
