<template>
  <UContainer class="py-6">
      <div class="flex items-center justify-between">
        <!-- Logo a název -->
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-lg">
            <NuxtImg 
              src="/icon.png" 
              alt="CerberusAI Logo" 
              class="w-full h-full object-cover" /> 
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">CerberusAI</h1>
        </div>
        
        <!-- Tlačítka -->
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