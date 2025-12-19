# Use the official Node.js 20 image as the base image
FROM node:20

# Create application directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
# This is done separately to leverage Docker caching for dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD [ "node", "server.js" ]