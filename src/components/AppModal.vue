<!-- Reusable modal wrapper. Usage:
  <AppModal title="Add Book" :open="showModal" @close="showModal = false">
    <p>Modal body goes here</p>
    <template #footer>
      <button class="btn btn-primary">Save</button>
    </template>
  </AppModal>
-->
<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="open" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ title }}</div>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>
        <div class="modal-body">
          <!-- default slot = modal content from parent -->
          <slot />
        </div>
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  open:  { type: Boolean, default: false },
})
defineEmits(['close'])
</script>
