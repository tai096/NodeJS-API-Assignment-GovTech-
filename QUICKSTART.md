# 🚀 Quick Start - TypeScript Setup Fixed

## ✅ Đã sửa lỗi "Unknown file extension .ts"

### Giải pháp

Thay thế **ts-node** bằng **tsx** - TypeScript executor nhanh và đơn giản hơn.

---

## 🛠️ Development Commands

### Chạy Development Server

```bash
yarn dev
```

✅ Sử dụng `tsx` thay vì `ts-node`  
✅ Auto-reload khi file thay đổi  
✅ Nhanh hơn và ít lỗi hơn

### Type Checking

```bash
yarn typecheck
```

### Build Production

```bash
yarn build
yarn start
```

---

## 📝 Cấu hình hiện tại

### nodemon.json

```json
{
  "exec": "tsx src/server.ts"
}
```

### package.json

```json
{
  "scripts": {
    "dev": "nodemon"
  },
  "devDependencies": {
    "tsx": "^4.20.6"
  }
}
```

---

## 🎯 Tại sao dùng tsx thay vì ts-node?

| Feature           | ts-node          | tsx                      |
| ----------------- | ---------------- | ------------------------ |
| **Speed**         | Chậm hơn         | Nhanh hơn (dùng esbuild) |
| **ESM Support**   | Phức tạp         | Đơn giản                 |
| **Setup**         | Cần nhiều config | Chỉ cần cài đặt          |
| **File watching** | Cần workaround   | Hoạt động ngay           |

---

## ✨ Bây giờ chạy được rồi!

```bash
yarn dev
# ✓ Loaded environment: development from .env
# ✓ Database connection has been established successfully
# ✓ Server is running on port 5001
```

**Happy coding! 🎉**
