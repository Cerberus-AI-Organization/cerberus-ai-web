# Dockerfile pro Nuxt 4 s pnpm
# FROM node:20-alpine AS base

# Instalace pnpm
# RUN corepack enable && corepack prepare pnpm@latest --activate

FROM guergeiro/pnpm:24-9-alpine AS base

# Nastavení pracovního adresáře
WORKDIR /app

# Build stage
FROM base AS build

# Kopírování package.json a pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalace závislostí
RUN pnpm install --frozen-lockfile

# Kopírování zdrojového kódu
COPY . .

# Build aplikace
RUN pnpm run build

# Production stage
FROM base AS production

# Kopírování pouze potřebných souborů z build stage
COPY --from=build /app/.output /app/.output
COPY --from=build /app/package.json /app/package.json

# Expozice portu
EXPOSE 3000

# Spuštění aplikace
CMD ["node", ".output/server/index.mjs"]