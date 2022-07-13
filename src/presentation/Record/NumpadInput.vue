<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
  modelValue: number
  title: string
  errors?: string[]
}>()
const emit = defineEmits<{(e: 'update:modelValue', num: number): void}>()

const inputStr = computed<string>({
  get() {
    return String(props.modelValue === 0 ? '' : props.modelValue)
  },
  set(val) {
    const num = parseFloat(val)
    emit('update:modelValue', isNaN(num) ? 0 : num)
  },
})
</script>

<template>
  <div class="form-control flex max-w-xs mx-auto">
    <div class="relative">
      <input
        type="number"
        class="input input-bordered input-primary input-md w-full text-right"
        v-model="inputStr"
      />
      <div
        class="absolute top-0 left-3 bottom-0 flex justify-center items-center"
      >
        <label class="text-sm font-bold text-sm">
          {{ title }}
        </label>
      </div>
    </div>
    <label class="label">
      <span class="label-text-alt"></span>
      <span class="label-text-alt text-error text-right">
        <div v-for="err in errors" :key="err">
          {{ $t(err) }}
        </div>
      </span>
    </label>
  </div>
</template>
