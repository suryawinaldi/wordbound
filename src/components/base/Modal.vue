<!--
  Modal.vue — Base component

  A single, reusable, fully accessible dialog: scrim, centered panel,
  focus trap, scroll lock, Escape/backdrop close, and focus restoration
  on close. Teleported to <body> so it's never affected by an ancestor's
  overflow/z-index/transform.

  Scope note: this component owns exactly one dialog's presentation and
  behavior. It does NOT manage stacking multiple modals, a global open/
  close registry, or app-wide overlay positioning — that orchestration
  belongs to a future ModalLayer/AppShell (per the Frontend Architecture
  Blueprint), which is explicitly out of scope for this step and will
  compose this component rather than replace it.

  Owns its own accessibility semantics and keyboard behavior; never
  imports a Pinia store — data and behavior are always supplied by the
  parent via v-model/props/slots/events, matching the pattern
  established by Button.vue, Input.vue, Badge.vue, Avatar.vue, Tabs.vue,
  Dropdown.vue, and Toast.vue.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, or transition value is declared here.

  Usage:
    <Modal v-model="isOpen" title="Delete this word?" description="This can't be undone.">
      <p>Are you sure you want to remove this from your garden?</p>
      <template #footer>
        <Button variant="ghost" @click="isOpen = false">Cancel</Button>
        <Button variant="danger" @click="confirmDelete">Delete</Button>
      </template>
    </Modal>
-->
<script setup>
import { ref, watch, nextTick, onBeforeUnmount, onMounted, useId } from 'vue'

const props = defineProps({
  /** v-model — whether the modal is open. */
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  /** Accessible name fallback when there's no `title` (e.g. a fully custom `header` slot). Ignored if `title` is set, since aria-labelledby takes precedence. */
  ariaLabel: {
    type: String,
    default: ''
  },
  /** Shows the built-in "x" close button in the corner of the panel. */
  closable: {
    type: Boolean,
    default: true
  },
  /** Whether clicking the backdrop closes the modal. */
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const panelRef = ref(null)

const generatedId = useId()
const titleId = `${generatedId}-title`
const descId = `${generatedId}-description`

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null
  )
}

let previouslyFocusedElement = null
let previousBodyOverflow = ''

function lockBodyScroll() {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow
}

function focusInitialElement() {
  const focusables = getFocusableElements(panelRef.value)
  if (focusables.length > 0) {
    focusables[0].focus()
  } else {
    panelRef.value?.focus()
  }
}

function restoreFocus() {
  previouslyFocusedElement?.focus?.()
  previouslyFocusedElement = null
}

function triggerClose() {
  emit('update:modelValue', false)
  emit('close')
}

function onScrimMouseDown(event) {
  if (props.closeOnBackdrop && !panelRef.value?.contains(event.target)) {
    triggerClose()
  }
}

function onGlobalKeydown(event) {
  if (event.key === 'Escape') {
    triggerClose()
  }
}

function onPanelKeydown(event) {
  if (event.key !== 'Tab') return
  const focusables = getFocusableElements(panelRef.value)
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

watch(
  () => props.modelValue,
  (isOpen, wasOpen) => {
    if (isOpen) {
      previouslyFocusedElement = document.activeElement
      lockBodyScroll()
      document.addEventListener('keydown', onGlobalKeydown)
      nextTick(focusInitialElement)
    } else if (wasOpen) {
      unlockBodyScroll()
      document.removeEventListener('keydown', onGlobalKeydown)
      restoreFocus()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (props.modelValue) {
    unlockBodyScroll()
    document.removeEventListener('keydown', onGlobalKeydown)
    restoreFocus()
  }
})

// Accessibility-first guard: a dialog with no accessible name at all is
// a real WCAG failure (4.1.2 Name, Role, Value), not just a style
// inconsistency — same pattern as the dev-mode guards in Button.vue,
// Badge.vue, Avatar.vue, and Dropdown.vue.
if (import.meta.env.DEV) {
  onMounted(() => {
    if (!props.title && !props.ariaLabel) {
      console.warn(
        '[Modal] This modal has no accessible name. Provide a `title` prop ' +
          '(or `aria-label` when using a custom `header` slot without a title).'
      )
    }
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="wb-modal-scrim">
      <div v-if="modelValue" class="wb-modal-scrim" @mousedown="onScrimMouseDown">
        <div class="wb-modal-scrim__backdrop" aria-hidden="true"></div>
        <Transition name="wb-modal-panel">
          <div
            v-if="modelValue"
            ref="panelRef"
            class="wb-modal"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            :aria-label="!title && ariaLabel ? ariaLabel : undefined"
            :aria-describedby="description ? descId : undefined"
            tabindex="-1"
            @keydown="onPanelKeydown"
          >
            <button
              v-if="closable"
              type="button"
              class="wb-modal__close"
              aria-label="Close dialog"
              @click="triggerClose"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
              </svg>
            </button>

            <header v-if="$slots.header || title || description" class="wb-modal__header">
              <slot name="header">
                <h2 v-if="title" :id="titleId" class="wb-modal__title">{{ title }}</h2>
                <p v-if="description" :id="descId" class="wb-modal__description">{{ description }}</p>
              </slot>
            </header>

            <div class="wb-modal__body">
              <slot />
            </div>

            <footer v-if="$slots.footer" class="wb-modal__footer">
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.wb-modal-scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.wb-modal-scrim__backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--color-green-900);
  opacity: 0.45;
}

.wb-modal {
  position: relative;
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 28rem;
  max-height: calc(100vh - var(--space-12));
  overflow-y: auto;
  padding: var(--space-6);
  background-color: var(--surface-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.wb-modal:focus {
  outline: none;
}

.wb-modal__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard);
}

.wb-modal__close:hover {
  color: var(--text-primary);
}

.wb-modal__close:focus {
  outline: none;
}
.wb-modal__close:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.wb-modal__close svg {
  width: 1.125rem;
  height: 1.125rem;
}

.wb-modal__header {
  padding-right: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.wb-modal__title {
  font-family: var(--text-heading-lg-family);
  font-size: var(--text-heading-lg-size);
  line-height: var(--text-heading-lg-leading);
  font-weight: var(--text-heading-lg-weight);
  color: var(--text-primary);
  margin: 0;
}

.wb-modal__description {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  color: var(--text-secondary);
  margin: 0;
}

.wb-modal__body {
  font-family: var(--text-body-lg-family);
  font-size: var(--text-body-lg-size);
  line-height: var(--text-body-lg-leading);
  color: var(--text-primary);
}

.wb-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* --------------------------------------------------------------------
   Transitions
   -------------------------------------------------------------------- */
.wb-modal-scrim-enter-active,
.wb-modal-scrim-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}
.wb-modal-scrim-enter-from,
.wb-modal-scrim-leave-to {
  opacity: 0;
}

.wb-modal-panel-enter-active,
.wb-modal-panel-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}
.wb-modal-panel-enter-from,
.wb-modal-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

/* --------------------------------------------------------------------
   Reduced motion — degrade to instant, non-moving state changes.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-modal-scrim-enter-active,
  .wb-modal-scrim-leave-active,
  .wb-modal-panel-enter-active,
  .wb-modal-panel-leave-active {
    transition: opacity var(--duration-fast) linear;
  }
  .wb-modal-panel-enter-from,
  .wb-modal-panel-leave-to {
    transform: none;
  }
  .wb-modal__close {
    transition: none;
  }
}
</style>
