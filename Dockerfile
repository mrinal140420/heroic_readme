# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Next.js app
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

# Only copy necessary files
COPY --from=builder /app ./

# Install only production deps
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
