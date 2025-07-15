<template>
  <div class="min-h-screen">
    <!-- Header -->
    <HomeAppBar />

    <!-- Hero sekce -->
    <UContainer class="py-6">
      <div class="text-center max-w-4xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Pokročilý AI asistent pro 
          <span class="text-red-600 dark:text-primary">kyberbezpečnost</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Komplexní platforma pro analýzu hrozeb, incident response a bezpečnostní vzdělávání. 
          Využijte sílu umělé inteligence pro ochranu vaší organizace.
        </p>
      </div>
    </UContainer>

    <!-- Funkce -->
    <UContainer class="py-6">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Analýza souborů a dat -->
        <UCard>
          <template #header>
            <IconHeader icon="heroicons:magnifying-glass" text="Analýza souborů a dat" color="red" />
          </template>
          
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:shield-check" class="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">File Analysis</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Pokročilá analýza souborů s AI detekcí malware podobně jako VirusTotal
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:document-text" class="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">Log Analysis</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Inteligentní chatbot pro analýzu a interpretaci bezpečnostních logů
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:envelope" class="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">Email Security</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Detekce phishingových emailů a analýza hlaviček/příloh
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:globe-alt" class="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">URL/Domain Check</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Rychlá kontrola podezřelých domén a URL adres
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:lock-closed" class="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">Password Strength</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Pokročilé testování a hodnocení síly hesel s doporučeními
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Incident Response -->
        <UCard>
          <template #header>
            <IconHeader icon="heroicons:exclamation-triangle" text="Incident Response" color="red" />
          </template>
          
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">Incident Response Checklist</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Automatické vytvoření přizpůsobeného incident response plánu
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">Step-by-Step Guide</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Interaktivní průvodce řešením bezpečnostních incidentů krok za krokem
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Vzdělávání a databáze -->
        <UCard class="md:col-span-2">
          <template #header>
            <IconHeader icon="heroicons:academic-cap" text="Vzdělávání a databáze" color="red" />
          </template>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:bolt" class="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">Attack Simulation Training</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Teoretické simulace kybernetických útoků pro vzdělávání zaměstnanců
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <Icon name="heroicons:server" class="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">NIST Database Search</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Inteligentní vyhledávání v databázi NIST CVE vulnerabilities
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>

    <!-- PWA -->
    <UContainer class="py-6">
      <UCard class="mb-8">
        <template #header>
          <IconHeader icon="heroicons:device-phone-mobile" text="Přístupné jako PWA aplikace" color="red" />          
        </template>

        <div class="text-center">          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Nainstalujte si CerberusAI jako aplikaci pro rychlý přístup
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UPopover>
              <UButton 
                icon="heroicons:plus-circle"
                variant="outline"
                color="neutral"
                class="pl-4 pr-4"
              >
                Návod pro Chrome
              </UButton>
              <template #content>
                <div class="p-4">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Icon name="heroicons:globe-alt" class="w-5 h-5 mr-2" />
                    Google Chrome
                  </h4>
                  <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Otevřete CerberusAI v prohlížeči Chrome</li>
                    <li>Klikněte na ikonu "Nainstalovat" v adresním řádku</li>
                    <li>Nebo přejděte do menu (⋮) → "Nainstalovat CerberusAI"</li>
                    <li>Potvrďte instalaci</li>
                  </ol>
                </div>
              </template>
            </UPopover>
            <UPopover>
              <UButton 
                icon="heroicons:plus-circle"
                variant="outline"
                color="neutral"
                class="pl-4 pr-4"
              >
                Návod pro Safari
              </UButton>
              <template #content>
                <div class="p-4">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Icon name="heroicons:globe-alt" class="w-5 h-5 mr-2" />
                    Safari (iOS)
                  </h4>
                  <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Otevřete CerberusAI v Safari</li>
                    <li>Klikněte na tlačítko "Sdílet" (čtverec se šipkou)</li>
                    <li>Vyberte "Přidat na plochu"</li>
                    <li>Potvrďte název a klikněte "Přidat"</li>
                  </ol>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
      </UCard>
    </UContainer>

    <!-- Deployment info -->
    <UContainer class="py-4">
      <UCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <Icon name="heroicons:server-stack" class="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Snadné nasazení
            </h3>
          </div>
        </template>
        
        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Celé řešení lze snadno nasadit pomocí Docker a docker-compose s následujícími komponentami:
          </p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon name="heroicons:globe-alt" class="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <h4 class="font-medium text-gray-900 dark:text-white">Web</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">Frontend aplikace</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon name="heroicons:server" class="w-8 h-8 mx-auto text-green-500 mb-2" />
              <h4 class="font-medium text-gray-900 dark:text-white">Main API</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">Hlavní API server</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon name="heroicons:cpu-chip" class="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <h4 class="font-medium text-gray-900 dark:text-white">Compute API</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">AI výpočetní server</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon name="heroicons:circle-stack" class="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <h4 class="font-medium text-gray-900 dark:text-white">PostgresDB</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">Databáze</p>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>