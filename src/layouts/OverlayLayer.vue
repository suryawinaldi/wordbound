<!--
  OverlayLayer.vue — Layout

  The global stacking container for transient notifications. This is
  precisely the "future global overlay layer" anticipated in Toast.vue's
  own header comment — Toast.vue owns a single toast's presentation and
  timing only, and explicitly does not manage a stack, positioning, or
  mount/unmount choreography. This component provides exactly that,
  composing Toast.vue rather than reimplementing any of it.

  Unlike ModalLayer (which relies on Modal.vue already teleporting
  itself), Toast.vue does not self-teleport, so this component owns its
  own <Teleport to="body"> plus the fixed positioning, stacking, and
  enter/leave animation for the whole notification stack.

  Provides an injection key, 'overlayLayer', exposing:
    notify(options) -> id
      options: { variant, title, description, duration, dismissible,
                 actionLabel, onAction }
      Returns the new toast's id (useful for an early `dismiss(id)` call).
    dismiss(id) — removes a specific toast immediately.

  Usage (from any descendant component):
    const overlayLayer = inject('overlayLayer')
    overlayLayer.notify({ variant: 'success', title: 'Saved!' })
-->
<script setup>
import { ref, provide } from 'vue'
import Toast from '@/components/base/Toast.vue'

const queue = ref([])
let nextId = 1

function notify(options = {}) {
  const id = nextId++
  queue.value.push({ id, options })
  return id
}

function dismiss(id) {
  const index = queue.value.findIndex((t) => t.id === id)
  if (index !== -1) queue.value.splice(index, 1)
}

provide('overlayLayer', { notify, dismiss })

defineExpose({ notify, dismiss })
</script>

<template>
  <Teleport to="body">
    <div class="wb-overlay-layer" role="region" aria-label="Notifications">
      <TransitionGroup name="wb-overlay-item" tag="div" class="wb-overlay-layer__stack">
        <Toast
          v-for="toast in queue"
          :key="toast.id"
          :variant="toast.options.variant"
          :title="toast.options.title"
          :description="toast.options.description"
          :duration="toast.options.duration"
          :dismissible="toast.options.dismissible"
          :action-label="toast.options.actionLabel"
          @dismiss="dismiss(toast.id)"
          @action="toast.options.onAction && toast.options.onAction()"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.wb-overlay-layer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: var(--z-overlay);
  padding: var(--space-4);
  padding-top: max(var(--space-4), env(safe-area-inset-top));
  padding-right: max(var(--space-4), env(safe-area-inset-right));
  pointer-events: none;
  max-width: 100%;
}

.wb-overlay-layer__stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.wb-overlay-layer__stack > * {
  pointer-events: auto;
}

.wb-overlay-item-enter-active,
.wb-overlay-item-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}
.wb-overlay-item-enter-from,
.wb-overlay-item-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.wb-overlay-item-leave-active {
  position: absolute;
  right: 0;
}

@media (prefers-reduced-motion: reduce) {
  .wb-overlay-item-enter-active,
  .wb-overlay-item-leave-active {
    transition: opacity var(--duration-fast) linear;
  }
  .wb-overlay-item-enter-from,
  .wb-overlay-item-leave-to {
    transform: none;
  }
}
</style>
