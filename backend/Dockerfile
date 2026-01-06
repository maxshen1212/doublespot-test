# Use specific node version (matches your engines config)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the dev server (matches your 'scripts' in package.json)
CMD ["npm", "run", "dev"]