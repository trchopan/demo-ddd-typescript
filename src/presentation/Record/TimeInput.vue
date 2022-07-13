<script setup lang="ts">
import {computed} from 'vue'
import {format} from 'date-fns'

const props = defineProps<{
  modelValue: Date
  title: string
  errors?: string[]
}>()
const emit = defineEmits<{(e: 'update:modelValue', d: Date): void}>()
const localValue = computed<string>({
  get() {
    return format(props.modelValue, "yyyy-MM-dd'T'HH:mm")
  },
  set(val) {
    emit('update:modelValue', new Date(val))
  },
})
</script>

<template>
  <div class="max-w-xs mx-auto">
    <div class="relative">
      <input
        v-model="localValue"
        type="datetime-local"
        class="input input-bordered w-full text-right"
      />
      <div
        class="absolute top-0 left-3 bottom-0 flex justify-center items-center"
      >
        <label class="text-sm font-bold text-sm">Time</label>
      </div>
    </div>
  </div>
</template>
