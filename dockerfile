# ------------------------------------
# FASE 1: Construcción (usa node:20)
# ------------------------------------
FROM node:20 AS build

WORKDIR /app

# 🔧 Recibe la variable de entorno
ARG VITE_API_BASE_LOCAL
ENV VITE_API_BASE_LOCAL=$VITE_API_BASE_LOCAL

# Verificación
RUN echo "✅ [DOCKER BUILD] VITE_API_BASE_LOCAL: $VITE_API_BASE_LOCAL"

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