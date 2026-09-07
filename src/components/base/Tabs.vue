<!--
  Tabs.vue — Base component

  A self-contained, fully accessible horizontal Tabs control implementing
  the WAI-ARIA Authoring Practices Tabs pattern (automatic activation:
  arrow-key navigation moves focus AND selection together). Renders its
  own tablist and the single active tabpanel — the parent only supplies
  `items` and the `panel` scoped slot for that tab's content.

  Owns its own accessibility semantics and keyboard behavior; never
  imports a Pinia store — data and behavior are always supplied by the
  parent via v-model/props/slots/events, matching the pattern established
  by Button.vue, Input.vue, Badge.vue, and Avatar.vue. Internally composes
  Badge.vue for the default badge rendering rather than reimplementing it.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, or transition value is declared here.

  Usage:
    <Tabs v-model="activeTab" :items="[
      { id: 'consistency', label: 'Consistency' },
      { id: 'mastery', label: 'Mastery', badge: 3 },
      { id: 'exploration', label: 'Exploration', disabled: true }
    ]">
      <template #panel="{ item }">
        <p>Content for {{ item.label }}</p>
      </template>
    </Tabs>
-->
<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useId } from 'vue'
import Badge from './Badge.vue'

const props = defineProps({
  /** Tab definitions: [{ id, label, disabled }]. `id` must be unique within the list. */
  items: {
    type: Array,
    required: true,
    validator: (items) => items.every((item) => typeof item.id !== 'undefined' && typeof item.label !== 'undefined')
  },
  /** v-model — the currently active tab's id. */
  modelValue: {
    type: [String, Number],
    default: ''
  },
  /** Visual style. 'underline' for page navigation, 'pill' for mode-switching. */
  variant: {
    type: String,
    default: 'underline',
    validator: (v) => ['underline', 'pill'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue'])

const baseId = useId()
const tablistRef = ref(null)
const indicatorRef = ref(null)
const tabRefs = ref(new Map())

const enabledItems = computed(() => props.items.filter((item) => !item.disabled))

const activeId = computed(() => {
  const matchesModelValue = props.items.some((item) => item.id === props.modelValue && !item.disabled)
  if (matchesModelValue) return props.modelValue
  return enabledItems.value.length > 0 ? enabledItems.value[0].id : undefined
})

const activeItem = computed(() => props.items.find((item) => item.id === activeId.value))

function tabId(itemId) {
  return `${baseId}-tab-${itemId}`
}
function panelId(itemId) {
  return `${baseId}-panel-${itemId}`
}

function setTabRef(itemId, el) {
  if (el) {
    tabRefs.value.set(itemId, el)
  } else {
    tabRefs.value.delete(itemId)
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function selectTab(itemId, { focusTab = false } = {}) {
  const item = props.items.find((i) => i.id === itemId)
  if (!item || item.disabled) return
  if (itemId !== props.modelValue) {
    emit('update:modelValue', itemId)
  }
  if (focusTab) {
    nextTick(() => {
      const el = tabRefs.value.get(itemId)
      el?.focus()
      el?.scrollIntoView({
        inline: 'nearest',
        block: 'nearest',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      })
    })
  }
}

function moveFocus(direction) {
  const enabled = enabledItems.value
  if (enabled.length === 0) return
  const currentIndex = enabled.findIndex((item) => item.id === activeId.value)
  const nextIndex = (currentIndex + direction + enabled.length) % enabled.length
  selectTab(enabled[nextIndex].id, { focusTab: true })
}

function focusFirst() {
  const enabled = enabledItems.value
  if (enabled.length === 0) return
  selectTab(enabled[0].id, { focusTab: true })
}

function focusLast() {
  const enabled = enabledItems.value
  if (enabled.length === 0) return
  selectTab(enabled[enabled.length - 1].id, { focusTab: true })
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

function onTabClick(item) {
  if (item.disabled) return
  selectTab(item.id)
}

// Sliding active-indicator positioning. Measures the active tab button's
// offset/width within the tablist and positions an absolutely-positioned
// indicator element to match — recalculated on selection change and on
// any resize of the tablist itself (covers window resize, font loading,
// and content reflow inside a horizontally-scrollable tablist alike).
function updateIndicatorPosition() {
  const activeEl = tabRefs.value.get(activeId.value)
  const indicatorEl = indicatorRef.value
  if (!activeEl || !indicatorEl) return
  indicatorEl.style.width = `${activeEl.offsetWidth}px`
  indicatorEl.style.transform = `translateX(${activeEl.offsetLeft}px)`
}

let resizeObserver
onMounted(() => {
  if (props.modelValue !== activeId.value) {
    emit('update:modelValue', activeId.value)
  }
  nextTick(updateIndicatorPosition)
  if (typeof ResizeObserver !== 'undefined' && tablistRef.value) {
    resizeObserver = new ResizeObserver(() => updateIndicatorPosition())
    resizeObserver.observe(tablistRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(activeId, () => {
  nextTick(updateIndicatorPosition)
})
</script>

<template>
  <div class="wb-tabs">
    <div
      ref="tablistRef"
      class="wb-tabs__list"
      :class="`wb-tabs__list--${variant}`"
      role="tablist"
      aria-orientation="horizontal"
      @keydown="onKeydown"
    >
      <button
        v-for="item in items"
        :key="item.id"
        :ref="(el) => setTabRef(item.id, el)"
        :id="tabId(item.id)"
        type="button"
        role="tab"
        class="wb-tabs__tab"
        :class="{ 'wb-tabs__tab--active': item.id === activeId }"
        :aria-selected="item.id === activeId ? 'true' : 'false'"
        :aria-controls="panelId(item.id)"
        :aria-disabled="item.disabled ? 'true' : undefined"
        :tabindex="item.id === activeId ? 0 : -1"
        :disabled="item.disabled"
        @click="onTabClick(item)"
      >
        <span v-if="$slots.icon" class="wb-tabs__icon" aria-hidden="true">
          <slot name="icon" :item="item" />
        </span>
        <span class="wb-tabs__label">{{ item.label }}</span>
        <span v-if="$slots.badge || item.badge !== undefined" class="wb-tabs__badge">
          <slot name="badge" :item="item">
            <Badge size="sm" :variant="item.id === activeId ? 'primary' : 'default'">
              {{ item.badge }}
            </Badge>
          </slot>
        </span>
      </button>

      <span v-if="variant === 'underline'" ref="indicatorRef" class="wb-tabs__indicator" aria-hidden="true"></span>
    </div>

    <div
      v-if="activeItem"
      :id="panelId(activeItem.id)"
      class="wb-tabs__panel"
      role="tabpanel"
      :aria-labelledby="tabId(activeItem.id)"
      tabindex="0"
    >
      <slot name="panel" :item="activeItem" />
    </div>
  </div>
</template>

<style scoped>
.wb-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.wb-tabs__list {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.wb-tabs__list--underline {
  border-bottom: 1.5px solid var(--border-default);
}

.wb-tabs__list--pill {
  padding: var(--space-1);
  background-color: var(--bg-subtle);
  border-radius: var(--radius-md);
}

.wb-tabs__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
  scroll-snap-align: start;
  padding: var(--space-3) var(--space-4);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
}

.wb-tabs__list--pill .wb-tabs__tab {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
}

.wb-tabs__tab:hover:not(:disabled) {
  color: var(--text-primary);
}

.wb-tabs__list--pill .wb-tabs__tab:hover:not(:disabled) {
  background-color: var(--surface-card);
}

.wb-tabs__tab--active {
  color: var(--brand-primary);
  font-weight: var(--font-weight-semibold);
}

.wb-tabs__list--pill .wb-tabs__tab--active {
  background-color: var(--surface-elevated);
  color: var(--brand-primary);
  box-shadow: var(--shadow-sm);
}

.wb-tabs__tab:disabled {
  color: var(--text-secondary);
  opacity: 0.5;
  cursor: not-allowed;
}

.wb-tabs__tab:focus {
  outline: none;
}
.wb-tabs__tab:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
  border-radius: var(--radius-sm);
}

.wb-tabs__icon {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.wb-tabs__badge {
  display: inline-flex;
  align-items: center;
}

.wb-tabs__indicator {
  position: absolute;
  left: 0;
  bottom: -1.5px;
  height: 2px;
  background-color: var(--brand-primary);
  border-radius: var(--radius-full);
  transition:
    transform var(--duration-base) var(--ease-standard),
    width var(--duration-base) var(--ease-standard);
}

.wb-tabs__panel {
  padding-top: var(--space-4);
}

.wb-tabs__panel:focus {
  outline: none;
}
.wb-tabs__panel:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
  border-radius: var(--radius-sm);
}

/* --------------------------------------------------------------------
   Reduced motion — degrade to instant, non-animated state changes.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-tabs__tab {
    transition: none;
  }
  .wb-tabs__indicator {
    transition: none;
  }
}
</style>
