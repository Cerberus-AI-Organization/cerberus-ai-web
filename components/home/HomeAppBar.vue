<template>
  <UContainer class="py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg">
            <NuxtImg 
              src="/icon.png" 
              alt="CerberusAI Logo" 
              class="w-full h-full object-cover" /> 
          </div>
          <h1 class="flex text-2xl font-bold text-gray-900 dark:text-white">Cerberus<GradientText text="AI"/></h1>
        </div>
        
        <div class="flex items-center space-x-3">
          <UButton
            icon="heroicons:chart-bar-square"
            variant="ghost"
            color="neutral"
            size="lg"
            @click="$router.push('/dashboard')"
          >
            Dashboard
          </UButton>

          <ThemeButton />
        </div>
      </div>
    </UContainer>
</template>

<script lang="ts" setup>
useHead({
  title: 'CerberusAI',
  meta: [
    {
      name: 'description',
      content: 'AI chatbot for Cybersecurity'
    }
  ]
})
</script>