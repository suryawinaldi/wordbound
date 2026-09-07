<!--
  DesignSystemView.vue

  Permanent development playground and visual QA reference for every Base
  Component in the WordBound design system. This page is never linked from
  in-app navigation and exists purely for development — see the dev-only
  route guard in src/router/index.js.

  Rules for maintaining this file (see Master Implementation Blueprint,
  Part 3 — Component Development Order):
    - Every completed Base Component gets its own <section class="ds-section">
      below, added in the order it was built.
    - Never delete a previous component's section when adding a new one —
      by the end of Milestone 1 this page is the living reference for the
      whole Base tier.
    - No inline styles — this page consumes the same design tokens as
      every other screen, via the scoped classes below.
-->
<script setup>
import { reactive, ref } from 'vue'
import Button from '@/components/base/Button.vue'
import Input from '@/components/base/Input.vue'
import Badge from '@/components/base/Badge.vue'
import Avatar from '@/components/base/Avatar.vue'
import Tabs from '@/components/base/Tabs.vue'
import Dropdown from '@/components/base/Dropdown.vue'
import Toast from '@/components/base/Toast.vue'
import Modal from '@/components/base/Modal.vue'
import Search from '@/components/base/Search.vue'

function handleDemoClick(label) {
  console.log(`[DesignSystemView] Button clicked: ${label}`)
}

function handleBadgeClick(label) {
  console.log(`[DesignSystemView] Badge clicked: ${label}`)
}

function handleAvatarClick(label) {
  console.log(`[DesignSystemView] Avatar clicked: ${label}`)
}

// Self-contained demo image (inline SVG data URI) so the "working image"
// example never depends on network access or an external placeholder
// service — it will always render identically for anyone verifying this page.
const demoAvatarImageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    '<rect width="100" height="100" fill="#8FD1AE"/>' +
    '<circle cx="50" cy="38" r="18" fill="#0F3D2E"/>' +
    '<path d="M20 90c6-24 20-34 30-34s24 10 30 34" fill="#0F3D2E"/>' +
    '</svg>'
)}`

// Deliberately invalid path — guaranteed to 404 against the local dev
// server, reliably triggering the Avatar's image-error fallback.
const demoBrokenImageSrc = '/this-avatar-image-does-not-exist.jpg'

const avatarLoadingDemo = ref(true)
function toggleAvatarLoadingDemo() {
  avatarLoadingDemo.value = !avatarLoadingDemo.value
}

// Tabs demo state — three independent instances so each can be tested
// in isolation without one interfering with another's selection.
const underlineTabsDemo = ref('consistency')
const underlineTabsItems = [
  { id: 'consistency', label: 'Consistency' },
  { id: 'mastery', label: 'Mastery', badge: 3 },
  { id: 'exploration', label: 'Exploration', disabled: true },
  { id: 'together', label: 'Together' },
  { id: 'fun', label: 'Fun / hidden' }
]

const pillTabsDemo = ref('practice')
const pillTabsItems = [
  { id: 'practice', label: 'Practice' },
  { id: 'timed', label: 'Timed' },
  { id: 'survival', label: 'Survival' }
]

const overflowTabsDemo = ref('tag-1')
const overflowTabsItems = Array.from({ length: 12 }, (_, i) => ({
  id: `tag-${i + 1}`,
  label: `Category ${i + 1}`
}))

// Dropdown demo state — independent instances so each can be tested
// in isolation.
const cefrOptions = [
  { value: 'a1', label: 'A1 — Beginner' },
  { value: 'a2', label: 'A2 — Elementary' },
  { value: 'b1', label: 'B1 — Intermediate' },
  { value: 'b2', label: 'B2 — Upper Intermediate' },
  { value: 'c1', label: 'C1 — Advanced', disabled: true },
  { value: 'c2', label: 'C2 — Mastery', disabled: true }
]
const dropdownDefaultDemo = ref(null)
const dropdownPreselectedDemo = ref('b1')
const dropdownClearableDemo = ref('a2')
const dropdownErrorDemo = ref(null)
const dropdownLoadingDemo = ref(false)
function toggleDropdownLoadingDemo() {
  dropdownLoadingDemo.value = !dropdownLoadingDemo.value
}

// Toast demo state.
// Static examples stay visible (duration: 0) so every variant, and the
// dismiss button itself, can be inspected without racing a timer.
const staticToastVisibility = reactive({
  success: true,
  warning: true,
  error: true,
  info: true
})
function resetStaticToasts() {
  staticToastVisibility.success = true
  staticToastVisibility.warning = true
  staticToastVisibility.error = true
  staticToastVisibility.info = true
}

// Live spawn demo — real auto-dismiss timing, so pause-on-hover/focus can
// actually be exercised by hovering a toast mid-countdown.
const spawnedToasts = ref([])
let nextToastId = 1
function spawnToast(variant) {
  const messages = {
    success: { title: 'Saved!', description: 'Your progress is safe.' },
    warning: { title: 'Streak at risk', description: 'Play a round today to keep it alive.' },
    error: { title: "Couldn't connect", description: 'Retrying automatically…' },
    info: { title: 'New words unlocked', description: '3 new vocabulary cards were added.' }
  }
  spawnedToasts.value.push({
    id: nextToastId++,
    variant,
    ...messages[variant]
  })
}
function removeSpawnedToast(id) {
  spawnedToasts.value = spawnedToasts.value.filter((t) => t.id !== id)
}

function handleToastAction(label) {
  console.log(`[DesignSystemView] Toast action clicked: ${label}`)
}

// Modal demo state — one independent boolean per demo so each can be
// opened/closed without interfering with the others.
const modalBasicDemo = ref(false)
const modalFooterDemo = ref(false)
const modalCustomHeaderDemo = ref(false)
const modalNoBackdropCloseDemo = ref(false)
const modalNoCloseButtonDemo = ref(false)
const modalFocusTrapDemo = ref(false)

function handleModalConfirm(label) {
  console.log(`[DesignSystemView] Modal confirmed: ${label}`)
  modalFooterDemo.value = false
}

// Search demo state.
const searchBasicDemo = ref('')
function handleSearchEvent(source, value) {
  console.log(`[DesignSystemView] Search "${source}" fired: "${value}"`)
}

const searchDebounceDemo = ref('')

const searchLoadingDemo = ref('')
const searchIsLoading = ref(false)
function handleSearchLoadingDemo(value) {
  searchIsLoading.value = true
  console.log(`[DesignSystemView] Search "loading-demo" fired: "${value}"`)
  setTimeout(() => {
    searchIsLoading.value = false
  }, 1200)
}

const searchVisibleLabelDemo = ref('')
const searchClearableDemo = ref('Almira')

const searchAutofocusVisible = ref(false)
const searchAutofocusValue = ref('')
function toggleSearchAutofocusDemo() {
  searchAutofocusVisible.value = !searchAutofocusVisible.value
}

// Local, page-only state for the Input playground below — not connected
// to any store, since this page exists purely for visual/behavioral QA.
const inputDemo = reactive({
  default: '',
  success: 'Almira',
  warning: '',
  error: '',
  errorText: '',
  sizeSm: '',
  sizeMd: '',
  sizeLg: '',
  disabled: 'Can\'t edit me',
  readonly: 'Read-only value',
  required: '',
  loading: '',
  prefix: '',
  suffix: '',
  clearable: '',
  password: '',
  passwordClearable: '',
  labelCheck: ''
})
</script>

<template>
  <div class="ds-page">
    <header class="ds-banner">
      <p class="ds-banner__label">Development only</p>
      <p class="ds-banner__text">
        This page is not part of the WordBound experience. It exists to visually
        verify every Base Component against the design tokens before it's used
        in a real screen. Remove the route in <code>src/router/index.js</code>
        before a production build if you want it excluded entirely.
      </p>
    </header>

    <h1 class="ds-title">WordBound Design System</h1>
    <p class="ds-subtitle">Milestone 1 — Foundation · Base Component reference</p>

    <!-- ================================================================
         BUTTON
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Button</h2>
      <p class="ds-section__meta">src/components/base/Button.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Variants — md size</p>
        <div class="ds-row">
          <Button variant="primary" @click="handleDemoClick('primary')">Primary</Button>
          <Button variant="secondary" @click="handleDemoClick('secondary')">Secondary</Button>
          <Button variant="ghost" @click="handleDemoClick('ghost')">Ghost</Button>
          <Button variant="danger" @click="handleDemoClick('danger')">Danger</Button>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Sizes — primary variant</p>
        <div class="ds-row ds-row--align-center">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Disabled — all variants</p>
        <div class="ds-row">
          <Button variant="primary" disabled @click="handleDemoClick('primary-disabled')">Primary</Button>
          <Button variant="secondary" disabled @click="handleDemoClick('secondary-disabled')">Secondary</Button>
          <Button variant="ghost" disabled @click="handleDemoClick('ghost-disabled')">Ghost</Button>
          <Button variant="danger" disabled @click="handleDemoClick('danger-disabled')">Danger</Button>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Loading — all variants</p>
        <div class="ds-row">
          <Button variant="primary" loading>Saving</Button>
          <Button variant="secondary" loading>Saving</Button>
          <Button variant="ghost" loading>Saving</Button>
          <Button variant="danger" loading>Saving</Button>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Block (full width)</p>
        <Button variant="primary" block>Continue</Button>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Icon slot &amp; accessibility warning check</p>
        <p class="ds-note">
          Open the browser console: the first two buttons below should log
          nothing; the third is intentionally missing an accessible name and
          should log a <code>[Button]</code> warning.
        </p>
        <div class="ds-row">
          <Button variant="secondary">
            <template #icon><span aria-hidden="true">🔊</span></template>
            With Icon
          </Button>
          <Button variant="ghost" aria-label="Replay audio">
            <template #icon><span aria-hidden="true">🔊</span></template>
          </Button>
          <Button variant="ghost">
            <template #icon><span aria-hidden="true">🔊</span></template>
          </Button>
        </div>
      </div>
    </section>

    <!-- ================================================================
         INPUT
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Input</h2>
      <p class="ds-section__meta">src/components/base/Input.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Variants — default / success / warning / error</p>
        <div class="ds-column">
          <Input v-model="inputDemo.default" label="Default" placeholder="Type something…" />
          <Input v-model="inputDemo.success" variant="success" label="Success" helper-text="Looks good." />
          <Input v-model="inputDemo.warning" variant="warning" label="Warning" helper-text="Double-check this." />
          <Input
            v-model="inputDemo.error"
            label="Error (via variant)"
            variant="error"
            helper-text="This helper text is intentionally hidden — error styling forces the error message below instead."
          />
          <Input
            v-model="inputDemo.errorText"
            label="Error (via error-text)"
            error-text="This field is required."
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Sizes — sm / md / lg</p>
        <div class="ds-column">
          <Input v-model="inputDemo.sizeSm" size="sm" label="Small" placeholder="Small input" />
          <Input v-model="inputDemo.sizeMd" size="md" label="Medium" placeholder="Medium input" />
          <Input v-model="inputDemo.sizeLg" size="lg" label="Large" placeholder="Large input" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">States — disabled / readonly / required / loading</p>
        <div class="ds-column">
          <Input v-model="inputDemo.disabled" label="Disabled" disabled placeholder="Can't touch this" />
          <Input v-model="inputDemo.readonly" label="Readonly" readonly />
          <Input v-model="inputDemo.required" label="Required field" required placeholder="Must be filled" />
          <Input v-model="inputDemo.loading" label="Loading" loading placeholder="Checking availability…" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Prefix &amp; suffix slots</p>
        <div class="ds-column">
          <Input v-model="inputDemo.prefix" label="With prefix">
            <template #prefix><span aria-hidden="true">@</span></template>
          </Input>
          <Input v-model="inputDemo.suffix" label="With suffix" placeholder="0.00">
            <template #suffix><span aria-hidden="true">coins</span></template>
          </Input>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Clearable</p>
        <p class="ds-note">
          Type something, then confirm the "×" button appears, clears the
          field, and returns focus to the input.
        </p>
        <div class="ds-column">
          <Input v-model="inputDemo.clearable" clearable label="Clearable field" placeholder="Type to see the clear button" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Password visibility toggle</p>
        <p class="ds-note">
          Automatically enabled for <code>type="password"</code>. Combined
          with <code>clearable</code> below to confirm both action buttons
          can appear together.
        </p>
        <div class="ds-column">
          <Input v-model="inputDemo.password" type="password" label="Password" placeholder="Enter password" />
          <Input
            v-model="inputDemo.passwordClearable"
            type="password"
            clearable
            label="Password (clearable too)"
            placeholder="Enter password"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Label association &amp; keyboard check</p>
        <p class="ds-note">
          Click directly on the label text below — focus should move into
          the input. Tab order should flow label → input → clear/toggle
          buttons in a logical sequence.
        </p>
        <div class="ds-column">
          <Input v-model="inputDemo.labelCheck" label="Click this label" clearable placeholder="Focus test" />
        </div>
      </div>
    </section>

    <!-- ================================================================
         BADGE
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Badge</h2>
      <p class="ds-section__meta">src/components/base/Badge.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Variants — md size</p>
        <div class="ds-row ds-row--align-center">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Sizes — primary variant</p>
        <div class="ds-row ds-row--align-center">
          <Badge variant="primary" size="sm">Small</Badge>
          <Badge variant="primary" size="md">Medium</Badge>
          <Badge variant="primary" size="lg">Large</Badge>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Leading &amp; trailing icon slots</p>
        <div class="ds-row ds-row--align-center">
          <Badge variant="warning">
            <template #leading>🔥</template>
            7-day streak
          </Badge>
          <Badge variant="success">
            Correct
            <template #trailing>✓</template>
          </Badge>
          <Badge variant="primary">
            <template #leading>🌱</template>
            Level 3
            <template #trailing>+120 XP</template>
          </Badge>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Clickable — keyboard &amp; focus check</p>
        <p class="ds-note">
          Tab to each badge below — a visible focus ring should appear;
          clicking (mouse or Enter/Space while focused) logs to the
          console. The disabled badge should be unreachable by click and
          show no focus ring.
        </p>
        <div class="ds-row ds-row--align-center">
          <Badge variant="outline" clickable @click="handleBadgeClick('vocabulary-filter')">
            Vocabulary
            <template #trailing>×</template>
          </Badge>
          <Badge variant="outline" clickable disabled>
            Grammar (disabled)
            <template #trailing>×</template>
          </Badge>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Long text &amp; wrapping behavior</p>
        <p class="ds-note">
          Confirm the single long badge truncates with an ellipsis rather
          than breaking the pill shape, and that the row of many short
          badges wraps onto multiple lines cleanly at narrow widths.
        </p>
        <div class="ds-column">
          <div class="ds-truncate-demo">
            <Badge variant="primary">This is a deliberately long badge label to test truncation</Badge>
          </div>
          <div class="ds-row">
            <Badge v-for="n in 14" :key="n" variant="default">Tag {{ n }}</Badge>
          </div>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Accessibility warning check</p>
        <p class="ds-note">
          Open the browser console: the first badge below should log
          nothing; the second is intentionally icon-only with no
          accessible name and should log a <code>[Badge]</code> warning.
        </p>
        <div class="ds-row ds-row--align-center">
          <Badge variant="default" aria-label="Unread notifications">
            <template #leading>🔔</template>
          </Badge>
          <Badge variant="default">
            <template #leading>🔔</template>
          </Badge>
        </div>
      </div>
    </section>

    <!-- ================================================================
         AVATAR
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Avatar</h2>
      <p class="ds-section__meta">src/components/base/Avatar.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Sizes — xs / sm / md / lg / xl</p>
        <div class="ds-row ds-row--align-center">
          <Avatar size="xs" initials="XS" alt="Extra small example" />
          <Avatar size="sm" initials="SM" alt="Small example" />
          <Avatar size="md" initials="MD" alt="Medium example" />
          <Avatar size="lg" initials="LG" alt="Large example" />
          <Avatar size="xl" initials="XL" alt="Extra large example" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Status variants</p>
        <div class="ds-row ds-row--align-center">
          <Avatar initials="SA" alt="Surya, no status" variant="default" />
          <Avatar initials="AL" alt="Almira, online" variant="online" />
          <Avatar initials="SA" alt="Surya, away" variant="away" />
          <Avatar initials="AL" alt="Almira, offline" variant="offline" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Image avatar</p>
        <p class="ds-note">
          Uses a self-contained inline SVG image so this example never
          depends on network access.
        </p>
        <div class="ds-row ds-row--align-center">
          <Avatar :src="demoAvatarImageSrc" alt="Player with a photo" size="lg" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Initials fallback</p>
        <div class="ds-row ds-row--align-center">
          <Avatar initials="SA" alt="Surya" size="lg" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Icon fallback (no image, no initials)</p>
        <div class="ds-row ds-row--align-center">
          <Avatar alt="Guest player" size="lg" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Loading state</p>
        <p class="ds-note">
          Click the button to toggle between the shimmering skeleton and
          the loaded initials fallback.
        </p>
        <div class="ds-row ds-row--align-center">
          <Avatar :loading="avatarLoadingDemo" initials="SA" alt="Surya" size="lg" />
          <Button variant="secondary" size="sm" @click="toggleAvatarLoadingDemo">
            Toggle loading
          </Button>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Image error fallback</p>
        <p class="ds-note">
          Points at a deliberately invalid image path — should fall back
          to the initials below it automatically once the image fails to load.
        </p>
        <div class="ds-row ds-row--align-center">
          <Avatar :src="demoBrokenImageSrc" initials="SA" alt="Surya, broken image example" size="lg" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Clickable avatar &amp; ring — keyboard &amp; focus check</p>
        <p class="ds-note">
          Tab to the avatar below — a visible focus ring should appear;
          clicking (mouse or Enter/Space while focused) logs to the console.
        </p>
        <div class="ds-row ds-row--align-center">
          <Avatar
            initials="AL"
            alt="Open Almira's profile"
            variant="online"
            ring
            clickable
            @click="handleAvatarClick('almira-profile')"
          />
          <Avatar initials="SA" alt="Disabled example" clickable disabled />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Grouped avatars</p>
        <div class="ds-avatar-group">
          <Avatar initials="SA" alt="Surya" variant="online" ring />
          <Avatar initials="AL" alt="Almira" variant="online" ring />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Accessibility warning check</p>
        <p class="ds-note">
          Open the browser console: the first avatar below should log
          nothing; the second has no <code>alt</code> and no
          <code>aria-label</code>, and should log an <code>[Avatar]</code> warning.
        </p>
        <div class="ds-row ds-row--align-center">
          <Avatar initials="OK" alt="Has an accessible name" />
          <Avatar initials="NO" />
        </div>
      </div>
    </section>

    <!-- ================================================================
         TABS
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Tabs</h2>
      <p class="ds-section__meta">src/components/base/Tabs.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Underline variant — with badge &amp; a disabled tab</p>
        <p class="ds-note">
          Click "Exploration" (disabled) — nothing should happen. Use Tab
          to focus the tablist, then Arrow Left/Right to move between
          tabs (disabled ones are skipped automatically), and Home/End to
          jump to the first/last tab.
        </p>
        <Tabs v-model="underlineTabsDemo" :items="underlineTabsItems" variant="underline">
          <template #panel="{ item }">
            <p class="ds-note">Panel content for "{{ item.label }}".</p>
          </template>
        </Tabs>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Pill variant — mode switching</p>
        <Tabs v-model="pillTabsDemo" :items="pillTabsItems" variant="pill">
          <template #panel="{ item }">
            <p class="ds-note">Panel content for "{{ item.label }}".</p>
          </template>
        </Tabs>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Overflow behavior — narrow the browser window to test</p>
        <p class="ds-note">
          At full width all 12 categories may fit; narrow the window (or
          zoom in) until they no longer do — the tablist should scroll
          horizontally rather than wrap or overflow the page.
        </p>
        <Tabs v-model="overflowTabsDemo" :items="overflowTabsItems" variant="underline">
          <template #panel="{ item }">
            <p class="ds-note">Panel content for "{{ item.label }}".</p>
          </template>
        </Tabs>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Icon + label</p>
        <Tabs
          v-model="pillTabsDemo"
          :items="pillTabsItems"
          variant="pill"
        >
          <template #icon="{ item }">
            <span aria-hidden="true">{{ item.id === 'practice' ? '📘' : item.id === 'timed' ? '⏱️' : '🔥' }}</span>
          </template>
          <template #panel="{ item }">
            <p class="ds-note">Same selection state as the pill example above — "{{ item.label }}" is shared between both.</p>
          </template>
        </Tabs>
      </div>
    </section>

    <!-- ================================================================
         DROPDOWN
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Dropdown</h2>
      <p class="ds-section__meta">src/components/base/Dropdown.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Default — with placeholder, label, helper text &amp; disabled options</p>
        <p class="ds-note">
          C1/C2 are disabled — they should be skipped entirely by keyboard
          navigation and typeahead, and show a not-allowed cursor.
        </p>
        <div class="ds-column">
          <Dropdown
            v-model="dropdownDefaultDemo"
            label="CEFR level"
            placeholder="Choose a level"
            helper-text="This determines the difficulty of your daily missions."
            :options="cefrOptions"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Pre-selected value</p>
        <div class="ds-column">
          <Dropdown v-model="dropdownPreselectedDemo" label="CEFR level" :options="cefrOptions" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Clearable</p>
        <div class="ds-column">
          <Dropdown v-model="dropdownClearableDemo" label="CEFR level" clearable :options="cefrOptions" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Error state</p>
        <div class="ds-column">
          <Dropdown
            v-model="dropdownErrorDemo"
            label="CEFR level"
            placeholder="Choose a level"
            error-text="Please select your current level."
            :options="cefrOptions"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Loading &amp; disabled states</p>
        <div class="ds-column">
          <div class="ds-row ds-row--align-center">
            <Dropdown
              label="Loading example"
              placeholder="Checking availability…"
              :loading="dropdownLoadingDemo"
              :options="cefrOptions"
            />
            <Button variant="secondary" size="sm" @click="toggleDropdownLoadingDemo">
              Toggle loading
            </Button>
          </div>
          <Dropdown label="Disabled example" placeholder="Not available" disabled :options="cefrOptions" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Keyboard &amp; typeahead check</p>
        <p class="ds-note">
          Tab to the field below, press ArrowDown to open it, use
          ArrowUp/ArrowDown to move the highlight, Home/End to jump to the
          first/last enabled option, Enter to commit, and Escape to close
          without changing the selection. With the field focused (open or
          closed), type "b" — the selection should jump directly to the
          first option starting with "B".
        </p>
        <div class="ds-column">
          <Dropdown label="Keyboard test" placeholder="Try the keyboard" :options="cefrOptions" />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Accessibility warning check</p>
        <p class="ds-note">
          Open the browser console: the labeled dropdown above logs
          nothing; the one below has no <code>label</code> and no
          <code>aria-label</code>, and should log a
          <code>[Dropdown]</code> warning.
        </p>
        <div class="ds-column">
          <Dropdown placeholder="No accessible name" :options="cefrOptions" />
        </div>
      </div>
    </section>

    <!-- ================================================================
         TOAST
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Toast</h2>
      <p class="ds-section__meta">src/components/base/Toast.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Variants — persistent (duration 0) for inspection</p>
        <p class="ds-note">
          Each of these stays visible so you can inspect its ARIA role
          and try its dismiss button without racing a timer. Use "Reset
          all" to bring back any you've dismissed.
        </p>
        <div class="ds-column">
          <Toast
            v-if="staticToastVisibility.success"
            variant="success"
            title="Saved!"
            description="Your progress is safe."
            :duration="0"
            @dismiss="staticToastVisibility.success = false"
          />
          <Toast
            v-if="staticToastVisibility.warning"
            variant="warning"
            title="Streak at risk"
            description="Play a round today to keep it alive."
            :duration="0"
            @dismiss="staticToastVisibility.warning = false"
          />
          <Toast
            v-if="staticToastVisibility.error"
            variant="error"
            title="Couldn't connect"
            description="Retrying automatically…"
            :duration="0"
            @dismiss="staticToastVisibility.error = false"
          />
          <Toast
            v-if="staticToastVisibility.info"
            variant="info"
            title="New words unlocked"
            description="3 new vocabulary cards were added."
            :duration="0"
            @dismiss="staticToastVisibility.info = false"
          />
          <Button variant="secondary" size="sm" @click="resetStaticToasts">
            Reset all
          </Button>
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Action button</p>
        <div class="ds-column">
          <Toast
            variant="info"
            title="Level up!"
            description="You've reached Level 4."
            action-label="View profile"
            :duration="0"
            @action="handleToastAction('view-profile')"
            @dismiss="handleToastAction('level-up-dismissed')"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Live auto-dismiss demo — pause on hover/focus</p>
        <p class="ds-note">
          Click a button to spawn a real toast (4 second auto-dismiss).
          Hover your mouse over it, or Tab to focus its dismiss button,
          partway through the countdown — the timer should visibly pause
          and only resume once you move away.
        </p>
        <div class="ds-row">
          <Button variant="secondary" size="sm" @click="spawnToast('success')">Spawn success</Button>
          <Button variant="secondary" size="sm" @click="spawnToast('warning')">Spawn warning</Button>
          <Button variant="secondary" size="sm" @click="spawnToast('error')">Spawn error</Button>
          <Button variant="secondary" size="sm" @click="spawnToast('info')">Spawn info</Button>
        </div>
        <div class="ds-column">
          <Toast
            v-for="toast in spawnedToasts"
            :key="toast.id"
            :variant="toast.variant"
            :title="toast.title"
            :description="toast.description"
            :duration="4000"
            @dismiss="removeSpawnedToast(toast.id)"
          />
        </div>
      </div>
    </section>

    <!-- ================================================================
         MODAL
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Modal</h2>
      <p class="ds-section__meta">src/components/base/Modal.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Basic — title, description, default slot</p>
        <div class="ds-row">
          <Button variant="primary" @click="modalBasicDemo = true">Open basic modal</Button>
        </div>
        <Modal
          v-model="modalBasicDemo"
          title="Delete this word?"
          description="This can't be undone."
        >
          <p class="ds-note">Removing a word takes it out of your Garden collection permanently.</p>
        </Modal>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Footer slot — action buttons</p>
        <div class="ds-row">
          <Button variant="primary" @click="modalFooterDemo = true">Open modal with footer</Button>
        </div>
        <Modal v-model="modalFooterDemo" title="Confirm sign out">
          <p class="ds-note">You'll need to answer your security question again next time.</p>
          <template #footer>
            <Button variant="ghost" @click="modalFooterDemo = false">Cancel</Button>
            <Button variant="danger" @click="handleModalConfirm('sign-out')">Sign out</Button>
          </template>
        </Modal>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Custom header slot</p>
        <div class="ds-row">
          <Button variant="secondary" @click="modalCustomHeaderDemo = true">Open custom-header modal</Button>
        </div>
        <Modal v-model="modalCustomHeaderDemo" aria-label="Almira's level up celebration">
          <template #header>
            <div class="ds-row ds-row--align-center">
              <Avatar initials="AL" alt="Almira" variant="online" />
              <span class="ds-note">Almira just leveled up!</span>
            </div>
          </template>
          <p class="ds-note">A fully custom header can replace the default title/description entirely.</p>
        </Modal>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Backdrop click disabled — must use close button or Escape</p>
        <p class="ds-note">
          Clicking outside this one should do nothing; only the "×"
          button or the Escape key should close it.
        </p>
        <div class="ds-row">
          <Button variant="secondary" @click="modalNoBackdropCloseDemo = true">Open non-dismissible-by-backdrop modal</Button>
        </div>
        <Modal v-model="modalNoBackdropCloseDemo" title="Careful" :close-on-backdrop="false">
          <p class="ds-note">Clicking the backdrop won't close this one.</p>
        </Modal>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">No close button — footer action or Escape only</p>
        <div class="ds-row">
          <Button variant="secondary" @click="modalNoCloseButtonDemo = true">Open modal without a close button</Button>
        </div>
        <Modal v-model="modalNoCloseButtonDemo" title="Read this first" :closable="false">
          <p class="ds-note">There's no "×" here — only the footer button or Escape will close it.</p>
          <template #footer>
            <Button variant="primary" @click="modalNoCloseButtonDemo = false">Got it</Button>
          </template>
        </Modal>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Focus trap check — multiple focusable elements</p>
        <p class="ds-note">
          Open this one and press Tab repeatedly — focus should cycle
          between the two inputs and two buttons and never escape to the
          page behind the modal; Shift+Tab should cycle backwards the
          same way. Close it and confirm focus returns to the button you
          clicked to open it, not somewhere else on the page.
        </p>
        <div class="ds-row">
          <Button variant="secondary" @click="modalFocusTrapDemo = true">Open focus-trap test modal</Button>
        </div>
        <Modal v-model="modalFocusTrapDemo" title="Focus trap test">
          <div class="ds-column">
            <Input label="First field" placeholder="Tab here first" />
            <Input label="Second field" placeholder="Then here" />
          </div>
          <template #footer>
            <Button variant="ghost" @click="modalFocusTrapDemo = false">Cancel</Button>
            <Button variant="primary" @click="modalFocusTrapDemo = false">Save</Button>
          </template>
        </Modal>
      </div>
    </section>

    <!-- ================================================================
         SEARCH
         ================================================================ -->
    <section class="ds-section">
      <h2 class="ds-section__title">Search</h2>
      <p class="ds-section__meta">src/components/base/Search.vue</p>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Basic — default debounce (300ms), hidden label</p>
        <p class="ds-note">
          Type and stop for a moment — open the console to see the
          debounced <code>search</code> event fire roughly 300ms after
          you stop typing. Press Enter to fire it immediately instead.
        </p>
        <div class="ds-column">
          <Search
            v-model="searchBasicDemo"
            @search="handleSearchEvent('basic', $event)"
            @clear="handleSearchEvent('basic-clear', '')"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Configurable debounce duration (800ms)</p>
        <div class="ds-column">
          <Search
            v-model="searchDebounceDemo"
            :debounce="800"
            placeholder="Slower debounce…"
            @search="handleSearchEvent('slow-debounce', $event)"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Loading state</p>
        <p class="ds-note">
          Type something and stop — a spinner should appear for about
          1.2 seconds (simulating a network request) before clearing.
        </p>
        <div class="ds-column">
          <Search
            v-model="searchLoadingDemo"
            :loading="searchIsLoading"
            @search="handleSearchLoadingDemo"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Visible label</p>
        <div class="ds-column">
          <Search
            v-model="searchVisibleLabelDemo"
            label="Search vocabulary"
            :hide-label="false"
            @search="handleSearchEvent('visible-label', $event)"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Clearable &amp; Escape-to-clear — keyboard check</p>
        <p class="ds-note">
          Field starts pre-filled. Click the "×" or focus the field and
          press Escape — both should clear it and log a clear event.
          With the field already empty, press Escape again — nothing
          should happen (it's not consumed, so a field like this nested
          inside a real Modal would still let Escape close that Modal).
        </p>
        <div class="ds-column">
          <Search
            v-model="searchClearableDemo"
            label="Clearable example"
            :hide-label="false"
            @clear="handleSearchEvent('clearable-clear', '')"
          />
        </div>
      </div>

      <div class="ds-subsection">
        <p class="ds-subsection__label">Autofocus — mounted on demand</p>
        <p class="ds-note">
          Kept behind a button rather than always mounted, so it doesn't
          steal keyboard focus the moment this page loads. Clicking the
          button below should immediately place the text cursor in the
          field that appears.
        </p>
        <div class="ds-column">
          <Button variant="secondary" size="sm" @click="toggleSearchAutofocusDemo">
            {{ searchAutofocusVisible ? 'Hide' : 'Show' }} autofocus example
          </Button>
          <Search
            v-if="searchAutofocusVisible"
            v-model="searchAutofocusValue"
            autofocus
            label="Autofocus example"
            :hide-label="false"
            @search="handleSearchEvent('autofocus', $event)"
          />
        </div>
      </div>
    </section>

    <!--
      All Base Components from PART 10, Steps 2–10 are now demonstrated
      above (Button, Input, Badge, Avatar, Tabs, Dropdown, Toast, Modal,
      Search). Future Shared/Feature/Game-tier components (per the
      Frontend Architecture Blueprint) get their own playground page —
      this file remains the permanent reference for the Base tier only.
    -->
  </div>
</template>

<style scoped>
.ds-page {
  min-height: 100vh;
  background-color: var(--bg-default);
  color: var(--text-primary);
  font-family: var(--font-sans);
  padding: var(--space-8) var(--space-6) var(--space-24);
  max-width: 960px;
  margin: 0 auto;
}

.ds-banner {
  background-color: var(--color-warning-100);
  border: 1px solid var(--state-warning);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-8);
}

.ds-banner__label {
  font-family: var(--text-caption-family);
  font-size: var(--text-caption-size);
  line-height: var(--text-caption-leading);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--text-caption-tracking);
  text-transform: var(--text-caption-transform);
  color: var(--state-warning);
  margin: 0 0 var(--space-2) 0;
}

.ds-banner__text {
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  color: var(--text-primary);
  margin: 0;
}

.ds-banner__text code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background-color: var(--surface-elevated);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
}

.ds-title {
  font-family: var(--text-display-lg-family);
  font-size: var(--text-display-lg-size);
  line-height: var(--text-display-lg-leading);
  font-weight: var(--text-display-lg-weight);
  margin: 0 0 var(--space-2) 0;
}

.ds-subtitle {
  font-size: var(--text-body-lg-size);
  line-height: var(--text-body-lg-leading);
  color: var(--text-secondary);
  margin: 0 0 var(--space-8) 0;
}

.ds-section {
  background-color: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.ds-section__title {
  font-family: var(--text-heading-lg-family);
  font-size: var(--text-heading-lg-size);
  line-height: var(--text-heading-lg-leading);
  font-weight: var(--text-heading-lg-weight);
  margin: 0 0 var(--space-1) 0;
}

.ds-section__meta {
  font-family: var(--font-mono);
  font-size: var(--text-numeric-sm-size);
  color: var(--text-secondary);
  margin: 0 0 var(--space-6) 0;
}

.ds-subsection {
  margin-bottom: var(--space-6);
}

.ds-subsection:last-child {
  margin-bottom: 0;
}

.ds-subsection__label {
  font-family: var(--text-caption-family);
  font-size: var(--text-caption-size);
  line-height: var(--text-caption-leading);
  font-weight: var(--text-caption-weight);
  letter-spacing: var(--text-caption-tracking);
  text-transform: var(--text-caption-transform);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3) 0;
}

.ds-note {
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-leading);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3) 0;
}

.ds-note code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background-color: var(--surface-elevated);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
}

.ds-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.ds-row--align-center {
  align-items: center;
}

.ds-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 22rem;
}

.ds-truncate-demo {
  max-width: 12rem;
}

.ds-avatar-group {
  display: flex;
}

.ds-avatar-group > * {
  border-radius: var(--radius-full);
}

.ds-avatar-group > *:not(:first-child) {
  margin-left: calc(-1 * var(--space-2));
}
</style>
