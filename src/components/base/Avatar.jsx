import { useState, useEffect, forwardRef } from 'react'
import './Avatar.css'

/**
 * Avatar — Player/identity display with strict fallback order:
 * image → initials → generic-person icon (never renders empty).
 *
 * Non-interactive (span) by default; becomes a button when clickable=true.
 *
 * Props:
 *   src       — image URL
 *   alt       — accessible name (also image alt text)
 *   initials  — fallback text (typically 1-2 chars)
 *   variant   — 'default' | 'online' | 'offline' | 'away'
 *   size      — 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   ring      — adds decorative ring
 *   clickable — renders as <button>
 *   disabled  — only meaningful when clickable=true
 *   loading   — shows skeleton placeholder
 */
const Avatar = forwardRef(function Avatar({
  src = '',
  alt = '',
  initials = '',
  variant = 'default',
  size = 'md',
  ring = false,
  clickable = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...rest
}, ref) {
  const [imageFailed, setImageFailed] = useState(false)

  // Reset failed state when src changes
  useEffect(() => {
    setImageFailed(false)
  }, [src])

  const showImage = !!src && !imageFailed && !loading
  const showInitials = !showImage && !loading && !!initials
  const showIconFallback = !showImage && !loading && !initials

  const Tag = clickable ? 'button' : 'span'

  const statusLabels = { online: 'Online', away: 'Away', offline: 'Offline' }
  const statusLabel = statusLabels[variant] || ''

  function handleClick(event) {
    if (!clickable || disabled) return
    onClick?.(event)
  }

  const classes = [
    'wb-avatar',
    `wb-avatar--${size}`,
    ring ? 'wb-avatar--ring' : '',
    clickable ? 'wb-avatar--clickable' : '',
    loading ? 'wb-avatar--loading' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <Tag
      ref={ref}
      className={classes}
      type={clickable ? 'button' : undefined}
      disabled={clickable && disabled ? true : undefined}
      aria-label={alt || undefined}
      aria-busy={loading ? 'true' : undefined}
      onClick={handleClick}
      {...rest}
    >
      <span className="wb-avatar__frame">
        {loading && <span className="wb-avatar__skeleton" aria-hidden="true" />}

        {!loading && showImage && (
          <img
            src={src}
            alt={alt}
            className="wb-avatar__image"
            onError={() => setImageFailed(true)}
          />
        )}

        {!loading && showInitials && (
          <span className="wb-avatar__initials" aria-hidden="true">
            {initials}
          </span>
        )}

        {!loading && showIconFallback && (
          <span className="wb-avatar__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M4.5 20c1.2-3.8 4.4-6 7.5-6s6.3 2.2 7.5 6"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
              />
            </svg>
          </span>
        )}
      </span>

      {variant !== 'default' && !loading && (
        <span className={`wb-avatar__status wb-avatar__status--${variant}`}>
          <span className="wb-visually-hidden">{statusLabel}</span>
        </span>
      )}
    </Tag>
  )
})

export default Avatar
