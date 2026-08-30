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
  // Filters are optional; the fields of a form are usually not.
  required?: boolean;
  // Given when the page needs to react to the choice, as the admission form
  // does: picking a species changes the list of enclosures.
  onChange?: (value: string) => void;
};

export default function SelectField({
  id,
  label,
  options,
  error,
  defaultValue,
  required = true,
  onChange,
}: Props) {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (onChange) {
      onChange(event.target.value);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-khulula-ink">
        {label} {required && <span aria-hidden="true">*</span>}
      </label>

      <select
        id={id}
        name={id}
        defaultValue={defaultValue}
        onChange={handleChange}
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
