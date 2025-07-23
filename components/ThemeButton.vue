<template>
  <UTooltip
    text="Change Theme">
    <UButton
        :icon="getIcon()"
        variant="ghost"
        color="neutral"
        size="lg"
        @click="toggleColorMode"
      />
  </UTooltip>
</template>

<script lang="ts" setup>
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  const modes = ['system', 'light', 'dark']
  const currentIndex = modes.indexOf(colorMode.preference || 'system')
  const nextIndex = (currentIndex + 1) % modes.length
  colorMode.preference = modes[nextIndex]

  // const toast = useToast()
  // toast.add({
  //   title: colorMode.preference
  // })
}

const getIcon = () => {
  switch (colorMode.preference) {
    case 'dark':
      return 'heroicons:moon'
    case 'light':
      return 'heroicons:sun'
    case 'system':
    default:
      return 'heroicons:computer-desktop'
  }
}

</script>

<style>

</style>