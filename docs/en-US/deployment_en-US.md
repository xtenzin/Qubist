# Deployment Guide

[English](deployment_en-US.md) | [中文](../zh-CN/deployment_zh-CN.md)

This document describes how to deploy Qubist to production.

## Building the Project

First, you need to build the project:

```bash
cd src
npm install
npm run build
```

After building, static files will be generated in the `dist/` directory.

## Deployment Methods

### Method 1: Using Nginx (Recommended)

1. **Copy build files**
   ```bash
   cp -r dist/* /usr/share/nginx/html/qubist/
   ```

2. **Configure Nginx**
   
   Create configuration file `/etc/nginx/sites-available/qubist`:
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /usr/share/nginx/html/qubist;
       index index.html;
       
       # Support Vue Router History mode
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Static resource caching
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
   }
   ```

3. **Enable configuration**
   ```bash
   ln -s /etc/nginx/sites-available/qubist /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

### Method 2: Using Apache

1. **Copy build files**
   ```bash
   cp -r dist/* /var/www/html/qubist/
   ```

2. **Configure Apache**
   
   Create configuration file `/etc/apache2/sites-available/qubist.conf`:
   
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /var/www/html/qubist
       
       <Directory /var/www/html/qubist>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       # Support Vue Router History mode
       <IfModule mod_rewrite.c>
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </IfModule>
   </VirtualHost>
   ```

3. **Enable configuration**
   ```bash
   a2ensite qubist.conf
   systemctl reload apache2
   ```

### Method 3: Using Docker

1. **Create Dockerfile**
   
   Create `Dockerfile` in project root:
   
   ```dockerfile
   # Build stage
   FROM node:20-alpine AS builder
   
   WORKDIR /app
   COPY src/package*.json ./src/
   RUN cd src && npm ci
   
   COPY src/ ./src/
   RUN cd src && npm run build
   
   # Production stage
   FROM nginx:alpine
   
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
   
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create Nginx configuration**
   
   Create `docker/nginx.conf`:
   
   ```nginx
   server {
       listen 80;
       root /usr/share/nginx/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Build and run**
   ```bash
   docker build -t qubist .
   docker run -d -p 8080:80 qubist
   ```

### Method 4: Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  qubist:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run:

```bash
docker-compose up -d
```

## Environment Configuration

### Production Optimization

1. **Enable HTTPS**
   - Use Let's Encrypt free SSL certificate
   - Configure auto-renewal

2. **Configure reverse proxy**
   - If Qdrant server is on the same network, configure reverse proxy
   - Avoid CORS issues

3. **Performance optimization**
   - Enable CDN for static resources
   - Configure browser caching
   - Enable Gzip/Brotli compression

## Notes

1. **CORS Configuration**
   - If Qdrant server and frontend are not on the same domain, configure CORS
   - In production, use reverse proxy is recommended

2. **API Address Configuration**
   - Ensure frontend can access Qdrant server
   - If using HTTPS, ensure Qdrant server also supports HTTPS

3. **Security Recommendations**
   - Do not hardcode API KEY in client code
   - Use environment variables or config files for sensitive information
   - Regularly update dependencies
