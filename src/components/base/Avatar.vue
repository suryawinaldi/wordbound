<!--
  Avatar.vue — Base component

  Player/identity display with a strict fallback order: image → initials
  → icon slot → a built-in generic-person icon, so the component never
  renders empty. Non-interactive (a <span>) by default; becomes a real,
  keyboard-accessible <button> when the `clickable` prop is set. Owns its
  own visual states and accessibility semantics; never imports a Pinia
  store — data and behavior are always supplied by the parent via
  props/slots/events, matching the pattern established by Button.vue,
  Input.vue, and Badge.vue.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, transition, or z-index value is declared
  here.

  Usage:
    <Avatar src="/almira.jpg" alt="Almira" size="lg" />
    <Avatar initials="SA" alt="Surya" variant="online" />
    <Avatar alt="Guest player"><template #icon><IconGuest /></template></Avatar>
    <Avatar alt="Almira" clickable ring @click="openProfile" />
-->
<script setup>
import { computed, ref, watch, useSlots, useAttrs, onMounted } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** Image URL. Falls back to initials, then the icon slot, if it fails to load or isn't provided. */
  src: {
    type: String,
    default: ''
  },
  /** Accessible name for this avatar (e.g. the player's name). Also used as the image's alt text. */
  alt: {
    type: String,
    default: ''
  },
  /** Fallback text shown when there is no image (or it failed to load). Typically 1–2 characters. */
  initials: {
    type: String,
    default: ''
  },
  /** Status. One of 'default' | 'online' | 'offline' | 'away'. 'default' shows no status indicator. */
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'online', 'offline', 'away'].includes(v)
  },
  /** Size. One of 'xs' | 'sm' | 'md' | 'lg' | 'xl'. */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v)
  },
  /** Adds a decorative ring around the avatar. */
  ring: {
    type: Boolean,
    default: false
  },
  /**
   * Renders the avatar as a real <button> with full keyboard support
   * instead of a plain, non-interactive <span>.
   */
  clickable: {
    type: Boolean,
    default: false
  },
  /** Only meaningful when `clickable` is true. */
  disabled: {
    type: Boolean,
    default: false
  },
  /** Shows a skeleton placeholder instead of any fallback tier. Parent-controlled, like Button/Input's `loading`. */
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const rootRef = ref(null)

const slots = useSlots()
const attrs = useAttrs()

const imageFailed = ref(false)

watch(
  () => props.src,
  () => {
    imageFailed.value = false
  }
)

function handleImageError() {
  imageFailed.value = true
}

const showImage = computed(() => !!props.src && !imageFailed.value && !props.loading)
const showInitials = computed(() => !showImage.value && !props.loading && !!props.initials)
const showIconFallback = computed(() => !showImage.value && !props.loading && !props.initials)

const rootTag = computed(() => (props.clickable ? 'button' : 'span'))

const statusLabel = computed(() => {
  switch (props.variant) {
    case 'online':
      return 'Online'
    case 'away':
      return 'Away'
    case 'offline':
      return 'Offline'
    default:
      return ''
  }
})

function handleClick(event) {
  if (!props.clickable || props.disabled) return
  emit('click', event)
}

// Accessibility-first guard: an avatar with no accessible name (no `alt`
// and no aria-label/aria-labelledby override) is a screen-reader dead
// end — identity is the entire point of this component. Same pattern
// as the dev-mode guards in Button.vue and Badge.vue.
if (import.meta.env.DEV) {
  onMounted(() => {
    const hasAccessibleName = !!(props.alt || attrs['aria-label'] || attrs['aria-labelledby'])
    if (!hasAccessibleName) {
      console.warn(
        '[Avatar] This avatar has no accessible name. Provide an `alt` prop ' +
          '(or aria-label/aria-labelledby) describing who it represents.'
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
    class="wb-avatar"
    :class="[
      `wb-avatar--${size}`,
      { 'wb-avatar--ring': ring, 'wb-avatar--clickable': clickable, 'wb-avatar--loading': loading }
    ]"
    v-bind="attrs"
    :type="clickable ? 'button' : undefined"
    :disabled="clickable && disabled ? true : undefined"
    :aria-label="alt || undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="handleClick"
  >
    <span class="wb-avatar__frame">
      <span v-if="loading" class="wb-avatar__skeleton" aria-hidden="true"></span>

      <img
        v-else-if="showImage"
        :src="src"
        :alt="alt"
        class="wb-avatar__image"
        @error="handleImageError"
      />

      <span v-else-if="showInitials" class="wb-avatar__initials" aria-hidden="true">
        {{ initials }}
      </span>

      <span v-else-if="showIconFallback" class="wb-avatar__icon" aria-hidden="true">
        <slot name="icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" stroke-width="1.75" />
            <path
              d="M4.5 20c1.2-3.8 4.4-6 7.5-6s6.3 2.2 7.5 6"
              stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
            />
          </svg>
        </slot>
      </span>
    </span>

    <span v-if="variant !== 'default' && !loading" class="wb-avatar__status" :class="`wb-avatar__status--${variant}`">
      <span class="wb-visually-hidden">{{ statusLabel }}</span>
    </span>
  </component>
</template>

<style scoped>
.wb-avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  box-sizing: border-box;
}

.wb-avatar__frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-full);
  background-color: var(--bg-subtle);
  color: var(--text-secondary);
}

/* --------------------------------------------------------------------
   Sizes
   -------------------------------------------------------------------- */
.wb-avatar--xs {
  width: 1.5rem; /* 24px */
  height: 1.5rem;
}
.wb-avatar--xs .wb-avatar__initials {
  font-size: var(--text-caption-size);
}
.wb-avatar--xs .wb-avatar__icon svg {
  width: 0.875rem;
  height: 0.875rem;
}

.wb-avatar--sm {
  width: 2rem; /* 32px */
  height: 2rem;
}
.wb-avatar--sm .wb-avatar__initials {
  font-size: var(--text-caption-size);
}
.wb-avatar--sm .wb-avatar__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.wb-avatar--md {
  width: 2.75rem; /* 44px — matches Button/Input's md height */
  height: 2.75rem;
}
.wb-avatar--md .wb-avatar__initials {
  font-size: var(--text-body-sm-size);
}
.wb-avatar--md .wb-avatar__icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.wb-avatar--lg {
  width: 3.5rem; /* 56px */
  height: 3.5rem;
}
.wb-avatar--lg .wb-avatar__initials {
  font-size: var(--text-heading-md-size);
}
.wb-avatar--lg .wb-avatar__icon svg {
  width: 2rem;
  height: 2rem;
}

.wb-avatar--xl {
  width: 4.5rem; /* 72px */
  height: 4.5rem;
}
.wb-avatar--xl .wb-avatar__initials {
  font-size: var(--text-heading-lg-size);
}
.wb-avatar--xl .wb-avatar__icon svg {
  width: 2.5rem;
  height: 2.5rem;
}

/* --------------------------------------------------------------------
   Content tiers
   -------------------------------------------------------------------- */
.wb-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wb-avatar__initials {
  font-family: var(--font-sans);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  text-transform: uppercase;
  user-select: none;
}

.wb-avatar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* --------------------------------------------------------------------
   Loading skeleton — content-loading uses the design system's shimmer
   pattern, distinct from Button/Input's brief action-loading spinner,
   since this represents "image not yet available" rather than an
   in-flight user action.
   -------------------------------------------------------------------- */
.wb-avatar__skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    var(--bg-subtle) 30%,
    var(--surface-card) 50%,
    var(--bg-subtle) 70%
  );
  background-size: 200% 100%;
  animation: wb-avatar-shimmer 1.4s ease-in-out infinite;
}

@keyframes wb-avatar-shimmer {
  from {
    background-position: 150% 0;
  }
  to {
    background-position: -50% 0;
  }
}

/* --------------------------------------------------------------------
   Ring
   -------------------------------------------------------------------- */
.wb-avatar--ring .wb-avatar__frame {
  box-shadow: 0 0 0 2px var(--surface-card), 0 0 0 4px var(--brand-secondary);
}

/* --------------------------------------------------------------------
   Status indicator
   -------------------------------------------------------------------- */
.wb-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 28%;
  height: 28%;
  min-width: 0.5rem;
  min-height: 0.5rem;
  border-radius: var(--radius-full);
  border: 2px solid var(--surface-card);
  box-sizing: content-box;
}

.wb-avatar__status--online {
  background-color: var(--state-success);
}
.wb-avatar__status--away {
  background-color: var(--state-warning);
}
.wb-avatar__status--offline {
  background-color: var(--text-secondary);
}

/* --------------------------------------------------------------------
   Clickable behavior — matches the interaction language of
   Button.vue/Badge.vue's clickable states.
   -------------------------------------------------------------------- */
.wb-avatar--clickable {
  cursor: pointer;
  transition:
    transform var(--duration-instant) var(--ease-standard),
    filter var(--duration-fast) var(--ease-standard);
}

@media (hover: hover) and (pointer: fine) {
  .wb-avatar--clickable:hover:not(:disabled) .wb-avatar__frame {
    filter: brightness(0.96);
  }
}

.wb-avatar--clickable:active:not(:disabled) {
  transform: scale(0.96);
}

.wb-avatar--clickable:focus {
  outline: none;
}
.wb-avatar--clickable:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.wb-avatar--clickable:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* --------------------------------------------------------------------
   Visually hidden — standard screen-reader-only text technique, used
   to announce the status indicator's meaning without showing text on
   screen. Structural accessibility boilerplate, not a design token.
   -------------------------------------------------------------------- */
.wb-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* --------------------------------------------------------------------
   Reduced motion — degrade to static, non-moving states.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-avatar__skeleton {
    animation: none;
    background: var(--bg-subtle);
  }
  .wb-avatar--clickable {
    transition: filter var(--duration-fast) linear;
  }
  .wb-avatar--clickable:active:not(:disabled) {
    transform: none;
    opacity: 0.85;
  }
}
</style>
