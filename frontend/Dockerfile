# --- STAGE 1: Build the React Application ---
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# IMPORTANT FIX: Copy files from the 'client' subdirectory on the NAS
# The build context root is ./frontend, so we copy from ./client/
# The 'package-lock.json' file name is standard.
COPY client/package.json client/package-lock.json ./

# Install dependencies
# Using npm ci ensures faster, consistent builds when a lock file is present
RUN npm ci

# Copy all other source code from the client directory
COPY client/. .

# Build the app (assuming 'npm run build' is defined in your package.json)
RUN npm run build

# --- STAGE 2: Serve the Built Application with Nginx ---
FROM nginx:stable-alpine

# Copy the built files from the builder stage to the Nginx serving directory
# Assumes the build output is placed in /app/build (standard for Create React App/Vite)
COPY --from=builder /app/build /usr/share/nginx/html

# The Nginx reverse proxy config is mounted separately in docker-compose.yml

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]