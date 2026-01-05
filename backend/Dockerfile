# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create database directory
RUN mkdir -p database/data

# Expose port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["node", "server.js"]

