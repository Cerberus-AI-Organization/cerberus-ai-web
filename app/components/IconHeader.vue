<template>
  <div class="flex items-center space-x-2">
    <Icon
      :name="icon"
      class="w-6 h-6"
      :class="[
        `text-${color}-600`,
        `dark:text-${color}-400`
      ]"
    />
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
      {{ text }}
    </h3>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string
  text: string
  color?: string
}>()

const color = defineModel('color', { default: 'red' })
</script>
