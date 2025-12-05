# Money Notebook - Production Deployment Guide

## 📋 Tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Docker Compose                                                 │
│   ├── MySQL 8.0         ──► Port 3306                           │
│   ├── Redis 7           ──► Port 6379                           │
│   └── Nginx             ──► Port 80, 443                        │
│           │                                                      │
│           ├── moneynote.store      ──► frontend/out (static)    │
│           └── api.moneynote.store  ──► localhost:2053 (proxy)   │
│                                                                  │
│   PM2 (trên host)                                                │
│   └── API (NestJS)      ──► Port 2053                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Cấu trúc project

```
money-notebook/
├── docker-compose.yml      # MySQL + Redis + Nginx
├── .env                    # Environment variables
├── api/                    # NestJS Backend
├── frontend/
│   └── out/                # Build output (static files)
├── docker/
│   └── nginx/
│       ├── nginx.conf
│       └── conf.d/
│           └── moneynote.store.conf
└── ssl/
    ├── fullchain.pem       # SSL Certificate
    └── privkey.pem         # SSL Private Key
```

---

## 🚀 Cài đặt lần đầu

### 1. Yêu cầu server

- **OS**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 2GB+
- **Docker**: 20.10+
- **Node.js**: 22.x
- **PM2**: Cài global

```bash
# Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Cài Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Cài PM2
sudo npm install -g pm2
```

### 2. Clone project

```bash
cd /home
git clone https://github.com/tonamson/money-notebook.git
cd money-notebook
```

### 3. Tạo file .env

```bash
nano .env
```

```env
# Database
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_DATABASE=money_notebook
MYSQL_USER=money_user
MYSQL_PASSWORD=your_strong_password
```

### 4. Cài SSL Certificate

Đặt 2 file vào folder `ssl/`:
- `ssl/fullchain.pem` - Certificate
- `ssl/privkey.pem` - Private Key

**Xem hướng dẫn chi tiết:** [ssl/README.md](ssl/README.md)

### 5. Khởi động Docker (MySQL + Redis + Nginx)

```bash
docker compose up -d
```

### 6. Build và chạy API

```bash
cd api

# Tạo file .env
nano .env
```

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=money_notebook
MYSQL_USER=money_user
MYSQL_PASSWORD=your_strong_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

# App
PORT=2053
NODE_ENV=production
```

```bash
# Install và build
npm install
npm run build

# Chạy với PM2
pm2 start dist/main.js --name money-api
pm2 save
pm2 startup
```

### 7. Build Frontend

```bash
cd frontend

# Tạo file .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.moneynote.store
```

```bash
# Install và build
npm install
npm run build
```

Output sẽ nằm trong `frontend/out/` - Nginx đã được config để serve folder này.

---

## 🔧 Các lệnh thường dùng

### Docker

```bash
# Xem status
docker compose ps

# Xem logs
docker compose logs -f nginx
docker compose logs -f mysql

# Restart
docker compose restart nginx

# Stop tất cả
docker compose down

# Start lại
docker compose up -d
```

### PM2 (API)

```bash
# Xem status
pm2 list

# Xem logs
pm2 logs money-api

# Restart
pm2 restart money-api

# Reload (zero downtime)
pm2 reload money-api
```

### Nginx

```bash
# Test config
docker exec money-notebook-nginx nginx -t

# Reload config
docker exec money-notebook-nginx nginx -s reload

# Xem logs
docker exec money-notebook-nginx tail -f /var/log/nginx/error.log
```

---

## 🔄 Cập nhật code

### Cập nhật API

```bash
cd /home/money-notebook
git pull

cd api
npm install
npm run build
pm2 reload money-api
```

### Cập nhật Frontend

```bash
cd /home/money-notebook
git pull

cd frontend
npm install
npm run build
# Nginx tự động serve folder out/ mới
```

---

## 💾 Backup Database

```bash
# Backup
docker exec money-notebook-mysql mysqldump -u root -p'YOUR_ROOT_PASSWORD' money_notebook > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i money-notebook-mysql mysql -u root -p'YOUR_ROOT_PASSWORD' money_notebook < backup.sql
```

---

## 🔒 SSL Certificate

### Cloudflare Origin Certificate (Khuyến nghị)

1. Cloudflare → SSL/TLS → Origin Server → Create Certificate
2. Lưu vào `ssl/fullchain.pem` và `ssl/privkey.pem`
3. Cloudflare SSL mode: **Full (strict)**

### Let's Encrypt

```bash
# Cài certbot
sudo apt install certbot

# Tạm dừng nginx
docker compose stop nginx

# Lấy certificate
sudo certbot certonly --standalone -d moneynote.store -d www.moneynote.store -d api.moneynote.store

# Copy vào project
sudo cp /etc/letsencrypt/live/moneynote.store/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/moneynote.store/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*.pem

# Khởi động nginx
docker compose up -d nginx
```

### Reload SSL

```bash
docker compose restart nginx
```

---

## 🐛 Troubleshooting

### Nginx không start

```bash
# Kiểm tra config
docker exec money-notebook-nginx nginx -t

# Xem error log
docker compose logs nginx
```

### API không connect được database

```bash
# Kiểm tra MySQL đang chạy
docker compose ps mysql

# Kiểm tra connection
docker exec money-notebook-mysql mysqladmin ping -h localhost
```

### SSL không hoạt động

```bash
# Kiểm tra file SSL tồn tại
ls -la ssl/

# Kiểm tra certificate
openssl x509 -in ssl/fullchain.pem -text -noout | head -20
```

### Frontend không hiển thị

```bash
# Kiểm tra folder out tồn tại
ls -la frontend/out/

# Rebuild frontend
cd frontend && npm run build
```

---

## 📊 Monitoring

### Xem resource usage

```bash
# Docker containers
docker stats

# PM2
pm2 monit
```

### Health check

```bash
curl -I https://moneynote.store/health
curl -I https://api.moneynote.store/health
```

---

## 📝 Tóm tắt ports

| Service | Port | Mô tả |
|---------|------|-------|
| Nginx | 80 | HTTP (redirect to HTTPS) |
| Nginx | 443 | HTTPS |
| MySQL | 3306 | Database |
| Redis | 6379 | Cache |
| API | 2053 | NestJS (PM2) |

---

## 🔗 Links

- **Frontend**: https://moneynote.store
- **API**: https://api.moneynote.store
- **API Docs**: https://api.moneynote.store/docs
