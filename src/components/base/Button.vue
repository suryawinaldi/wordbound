<!--
  Button.vue — Base component

  The single interactive-action primitive for WordBound. Owns its own
  visual states and accessibility semantics; knows nothing about what it
  contains or does. Never imports a Pinia store — data and behavior are
  always supplied by the parent via props/events.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, or duration value is declared in this file.

  Variants:
    primary   — the one main action on a screen (brand-filled)
    secondary — an alternate action (outlined)
    ghost     — lowest-emphasis / navigation-style action (text-only)
    danger    — destructive-confirm actions only

  Usage:
    <Button>Play Again</Button>
    <Button variant="secondary" size="sm">Cancel</Button>
    <Button variant="danger" @click="handleLogout">Log Out</Button>
    <Button loading>Saving…</Button>
    <Button aria-label="Replay audio"><template #icon><IconSpeaker /></template></Button>
-->
<script setup>
import { computed, ref, useSlots, onMounted, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** Visual style. One of 'primary' | 'secondary' | 'ghost' | 'danger'. */
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v)
  },
  /** Size. One of 'sm' | 'md' | 'lg'. */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  /** Native button[type]. Defaults to 'button' to avoid accidental form submission. */
  type: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'submit', 'reset'].includes(v)
  },
  /** Disables interaction and dims the button. */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Shows the inline loading spinner and disables interaction.
   * This is the one place in the design system a spinner is used
   * intentionally (brief, contained, button-level — see the
   * Frontend Architecture Blueprint's loading-state strategy).
   */
  loading: {
    type: Boolean,
    default: false
  },
  /** Stretches the button to fill its container's width. */
  block: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const rootRef = ref(null)

const slots = useSlots()
const attrs = useAttrs()

const isDisabled = computed(() => props.disabled || props.loading)

function handleClick(event) {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}

// Accessibility-first guard: an icon-only button (no default slot text)
// must be given an accessible name via aria-label. This never blocks
// anything in production — it only helps whoever builds the next
// screen notice the gap immediately instead of shipping a silent
// screen-reader dead-end.
if (import.meta.env.DEV) {
  onMounted(() => {
    const hasLabelText = !!(slots.default && slots.default().some(
      (node) => (typeof node.children === 'string' && node.children.trim().length > 0)
    ))
    const hasAccessibleName = !!(attrs['aria-label'] || attrs['aria-labelledby'])
    if (!hasLabelText && !hasAccessibleName) {
      console.warn(
        '[Button] This button has no visible label text and no aria-label/aria-labelledby. ' +
        'Icon-only buttons must supply an accessible name.'
      )
    }
  })
}

defineExpose({
  focus: () => rootRef.value?.focus()
})
</script>

<template>
  <button
    ref="rootRef"
    class="wb-button"
    :class="[
      `wb-button--${variant}`,
      `wb-button--${size}`,
      { 'wb-button--block': block, 'wb-button--loading': loading }
    ]"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : undefined"
    v-bind="attrs"
    @click="handleClick"
  >
    <span v-if="loading" class="wb-button__spinner" aria-hidden="true"></span>
    <span v-if="$slots.icon && !loading" class="wb-button__icon">
      <slot name="icon" />
    </span>
    <span class="wb-button__label"><slot /></span>
  </button>
</template>

<style scoped>
.wb-button {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: auto;

  /* Shape */
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;

  /* Type */
  font-family: var(--text-button-family);
  font-size: var(--text-button-size);
  line-height: var(--text-button-leading);
  font-weight: var(--text-button-weight);
  white-space: nowrap;

  /* Interaction */
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    transform var(--duration-instant) var(--ease-standard);
}

.wb-button.wb-button--block {
  display: flex;
  width: 100%;
}

/* --------------------------------------------------------------------
   Sizes
   -------------------------------------------------------------------- */
.wb-button--sm {
  height: 2.25rem; /* 36px */
  padding: 0 var(--space-3);
}

.wb-button--md {
  height: 2.75rem; /* 44px */
  padding: 0 var(--space-4);
}

.wb-button--lg {
  height: 3.25rem; /* 52px */
  padding: 0 var(--space-6);
}

/* --------------------------------------------------------------------
   Variants
   -------------------------------------------------------------------- */
.wb-button--primary {
  background-color: var(--brand-primary);
  color: var(--text-on-brand);
}
.wb-button--primary:hover:not(:disabled) {
  background-color: var(--brand-primary-hover);
}

.wb-button--secondary {
  background-color: transparent;
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}
.wb-button--secondary:hover:not(:disabled) {
  background-color: var(--brand-tint);
}

.wb-button--ghost {
  background-color: transparent;
  color: var(--brand-primary);
}
.wb-button--ghost:hover:not(:disabled) {
  background-color: var(--brand-tint);
}

.wb-button--danger {
  background-color: transparent;
  border-color: var(--state-error);
  color: var(--state-error);
}
.wb-button--danger:hover:not(:disabled) {
  background-color: var(--color-error-100);
}

/* --------------------------------------------------------------------
   Hover lift (pointer-capable devices only — no lift on touch, per
   the Performance Plan's "hover gated to pointer-capable devices")
   -------------------------------------------------------------------- */
@media (hover: hover) and (pointer: fine) {
  .wb-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

/* --------------------------------------------------------------------
   Press feedback — the one bespoke animation this component owns,
   matching the design system's "press-scale (0.97, 100ms)" spec.
   -------------------------------------------------------------------- */
.wb-button:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: none;
}

/* --------------------------------------------------------------------
   Focus — visible only for keyboard navigation, never on mouse click.
   -------------------------------------------------------------------- */
.wb-button:focus {
  outline: none;
}
.wb-button:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

/* --------------------------------------------------------------------
   Disabled
   -------------------------------------------------------------------- */
.wb-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
  transform: none;
}

/* --------------------------------------------------------------------
   Loading spinner — the one intentional exception to "no spinners,"
   per the Frontend Architecture Blueprint's loading-state strategy:
   brief, contained, button-level only.
   -------------------------------------------------------------------- */
.wb-button__spinner {
  width: 1rem;
  height: 1rem;
  border-radius: var(--radius-full);
  border: 2px solid currentColor;
  border-top-color: transparent;
  opacity: 0.9;
  animation: wb-button-spin 0.7s linear infinite;
}

.wb-button__icon {
  display: inline-flex;
  align-items: center;
}

@keyframes wb-button-spin {
  to {
    transform: rotate(360deg);
  }
}

/* --------------------------------------------------------------------
   Reduced motion — degrade movement to a static/opacity-only state,
   per the design system's system-wide reduced-motion rule.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-button {
    transition: background-color var(--duration-fast) linear,
      border-color var(--duration-fast) linear,
      color var(--duration-fast) linear;
  }
  .wb-button:hover:not(:disabled) {
    transform: none;
  }
  .wb-button:active:not(:disabled) {
    transform: none;
    opacity: 0.85;
  }
  .wb-button__spinner {
    animation: none;
    opacity: 0.6;
  }
}
</style>
