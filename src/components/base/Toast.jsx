/*
  Toast.jsx — Base component

  A single toast notification unit: icon, title, description, an optional
  action, an optional dismiss button, and an auto-dismiss timer that pauses
  while hovered or focused. This component owns one toast's presentation
  and timing only — it does not manage a stack, positioning, or mount/
  unmount choreography for multiple toasts; that orchestration belongs to
  a future global overlay/notifications layer. Internally composes Button.jsx
  for the default action button.

  Variant note: this design system deliberately uses a single brand green
  plus a limited semantic palette (success/warning/error) rather than a
  wide hue set. The 'info' variant therefore reads in the brand color
  (--brand-primary / --brand-tint) rather than introducing a new blue
  token that doesn't exist anywhere else in tokens.css.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, or transition value is declared here.

  Usage:
    <Toast variant="success" title="Saved!" description="Your progress is safe." onDismiss={() => remove(id)} />
    <Toast variant="error" title="Couldn't connect" duration={0} onDismiss={() => remove(id)} />
    <Toast variant="info" title="New words unlocked" actionLabel="View" onAction={openGarden} onDismiss={() => remove(id)} />
*/
import { useRef, useEffect, useMemo } from 'react'
import Button from './Button.jsx'
import './Toast.css'

function Toast({
  /** Visual/semantic style. One of 'success' | 'warning' | 'error' | 'info'. */
  variant = 'info',
  title = '',
  description = '',
  /** Auto-dismiss delay in milliseconds. Set to 0 to disable auto-dismiss entirely. */
  duration = 5000,
  /** Shows the "x" dismiss button. */
  dismissible = true,
  /** Renders a default action Button with this label if no actionSlot is provided. */
  actionLabel = '',
  /** Optional custom action slot content. */
  actionSlot,
  /** Optional custom icon slot content. */
  iconSlot,
  onDismiss,
  onAction,
}) {
  const rootRef = useRef(null)
  const remainingTimeRef = useRef(duration)
  const timerStartRef = useRef(0)
  const timerHandleRef = useRef(null)
  const isHoveredRef = useRef(false)
  const isFocusedRef = useRef(false)

  const ariaRole = variant === 'error' ? 'alert' : 'status'
  const ariaLive = variant === 'error' ? 'assertive' : 'polite'

  function hasAutoDismiss() {
    return typeof duration === 'number' && duration > 0
  }

  function handleDismiss() {
    clearTimer()
    onDismiss?.()
  }

  function handleAction() {
    onAction?.()
  }

  function clearTimer() {
    if (timerHandleRef.current) {
      clearTimeout(timerHandleRef.current)
      timerHandleRef.current = null
    }
  }

  function startTimer() {
    if (!hasAutoDismiss() || remainingTimeRef.current <= 0) return
    timerStartRef.current = Date.now()
    timerHandleRef.current = setTimeout(() => {
      handleDismiss()
    }, remainingTimeRef.current)
  }

  function pauseTimer() {
    if (!hasAutoDismiss() || !timerHandleRef.current) return
    clearTimer()
    const elapsed = Date.now() - timerStartRef.current
    remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0)
  }

  function resumeTimer() {
    if (!hasAutoDismiss() || timerHandleRef.current) return
    startTimer()
  }

  // A single source of truth for pause/resume, driven by either hover or
  // keyboard focus being present anywhere inside the toast — satisfies
  // WCAG's "pause on hover or focus" guidance for timed content.
  function syncTimerToPauseState() {
    if (isHoveredRef.current || isFocusedRef.current) {
      pauseTimer()
    } else {
      resumeTimer()
    }
  }

  useEffect(() => {
    startTimer()
    return () => clearTimer()
  }, [])

  function onPointerEnter() {
    isHoveredRef.current = true
    syncTimerToPauseState()
  }

  function onPointerLeave() {
    isHoveredRef.current = false
    syncTimerToPauseState()
  }

  function onFocusIn() {
    isFocusedRef.current = true
    syncTimerToPauseState()
  }

  function onFocusOut(event) {
    if (!rootRef.current?.contains(event.relatedTarget)) {
      isFocusedRef.current = false
      syncTimerToPauseState()
    }
  }

  // Default icons per variant
  const defaultIcon = useMemo(() => {
    if (variant === 'success') {
      return (
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.5 10.5L8.75 12.75L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
    if (variant === 'warning') {
      return (
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M10 3L18 17H2L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 8.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.9" fill="currentColor" />
        </svg>
      )
    }
    if (variant === 'error') {
      return (
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    }
    // info
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="6.25" r="0.9" fill="currentColor" />
      </svg>
    )
  }, [variant])

  return (
    <div
      ref={rootRef}
      className={`wb-toast wb-toast--${variant}`}
      role={ariaRole}
      aria-live={ariaLive}
      aria-atomic="true"
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      onFocus={onFocusIn}
      onBlur={onFocusOut}
    >
      <span className="wb-toast__icon" aria-hidden="true">
        {iconSlot || defaultIcon}
      </span>

      <div className="wb-toast__content">
        {title && <p className="wb-toast__title">{title}</p>}
        {description && <p className="wb-toast__description">{description}</p>}
      </div>

      {(actionSlot || actionLabel) && (
        <div className="wb-toast__action">
          {actionSlot || (
            <Button variant="ghost" size="sm" onClick={handleAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}

      {dismissible && (
        <button
          type="button"
          className="wb-toast__dismiss"
          aria-label="Dismiss notification"
          onClick={handleDismiss}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Toast
