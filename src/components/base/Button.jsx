import { forwardRef } from 'react'
import './Button.css'

/**
 * Button — The single interactive-action primitive for WordBound.
 *
 * Variants: primary | secondary | ghost | danger
 * Sizes: sm | md | lg
 *
 * Props:
 *   variant  — visual style
 *   size     — button size
 *   type     — native button type (default: 'button')
 *   disabled — disables interaction and dims the button
 *   loading  — shows loading spinner and disables interaction
 *   block    — stretches button to fill container width
 *   icon     — optional icon element (shown left of label)
 *   children — button label
 *   onClick  — click handler
 */
const Button = forwardRef(function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  block = false,
  icon,
  children,
  className = '',
  onClick,
  ...rest
}, ref) {
  const isDisabled = disabled || loading

  function handleClick(event) {
    if (isDisabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  const classes = [
    'wb-button',
    `wb-button--${variant}`,
    `wb-button--${size}`,
    block ? 'wb-button--block' : '',
    loading ? 'wb-button--loading' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      className={classes}
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      onClick={handleClick}
      {...rest}
    >
      {loading && <span className="wb-button__spinner" aria-hidden="true" />}
      {icon && !loading && <span className="wb-button__icon">{icon}</span>}
      <span className="wb-button__label">{children}</span>
    </button>
  )
})

export default Button
