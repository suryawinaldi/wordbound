<!--
  Badge.vue — Base component

  A compact status/label pill. Non-interactive (a <span>) by default;
  becomes a real, keyboard-accessible <button> when the `clickable` prop
  is set (e.g. a toggleable filter tag). Owns its own visual states and
  accessibility semantics; never imports a Pinia store — data and
  behavior are always supplied by the parent via props/slots/events.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, or transition value is declared here.

  Usage:
    <Badge>New</Badge>
    <Badge variant="success">Correct</Badge>
    <Badge variant="outline" size="sm">A2</Badge>
    <Badge variant="primary"><template #leading>🔥</template>7-day streak</Badge>
    <Badge clickable @click="removeFilter">
      Vocabulary
      <template #trailing>×</template>
    </Badge>
-->
<script setup>
import { computed, ref, useSlots, useAttrs, onMounted } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** Visual style. One of 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'. */
  variant: {
    type: String,
    default: 'default',
    validator: (v) =>
      ['default', 'primary', 'success', 'warning', 'error', 'outline'].includes(v)
  },
  /** Size. One of 'sm' | 'md' | 'lg'. */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  /**
   * Renders the badge as a real <button> with full keyboard support
   * instead of a plain, non-interactive <span>. Use this only when the
   * badge is genuinely an action (e.g. a removable filter tag) — a
   * purely informational badge should stay non-interactive.
   */
  clickable: {
    type: Boolean,
    default: false
  },
  /** Only meaningful when `clickable` is true. */
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const rootRef = ref(null)

const slots = useSlots()
const attrs = useAttrs()

const rootTag = computed(() => (props.clickable ? 'button' : 'span'))

function handleClick(event) {
  if (!props.clickable || props.disabled) return
  emit('click', event)
}

// Accessibility-first guard: a badge with no visible text (icon-only,
// via the default slot) must be given an accessible name. This applies
// regardless of `clickable`, since even a purely informational badge
// still needs to be understandable to a screen reader user.
if (import.meta.env.DEV) {
  onMounted(() => {
    const hasLabelText = !!(
      slots.default &&
      slots.default().some(
        (node) => typeof node.children === 'string' && node.children.trim().length > 0
      )
    )
    const hasAccessibleName = !!(attrs['aria-label'] || attrs['aria-labelledby'])
    if (!hasLabelText && !hasAccessibleName) {
      console.warn(
        '[Badge] This badge has no visible label text and no aria-label/aria-labelledby. ' +
          'Icon-only badges must supply an accessible name.'
      )
    }
  })
}

defineExpose({
  focus: () => rootRef.value?.focus()
})
</script>

<template>
  <component
    :is="rootTag"
    ref="rootRef"
    class="wb-badge"
    :class="[`wb-badge--${variant}`, `wb-badge--${size}`, { 'wb-badge--clickable': clickable }]"
    v-bind="attrs"
    :type="clickable ? 'button' : undefined"
    :disabled="clickable && disabled ? true : undefined"
    @click="handleClick"
  >
    <span v-if="$slots.leading" class="wb-badge__icon wb-badge__icon--leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span class="wb-badge__label"><slot /></span>
    <span v-if="$slots.trailing" class="wb-badge__icon wb-badge__icon--trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
  </component>
</template>

<style scoped>
.wb-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  width: fit-content;
  max-width: 100%;
  border-radius: var(--radius-full);
  border: 1.5px solid transparent;
  font-family: var(--text-body-sm-family);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  box-sizing: border-box;
}

.wb-badge__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wb-badge__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  font-size: 1em;
}

/* --------------------------------------------------------------------
   Sizes
   -------------------------------------------------------------------- */
.wb-badge--sm {
  height: 1.25rem; /* 20px */
  padding: 0 var(--space-2);
  font-size: var(--text-caption-size);
  line-height: 1;
}

.wb-badge--md {
  height: 1.5rem; /* 24px */
  padding: 0 var(--space-3);
  font-size: var(--text-caption-size);
  line-height: 1;
}

.wb-badge--lg {
  height: 1.75rem; /* 28px */
  padding: 0 var(--space-4);
  font-size: var(--text-body-sm-size);
  line-height: 1;
}

/* --------------------------------------------------------------------
   Variants
   -------------------------------------------------------------------- */
.wb-badge--default {
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
}

.wb-badge--primary {
  background-color: var(--brand-tint);
  color: var(--brand-primary);
}

.wb-badge--success {
  background-color: var(--color-success-100);
  color: var(--state-success);
}

.wb-badge--warning {
  background-color: var(--color-warning-100);
  color: var(--state-warning);
}

.wb-badge--error {
  background-color: var(--color-error-100);
  color: var(--state-error);
}

.wb-badge--outline {
  background-color: transparent;
  border-color: var(--border-default);
  color: var(--text-primary);
}

/* --------------------------------------------------------------------
   Clickable behavior — only applied when the badge is a real <button>.
   -------------------------------------------------------------------- */
.wb-badge--clickable {
  cursor: pointer;
  transition:
    transform var(--duration-instant) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    filter var(--duration-fast) var(--ease-standard);
}

@media (hover: hover) and (pointer: fine) {
  .wb-badge--clickable:hover:not(:disabled) {
    filter: brightness(0.97);
  }
}

.wb-badge--clickable:active:not(:disabled) {
  transform: scale(0.96);
}

.wb-badge--clickable:focus {
  outline: none;
}
.wb-badge--clickable:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.wb-badge--clickable:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* --------------------------------------------------------------------
   Reduced motion — degrade to a static, non-moving state.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-badge--clickable {
    transition: filter var(--duration-fast) linear;
  }
  .wb-badge--clickable:active:not(:disabled) {
    transform: none;
    filter: brightness(0.9);
  }
}
</style>
