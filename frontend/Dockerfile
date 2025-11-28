# --- STAGE 1: Build the React Application ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/. .

RUN npm run build   # Vite builds to /app/dist

# --- STAGE 2: Serve the Built Application with Nginx ---
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
