function AuthField({
  autoComplete,
  error,
  id,
  label,
  name,
  onChange,
  placeholder,
  type = 'text',
  value,
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default AuthField
