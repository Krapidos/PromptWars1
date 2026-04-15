# Use the official NGINX lightweight image
FROM nginx:alpine

# Copy all the static web files into the standard NGINX web root folder
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY sketch.js /usr/share/nginx/html/

# Expose port 8080 because Google Cloud Run routes traffic to port 8080 by default
EXPOSE 8080

# Update the exact NGINX configurations to bind to port 8080
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf
