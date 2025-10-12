# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

RUN npm install

# Copy the rest of the code
COPY . .

# Increase memory to prevent heap errors
RUN node --max_old_space_size=4096 node_modules/.bin/react-scripts build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built React app
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
