# Development image for the React client.
# Production gets its own file at step 29 — this one is not built for it.

FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# --host makes Vite listen on every address. Without it it listens only inside
# the container and the browser on your machine cannot reach it.
CMD ["npm", "run", "dev", "--", "--host"]
