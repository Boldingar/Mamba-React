# Builder stage
FROM node:18-alpine AS build

WORKDIR /app

# Add dependencies Vite needs to build properly (like you did manually)
RUN apk add --no-cache bash curl

# Copy and install node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install axios explicitly
RUN npm install axios

# Copy the rest of the app and build it
COPY . .
RUN npm run build || (echo "=== BUILD FAILED - SHOWING DEBUG INFO ===" && npm run build --verbose && exit 1)

# Production stage
FROM nginx:alpine

# Copy build output to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
