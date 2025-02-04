# Use the official Node.js image as the base image
FROM node:14

# Install MongoDB
RUN apt-get update && \
    apt-get install -y mongodb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a directory for the app
WORKDIR /workspace

# Install global dependencies
RUN npm install -g nodemon

# Expose the ports for the server and MongoDB
EXPOSE 3000 5000 27017