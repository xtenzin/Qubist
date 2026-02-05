# 部署指南

[English](../en-US/deployment_en-US.md) | [中文](deployment_zh-CN.md)

本文档介绍如何将 Qubist 部署到生产环境。
This document describes how to deploy Qubist to production.

## 构建项目

首先需要构建项目：
First, you need to build the project:

```bash
cd src
npm install
npm run build
```

构建完成后，静态文件将生成在 `dist/` 目录中。
After building, static files will be generated in the `dist/` directory.

## 部署方式

### 方式一：使用 GitHub Pages（最简单，推荐用于演示）

GitHub Pages 提供了最简单的部署方式，无需服务器配置，每次推送到 main 分支后会自动部署。

**优势**：
- 无需服务器配置
- 自动部署（推送到 main 分支后自动构建和部署）
- 免费使用
- HTTPS 自动配置

**使用步骤**：

1. **启用 GitHub Pages**
   - 进入仓库的 Settings → Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

2. **自动部署**
   - 推送到 main 分支后，GitHub Actions 会自动构建并部署
   - 部署完成后，访问地址为：`https://<username>.github.io/Qubist/`

3. **查看部署状态**
   - 在仓库的 Actions 标签页可以查看部署进度
   - 部署成功后，在仓库的 Settings → Pages 可以看到部署地址

**注意事项**：
- 使用 GitHub Pages 时，需要确保 Qdrant 服务器可以从互联网访问
- 如果 Qdrant 服务器在本地或内网，建议使用其他部署方式
- GitHub Pages 有构建时间限制，大型项目可能需要优化构建时间

### 方式二：使用 Nginx（推荐用于生产环境）

1. **复制构建文件**
   **Copy build files**
   ```bash
   cp -r dist/* /usr/share/nginx/html/qubist/
   ```

2. **配置 Nginx**
   **Configure Nginx**
   
   创建配置文件 `/etc/nginx/sites-available/qubist`：
   Create configuration file `/etc/nginx/sites-available/qubist`:
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /usr/share/nginx/html/qubist;
       index index.html;
       
       # 支持 Vue Router 的 History 模式
       # Support Vue Router History mode
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 静态资源缓存
       # Static resource caching
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Gzip 压缩
       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
   }
   ```

3. **启用配置**
   **Enable configuration**
   ```bash
   ln -s /etc/nginx/sites-available/qubist /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

### 方式二：使用 Apache

1. **复制构建文件**
   **Copy build files**
   ```bash
   cp -r dist/* /var/www/html/qubist/
   ```

2. **配置 Apache**
   **Configure Apache**
   
   创建配置文件 `/etc/apache2/sites-available/qubist.conf`：
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
       
       # 支持 Vue Router 的 History 模式
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

3. **启用配置**
   **Enable configuration**
   ```bash
   a2ensite qubist.conf
   systemctl reload apache2
   ```

### 方式三：使用 Docker Compose

1. **创建 Dockerfile**
   **Create Dockerfile**
   
   在项目根目录创建 `Dockerfile`：
   Create `Dockerfile` in project root:
   
   ```dockerfile
   # 构建阶段
   # Build stage
   FROM node:20-alpine AS builder
   
   WORKDIR /app
   COPY src/package*.json ./src/
   RUN cd src && npm ci
   
   COPY src/ ./src/
   RUN cd src && npm run build
   
   # 生产阶段
   # Production stage
   FROM nginx:alpine
   
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
   
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **创建 Nginx 配置**
   **Create Nginx configuration**
   
   创建 `docker/nginx.conf`：
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

3. **构建和运行**
   **Build and run**
   ```bash
   docker build -t qubist .
   docker run -d -p 8080:80 qubist
   ```

### 方式四：使用 Docker

创建 `docker-compose.yml`：
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

运行：
Run:

```bash
docker-compose up -d
```

## 环境配置

### 生产环境优化

1. **启用 HTTPS**
   **Enable HTTPS**
   - 使用 Let's Encrypt 免费 SSL 证书
     Use Let's Encrypt free SSL certificate
   - 配置自动续期
     Configure auto-renewal

2. **配置反向代理**
   **Configure reverse proxy**
   - 如果 Qdrant 服务器在同一网络，可以配置反向代理
     If Qdrant server is on the same network, configure reverse proxy
   - 避免 CORS 问题
     Avoid CORS issues

3. **性能优化**
   **Performance optimization**
   - 启用 CDN 加速静态资源
     Enable CDN for static resources
   - 配置浏览器缓存
     Configure browser caching
   - 启用 Gzip/Brotli 压缩
     Enable Gzip/Brotli compression

## 注意事项

1. **CORS 配置**
   **CORS configuration**
   - 如果 Qdrant 服务器和前端不在同一域名，需要配置 CORS
     If Qdrant server and frontend are not on the same domain, configure CORS
   - 在生产环境中，建议使用反向代理
     In production, use reverse proxy is recommended

2. **API 地址配置**
   **API address configuration**
   - 确保前端可以访问 Qdrant 服务器
     Ensure frontend can access Qdrant server
   - 如果使用 HTTPS，确保 Qdrant 服务器也支持 HTTPS
     If using HTTPS, ensure Qdrant server also supports HTTPS

3. **安全建议**
   **Security recommendations**
   - 不要在客户端代码中硬编码 API KEY
     Do not hardcode API KEY in client code
   - 使用环境变量或配置文件管理敏感信息
     Use environment variables or config files for sensitive information
   - 定期更新依赖包
     Regularly update dependencies
