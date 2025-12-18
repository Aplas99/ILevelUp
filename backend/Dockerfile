# Use the official Node.js image
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your server code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]