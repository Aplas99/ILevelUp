# --- Stage 1: Build the React Application ---
    FROM node:20-alpine AS builder

    # Set the working directory
    WORKDIR /app
    
    # Copy package.json and package-lock.json (if present) to leverage Docker cache
    COPY package.json package.lock.json ./
    
    # Install dependencies (only for Node environment)
    RUN npm install
    
    # Copy all source files
    COPY . .
    
    # Run the build command (which includes TypeScript compilation thanks to package.json script)
    RUN npm run build
    
    
    # --- Stage 2: Serve the Static Files with Nginx ---
    FROM nginx:alpine AS runner
    
    # Copy the built application from the builder stage into Nginx's html directory
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Remove the default Nginx configuration file
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Add a custom Nginx configuration to handle single-page application routing (index.html fallback)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose the port Nginx will be listening on (default HTTP port)
    EXPOSE 80
    
    # Command to start Nginx
    CMD ["nginx", "-g", "daemon off;"]