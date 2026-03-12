# Kindlink Project 🌟

Chào mừng bạn đến với **Kindlink**, một hệ thống quản lý và kết nối thiện nguyện hiện đại. Dự án được phát triển theo mô hình **Monorepo** giúp quản lý cả Backend và Frontend trong cùng một kho lưu trữ một cách hiệu quả.

---

## 🛠️ Công nghệ sử dụng

Hệ thống sử dụng các bộ framework và công nghệ mới nhất:

| Thành phần | Công nghệ | Phiên bản |
| :--- | :--- | :--- |
| **Package Manager** | [pnpm](https://pnpm.io/) | `v10.x` |
| **Runtime** | [Node.js](https://nodejs.org/) | `v20.x` (Slim) |
| **Backend** | [NestJS](https://nestjs.com/) | `v11.x` |
| **Frontend** | [Next.js](https://nextjs.org/) | `v16.x` (App Router) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | `v15.x` |
| **ORM** | [Prisma](https://www.prisma.io/) | `v7.x` |
| **UI/UX** | [Tailwind CSS](https://tailwindcss.com/) | `v4.x` |

---

## 🏗️ Cấu trúc thư mục (Monorepo)

Dự án được tổ chức bằng **pnpm workspaces**:

```text
kindlink/
├── apps/
│   ├── api/                    # NestJS Backend (Cung cấp RESTful API)
│   │   ├── src/                # Mã nguồn chính
│   │   ├── prisma/             # Schema & Database Migrations
│   │   ├── Dockerfile          # Cấu hình biên dịch Docker
│   │   └── package.json
│   └── web/                    # Next.js Frontend (Giao diện người dùng)
│       ├── src/app/            # Next.js App Router
│       ├── src/components/     # UI Components dùng chung
│       └── package.json
├── packages/                   # Thư viện dùng chung (utils, types, shared-ui)
├── docker-compose.yml          # Điều phối các dịch vụ Docker (API + DB)
├── pnpm-workspace.yaml         # Cấu hình Pnpm monorepo
├── .env                        # Biến môi trường hệ thống
└── README.md                   # Tài liệu hướng dẫn
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
- **Docker** & **Docker Compose** (Khuyên dùng).
- **Node.js v20+** & **pnpm v10+** (Nếu chạy Local).

### 2. Thiết lập môi trường (.env)
Tạo file `.env` tại thư mục gốc của dự án:
```env
# Database configuration
POSTGRES_PASSWORD=your_secure_password

# JWT Security
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

### 3. Chạy với Docker (Nhanh nhất)
Đây là cách tốt nhất để đảm bảo môi trường chạy ổn định cho Backend và Database.

```bash
# Khởi động toàn bộ dịch vụ (API + PostgreSQL)
docker-compose up -d

# Xem log của API trực tiếp
docker-compose logs -f api

# Dừng các dịch vụ
docker-compose down
```

> [!TIP]
> Nếu bạn thay đổi mã nguồn Backend, hãy build lại với: `docker-compose up -d --build api`

### 4. Chạy Local (Để phát triển nhanh)

1. **Cài đặt dependencies cho toàn bộ workspace:**
   ```bash
   pnpm install
   ```

2. **Khởi chạy Backend (API):**
   ```bash
   # Tạo Prisma Client
   pnpm --filter api exec prisma generate
   
   pnpm --filter api exec prisma migrate deploy
   
   # Chạy dev mode
   pnpm dev:api
   ```

3. **Khởi chạy Frontend (Web):**
   ```bash
   pnpm dev:web
   ```

---

## 🗄️ Quản lý Cơ sở dữ liệu (Prisma)

Khi làm việc với Database, bạn cần sử dụng các lệnh sau (chạy từ thư mục gốc hoặc vào `apps/api`):

- **Tạo migration mới:**
  ```bash
  pnpm --filter api exec prisma migrate dev --name <tên_migration>
  ```
- **Mở giao diện quản lý DB (Prisma Studio):**
  ```bash
  pnpm --filter api exec prisma studio
  ```

---

## 🤝 Đóng góp dự án
Nếu bạn gặp vấn đề hoặc muốn đề xuất tính năng mới, vui lòng tạo Issue hoặc gửi Pull Request. Cảm ơn bạn đã tham gia phát triển **Kindlink**!

## Cổng Backend : http://localhost:3001 : cd apps/api run pnpm start:dev
## Cổng Frontend : http://localhost:3000 : run pnpm dev:web