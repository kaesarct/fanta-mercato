FROM node:20-alpine as build

WORKDIR /app

# Copia i file necessari per installare le dipendenze
COPY package.json package-lock.json ./
RUN npm install

# Copia tutti gli altri file del progetto
COPY . .

# Ora che tutti i file sono presenti, esegui la build
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
