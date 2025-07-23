<template>
  <div class="grid bg-white dark:bg-black relative overflow-hidden">
    <div class="z-10 col-start-1 row-start-1">
      <slot></slot>
    </div>
    <div class="col-start-1 row-start-1">
      <div 
        :class="[
          `absolute w-96 h-96 top-20 left-3/5`,
          `bg-radial from-purple-600 to-sky-400`,
          `rounded-full opacity-30 blur-3xl`
        ]"
      ></div>
      <div 
        :class="[
          `absolute w-full h-full`,
          `bg-gradient-to-t from-purple-600 via-sky-400 to-transparent`,
          `opacity-10 blur-3xl`
        ]"
      ></div>
     </div>
  </div>
</template>

<script lang="ts" setup>
</script>