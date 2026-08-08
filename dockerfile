# ------------------------------------
# FASE 1: Construcción (usa node:20)
# ------------------------------------
FROM node:20 AS build

WORKDIR /app

# 🔧 Recibe la variable de entorno para la API
ARG VITE_API_BASE_LOCAL
ENV VITE_API_BASE_LOCAL=$VITE_API_BASE_LOCAL

# 🔧 Recibe la variable de entorno para habilitar el simulador (solo en test)
ARG VITE_ENABLE_SIMULATOR
ENV VITE_ENABLE_SIMULATOR=$VITE_ENABLE_SIMULATOR

# Verificación (opcional pero útil para depurar)
RUN echo "✅ [DOCKER BUILD] VITE_API_BASE_LOCAL: $VITE_API_BASE_LOCAL"
RUN echo "✅ [DOCKER BUILD] VITE_ENABLE_SIMULATOR: $VITE_ENABLE_SIMULATOR"

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# ------------------------------------
# FASE 2: Producción (usa nginx:alpine)
# ------------------------------------
FROM nginx:alpine

# Copia los archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# 🔧 Copia la configuración CORREGIDA de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# 🔍 Verifica que la configuración sea válida (opcional pero útil)
RUN nginx -t

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]