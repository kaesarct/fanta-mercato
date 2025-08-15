FROM node:20-alpine as build

WORKDIR /app

# Cattura le variabili d'ambiente
ARG KEYCLOAK_REALM
ARG KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_CLIENT_SECRET

# Il tuo processo di build Angular deve leggere queste variabili
# (potrebbe essere necessario uno script di build personalizzato per questo)
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]