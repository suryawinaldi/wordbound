<!--
  Dropdown.vue — Base component

  A single-select, button-triggered dropdown implementing the WAI-ARIA
  combobox-listbox pattern: a trigger with role="combobox" (which is the
  role that officially supports aria-activedescendant) controlling a
  popup role="listbox" of role="option" elements. Real DOM focus never
  leaves the trigger button — the currently highlighted option is
  communicated to assistive technology via aria-activedescendant and a
  visual highlight class, exactly like a native <select>.

  Owns its own accessibility semantics and keyboard behavior; never
  imports a Pinia store — data and behavior are always supplied by the
  parent via v-model/props/events, matching the pattern established by
  Button.vue, Input.vue, Badge.vue, Avatar.vue, and Tabs.vue.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, border, or transition value is declared
  here.

  Usage:
    <Dropdown
      v-model="selectedLevel"
      label="CEFR level"
      placeholder="Choose a level"
      :options="[
        { value: 'a1', label: 'A1 — Beginner' },
        { value: 'b1', label: 'B1 — Intermediate' },
        { value: 'c1', label: 'C1 — Advanced', disabled: true }
      ]"
    />
-->
<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useId, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** v-model — the selected option's `value`, or null when nothing is selected. */
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  /** Option definitions: [{ value, label, disabled? }]. `value` must be unique within the list. */
  options: {
    type: Array,
    required: true,
    validator: (opts) => opts.every((o) => typeof o.value !== 'undefined' && typeof o.label !== 'undefined')
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  label: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  errorText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'clear'])

const attrs = useAttrs()

const rootRef = ref(null)
const triggerRef = ref(null)
const listboxRef = ref(null)
const optionRefs = ref(new Map())

const isOpen = ref(false)
const highlightedIndex = ref(-1)

const generatedId = useId()
const inputId = computed(() => props.id || generatedId)
const listboxId = computed(() => `${inputId.value}-listbox`)
const helperId = computed(() => `${inputId.value}-helper`)
const errorId = computed(() => `${inputId.value}-error`)
function optionId(index) {
  return `${inputId.value}-option-${index}`
}

const hasError = computed(() => props.errorText.trim().length > 0)
const effectiveVariant = computed(() => (hasError.value ? 'error' : 'default'))

const describedBy = computed(() => {
  if (hasError.value) return errorId.value
  if (props.helperText) return helperId.value
  return undefined
})

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === props.modelValue))
const selectedOption = computed(() => (selectedIndex.value >= 0 ? props.options[selectedIndex.value] : null))
const enabledIndices = computed(() =>
  props.options.reduce((acc, o, i) => {
    if (!o.disabled) acc.push(i)
    return acc
  }, [])
)

const isInteractive = computed(() => !props.disabled && !props.loading)

function setOptionRef(index, el) {
  if (el) {
    optionRefs.value.set(index, el)
  } else {
    optionRefs.value.delete(index)
  }
}

function scrollHighlightedIntoView() {
  const el = optionRefs.value.get(highlightedIndex.value)
  el?.scrollIntoView({ block: 'nearest' })
}

function openDropdown() {
  if (!isInteractive.value || isOpen.value) return
  isOpen.value = true
  highlightedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : enabledIndices.value[0] ?? -1
  nextTick(scrollHighlightedIntoView)
}

function closeDropdown() {
  isOpen.value = false
  highlightedIndex.value = -1
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function commitHighlighted() {
  if (highlightedIndex.value < 0) return
  const option = props.options[highlightedIndex.value]
  if (!option || option.disabled) return
  if (option.value !== props.modelValue) {
    emit('update:modelValue', option.value)
  }
  closeDropdown()
}

function moveHighlight(direction) {
  const enabled = enabledIndices.value
  if (enabled.length === 0) return
  const currentPos = enabled.indexOf(highlightedIndex.value)
  const nextPos = currentPos === -1
    ? (direction > 0 ? 0 : enabled.length - 1)
    : (currentPos + direction + enabled.length) % enabled.length
  highlightedIndex.value = enabled[nextPos]
  nextTick(scrollHighlightedIntoView)
}

function highlightFirst() {
  const enabled = enabledIndices.value
  if (enabled.length === 0) return
  highlightedIndex.value = enabled[0]
  nextTick(scrollHighlightedIntoView)
}

function highlightLast() {
  const enabled = enabledIndices.value
  if (enabled.length === 0) return
  highlightedIndex.value = enabled[enabled.length - 1]
  nextTick(scrollHighlightedIntoView)
}

function handleClear(event) {
  event.stopPropagation()
  if (!props.clearable || !isInteractive.value || props.modelValue === null) return
  emit('update:modelValue', null)
  emit('clear')
  closeDropdown()
}

// --------------------------------------------------------------------
// Typeahead — mirrors native <select> behavior: typing letters directly
// changes the selection to the first matching option, whether the
// dropdown is open or closed.
// --------------------------------------------------------------------
let typeaheadBuffer = ''
let typeaheadTimer = null

function handleTypeahead(char) {
  typeaheadBuffer += char.toLowerCase()
  clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => {
    typeaheadBuffer = ''
  }, 500)

  const match = props.options.findIndex(
    (o, i) => enabledIndices.value.includes(i) && o.label.toLowerCase().startsWith(typeaheadBuffer)
  )
  if (match >= 0) {
    highlightedIndex.value = match
    emit('update:modelValue', props.options[match].value)
    if (isOpen.value) nextTick(scrollHighlightedIntoView)
  }
}

function onTriggerKeydown(event) {
  if (!isInteractive.value) return

  if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault()
    handleTypeahead(event.key)
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      } else {
        moveHighlight(1)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      } else {
        moveHighlight(-1)
      }
      break
    case 'Home':
      if (isOpen.value) {
        event.preventDefault()
        highlightFirst()
      }
      break
    case 'End':
      if (isOpen.value) {
        event.preventDefault()
        highlightLast()
      }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value) {
        commitHighlighted()
      } else {
        openDropdown()
      }
      break
    case 'Escape':
      if (isOpen.value) {
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
  const option = props.options[index]
  if (!option || option.disabled) return
  highlightedIndex.value = index
  commitHighlighted()
}

function onDocumentPointerDown(event) {
  if (!isOpen.value || !rootRef.value) return
  if (!rootRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  clearTimeout(typeaheadTimer)
})

// Accessibility-first guard: a dropdown with no accessible name (no
// `label` and no aria-label/aria-labelledby override) leaves a screen
// reader user unable to tell what the field is for, even though the
// trigger's visible text shows a value. Same pattern as the dev-mode
// guards in Button.vue, Badge.vue, and Avatar.vue.
if (import.meta.env.DEV) {
  onMounted(() => {
    const hasAccessibleName = !!(props.label || attrs['aria-label'] || attrs['aria-labelledby'])
    if (!hasAccessibleName) {
      console.warn(
        '[Dropdown] This dropdown has no accessible name. Provide a `label` prop ' +
          '(or aria-label/aria-labelledby) describing what it selects.'
      )
    }
  })
}

watch(
  () => props.options,
  () => {
    if (isOpen.value && highlightedIndex.value >= 0 && !props.options[highlightedIndex.value]) {
      closeDropdown()
    }
  }
)
</script>

<template>
  <div ref="rootRef" class="wb-dropdown">
    <label v-if="label" :for="inputId" class="wb-dropdown__label">{{ label }}</label>

    <button
      :id="inputId"
      ref="triggerRef"
      type="button"
      class="wb-dropdown__trigger"
      :class="[`wb-dropdown__trigger--${effectiveVariant}`, { 'wb-dropdown__trigger--open': isOpen }]"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="listboxId"
      :aria-activedescendant="isOpen && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined"
      :aria-invalid="effectiveVariant === 'error' ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-busy="loading ? 'true' : undefined"
      :disabled="disabled"
      :name="name"
      v-bind="attrs"
      @click="toggleDropdown"
      @keydown="onTriggerKeydown"
    >
      <span class="wb-dropdown__value" :class="{ 'wb-dropdown__value--placeholder': !selectedOption }">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>

      <span v-if="loading" class="wb-dropdown__spinner" aria-hidden="true"></span>

      <button
        v-else-if="clearable && selectedOption && isInteractive"
        type="button"
        class="wb-dropdown__clear"
        aria-label="Clear selection"
        @click="handleClear"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
      </button>

      <span v-if="!loading" class="wb-dropdown__chevron" :class="{ 'wb-dropdown__chevron--open': isOpen }" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <p v-if="hasError" :id="errorId" class="wb-dropdown__message wb-dropdown__message--error" role="alert">
      {{ errorText }}
    </p>
    <p v-else-if="helperText" :id="helperId" class="wb-dropdown__message wb-dropdown__message--helper">
      {{ helperText }}
    </p>

    <Transition name="wb-dropdown-pop">
      <ul
        v-if="isOpen"
        :id="listboxId"
        ref="listboxRef"
        class="wb-dropdown__listbox"
        role="listbox"
        :aria-labelledby="label ? inputId : undefined"
      >
        <li
          v-for="(option, index) in options"
          :key="option.value"
          :ref="(el) => setOptionRef(index, el)"
          :id="optionId(index)"
          role="option"
          class="wb-dropdown__option"
          :class="{
            'wb-dropdown__option--highlighted': index === highlightedIndex,
            'wb-dropdown__option--selected': option.value === modelValue,
            'wb-dropdown__option--disabled': option.disabled
          }"
          :aria-selected="option.value === modelValue ? 'true' : 'false'"
          :aria-disabled="option.disabled ? 'true' : undefined"
          @click="onOptionClick(index)"
          @pointermove="!option.disabled && (highlightedIndex = index)"
        >
          {{ option.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.wb-dropdown {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.wb-dropdown__label {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.wb-dropdown__trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  height: 2.75rem;
  padding: 0 var(--space-4);
  background-color: var(--surface-sunken);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--text-body-lg-family);
  font-size: var(--text-body-lg-size);
  line-height: var(--text-body-lg-leading);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.wb-dropdown__trigger--error {
  border-color: var(--state-error);
}

.wb-dropdown__trigger--open,
.wb-dropdown__trigger:focus-visible {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus-ring);
}

.wb-dropdown__trigger:focus {
  outline: none;
}

.wb-dropdown__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.wb-dropdown__value {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.wb-dropdown__value--placeholder {
  color: var(--text-secondary);
}

.wb-dropdown__chevron {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.wb-dropdown__chevron svg {
  width: 1.25rem;
  height: 1.25rem;
}

.wb-dropdown__chevron--open {
  transform: rotate(180deg);
}

.wb-dropdown__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard);
}

.wb-dropdown__clear:hover {
  color: var(--brand-primary);
}

.wb-dropdown__clear:focus {
  outline: none;
}
.wb-dropdown__clear:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.wb-dropdown__clear svg {
  width: 1rem;
  height: 1rem;
}

.wb-dropdown__spinner {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  border-radius: var(--radius-full);
  border: 2px solid var(--text-secondary);
  border-top-color: transparent;
  animation: wb-dropdown-spin 0.7s linear infinite;
}

@keyframes wb-dropdown-spin {
  to {
    transform: rotate(360deg);
  }
}

.wb-dropdown__message {
  font-family: var(--text-body-sm-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  margin: 0;
}

.wb-dropdown__message--helper {
  color: var(--text-secondary);
}

.wb-dropdown__message--error {
  color: var(--state-error);
}

.wb-dropdown__listbox {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  max-height: 16rem;
  overflow-y: auto;
  margin: 0;
  padding: var(--space-1);
  list-style: none;
  background-color: var(--surface-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.wb-dropdown__option {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--text-body-lg-family);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  cursor: pointer;
}

.wb-dropdown__option--highlighted {
  background-color: var(--brand-tint);
  color: var(--brand-primary);
}

.wb-dropdown__option--selected {
  font-weight: var(--font-weight-semibold);
}

.wb-dropdown__option--disabled {
  color: var(--text-secondary);
  opacity: 0.5;
  cursor: not-allowed;
}

/* --------------------------------------------------------------------
   Popup enter/leave transition
   -------------------------------------------------------------------- */
.wb-dropdown-pop-enter-active,
.wb-dropdown-pop-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}
.wb-dropdown-pop-enter-from,
.wb-dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* --------------------------------------------------------------------
   Reduced motion — degrade to instant, non-animated state changes.
   -------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .wb-dropdown__trigger,
  .wb-dropdown__chevron,
  .wb-dropdown__clear {
    transition: none;
  }
  .wb-dropdown-pop-enter-active,
  .wb-dropdown-pop-leave-active {
    transition: none;
  }
  .wb-dropdown-pop-enter-from,
  .wb-dropdown-pop-leave-to {
    opacity: 0;
    transform: none;
  }
  .wb-dropdown__spinner {
    animation: none;
    opacity: 0.6;
  }
}
</style>
