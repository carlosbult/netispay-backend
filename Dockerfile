# Etapa de construcción
FROM node:22.12.0-bullseye AS builder

WORKDIR /app

# Copiar archivos necesarios para la instalación
COPY package.json yarn.lock ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY .swcrc ./
COPY src ./src

# Instalar dependencias y compilar
RUN yarn install --frozen-lockfile && \
    yarn prisma generate && \
    yarn clean && \
    # Compilar NestJS de manera estándar
    ./node_modules/.bin/nest build && \
    # Compilar prisma con swc
    yarn swc prisma --out-dir dist/src/prisma && \
    # Verificar la estructura de archivos
    ls -la dist && \
    ls -la dist/src || true

# Etapa de producción
FROM node:22.12.0-bullseye-slim

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Instalar solo las dependencias necesarias para Chrome/Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y \
    google-chrome-stable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json
COPY package.json yarn.lock ./

# Instalar solo dependencias de producción
RUN yarn install --production --frozen-lockfile

# Copiar archivos compilados y necesarios desde la etapa de builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3000

# Ajustar el comando para usar la ruta correcta del main.js
CMD ["sh", "-c", "yarn prisma:migrate-prod && node dist/src/src/main"]
