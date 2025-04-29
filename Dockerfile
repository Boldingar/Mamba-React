# Stage 1: Build the application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production  # Install only production dependencies

# Copy the rest of the app and build it
COPY . .
RUN npm run build  # Ensure this command works in your project

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy the built app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports for HTTP and HTTPS
EXPOSE 80
EXPOSE 443

# Optional: Clean up and remove unnecessary files
# RUN rm -rf /usr/share/nginx/html/* && mv /app/dist/* /usr/share/nginx/html/

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
