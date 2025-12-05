# SSL Certificates

## Cấu trúc thư mục

```
ssl/
├── fullchain.pem    # Certificate + Intermediate CA
├── privkey.pem      # Private Key
└── README.md        # File này
```

## Cách đặt SSL Certificate

Nginx sẽ tự động đọc 2 file trong folder này:

- `fullchain.pem` - Certificate chain
- `privkey.pem` - Private key

### Option 1: Cloudflare Origin Certificate (Khuyến nghị)

1. Vào **Cloudflare Dashboard** → **SSL/TLS** → **Origin Server**
2. Click **Create Certificate**
3. Chọn:
   - Private key type: **RSA (2048)**
   - Hostnames: `moneynote.store`, `*.moneynote.store`
   - Certificate Validity: **15 years**
4. Copy và lưu:
   - **Origin Certificate** → `ssl/fullchain.pem`
   - **Private Key** → `ssl/privkey.pem`
5. Cloudflare SSL mode: **Full (strict)**

### Option 2: Let's Encrypt (Certbot)

```bash
# Cài certbot trên server
sudo apt install certbot

# Tạm dừng nginx
docker compose stop nginx

# Lấy certificate
sudo certbot certonly --standalone -d moneynote.store -d www.moneynote.store -d api.moneynote.store

# Copy certificate vào project
sudo cp /etc/letsencrypt/live/moneynote.store/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/moneynote.store/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*.pem

# Khởi động lại nginx
docker compose up -d nginx
```

**Gia hạn Let's Encrypt (mỗi 90 ngày):**

```bash
sudo certbot renew --pre-hook "docker compose stop nginx" --post-hook "docker compose start nginx"
```

### Option 3: Certificate từ provider khác

Copy 2 file vào folder `ssl/`:

- Certificate chain → `fullchain.pem`
- Private key → `privkey.pem`

## Reload Nginx sau khi thay đổi SSL

```bash
docker compose restart nginx
# hoặc
docker exec money-notebook-nginx nginx -s reload
```

## Kiểm tra SSL

```bash
# Kiểm tra ngày hết hạn
echo | openssl s_client -servername moneynote.store -connect moneynote.store:443 2>/dev/null | openssl x509 -noout -dates

# Test HTTPS
curl -I https://moneynote.store
curl -I https://api.moneynote.store
```
