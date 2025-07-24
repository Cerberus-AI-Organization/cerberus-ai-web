<template>
  <div class="grid bg-white dark:bg-black relative overflow-hidden">
    <div class="z-10 col-start-1 row-start-1">
      <slot></slot>
    </div>
    <div class="col-start-1 row-start-1">
      <div 
        v-if="props.showCircle"
        :class="[
          `absolute ${currentCircle.size} ${currentCircle.position}`,
          `bg-radial from-purple-600 to-sky-400`,
          `rounded-full opacity-30 blur-3xl transition-all duration-20000 ease-in-out`
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
const props = defineProps({
    showCircle: { type: Boolean, required: false, default: true }
});

const circleVariations = [
    { size: 'w-96 h-96', position: 'top-20 right-2/12' },
    { size: 'w-80 h-80', position: 'top-10 right-3/12' },
    { size: 'w-64 h-64', position: 'top-32 right-1/12' },
    { size: 'w-72 h-72', position: 'top-60 right-4/12' },
  ] 

const currentCircle = ref(circleVariations[0])

if(props.showCircle) {
  const animateCircle = () => {
    const randomIndex = Math.floor(Math.random() * circleVariations.length)
    currentCircle.value = circleVariations[randomIndex]
  }

  onMounted(() => {
    animateCircle()
    setInterval(animateCircle, 20000)
  })
}
</script>