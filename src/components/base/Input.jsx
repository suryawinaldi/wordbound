import { useState, useRef, useId, forwardRef } from 'react'
import './Input.css'

/**
 * Input — Single-line text entry with label/helper/error support,
 * prefix/suffix slots, optional clear button, and password visibility toggle.
 *
 * Props:
 *   value        — controlled value
 *   onChange     — change handler (receives string value)
 *   label        — field label
 *   helperText   — supporting text below (shown when no error)
 *   errorText    — error message (forces error variant)
 *   placeholder  — input placeholder
 *   type         — native input type ('password' enables visibility toggle)
 *   variant      — 'default' | 'success' | 'warning' | 'error'
 *   size         — 'sm' | 'md' | 'lg'
 *   disabled     — disables the input
 *   readOnly     — makes the input read-only
 *   required     — marks as required
 *   loading      — shows loading spinner
 *   clearable    — shows clear button when value is present
 *   id           — override auto-generated id
 *   name         — native name attribute
 *   autoComplete — native autocomplete attribute
 *   prefix       — prefix element (left adornment)
 *   suffix       — suffix element (right adornment)
 */
const Input = forwardRef(function Input({
  value = '',
  onChange,
  onFocus,
  onBlur,
  onClear,
  label = '',
  helperText = '',
  errorText = '',
  placeholder = '',
  type = 'text',
  variant = 'default',
  size = 'md',
  disabled = false,
  readOnly = false,
  required = false,
  loading = false,
  clearable = false,
  id: idProp = '',
  name = '',
  autoComplete = 'off',
  prefix,
  suffix,
  className = '',
  ...rest
}, ref) {
  const generatedId = useId()
  const inputRef = useRef(null)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputId = idProp || generatedId
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`

  const hasError = errorText.trim().length > 0
  const effectiveVariant = hasError ? 'error' : variant

  const isPassword = type === 'password'
  const actualType = isPassword ? (passwordVisible ? 'text' : 'password') : type

  const hasValue = value !== '' && value !== null && value !== undefined
  const showClearButton = clearable && hasValue && !disabled && !readOnly && !loading
  const showPasswordToggle = isPassword && !disabled && !loading

  const describedBy = hasError ? errorId : helperText ? helperId : undefined

  function handleInput(event) {
    onChange?.(event.target.value)
  }

  function handleFocus(event) {
    setIsFocused(true)
    onFocus?.(event)
  }

  function handleBlur(event) {
    setIsFocused(false)
    onBlur?.(event)
  }

  function handleClear() {
    onChange?.('')
    onClear?.()
    const el = ref?.current || inputRef.current
    el?.focus()
  }

  const controlClasses = [
    'wb-field__control',
    `wb-field__control--${size}`,
    `wb-field__control--${effectiveVariant}`,
    isFocused ? 'wb-field__control--focused' : '',
    disabled ? 'wb-field__control--disabled' : '',
    readOnly ? 'wb-field__control--readonly' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={`wb-field wb-field--${size} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="wb-field__label">
          {label}
          {required && <span className="wb-field__required" aria-hidden="true">*</span>}
        </label>
      )}

      <div className={controlClasses}>
        {prefix && (
          <span className="wb-field__adornment wb-field__adornment--prefix">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          ref={ref || inputRef}
          className="wb-field__input"
          type={actualType}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          name={name}
          autoComplete={autoComplete}
          aria-invalid={effectiveVariant === 'error' ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-busy={loading ? 'true' : undefined}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {suffix && (
          <span className="wb-field__adornment wb-field__adornment--suffix">
            {suffix}
          </span>
        )}

        {loading && <span className="wb-field__spinner" aria-hidden="true" />}

        {showClearButton && (
          <button
            type="button"
            className="wb-field__action"
            aria-label="Clear input"
            onClick={handleClear}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {showPasswordToggle && (
          <button
            type="button"
            className="wb-field__action"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible ? 'true' : 'false'}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {!passwordVisible ? (
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 3L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
      </div>

      {hasError ? (
        <p id={errorId} className="wb-field__message wb-field__message--error" role="alert">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={helperId} className="wb-field__message wb-field__message--helper">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export default Input
