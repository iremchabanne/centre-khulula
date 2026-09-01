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

      {/* The browser draws its own arrow hard against the border and ignores
          padding, so appearance-none hides it and we draw our own. relative and
          absolute put our arrow inside the field; pointer-events-none lets a
          click go through to the select underneath. */}
      <div className="relative">
        <select
          id={id}
          name={id}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={
            error
              ? 'min-h-11 w-full appearance-none rounded border border-khulula-error bg-khulula-surface py-2 pl-3 pr-10'
              : 'min-h-11 w-full appearance-none rounded border border-khulula-line-strong bg-khulula-surface py-2 pl-3 pr-10'
          }
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* A chevron drawn by hand rather than a font character, which came out
            heavy. currentColor means the palette class above still sets it. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-khulula-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-khulula-error">
          {error}
        </p>
      )}
    </div>
  );
}
