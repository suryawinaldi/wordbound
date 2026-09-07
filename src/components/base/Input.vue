<!--
  Input.vue — Base component

  Single-line text entry with label/helper/error support, prefix/suffix
  slots, an optional clear button, and an automatic password-visibility
  toggle for type="password". Owns its own accessibility semantics; never
  imports a Pinia store — data and behavior are always supplied by the
  parent via v-model/props/events.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, or duration value is declared in this file.

  Usage:
    <Input v-model="email" label="Email" placeholder="you@example.com" />
    <Input v-model="answer" label="Security answer" required />
    <Input v-model="password" type="password" label="Password" />
    <Input v-model="search" clearable placeholder="Search the garden…" />
    <Input v-model="name" variant="error" error-text="This field is required" />
-->
<script setup>
import { computed, ref, useId } from 'vue'

const props = defineProps({
  /** v-model value. */
  modelValue: {
    type: [String, Number],
    default: ''
  },
  /** Field label, rendered above the control and associated via `for`/`id`. */
  label: {
    type: String,
    default: ''
  },
  /** Supporting text shown below the control when there is no error. */
  helperText: {
    type: String,
    default: ''
  },
  /**
   * Error message shown below the control instead of helperText.
   * Providing a non-empty errorText always forces the visual variant
   * to 'error', regardless of the `variant` prop.
   */
  errorText: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  /** Native input type. 'password' automatically enables the visibility toggle. */
  type: {
    type: String,
    default: 'text'
  },
  /** Visual variant. One of 'default' | 'success' | 'warning' | 'error'. */
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'success', 'warning', 'error'].includes(v)
  },
  /** Size. One of 'sm' | 'md' | 'lg'. */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  /** Shows an inline spinner and suppresses the clear/password-toggle controls. */
  loading: {
    type: Boolean,
    default: false
  },
  /** Shows a clear ("x") button whenever the field has a value. */
  clearable: {
    type: Boolean,
    default: false
  },
  /** Overrides the auto-generated id. Only needed if an external label must target it. */
  id: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: 'off'
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear'])

const inputRef = ref(null)
const passwordVisible = ref(false)
const isFocused = ref(false)

const generatedId = useId()
const inputId = computed(() => props.id || generatedId)
const helperId = computed(() => `${inputId.value}-helper`)
const errorId = computed(() => `${inputId.value}-error`)

const hasError = computed(() => props.errorText.trim().length > 0)
const effectiveVariant = computed(() => (hasError.value ? 'error' : props.variant))

const isPassword = computed(() => props.type === 'password')
const actualType = computed(() => {
  if (!isPassword.value) return props.type
  return passwordVisible.value ? 'text' : 'password'
})

const hasValue = computed(() => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined)

const showClearButton = computed(
  () => props.clearable && hasValue.value && !props.disabled && !props.readonly && !props.loading
)
const showPasswordToggle = computed(() => isPassword.value && !props.disabled && !props.loading)

const describedBy = computed(() => {
  if (hasError.value) return errorId.value
  if (props.helperText) return helperId.value
  return undefined
})

function onInput(event) {
  emit('update:modelValue', event.target.value)
}

function onFocus(event) {
  isFocused.value = true
  emit('focus', event)
}

function onBlur(event) {
  isFocused.value = false
  emit('blur', event)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value
}

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <div
    class="wb-field"
    :class="[`wb-field--${size}`]"
  >
    <label v-if="label" :for="inputId" class="wb-field__label">
      {{ label }}
      <span v-if="required" class="wb-field__required" aria-hidden="true">*</span>
    </label>

    <div
      class="wb-field__control"
      :class="[
        `wb-field__control--${size}`,
        `wb-field__control--${effectiveVariant}`,
        {
          'wb-field__control--focused': isFocused,
          'wb-field__control--disabled': disabled,
          'wb-field__control--readonly': readonly
        }
      ]"
    >
      <span v-if="$slots.prefix" class="wb-field__adornment wb-field__adornment--prefix">
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        ref="inputRef"
        class="wb-field__input"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :autocomplete="autocomplete"
        :aria-invalid="effectiveVariant === 'error' ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-busy="loading ? 'true' : undefined"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />

      <span v-if="$slots.suffix" class="wb-field__adornment wb-field__adornment--suffix">
        <slot name="suffix" />
      </span>

      <span v-if="loading" class="wb-field__spinner" aria-hidden="true"></span>

      <button
        v-if="showClearButton"
        type="button"
        class="wb-field__action"
        aria-label="Clear input"
        @click="handleClear"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
      </button>

      <button
        v-if="showPasswordToggle"
        type="button"
        class="wb-field__action"
        :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
        :aria-pressed="passwordVisible ? 'true' : 'false'"
        @click="togglePasswordVisibility"
      >
        <svg v-if="!passwordVisible" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"
          />
          <circle cx="10" cy="10" r="2.25" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"
          />
          <circle cx="10" cy="10" r="2.25" stroke="currentColor" stroke-width="1.5" />
          <path d="M3 3L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <p v-if="hasError" :id="errorId" class="wb-field__message wb-field__message--error" role="alert">
      {{ errorText }}
    </p>
    <p v-else-if="helperText" :id="helperId" class="wb-field__message wb-field__message--helper">
      {{ helperText }}
    </p>
  </div>
</template>

<style scoped>
.wb-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.wb-field__label {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.wb-field__required {
  color: var(--state-error);
  margin-left: var(--space-1);
}

.wb-field__control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  background-color: var(--surface-sunken);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3);
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.wb-field__control--sm {
  height: 2.25rem; /* 36px */
  padding: 0 var(--space-3);
}

.wb-field__control--md {
  height: 2.75rem; /* 44px */
  padding: 0 var(--space-4);
}

.wb-field__control--lg {
  height: 3.25rem; /* 52px */
  padding: 0 var(--space-5);
}

/* --------------------------------------------------------------------
   Variant border colors (idle)
   -------------------------------------------------------------------- */
.wb-field__control--success {
  border-color: var(--state-success);
}
.wb-field__control--warning {
  border-color: var(--state-warning);
}
.wb-field__control--error {
  border-color: var(--state-error);
}

/* --------------------------------------------------------------------
   Focus — a single, consistent focus ring regardless of variant, so
   the accessible affordance never depends on hue alone.
   -------------------------------------------------------------------- */
.wb-field__control--focused {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus-ring);
}
.wb-field__control--focused.wb-field__control--success,
.wb-field__control--focused.wb-field__control--warning,
.wb-field__control--focused.wb-field__control--error {
  border-color: currentColor;
}

/* --------------------------------------------------------------------
   Disabled / readonly
   -------------------------------------------------------------------- */
.wb-field__control--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wb-field__control--readonly {
  background-color: var(--surface-card);
  color: var(--text-secondary);
}

/* --------------------------------------------------------------------
   The native input itself — transparent, unstyled, inherits control sizing
   -------------------------------------------------------------------- */
.wb-field__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--text-body-lg-family);
}

.wb-field--sm .wb-field__input {
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
}
.wb-field--md .wb-field__input,
.wb-field--lg .wb-field__input {
  font-size: var(--text-body-lg-size);
  line-height: var(--text-body-lg-leading);
}

.wb-field__input::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

.wb-field__input:disabled,
.wb-field__input:read-only {
  cursor: inherit;
}

/* --------------------------------------------------------------------
   Prefix / suffix slot content
   -------------------------------------------------------------------- */
.wb-field__adornment {
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

/* --------------------------------------------------------------------
   Action buttons (clear / password toggle)
   -------------------------------------------------------------------- */
.wb-field__action {
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

.wb-field__action:hover {
  color: var(--brand-primary);
}

.wb-field__action:focus {
  outline: none;
}
.wb-field__action:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.wb-field__action svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* --------------------------------------------------------------------
   Loading spinner — matches the Button component's spinner treatment.
   -------------------------------------------------------------------- */
.wb-field__spinner {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  border-radius: var(--radius-full);
  border: 2px solid var(--text-secondary);
  border-top-color: transparent;
  animation: wb-field-spin 0.7s linear infinite;
}

@keyframes wb-field-spin {
  to {
    transform: rotate(360deg);
  }
}

/* --------------------------------------------------------------------
   Helper / error messages
   -------------------------------------------------------------------- */
.wb-field__message {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  margin: 0;
}

.wb-field__message--helper {
  color: var(--text-secondary);
}

.wb-field__message--error {
  color: var(--state-error);
}

/* --------------------------------------------------------------------
   Reduced motion — degrade to a static, non-rotating indicator.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-field__control {
    transition: border-color var(--duration-fast) linear;
  }
  .wb-field__spinner {
    animation: none;
    opacity: 0.6;
  }
}
</style>
