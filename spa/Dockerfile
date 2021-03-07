# --------- Base ---------
From node:lts-alpine AS base

WORKDIR /app

# --------- Builder ---------
FROM base as builder

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./nginx.conf ./nginx.conf

ARG VUE_APP_API_URL
ENV VUE_APP_API_URL $VUE_APP_API_URL

ARG VUE_APP_REC_URL
ENV VUE_APP_REC_URL $VUE_APP_REC_URL

ARG VUE_APP_INVENTORY_URL
ENV VUE_APP_INVENTORY_URL $VUE_APP_INVENTORY_URL

RUN npm run build

# --------- Release ---------
FROM nginx:stable-alpine as release

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
