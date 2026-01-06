FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# IMPORTANT:
# We add '-- --host' to expose Vite to the Docker network.
# Without this, you cannot access the site from your browser.
CMD ["npm", "run", "dev", "--", "--host"]