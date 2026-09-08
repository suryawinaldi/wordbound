import { forwardRef } from 'react'
import './Badge.css'

/**
 * Badge — A compact status/label pill.
 * Non-interactive (span) by default; becomes a button when clickable=true.
 *
 * Variants: default | primary | success | warning | error | outline
 * Sizes: sm | md | lg
 *
 * Props:
 *   variant   — visual style
 *   size      — badge size
 *   clickable — renders as <button>
 *   disabled  — only meaningful when clickable=true
 *   leading   — optional leading icon element
 *   trailing  — optional trailing icon element
 *   children  — badge label
 */
const Badge = forwardRef(function Badge({
  variant = 'default',
  size = 'md',
  clickable = false,
  disabled = false,
  leading,
  trailing,
  children,
  className = '',
  onClick,
  ...rest
}, ref) {
  const Tag = clickable ? 'button' : 'span'

  function handleClick(event) {
    if (!clickable || disabled) return
    onClick?.(event)
  }

  const classes = [
    'wb-badge',
    `wb-badge--${variant}`,
    `wb-badge--${size}`,
    clickable ? 'wb-badge--clickable' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <Tag
      ref={ref}
      className={classes}
      type={clickable ? 'button' : undefined}
      disabled={clickable && disabled ? true : undefined}
      onClick={handleClick}
      {...rest}
    >
      {leading && (
        <span className="wb-badge__icon wb-badge__icon--leading" aria-hidden="true">
          {leading}
        </span>
      )}
      <span className="wb-badge__label">{children}</span>
      {trailing && (
        <span className="wb-badge__icon wb-badge__icon--trailing" aria-hidden="true">
          {trailing}
        </span>
      )}
    </Tag>
  )
})

export default Badge
