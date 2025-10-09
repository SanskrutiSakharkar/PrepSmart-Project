# Serve pre-built React frontend with nginx
FROM nginx:alpine

# Copy the production build folder from your EC2 project directory
COPY build/ /usr/share/nginx/html

# Copy custom Nginx config if you have one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
