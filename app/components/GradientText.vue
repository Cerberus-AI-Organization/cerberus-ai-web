<template>
  <div class="bg-gradient-to-r from-purple-600 to-sky-400 bg-clip-text text-transparent">
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  text: String
}>()
</script>

<style>

</style>