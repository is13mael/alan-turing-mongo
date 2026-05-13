FROM node:24-alpine AS base
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Compilamos backend
FROM base AS build-backend
COPY ./backend/package*.json ./
RUN npm ci
COPY ./backend/ ./
RUN npm run build

# Compilamos frontend
FROM base AS build-frontend
COPY ./frontend/package*.json ./
RUN npm ci
COPY ./frontend/ ./
RUN npm run build

FROM base AS release
ENV STATIC_FILES_PATH=./public
COPY --from=build-frontend /usr/app/dist ${STATIC_FILES_PATH}
COPY --from=build-backend /usr/app/dist ./
COPY ./backend/package*.json ./
RUN npm ci --omit=dev

CMD ["node", "index.js"]