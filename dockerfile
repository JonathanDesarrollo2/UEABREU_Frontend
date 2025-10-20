# ------------------------------------
# FASE 1: Construcción (usa node:20)
# ------------------------------------
FROM node:20 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos de configuración (package.json y su lock)
# Esto permite que Docker cachee este paso si las dependencias no cambian.
COPY package.json package-lock.json ./

# Instala las dependencias usando NPM
RUN npm install

# Copia el resto del código fuente del proyecto
COPY . .

# Ejecuta el comando de construcción (por defecto, VITE usa 'npm run build' que crea una carpeta 'dist')
RUN npm run build

# ------------------------------------
# FASE 2: Producción (usa nginx:alpine)
# ------------------------------------
FROM nginx:alpine

# Copia los archivos de producción de la fase 'build'.
# Asumimos que el comando 'npm run build' anterior crea la carpeta 'dist'.
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run escucha en el puerto 8080 por defecto, pero Nginx escucha en el 80.
# Exponemos el puerto 80 del contenedor, Cloud Run se encarga de mapearlo al 8080.
EXPOSE 80 

# Comando para iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
