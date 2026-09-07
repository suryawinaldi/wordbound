<!--
  ModalLayer.vue — Layout

  A lightweight, imperative registry for opening confirm/alert-style
  dialogs from anywhere in the app (including from store/service code,
  not just templates) without each call site needing its own <Modal
  v-model> markup. Composes Modal.vue directly rather than reimplementing
  any dialog behavior — every accessibility guarantee (focus trap, scroll
  lock, focus restoration, Escape/backdrop close) already lives in
  Modal.vue and is inherited automatically here.

  Provides an injection key, 'modalLayer', exposing:
    open(options) -> Promise<result>
      options: { title, description, message, closable, closeOnBackdrop,
                 confirmLabel, cancelLabel, danger, dismissValue }
      Resolves with `true`/`false` when a confirm/cancel button is used,
      or `dismissValue` (default null) when closed via Escape/backdrop/
      the close button.
    close(id, value) — closes a specific open modal programmatically.

  Usage (from any descendant component):
    const modalLayer = inject('modalLayer')
    const confirmed = await modalLayer.open({
      title: 'Delete this word?',
      message: "This can't be undone.",
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true
    })

  Multiple simultaneously-open modals are supported (each gets its own
  Modal.vue instance, each of which teleports and manages focus
  independently) — this component does not attempt to enforce a single-
  modal-at-a-time rule; callers are expected to use this thoughtfully,
  the same way the Design System Rules document expects of any modal.

  Placement: since Modal.vue already teleports itself to <body>, this
  component does not need to be physically placed inside AppShell's
  `modal` slot to render correctly — it only needs to exist once,
  somewhere in the app's component tree, so its `provide()` is reachable
  by everything that needs `inject('modalLayer')`.
-->
<script setup>
import { ref, provide } from 'vue'
import Modal from '@/components/base/Modal.vue'
import Button from '@/components/base/Button.vue'

const queue = ref([])
let nextId = 1

function open(options = {}) {
  return new Promise((resolve) => {
    const id = nextId++
    queue.value.push({ id, options, resolve })
  })
}

function resolveModal(id, value) {
  const index = queue.value.findIndex((m) => m.id === id)
  if (index === -1) return
  const [modal] = queue.value.splice(index, 1)
  modal.resolve(value)
}

function close(id, value = null) {
  resolveModal(id, value)
}

function onDismiss(modal) {
  resolveModal(modal.id, modal.options.dismissValue ?? null)
}

provide('modalLayer', { open, close })

defineExpose({ open, close })
</script>

<template>
  <Modal
    v-for="modal in queue"
    :key="modal.id"
    :model-value="true"
    :title="modal.options.title"
    :description="modal.options.description"
    :closable="modal.options.closable !== false"
    :close-on-backdrop="modal.options.closeOnBackdrop !== false"
    :aria-label="modal.options.ariaLabel"
    @update:model-value="(val) => !val && onDismiss(modal)"
  >
    <p v-if="modal.options.message">{{ modal.options.message }}</p>
    <template v-if="modal.options.confirmLabel || modal.options.cancelLabel" #footer>
      <Button
        v-if="modal.options.cancelLabel"
        variant="ghost"
        @click="resolveModal(modal.id, false)"
      >
        {{ modal.options.cancelLabel }}
      </Button>
      <Button
        v-if="modal.options.confirmLabel"
        :variant="modal.options.danger ? 'danger' : 'primary'"
        @click="resolveModal(modal.id, true)"
      >
        {{ modal.options.confirmLabel }}
      </Button>
    </template>
  </Modal>
</template>
