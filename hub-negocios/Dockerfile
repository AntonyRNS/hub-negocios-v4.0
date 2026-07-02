# --- Fase 1: Instalador de dependências ---
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia apenas os arquivos de gerenciamento de pacotes
COPY package.json package-lock.json ./
# Copia a pasta do prisma para poder rodar o generate
COPY prisma ./prisma

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# --- Fase 2: Construtor (Builder) ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desativa a telemetria do Next.js durante o build
ENV NEXT_TELEMETRY_DISABLED=1

# Gera o client do Prisma e faz o build do Next.js
RUN npx prisma generate
RUN npm run build

# --- Fase 3: Imagem de Produção Final ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Cria um usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos públicos e assets estáticos
COPY --from=builder /app/public ./public

# Define as permissões corretas para o cache do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia o build standalone e os arquivos necessários do stage builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Muda para o usuário sem privilégios
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Executa o servidor standalone do Next.js
CMD ["node", "server.js"]
