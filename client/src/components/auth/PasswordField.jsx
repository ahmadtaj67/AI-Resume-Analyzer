function PasswordField({
  autoComplete,
  disabled = false,
  error,
  id,
  label,
  name,
  onChange,
  placeholder,
  showPassword,
  toggleLabel,
  onToggleVisibility,
  value,
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-control">
        <input
          autoComplete={autoComplete}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          id={id}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={showPassword ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={toggleLabel}
          className="password-toggle"
          disabled={disabled}
          onClick={onToggleVisibility}
          type="button"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default PasswordField
