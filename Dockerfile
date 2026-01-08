FROM node:20-slim

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Install system dependencies (CA certs for workerd)
RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose Vite port
EXPOSE 5173



# Start development server
CMD ["pnpm", "dev"]
