/*
  Tabs.jsx — Base component

  A self-contained, fully accessible horizontal Tabs control implementing
  the WAI-ARIA Authoring Practices Tabs pattern (automatic activation:
  arrow-key navigation moves focus AND selection together). Renders its
  own tablist and the single active tabpanel — the parent only supplies
  `items` and a `renderPanel` render prop for that tab's content.

  Owns its own accessibility semantics and keyboard behavior; never
  imports a store — data and behavior are always supplied by the parent
  via value/onChange/props. Internally composes Badge.jsx for the default
  badge rendering rather than reimplementing it.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, or transition value is declared here.

  Usage:
    <Tabs
      value={activeTab}
      onChange={setActiveTab}
      items={[
        { id: 'consistency', label: 'Consistency' },
        { id: 'mastery', label: 'Mastery', badge: 3 },
        { id: 'exploration', label: 'Exploration', disabled: true }
      ]}
      renderPanel={({ item }) => <p>Content for {item.label}</p>}
    />
*/
import { useRef, useEffect, useCallback, useId, useMemo } from 'react'
import Badge from './Badge.jsx'
import './Tabs.css'

function Tabs({
  /** Tab definitions: [{ id, label, badge?, disabled? }]. `id` must be unique within the list. */
  items,
  /** The currently active tab's id. */
  value = '',
  /** onChange handler — receives the new tab id. */
  onChange,
  /** Visual style. 'underline' for page navigation, 'pill' for mode-switching. */
  variant = 'underline',
  /** Render prop for the active tab's panel content. Receives { item }. */
  renderPanel,
  /** Optional icon render prop. Receives { item }. */
  renderIcon,
  /** Optional badge render prop. Receives { item }. Overrides default Badge rendering. */
  renderBadge,
}) {
  const baseId = useId()
  const tablistRef = useRef(null)
  const indicatorRef = useRef(null)
  const tabRefsMap = useRef(new Map())

  const enabledItems = useMemo(() => items.filter((item) => !item.disabled), [items])

  const activeId = useMemo(() => {
    const matchesValue = items.some((item) => item.id === value && !item.disabled)
    if (matchesValue) return value
    return enabledItems.length > 0 ? enabledItems[0].id : undefined
  }, [items, value, enabledItems])

  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [items, activeId])

  function tabId(itemId) {
    return `${baseId}-tab-${itemId}`
  }
  function panelId(itemId) {
    return `${baseId}-panel-${itemId}`
  }

  function setTabRef(itemId, el) {
    if (el) {
      tabRefsMap.current.set(itemId, el)
    } else {
      tabRefsMap.current.delete(itemId)
    }
  }

  function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const selectTab = useCallback((itemId, { focusTab = false } = {}) => {
    const item = items.find((i) => i.id === itemId)
    if (!item || item.disabled) return
    if (itemId !== value) {
      onChange?.(itemId)
    }
    if (focusTab) {
      // Use setTimeout to allow state update to flush
      setTimeout(() => {
        const el = tabRefsMap.current.get(itemId)
        el?.focus()
        el?.scrollIntoView({
          inline: 'nearest',
          block: 'nearest',
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        })
      }, 0)
    }
  }, [items, value, onChange])

  function moveFocus(direction) {
    if (enabledItems.length === 0) return
    const currentIndex = enabledItems.findIndex((item) => item.id === activeId)
    const nextIndex = (currentIndex + direction + enabledItems.length) % enabledItems.length
    selectTab(enabledItems[nextIndex].id, { focusTab: true })
  }

  function focusFirst() {
    if (enabledItems.length === 0) return
    selectTab(enabledItems[0].id, { focusTab: true })
  }

  function focusLast() {
    if (enabledItems.length === 0) return
    selectTab(enabledItems[enabledItems.length - 1].id, { focusTab: true })
  }

  function onKeydown(event) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(-1)
        break
      case 'Home':
        event.preventDefault()
        focusFirst()
        break
      case 'End':
        event.preventDefault()
        focusLast()
        break
      default:
        break
    }
  }

  // Sliding active-indicator positioning. Measures the active tab button's
  // offset/width within the tablist and positions an absolutely-positioned
  // indicator element to match — recalculated on selection change and on
  // any resize of the tablist itself.
  const updateIndicatorPosition = useCallback(() => {
    const activeEl = tabRefsMap.current.get(activeId)
    const indicatorEl = indicatorRef.current
    if (!activeEl || !indicatorEl) return
    indicatorEl.style.width = `${activeEl.offsetWidth}px`
    indicatorEl.style.transform = `translateX(${activeEl.offsetLeft}px)`
  }, [activeId])

  useEffect(() => {
    // Sync value → activeId on mount
    if (value !== activeId && activeId !== undefined) {
      onChange?.(activeId)
    }
    updateIndicatorPosition()

    let resizeObserver
    if (typeof ResizeObserver !== 'undefined' && tablistRef.current) {
      resizeObserver = new ResizeObserver(() => updateIndicatorPosition())
      resizeObserver.observe(tablistRef.current)
    }

    return () => {
      resizeObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    updateIndicatorPosition()
  }, [activeId, updateIndicatorPosition])

  return (
    <div className="wb-tabs">
      <div
        ref={tablistRef}
        className={`wb-tabs__list wb-tabs__list--${variant}`}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeydown}
      >
        {items.map((item) => (
          <button
            key={item.id}
            ref={(el) => setTabRef(item.id, el)}
            id={tabId(item.id)}
            type="button"
            role="tab"
            className={`wb-tabs__tab${item.id === activeId ? ' wb-tabs__tab--active' : ''}`}
            aria-selected={item.id === activeId ? 'true' : 'false'}
            aria-controls={panelId(item.id)}
            aria-disabled={item.disabled ? 'true' : undefined}
            tabIndex={item.id === activeId ? 0 : -1}
            disabled={item.disabled}
            onClick={() => !item.disabled && selectTab(item.id)}
          >
            {renderIcon && (
              <span className="wb-tabs__icon" aria-hidden="true">
                {renderIcon({ item })}
              </span>
            )}
            <span className="wb-tabs__label">{item.label}</span>
            {(renderBadge || item.badge !== undefined) && (
              <span className="wb-tabs__badge">
                {renderBadge
                  ? renderBadge({ item })
                  : (
                    <Badge size="sm" variant={item.id === activeId ? 'primary' : 'default'}>
                      {item.badge}
                    </Badge>
                  )
                }
              </span>
            )}
          </button>
        ))}

        {variant === 'underline' && (
          <span ref={indicatorRef} className="wb-tabs__indicator" aria-hidden="true" />
        )}
      </div>

      {activeItem && (
        <div
          id={panelId(activeItem.id)}
          className="wb-tabs__panel"
          role="tabpanel"
          aria-labelledby={tabId(activeItem.id)}
          tabIndex={0}
        >
          {renderPanel?.({ item: activeItem })}
        </div>
      )}
    </div>
  )
}

export default Tabs
