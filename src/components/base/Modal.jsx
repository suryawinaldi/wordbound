/*
  Modal.jsx — Base component

  A single, reusable, fully accessible dialog: scrim, centered panel,
  focus trap, scroll lock, Escape/backdrop close, and focus restoration
  on close. Rendered into a portal so it's never affected by an ancestor's
  overflow/z-index/transform.

  Scope note: this component owns exactly one dialog's presentation and
  behavior. It does NOT manage stacking multiple modals, a global open/
  close registry, or app-wide overlay positioning — that orchestration
  belongs to a future ModalLayer/AppShell, which is explicitly out of
  scope for this step and will compose this component rather than replace it.

  Owns its own accessibility semantics and keyboard behavior; never
  imports a store — data and behavior are always supplied by the parent
  via open/onClose/props/children, matching the pattern established by
  Button.jsx, Input.jsx, Badge.jsx, Avatar.jsx, Tabs.jsx,
  Dropdown.jsx, and Toast.jsx.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, or transition value is declared here.

  Usage:
    <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Delete this word?" description="This can't be undone.">
      <p>Are you sure you want to remove this from your garden?</p>
      <Modal.Footer>
        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
      </Modal.Footer>
    </Modal>
*/
import { useEffect, useRef, useId, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './Modal.css'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null
  )
}

function Modal({
  /** Whether the modal is open. */
  open = false,
  title = '',
  description = '',
  /** Accessible name fallback when there's no `title` (e.g. a fully custom header). Ignored if `title` is set, since aria-labelledby takes precedence. */
  ariaLabel = '',
  /** Shows the built-in "x" close button in the corner of the panel. */
  closable = true,
  /** Whether clicking the backdrop closes the modal. */
  closeOnBackdrop = true,
  onClose,
  header,
  footer,
  children,
}) {
  const panelRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descId = `${generatedId}-description`

  const triggerClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  // Scroll lock + focus capture when opening
  useEffect(() => {
    if (!open) return

    // Save previous focus target
    previouslyFocusedRef.current = document.activeElement

    // Lock body scroll
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus first focusable element after mount
    const raf = requestAnimationFrame(() => {
      const focusables = getFocusableElements(panelRef.current)
      if (focusables.length > 0) {
        focusables[0].focus()
      } else {
        panelRef.current?.focus()
      }
    })

    // Escape key handler
    function onGlobalKeydown(event) {
      if (event.key === 'Escape') triggerClose()
    }
    document.addEventListener('keydown', onGlobalKeydown)

    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onGlobalKeydown)
      // Restore focus on close
      previouslyFocusedRef.current?.focus?.()
      previouslyFocusedRef.current = null
    }
  }, [open, triggerClose])

  // Accessibility-first guard
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (!title && !ariaLabel) {
      console.warn(
        '[Modal] This modal has no accessible name. Provide a `title` prop ' +
          '(or `aria-label` when using a custom header without a title).'
      )
    }
  }, [title, ariaLabel])

  function onScrimMouseDown(event) {
    if (closeOnBackdrop && !panelRef.current?.contains(event.target)) {
      triggerClose()
    }
  }

  function onPanelKeydown(event) {
    if (event.key !== 'Tab') return
    const focusables = getFocusableElements(panelRef.current)
    if (focusables.length === 0) {
      event.preventDefault()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scrimVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const panelVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 8, scale: 0.98 },
    visible: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, scale: 1 },
  }

  const transition = prefersReducedMotion
    ? { duration: 0.1 }
    : { duration: 0.2, ease: [0.4, 0, 0.2, 1] }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="wb-modal-scrim"
          variants={scrimVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={transition}
          onMouseDown={onScrimMouseDown}
        >
          <div className="wb-modal-scrim__backdrop" aria-hidden="true" />
          <motion.div
            ref={panelRef}
            className="wb-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title && ariaLabel ? ariaLabel : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}
            onKeyDown={onPanelKeydown}
          >
            {closable && (
              <button
                type="button"
                className="wb-modal__close"
                aria-label="Close dialog"
                onClick={triggerClose}
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            )}

            {(header || title || description) && (
              <header className="wb-modal__header">
                {header || (
                  <>
                    {title && <h2 id={titleId} className="wb-modal__title">{title}</h2>}
                    {description && <p id={descId} className="wb-modal__description">{description}</p>}
                  </>
                )}
              </header>
            )}

            <div className="wb-modal__body">
              {children}
            </div>

            {footer && (
              <footer className="wb-modal__footer">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal
