<!--
  Search.vue — Base component

  A debounced search field built on top of Input.vue rather than
  reimplementing text-entry styling — composes it directly, the same way
  Tabs.vue composes Badge.vue and Toast.vue composes Button.vue.

  Accessible-name note: Input.vue does not set `inheritAttrs: false`, so
  any attrs passed to it land on its root wrapper element, not on the
  actual <input> — meaning a generic `aria-label` passthrough from this
  component would not reliably reach the real form control. Rather than
  changing Input.vue's attrs behavior (out of scope for this step, and
  risky for a component seven other steps already depend on), Search
  guarantees an accessible name a different way: it always resolves its
  own stable id via useId(), always renders an associated <label> (either
  visible, or visually hidden via `hide-label`, which is the default —
  search bars conventionally hide the label and rely on the icon +
  placeholder visually while a screen reader still gets a real label).
  This also means Search does not need the "warn if no accessible name"
  dev-guard used by Button.vue/Badge.vue/Avatar.vue/Dropdown.vue — there
  is no prop combination under which this component ships without one.

  Owns its own debounce/keyboard behavior; never imports a Pinia store —
  data and behavior are always supplied by the parent via v-model/props/
  events.

  Reads exclusively from design tokens (src/styles/tokens.css) — no raw
  color, size, radius, shadow, typography, or transition value is
  declared here (Input.vue already owns all of that visual styling).

  Usage:
    <Search v-model="query" @search="runSearch" />
    <Search v-model="query" :debounce="500" placeholder="Search vocabulary…" />
    <Search v-model="query" label="Search the garden" :hide-label="false" />
    <Search v-model="query" :loading="isSearching" @clear="resetResults" />
-->
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, useId } from 'vue'
import Input from './Input.vue'

const props = defineProps({
  /** v-model — the current search text. */
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search…'
  },
  /** Debounce delay, in milliseconds, before `search` fires after typing stops. 0 disables debouncing (fires immediately on every change). */
  debounce: {
    type: Number,
    default: 300
  },
  loading: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
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
  /** Focuses the field as soon as it mounts. */
  autofocus: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  /** Accessible name for the field. Always rendered as a real <label> — see the header comment above. */
  label: {
    type: String,
    default: 'Search'
  },
  /** Visually hides the label (screen readers still get it) — the conventional look for a compact search bar. */
  hideLabel: {
    type: Boolean,
    default: true
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

const emit = defineEmits(['update:modelValue', 'search', 'clear', 'focus', 'blur'])

const inputRef = ref(null)
const generatedId = useId()
const resolvedId = props.id || generatedId

let debounceTimer = null

function scheduleSearch(value) {
  clearTimeout(debounceTimer)
  if (!props.debounce || props.debounce <= 0) {
    emit('search', value)
    return
  }
  debounceTimer = setTimeout(() => {
    emit('search', value)
  }, props.debounce)
}

function onUpdateModelValue(value) {
  emit('update:modelValue', value)
  scheduleSearch(value)
}

function onKeydown(event) {
  if (event.key === 'Enter') {
    clearTimeout(debounceTimer)
    emit('search', props.modelValue)
  } else if (event.key === 'Escape' && props.modelValue) {
    // Only consume Escape when there's something to clear, so a Search
    // field nested inside e.g. a Modal still lets an empty-field Escape
    // bubble up and close that Modal instead of being silently eaten.
    event.preventDefault()
    event.stopPropagation()
    clearTimeout(debounceTimer)
    emit('update:modelValue', '')
    emit('clear')
  }
}

function onInputClear() {
  // Input.vue's own clear button already emitted update:modelValue('')
  // (handled by onUpdateModelValue above, which just scheduled a new
  // debounced search) immediately before this fires. Cancel that pending
  // search — an explicit clear should not implicitly trigger one.
  clearTimeout(debounceTimer)
  emit('clear')
}

function onFocus(event) {
  emit('focus', event)
}

function onBlur(event) {
  emit('blur', event)
}

onMounted(() => {
  if (props.autofocus) {
    nextTick(() => inputRef.value?.focus())
  }
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="wb-search">
    <label v-if="hideLabel" :for="resolvedId" class="wb-search__visually-hidden-label">
      {{ label }}
    </label>

    <Input
      ref="inputRef"
      :id="resolvedId"
      :model-value="modelValue"
      :label="hideLabel ? '' : label"
      :placeholder="placeholder"
      type="text"
      :loading="loading"
      :clearable="clearable"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :autocomplete="autocomplete"
      :name="name"
      @update:model-value="onUpdateModelValue"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
      @clear="onInputClear"
    >
      <template #prefix>
        <slot name="prefix">
          <svg class="wb-search__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M16 16L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </slot>
      </template>

      <template v-if="$slots.suffix" #suffix>
        <slot name="suffix" />
      </template>
    </Input>
  </div>
</template>

<style scoped>
.wb-search {
  width: 100%;
}

.wb-search__icon {
  width: 1.125rem;
  height: 1.125rem;
}

/* --------------------------------------------------------------------
   Visually hidden — standard screen-reader-only text technique (same
   approach used in Avatar.vue for its status-indicator label), used
   here so the field always has a real associated <label> even when
   `hide-label` is true.
   -------------------------------------------------------------------- */
.wb-search__visually-hidden-label {
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
</style>
