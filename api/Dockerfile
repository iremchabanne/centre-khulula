# Development image for the API.
# Production gets its own file at step 29 — this one is not built for it.

FROM node:24-alpine

WORKDIR /app

# The dependencies are installed first, on their own. Docker reuses this layer
# as long as package.json does not change, so editing the code stays fast.
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Prisma generates its client from the schema. Done here so the container has
# the Linux build of it, not the macOS one from the host.
RUN npx prisma generate

CMD ["npm", "run", "dev:docker"]
