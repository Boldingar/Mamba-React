# Builder stage
FROM node:18-alpine as build

WORKDIR /app

# Install required build dependencies for Vite
RUN apk add --no-cache bash curl

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application and build it
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
