# AISEP Capstone — Hướng dẫn chạy & triển khai Frontend

## Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt môi trường](#cài-đặt-môi-trường)
- [Chạy development](#chạy-development)
- [Build production](#build-production)
- [Triển khai](#triển-khai)
  - [Vercel (khuyến nghị)](#vercel-khuyến-nghị)
  - [Self-hosted (Node.js)](#self-hosted-nodejs)
  - [Docker](#docker)
- [Biến môi trường](#biến-môi-trường)
- [Cấu trúc thư mục chính](#cấu-trúc-thư-mục-chính)

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | 18.x trở lên |
| npm | 9.x trở lên (hoặc pnpm / yarn) |
| Git | Bất kỳ |

---

## Cài đặt môi trường

### 1. Clone repository

```bash
git clone https://github.com/<org>/AISEP-Capstone-FE.git
cd AISEP-Capstone-FE
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` ở root của project:

```env
# URL của Backend API (bắt buộc)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Ví dụ production
# NEXT_PUBLIC_BACKEND_URL=https://api.aisep.io
```

> **Lưu ý:** File `.env.local` không được commit lên Git. Chỉ có `NEXT_PUBLIC_*` mới được expose ra phía client.

---

## Chạy development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

Hot-reload tự động khi chỉnh sửa file. Compile time trung bình 200–1000ms trong dev mode (bình thường).

---

## Build production

```bash
npm run build
```

Nếu build thành công, output sẽ hiển thị danh sách các route được generate. Sau đó chạy thử production:

```bash
npm run start
```

Ứng dụng production chạy tại: **http://localhost:3000**

---

## Triển khai

### Vercel (khuyến nghị)

Vercel là nền tảng chính thức cho Next.js, zero-config.

1. Push code lên GitHub/GitLab
2. Truy cập [vercel.com](https://vercel.com) → **New Project** → Import repository
3. Trong phần **Environment Variables**, thêm:
   ```
   NEXT_PUBLIC_BACKEND_URL = https://api.aisep.io
   ```
4. Nhấn **Deploy**

Mỗi lần push lên branch `main` sẽ tự động trigger redeploy.

---

### Self-hosted (Node.js)

Dùng khi deploy lên VPS/server riêng (Ubuntu, CentOS...).

**Bước 1 — Build trên máy hoặc CI:**

```bash
npm install
npm run build
```

**Bước 2 — Chuyển các thư mục cần thiết lên server:**

```
.next/
public/
package.json
package-lock.json
next.config.ts
```

**Bước 3 — Trên server, cài dependencies production:**

```bash
npm install --omit=dev
```

**Bước 4 — Chạy ứng dụng:**

```bash
# Chạy trực tiếp
npm run start

# Hoặc dùng PM2 để giữ process sống
npm install -g pm2
pm2 start npm --name "aisep-fe" -- run start
pm2 save
pm2 startup
```

**Bước 5 — Cấu hình Nginx reverse proxy (tùy chọn, khuyến nghị):**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Docker

**Bước 1 — Tạo file `Dockerfile` ở root:**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
```

**Bước 2 — Build & run:**

```bash
docker build -t aisep-fe .

docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_URL=https://api.aisep.io \
  --name aisep-fe \
  aisep-fe
```

---

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | ✅ | Base URL của Backend API. VD: `http://localhost:5000` |

> Tất cả biến `NEXT_PUBLIC_*` sẽ được bundle vào client-side JavaScript. **Không được** đặt secret/key vào các biến này.

---

## Cấu trúc thư mục chính

```
AISEP-Capstone-FE/
├── app/                    # Next.js App Router — pages & layouts
│   ├── (public)/           # Trang public (landing page)
│   ├── admin/              # Workspace Admin
│   ├── advisor/            # Workspace Advisor
│   ├── auth/               # Login, register, verify email...
│   ├── investor/           # Workspace Investor
│   ├── staff/              # Workspace Operation Staff
│   └── startup/            # Workspace Startup
├── components/             # Shared & feature components
├── services/               # API calls (axios) & mock data
│   └── interceptor.ts      # Axios instance với auto refresh token
├── types/
│   └── global.ts           # Global TypeScript ambient declarations
├── context/                # React Context (Auth, StartupProfile...)
├── hooks/                  # Custom hooks
├── public/                 # Static assets (SVG, images...)
├── .env.local              # ⚠️ Không commit — biến môi trường local
├── next.config.ts          # Next.js configuration
└── package.json
```

---

## Ghi chú

- **Authentication:** Token được lưu vào `localStorage` (`accessToken`). Interceptor axios tự động refresh token khi nhận 401.
- **Mock data:** Nhiều màn hình hiện đang dùng mock data trong `services/**/*.mock.ts`. Khi BE sẵn sàng, thay thế bằng API call thật trong cùng file service.
- **SignalR:** Realtime messaging dùng `@microsoft/signalr`. Cần Backend hỗ trợ WebSocket/SignalR Hub tại endpoint `/hub/chat`.
