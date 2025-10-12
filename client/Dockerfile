# Use Nginx to serve static React files
FROM nginx:alpine

# Copy prebuilt React app
COPY build/ /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
