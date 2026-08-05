/**
 * Reusable labeled input. Accepts an optional `error` string to show
 * inline validation feedback under the field.
 */
const FormInput = ({ label, error, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white/70">
        {label}
      </label>
      <input id={id} className="input-field" {...props} />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default FormInput;
