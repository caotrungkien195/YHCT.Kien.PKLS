# YHCT Schedule API

## Base URL đúng

```
http://localhost:3000
```

Dán nguyên chuỗi trên vào ô **Base URL** trong app (Admin → API lịch trình).

- **Không** thêm `/api/v1` vào Base URL
- **Không** thêm dấu `/` ở cuối
- Token: để trống (trừ khi chạy với `API_TOKEN=...`)

## Chạy server

```bash
cd yhct-api
node server.js
```

Hoặc:

```bash
npm start
```

## Trong app chia-gio-yhct.html

1. Đăng nhập admin  
2. Mục 7 → **0. API lịch trình**  
3. Bật API  
4. Base URL: `http://localhost:3000`  
5. Token: để trống  
6. Bấm **Test** → phải hiện API: Online  
7. **Đẩy lên API** / **Kéo từ API**

## Endpoint

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/v1/health | Kiểm tra sống |
| GET | /api/v1/workspace | Lấy workspace |
| PUT | /api/v1/workspace | Lưu workspace |
| GET/PUT | /api/v1/schedule | Lịch (items) |
| GET/PUT | /api/v1/patients | DSBN (items) |

## Token (tuỳ chọn)

```bash
API_TOKEN=matkhau-bi-mat node server.js
```

Khi đó trong app điền Token: `matkhau-bi-mat` (không cần gõ chữ Bearer).
