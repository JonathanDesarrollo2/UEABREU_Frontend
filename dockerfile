# ------------------------------------
# FASE 1: Construcción (usa node:20)
# ------------------------------------
FROM node:20 AS build

# Establece el directorio de trabajo
WORKDIR /app

# 🔧 CLAVE: Recibe y establece la variable para Vite
ARG VITE_API_BASE_LOCAL
ENV VITE_API_BASE_LOCAL=$VITE_API_BASE_LOCAL

# 🔍 VERIFICACIÓN: Imprime el valor de la variable (aparecerá en logs de Cloud Build)
RUN echo "✅ [DOCKER BUILD] Valor de VITE_API_BASE_LOCAL recibido: $VITE_API_BASE_LOCAL"

# Copia los archivos de configuración
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Ejecuta la build de producción. Vite usará la variable de entorno.
RUN npm run build

# ------------------------------------
# FASE 2: Producción (usa nginx:alpine)
# ------------------------------------
FROM nginx:alpine

# Copia los archivos compilados desde la fase anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Ajuste necesario para Cloud Run: puerto 8080
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]