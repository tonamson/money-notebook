# Money Notebook - Production Deployment Guide

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cấu trúc deployment](#cấu-trúc-deployment)
3. [Cài đặt ban đầu](#cài-đặt-ban-đầu)
4. [Cài đặt SSL Certificate](#cài-đặt-ssl-certificate)
5. [Chạy Production](#chạy-production)
6. [Gia hạn SSL Certificate](#gia-hạn-ssl-certificate)
7. [Bảo trì & Troubleshooting](#bảo-trì--troubleshooting)

---

## Yêu cầu hệ thống

- **Server**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Tối thiểu 2GB
- **CPU**: 2 cores+
- **Docker**: 20.10+
- **Docker Compose**: v2.0+
- **Domain**: 2 domain/subdomain đã trỏ về server
  - Frontend: `yourdomain.com` (domain chính)
  - API: `api.yourdomain.com` (subdomain)

---

## Cấu trúc deployment

```
Server
├── Frontend (Next.js SSR) ──► Nginx (Port 443/SSL)
├── API (NestJS + PM2)     ──► Nginx Reverse Proxy
├── MySQL 8.0              ──► Internal Network
└── Redis 7                ──► Internal Network
```

**Các file chính:**

```
money-notebook/
├── Dockerfile              ← Build image production
├── docker-compose.ssl.yml  ← Chạy production với SSL
├── .env                    ← Biến môi trường
└── scripts/
    ├── setup-ssl.sh        ← Cài SSL lần đầu
    └── renew-ssl.sh        ← Gia hạn SSL
```

---

## Cài đặt ban đầu

### 1. Cài đặt Docker (nếu chưa có)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Logout và login lại để apply group
```

### 2. Clone repository

```bash
git clone https://github.com/tonamson/money-notebook.git
cd money-notebook
```

### 3. Cấu hình environment

#### 3.1. File `.env` (Docker Compose - thư mục gốc)

```bash
# Vào thư mục gốc project
cd /path/to/money-notebook

# Copy file mẫu (file .env sẽ ở thư mục gốc, cùng cấp với docker-compose.ssl.yml)
cp .env.ssl.example .env

# Chỉnh sửa file .env
nano .env
```

**Cập nhật các giá trị sau:**

```env
# Domain của bạn
FRONTEND_DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
SSL_EMAIL=your-email@example.com

# Database - đổi password mạnh
MYSQL_ROOT_PASSWORD=MyStr0ng!RootP@ss2024
MYSQL_PASSWORD=MyStr0ng!UserP@ss2024

# JWT - generate key mới
JWT_SECRET=<chạy: openssl rand -base64 64>
```

#### 3.2. Giải thích cách Docker sử dụng Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION DOCKER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   money-notebook/                                                            │
│   ├── .env  ◄──────────── Docker Compose đọc file này                       │
│   │                       (truyền biến vào containers)                       │
│   │                                                                          │
│   ├── api/                                                                   │
│   │   └── .env  ✗        KHÔNG CẦN tạo, Docker đã truyền biến               │
│   │                                                                          │
│   └── frontend/                                                              │
│       └── .env.local ✗   KHÔNG CẦN tạo, biến được truyền lúc build          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT LOCAL                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   money-notebook/                                                            │
│   ├── .env               Không cần (chỉ dùng cho Docker)                    │
│   │                                                                          │
│   ├── api/                                                                   │
│   │   └── .env  ◄─────── CẦN TẠO để chạy: yarn start:dev                    │
│   │                                                                          │
│   └── frontend/                                                              │
│       └── .env.local ◄── CẦN TẠO để chạy: yarn dev                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Tóm tắt:**

| Môi trường            | `.env` (gốc) | `api/.env`   | `frontend/.env.local` |
| --------------------- | ------------ | ------------ | --------------------- |
| **Production Docker** | ✅ BẮT BUỘC  | ❌ Không cần | ❌ Không cần          |
| **Development Local** | ❌ Không cần | ✅ BẮT BUỘC  | ✅ BẮT BUỘC           |

> **Giải thích**: Khi build Docker, các biến từ file `.env` gốc được:
>
> - Truyền vào `api` container qua `environment:` trong docker-compose
> - Truyền vào `frontend` lúc build qua `args:` (biến `NEXT_PUBLIC_*` được "đóng gói" vào JS bundle)

#### 3.3. Backend Environment (`api/.env`)

> ⚠️ **Chỉ cần khi chạy development local** (yarn start:dev)
>
> Khi chạy Docker production, các biến được truyền qua `docker-compose.ssl.yml` → `environment:`, Docker container sẽ nhận biến trực tiếp, KHÔNG đọc file `api/.env`.

```bash
cd api
cp .env.example .env
nano .env
```

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=money_notebook
MYSQL_USER=money_user
MYSQL_PASSWORD=money_pass

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# App
PORT=2053
NODE_ENV=development
```

#### 3.4. Frontend Environment (`frontend/.env.local`)

> ⚠️ **Chỉ cần khi chạy development local** (yarn dev)
>
> Khi build Docker production, `NEXT_PUBLIC_API_URL` được truyền qua `args:` trong docker-compose. Biến này được "đóng gói" vào JS bundle lúc build, nên KHÔNG cần file `.env.local` trong container.

```bash
cd frontend
nano .env.local
```

```env
# API URL - thay đổi theo môi trường
NEXT_PUBLIC_API_URL=http://localhost:2053
```

**Giá trị theo môi trường:**

| Môi trường  | NEXT_PUBLIC_API_URL          |
| ----------- | ---------------------------- |
| Development | `http://localhost:2053`      |
| Production  | `https://api.yourdomain.com` |

#### 3.5. Tổng hợp biến môi trường

| Biến                  | Mô tả                             | Ví dụ                     |
| --------------------- | --------------------------------- | ------------------------- |
| `FRONTEND_DOMAIN`     | Domain chính cho frontend         | `yourdomain.com`          |
| `API_DOMAIN`          | Subdomain cho API                 | `api.yourdomain.com`      |
| `SSL_EMAIL`           | Email đăng ký Let's Encrypt       | `admin@yourdomain.com`    |
| `MYSQL_ROOT_PASSWORD` | Password root MySQL               | `MyStr0ng!Pass`           |
| `MYSQL_USER`          | Username MySQL                    | `money_user`              |
| `MYSQL_PASSWORD`      | Password MySQL user               | `MyStr0ng!Pass`           |
| `MYSQL_DATABASE`      | Tên database                      | `money_notebook`          |
| `JWT_SECRET`          | Secret key cho JWT (min 32 chars) | `openssl rand -base64 64` |
| `JWT_EXPIRES_IN`      | Thời gian hết hạn token           | `7d`                      |

### 4. Cấp quyền cho scripts

```bash
chmod +x scripts/*.sh
```

---

## Cài đặt SSL Certificate

### Lần đầu tiên (Lấy certificate mới)

```bash
# Chạy script setup SSL
./scripts/setup-ssl.sh
```

Script sẽ tự động:

1. Khởi động nginx tạm thời
2. Lấy certificate từ Let's Encrypt cho cả 2 domain
3. Lưu certificate vào `./ssl/`

### Kiểm tra certificate

```bash
# Xem thông tin certificate
openssl x509 -in ./ssl/live/yourdomain.com/fullchain.pem -text -noout | grep -A2 "Validity"
```

---

## Chạy Production

### Build và khởi động

```bash
# Build image
docker compose -f docker-compose.ssl.yml build

# Khởi động services
docker compose -f docker-compose.ssl.yml up -d

# Xem logs
docker compose -f docker-compose.ssl.yml logs -f app
```

### Kiểm tra services

```bash
# Trạng thái containers
docker compose -f docker-compose.ssl.yml ps

# Health check
curl -k https://yourdomain.com/health
curl -k https://api.yourdomain.com/health

# PM2 status (trong container)
docker exec money-notebook-app pm2 list
```

### Các lệnh hữu ích

```bash
# Restart app
docker compose -f docker-compose.ssl.yml restart app

# Xem logs realtime
docker compose -f docker-compose.ssl.yml logs -f app

# Vào shell container
docker exec -it money-notebook-app sh

# Xem PM2 logs
docker exec money-notebook-app pm2 logs

# Reload nginx (sau khi thay đổi config)
docker exec money-notebook-app nginx -s reload
```

---

## Gia hạn SSL Certificate

### Gia hạn thủ công

```bash
./scripts/renew-ssl.sh
```

### Cài đặt tự động gia hạn (Cron job)

Let's Encrypt certificate có thời hạn 90 ngày. Nên setup cron để tự động gia hạn.

```bash
# Mở crontab
crontab -e

# Thêm dòng sau (chạy mỗi ngày lúc 3:00 AM)
0 3 * * * cd /path/to/money-notebook && ./scripts/renew-ssl.sh >> /var/log/ssl-renew.log 2>&1
```

### Kiểm tra ngày hết hạn

```bash
# Xem ngày hết hạn của certificate
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Thay thế SSL Certificate thủ công

Nếu bạn dùng certificate từ provider khác (không phải Let's Encrypt):

### 1. Chuẩn bị certificate files

Bạn cần 2 files cho mỗi domain:

- `fullchain.pem` - Certificate + Intermediate CA
- `privkey.pem` - Private key

### 2. Copy certificate vào đúng vị trí

```bash
# Frontend domain (domain chính)
mkdir -p ./ssl/live/yourdomain.com
cp /path/to/your/fullchain.pem ./ssl/live/yourdomain.com/
cp /path/to/your/privkey.pem ./ssl/live/yourdomain.com/

# API domain (subdomain)
mkdir -p ./ssl/live/api.yourdomain.com
cp /path/to/your/api-fullchain.pem ./ssl/live/api.yourdomain.com/fullchain.pem
cp /path/to/your/api-privkey.pem ./ssl/live/api.yourdomain.com/privkey.pem
```

### 3. Phân quyền

```bash
chmod 644 ./ssl/live/*/fullchain.pem
chmod 600 ./ssl/live/*/privkey.pem
```

### 4. Reload nginx

```bash
docker exec money-notebook-app nginx -s reload
```

### 5. Verify

```bash
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com
```

---

## Bảo trì & Troubleshooting

### Xem logs

```bash
# Tất cả logs
docker compose -f docker-compose.ssl.yml logs

# Chỉ app logs
docker compose -f docker-compose.ssl.yml logs app

# Chỉ MySQL logs
docker compose -f docker-compose.ssl.yml logs mysql

# Nginx access log
docker exec money-notebook-app tail -f /var/log/nginx/access.log

# Nginx error log
docker exec money-notebook-app tail -f /var/log/nginx/error.log

# PM2 logs
docker exec money-notebook-app pm2 logs
```

### Restart services

```bash
# Restart tất cả
docker compose -f docker-compose.ssl.yml restart

# Restart chỉ app
docker compose -f docker-compose.ssl.yml restart app

# Reload nginx (không downtime)
docker exec money-notebook-app nginx -s reload

# Reload PM2 (không downtime)
docker exec money-notebook-app pm2 reload all
```

### Backup database

```bash
# Backup
docker exec money-notebook-mysql mysqldump -u root -p'YOUR_ROOT_PASSWORD' money_notebook > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i money-notebook-mysql mysql -u root -p'YOUR_ROOT_PASSWORD' money_notebook < backup_20241201.sql
```

### Common issues

#### 1. Certificate không tìm thấy

```bash
# Kiểm tra certificate tồn tại
ls -la ./ssl/live/

# Kiểm tra mount volume
docker inspect money-notebook-app | grep -A20 "Mounts"
```

#### 2. Nginx không start

```bash
# Test nginx config
docker exec money-notebook-app nginx -t

# Xem error log
docker exec money-notebook-app cat /var/log/nginx/error.log
```

#### 3. API không kết nối được database

```bash
# Kiểm tra MySQL health
docker exec money-notebook-mysql mysqladmin ping -h localhost

# Kiểm tra network
docker network inspect money-notebook_money-network
```

#### 4. PM2 cluster không hoạt động

```bash
# Xem PM2 status
docker exec money-notebook-app pm2 list

# Restart PM2
docker exec money-notebook-app pm2 restart all

# Xem chi tiết
docker exec money-notebook-app pm2 describe money-notebook-api
```

---

## Cập nhật ứng dụng

```bash
# Pull code mới
git pull origin main

# Rebuild và restart
docker compose -f docker-compose.ssl.yml build app
docker compose -f docker-compose.ssl.yml up -d app

# Verify
docker compose -f docker-compose.ssl.yml logs -f app
```

---

## Liên hệ hỗ trợ

- **Repository**: https://github.com/tonamson/money-notebook
- **Issues**: https://github.com/tonamson/money-notebook/issues
