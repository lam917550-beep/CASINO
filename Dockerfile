# Build stage for API
FROM node:20-alpine AS api-build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/shared/package.json apps/shared/
COPY packages/*/package.json packages/
RUN npm install --workspaces --include-workspace-root
COPY . .
RUN npm run build -w apps/api

# Build stage for Web
FROM node:20-alpine AS web-build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY apps/shared/package.json apps/shared/
RUN npm install --workspaces --include-workspace-root
COPY . .
RUN npm run build -w apps/web

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=api-build /app/apps/api/dist ./apps/api/dist
COPY --from=web-build /app/apps/web/dist ./apps/web/dist
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/shared/package.json ./apps/shared/
RUN npm install --omit=dev --workspaces --include-workspace-root
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/api"]
