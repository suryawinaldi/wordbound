<!--
  Toast.vue — Base component

  A single toast notification unit: icon, title, description, an optional
  action, an optional dismiss button, and an auto-dismiss timer that pauses
  while hovered or focused. This component owns one toast's presentation
  and timing only — it does not manage a stack, positioning, or mount/
  unmount choreography for multiple toasts; that orchestration belongs to
  a future global overlay/notifications layer that renders one or more of
  these. Never imports a Pinia store — data and behavior are always
  supplied by the parent via props/events, matching the pattern
  established by Button.vue, Input.vue, Badge.vue, Avatar.vue, Tabs.vue,
  and Dropdown.vue. Internally composes Button.vue for the default action
  button rather than reimplementing it.

  Variant note: this design system deliberately uses a single brand green
  plus a limited semantic palette (success/warning/error) rather than a
  wide hue set. The 'info' variant therefore reads in the brand color
  (--brand-primary / --brand-tint) rather than introducing a new blue
  token that doesn't exist anywhere else in tokens.css.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, or transition value is declared here.

  Usage:
    <Toast variant="success" title="Saved!" description="Your progress is safe." @dismiss="remove(id)" />
    <Toast variant="error" title="Couldn't connect" :duration="0" @dismiss="remove(id)" />
    <Toast variant="info" title="New words unlocked" action-label="View" @action="openGarden" @dismiss="remove(id)" />
-->
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Button from './Button.vue'

const props = defineProps({
  /** Visual/semantic style. One of 'success' | 'warning' | 'error' | 'info'. */
  variant: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'warning', 'error', 'info'].includes(v)
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  /** Auto-dismiss delay in milliseconds. Set to 0 (or omit and pass null) to disable auto-dismiss entirely. */
  duration: {
    type: Number,
    default: 5000
  },
  /** Shows the "x" dismiss button. */
  dismissible: {
    type: Boolean,
    default: true
  },
  /** Renders a default action Button with this label, if no `action` slot is provided. */
  actionLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['dismiss', 'action'])

const rootRef = ref(null)
const remainingTime = ref(props.duration)
const isHovered = ref(false)
const isFocused = ref(false)

let timerStart = 0
let timerHandle = null

const isPaused = computed(() => isHovered.value || isFocused.value)

const ariaRole = computed(() => (props.variant === 'error' ? 'alert' : 'status'))
const ariaLive = computed(() => (props.variant === 'error' ? 'assertive' : 'polite'))

function hasAutoDismiss() {
  return typeof props.duration === 'number' && props.duration > 0
}

function startTimer() {
  if (!hasAutoDismiss() || remainingTime.value <= 0) return
  timerStart = Date.now()
  timerHandle = setTimeout(() => {
    handleDismiss()
  }, remainingTime.value)
}

function clearTimer() {
  if (timerHandle) {
    clearTimeout(timerHandle)
    timerHandle = null
  }
}

function pauseTimer() {
  if (!hasAutoDismiss() || !timerHandle) return
  clearTimer()
  const elapsed = Date.now() - timerStart
  remainingTime.value = Math.max(remainingTime.value - elapsed, 0)
}

function resumeTimer() {
  if (!hasAutoDismiss() || timerHandle) return
  startTimer()
}

function onPointerEnter() {
  isHovered.value = true
}
function onPointerLeave() {
  isHovered.value = false
}
function onFocusIn() {
  isFocused.value = true
}
function onFocusOut(event) {
  if (!rootRef.value?.contains(event.relatedTarget)) {
    isFocused.value = false
  }
}

// A single source of truth for pause/resume, driven by either hover or
// keyboard focus being present anywhere inside the toast — satisfies
// WCAG's "pause on hover or focus" guidance for timed content, not just
// mouse users.
function syncTimerToPauseState() {
  if (isPaused.value) {
    pauseTimer()
  } else {
    resumeTimer()
  }
}

function handleDismiss() {
  clearTimer()
  emit('dismiss')
}

function handleAction() {
  emit('action')
}

onMounted(() => {
  startTimer()
})
onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <div
    ref="rootRef"
    class="wb-toast"
    :class="`wb-toast--${variant}`"
    :role="ariaRole"
    :aria-live="ariaLive"
    aria-atomic="true"
    @mouseenter="onPointerEnter(); syncTimerToPauseState()"
    @mouseleave="onPointerLeave(); syncTimerToPauseState()"
    @focusin="onFocusIn(); syncTimerToPauseState()"
    @focusout="onFocusOut($event); syncTimerToPauseState()"
  >
    <span class="wb-toast__icon" aria-hidden="true">
      <slot name="icon">
        <svg v-if="variant === 'success'" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
          <path d="M6.5 10.5L8.75 12.75L13.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="variant === 'warning'" viewBox="0 0 20 20" fill="none">
          <path d="M10 3L18 17H2L10 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M10 8.5V11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="10" cy="14" r="0.9" fill="currentColor" />
        </svg>
        <svg v-else-if="variant === 'error'" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
          <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
          <path d="M10 9V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="10" cy="6.25" r="0.9" fill="currentColor" />
        </svg>
      </slot>
    </span>

    <div class="wb-toast__content">
      <p v-if="title" class="wb-toast__title">{{ title }}</p>
      <p v-if="description" class="wb-toast__description">{{ description }}</p>
    </div>

    <div v-if="$slots.action || actionLabel" class="wb-toast__action">
      <slot name="action">
        <Button variant="ghost" size="sm" @click="handleAction">{{ actionLabel }}</Button>
      </slot>
    </div>

    <button
      v-if="dismissible"
      type="button"
      class="wb-toast__dismiss"
      aria-label="Dismiss notification"
      @click="handleDismiss"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.wb-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  width: 100%;
  max-width: 24rem;
  padding: var(--space-4);
  background-color: var(--surface-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  animation: wb-toast-in var(--duration-slow) var(--ease-out);
}

/* --------------------------------------------------------------------
   Variant accent — a colored left rule plus a matching icon color,
   rather than tinting the whole surface, keeps every variant legible
   in both light and dark mode without needing per-variant background
   token pairs.
   -------------------------------------------------------------------- */
.wb-toast--success {
  border-left: 3px solid var(--state-success);
}
.wb-toast--success .wb-toast__icon {
  color: var(--state-success);
}

.wb-toast--warning {
  border-left: 3px solid var(--state-warning);
}
.wb-toast--warning .wb-toast__icon {
  color: var(--state-warning);
}

.wb-toast--error {
  border-left: 3px solid var(--state-error);
}
.wb-toast--error .wb-toast__icon {
  color: var(--state-error);
}

.wb-toast--info {
  border-left: 3px solid var(--brand-primary);
}
.wb-toast--info .wb-toast__icon {
  color: var(--brand-primary);
}

.wb-toast__icon {
  display: inline-flex;
  flex-shrink: 0;
  margin-top: var(--space-1);
}
.wb-toast__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.wb-toast__content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.wb-toast__title {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.wb-toast__description {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  color: var(--text-secondary);
  margin: 0;
}

.wb-toast__action {
  flex-shrink: 0;
}

.wb-toast__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard);
}

.wb-toast__dismiss:hover {
  color: var(--text-primary);
}

.wb-toast__dismiss:focus {
  outline: none;
}
.wb-toast__dismiss:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.wb-toast__dismiss svg {
  width: 1rem;
  height: 1rem;
}

/* --------------------------------------------------------------------
   Entrance animation — runs once when the element is inserted into the
   DOM, regardless of how the parent mounts it (v-if, v-for, dynamic
   component, etc.).
   -------------------------------------------------------------------- */
@keyframes wb-toast-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* --------------------------------------------------------------------
   Reduced motion — degrade to a simple opacity-only appearance.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-toast {
    animation: wb-toast-in-reduced var(--duration-fast) linear;
  }
  .wb-toast__dismiss {
    transition: none;
  }
}

@keyframes wb-toast-in-reduced {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
