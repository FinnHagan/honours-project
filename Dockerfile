# Use an official Node.js runtime as a base image
FROM node:18 as build

# Set the working directory in the container
WORKDIR /frontend

# Copy package.json and package-lock.json (or yarn.lock if you use Yarn) to the working directory
COPY frontend/package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY frontend/ ./

# Build the Ionic React app
RUN npm run build

# Use an official NGINX image as the web server
FROM nginx:alpine

# Remove the default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy the built Ionic React app to the nginx web server directory. Adjust the source path according to your build directory structure.
COPY --from=build /frontend/dist /usr/share/nginx/html

# Copy the NGINX config file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# When the container starts, replace the PORT placeholder in the NGINX config with the actual value of the PORT environment variable
CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.temp && mv /etc/nginx/conf.d/default.conf.temp /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]