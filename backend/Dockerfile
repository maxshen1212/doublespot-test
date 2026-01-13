# Use specific node version (matches your engines config)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Copy Prisma schema (needed for postinstall script)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies (will run prisma generate via postinstall)
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the dev server (matches your 'scripts' in package.json)
CMD ["npm", "run", "dev"]