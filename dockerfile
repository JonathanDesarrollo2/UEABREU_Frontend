# ------------------------------------
# FASE 1: Construcción (usa node:20)
# ------------------------------------
FROM node:20 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración (para aprovechar la caché de dependencias)
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente (incluye tsconfig.json y src/)
COPY . .

# Ejecuta la build de producción (Vite crea /dist)
RUN npm run build

# ------------------------------------
# FASE 2: Producción (usa nginx:alpine)
# ------------------------------------
FROM nginx:alpine

# Copia los archivos compilados desde la fase anterior
COPY --from=build /app/dist /usr/share/nginx/html

# 🔧 Ajuste necesario para Cloud Run:
# Reemplazamos el puerto 80 por el 8080 en la configuración de Nginx
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

# Exponemos el puerto que Cloud Run usará
EXPOSE 8080

# Comando de arranque
CMD ["nginx", "-g", "daemon off;"]
