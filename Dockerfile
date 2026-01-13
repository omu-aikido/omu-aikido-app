FROM node:lts-slim

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

CMD ["pnpm", "check"]
