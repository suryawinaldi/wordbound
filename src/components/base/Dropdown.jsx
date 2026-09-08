/*
  Dropdown.jsx — Base component

  A single-select, button-triggered dropdown implementing the WAI-ARIA
  combobox-listbox pattern: a trigger with role="combobox" (which is the
  role that officially supports aria-activedescendant) controlling a
  popup role="listbox" of role="option" elements. Real DOM focus never
  leaves the trigger button — the currently highlighted option is
  communicated to assistive technology via aria-activedescendant and a
  visual highlight class, exactly like a native <select>.

  Owns its own accessibility semantics and keyboard behavior; never
  imports a store — data and behavior are always supplied by the parent
  via value/onChange/props/events, matching the pattern established by
  Button.jsx, Input.jsx, Badge.jsx, Avatar.jsx, and Tabs.jsx.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, border, or transition value is declared here.

  Usage:
    <Dropdown
      value={selectedLevel}
      onChange={setSelectedLevel}
      label="CEFR level"
      placeholder="Choose a level"
      options={[
        { value: 'a1', label: 'A1 — Beginner' },
        { value: 'b1', label: 'B1 — Intermediate' },
        { value: 'c1', label: 'C1 — Advanced', disabled: true }
      ]}
    />
*/
import { useState, useRef, useEffect, useCallback, useId, useMemo, forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './Dropdown.css'

const Dropdown = forwardRef(function Dropdown({
  /** Controlled value — the selected option's `value`, or null when nothing is selected. */
  value = null,
  /** onChange handler — receives the new option value. */
  onChange,
  onClear,
  /** Option definitions: [{ value, label, disabled? }]. `value` must be unique within the list. */
  options,
  placeholder = 'Select an option',
  label = '',
  helperText = '',
  errorText = '',
  disabled = false,
  loading = false,
  clearable = false,
  id: idProp = '',
  name = '',
  className = '',
  ...rest
}, ref) {
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listboxRef = useRef(null)
  const optionRefsMap = useRef(new Map())

  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const generatedId = useId()
  const inputId = idProp || generatedId
  const listboxId = `${inputId}-listbox`
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`
  function optionId(index) {
    return `${inputId}-option-${index}`
  }

  const hasError = errorText.trim().length > 0
  const effectiveVariant = hasError ? 'error' : 'default'

  const describedBy = useMemo(() => {
    if (hasError) return errorId
    if (helperText) return helperId
    return undefined
  }, [hasError, errorId, helperText, helperId])

  const selectedIndex = useMemo(() => options.findIndex((o) => o.value === value), [options, value])
  const selectedOption = useMemo(() => (selectedIndex >= 0 ? options[selectedIndex] : null), [options, selectedIndex])
  const enabledIndices = useMemo(
    () => options.reduce((acc, o, i) => { if (!o.disabled) acc.push(i); return acc }, []),
    [options]
  )
  const isInteractive = !disabled && !loading

  function setOptionRef(index, el) {
    if (el) {
      optionRefsMap.current.set(index, el)
    } else {
      optionRefsMap.current.delete(index)
    }
  }

  function scrollHighlightedIntoView(idx) {
    const el = optionRefsMap.current.get(idx)
    el?.scrollIntoView({ block: 'nearest' })
  }

  function openDropdown() {
    if (!isInteractive || isOpen) return
    setIsOpen(true)
    const initHighlight = selectedIndex >= 0 ? selectedIndex : (enabledIndices[0] ?? -1)
    setHighlightedIndex(initHighlight)
    setTimeout(() => scrollHighlightedIntoView(initHighlight), 0)
  }

  function closeDropdown() {
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  function toggleDropdown() {
    if (isOpen) {
      closeDropdown()
    } else {
      openDropdown()
    }
  }

  function commitHighlighted(idx) {
    const hi = idx !== undefined ? idx : highlightedIndex
    if (hi < 0) return
    const option = options[hi]
    if (!option || option.disabled) return
    if (option.value !== value) {
      onChange?.(option.value)
    }
    closeDropdown()
  }

  function moveHighlight(direction) {
    const enabled = enabledIndices
    if (enabled.length === 0) return
    const currentPos = enabled.indexOf(highlightedIndex)
    const nextPos = currentPos === -1
      ? (direction > 0 ? 0 : enabled.length - 1)
      : (currentPos + direction + enabled.length) % enabled.length
    const next = enabled[nextPos]
    setHighlightedIndex(next)
    setTimeout(() => scrollHighlightedIntoView(next), 0)
  }

  function highlightFirst() {
    const enabled = enabledIndices
    if (enabled.length === 0) return
    setHighlightedIndex(enabled[0])
    setTimeout(() => scrollHighlightedIntoView(enabled[0]), 0)
  }

  function highlightLast() {
    const enabled = enabledIndices
    if (enabled.length === 0) return
    const last = enabled[enabled.length - 1]
    setHighlightedIndex(last)
    setTimeout(() => scrollHighlightedIntoView(last), 0)
  }

  function handleClear(event) {
    event.stopPropagation()
    if (!clearable || !isInteractive || value === null) return
    onChange?.(null)
    onClear?.()
    closeDropdown()
  }

  // --------------------------------------------------------------------
  // Typeahead — mirrors native <select> behavior: typing letters directly
  // changes the selection to the first matching option, whether the
  // dropdown is open or closed.
  // --------------------------------------------------------------------
  const typeaheadBufferRef = useRef('')
  const typeaheadTimerRef = useRef(null)

  function handleTypeahead(char) {
    typeaheadBufferRef.current += char.toLowerCase()
    clearTimeout(typeaheadTimerRef.current)
    typeaheadTimerRef.current = setTimeout(() => {
      typeaheadBufferRef.current = ''
    }, 500)

    const match = options.findIndex(
      (o, i) => enabledIndices.includes(i) && o.label.toLowerCase().startsWith(typeaheadBufferRef.current)
    )
    if (match >= 0) {
      setHighlightedIndex(match)
      onChange?.(options[match].value)
      if (isOpen) setTimeout(() => scrollHighlightedIntoView(match), 0)
    }
  }

  function onTriggerKeydown(event) {
    if (!isInteractive) return

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      handleTypeahead(event.key)
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          openDropdown()
        } else {
          moveHighlight(1)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) {
          openDropdown()
        } else {
          moveHighlight(-1)
        }
        break
      case 'Home':
        if (isOpen) {
          event.preventDefault()
          highlightFirst()
        }
        break
      case 'End':
        if (isOpen) {
          event.preventDefault()
          highlightLast()
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (isOpen) {
          commitHighlighted()
        } else {
          openDropdown()
        }
        break
      case 'Escape':
        if (isOpen) {
          event.preventDefault()
          closeDropdown()
        }
        break
      case 'Tab':
        closeDropdown()
        break
      default:
        break
    }
  }

  function onOptionClick(index) {
    const option = options[index]
    if (!option || option.disabled) return
    setHighlightedIndex(index)
    commitHighlighted(index)
  }

  // Close on outside click
  useEffect(() => {
    function onDocumentPointerDown(event) {
      if (!isOpen || !rootRef.current) return
      if (!rootRef.current.contains(event.target)) {
        closeDropdown()
      }
    }
    document.addEventListener('pointerdown', onDocumentPointerDown)
    return () => {
      document.removeEventListener('pointerdown', onDocumentPointerDown)
      clearTimeout(typeaheadTimerRef.current)
    }
  }, [isOpen])

  // Close if options array shrinks and highlightedIndex goes out of bounds
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && !options[highlightedIndex]) {
      closeDropdown()
    }
  }, [options, isOpen, highlightedIndex])

  // Accessibility-first guard
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const hasAccessibleName = !!(label || rest['aria-label'] || rest['aria-labelledby'])
    if (!hasAccessibleName) {
      console.warn(
        '[Dropdown] This dropdown has no accessible name. Provide a `label` prop ' +
          '(or aria-label/aria-labelledby) describing what it selects.'
      )
    }
  }, [label])

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const popVariants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 },
    visible: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  }
  const popTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.12, ease: [0.4, 0, 0.2, 1] }

  return (
    <div ref={rootRef} className={`wb-dropdown ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="wb-dropdown__label">
          {label}
        </label>
      )}

      <button
        id={inputId}
        ref={triggerRef}
        type="button"
        className={`wb-dropdown__trigger wb-dropdown__trigger--${effectiveVariant}${
          isOpen ? ' wb-dropdown__trigger--open' : ''
        }`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-controls={listboxId}
        aria-activedescendant={isOpen && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
        aria-invalid={effectiveVariant === 'error' ? 'true' : undefined}
        aria-describedby={describedBy}
        aria-busy={loading ? 'true' : undefined}
        disabled={disabled}
        name={name}
        onClick={toggleDropdown}
        onKeyDown={onTriggerKeydown}
        {...rest}
      >
        <span className={`wb-dropdown__value${!selectedOption ? ' wb-dropdown__value--placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {loading && <span className="wb-dropdown__spinner" aria-hidden="true" />}

        {!loading && clearable && selectedOption && isInteractive && (
          <button
            type="button"
            className="wb-dropdown__clear"
            aria-label="Clear selection"
            onClick={handleClear}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {!loading && (
          <span className={`wb-dropdown__chevron${isOpen ? ' wb-dropdown__chevron--open' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </button>

      {hasError && (
        <p id={errorId} className="wb-dropdown__message wb-dropdown__message--error" role="alert">
          {errorText}
        </p>
      )}
      {!hasError && helperText && (
        <p id={helperId} className="wb-dropdown__message wb-dropdown__message--helper">
          {helperText}
        </p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            id={listboxId}
            ref={listboxRef}
            className="wb-dropdown__listbox"
            role="listbox"
            aria-labelledby={label ? inputId : undefined}
            variants={popVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={popTransition}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                ref={(el) => setOptionRef(index, el)}
                id={optionId(index)}
                role="option"
                className={[
                  'wb-dropdown__option',
                  index === highlightedIndex ? 'wb-dropdown__option--highlighted' : '',
                  option.value === value ? 'wb-dropdown__option--selected' : '',
                  option.disabled ? 'wb-dropdown__option--disabled' : '',
                ].filter(Boolean).join(' ')}
                aria-selected={option.value === value ? 'true' : 'false'}
                aria-disabled={option.disabled ? 'true' : undefined}
                onClick={() => onOptionClick(index)}
                onPointerMove={() => !option.disabled && setHighlightedIndex(index)}
              >
                {option.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
})

export default Dropdown
