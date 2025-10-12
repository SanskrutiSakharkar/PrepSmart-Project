# Use Nginx to serve pre-built React static files
FROM nginx:alpine

# Copy the pre-built React app
COPY build/ /usr/share/nginx/html

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
