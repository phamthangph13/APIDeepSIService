# DeepSI Agent — service.deepsi.space

Giao diện dịch vụ API LLM dành cho agent, thuộc `deepsi.space`. Website giới thiệu dịch vụ, bảng giá, tài liệu API và client console để tạo/quản lý API key.

Frontend này dùng API Go + MongoDB trong repo `APIDeepSIService-ServerSide`.

## Chạy local

```bash
npm install
cp .env.example .env.local
# Sửa VITE_API_URL nếu backend không chạy ở http://localhost:8080
npm run dev
```

Mở `http://localhost:5173`. Backend cần chạy trước ở `http://localhost:8080` (xem README của repo server).

```bash
npm run build     # type-check + build production
npm run preview   # xem bản build
```

## Biến môi trường

Chỉ các biến `VITE_*` được đưa vào trình duyệt. Không đặt secret ở đây.

| Nhóm | Biến |
| --- | --- |
| API | `VITE_API_URL`, `VITE_LLM_BASE_URL` |
| Nhận diện | `VITE_SITE_NAME`, `VITE_SITE_DOMAIN`, `VITE_SITE_EMAIL`, `VITE_SUPPORT_EMAIL`, `VITE_PARENT_DOMAIN`, `VITE_PARENT_URL`, `VITE_SECURITY_EMAIL` |
| OAuth | `VITE_OAUTH_ENABLED` |

Mặc định khi dev: API `http://localhost:8080/api/v1`, LLM `http://localhost:8080/v1`. Khi build production, API mặc định là `https://api.service.deepsi.space/api/v1` nếu không đặt `VITE_API_URL`.

## Công nghệ

- Vite + React 19 + TypeScript
- React Router 7
- GSAP + ScrollTrigger cho reveal/scroll
- Three.js cho lõi agent ở hero
- CSS thuần, design token tự định nghĩa; không dùng gradient
- Sticker PNG tự tạo trong `public/stickers`

## Cấu trúc chính

```text
src/
  components/   UI dùng chung, sticker, form, dashboard shell
  context/      Auth, Plans, Toast
  data/         Metadata hiển thị của gói giá, mô hình, sticker, nội dung site
  lib/          API client, auth, usage, billing, plans, env, format
  pages/        Home, Pricing, Docs, auth, dashboard, legal, 404
  styles/       Token, components, pages, auth, dashboard
public/
  stickers/     28 sticker PNG
  textures/     Giấy, lưới, chấm
  og.png        Ảnh chia sẻ 1200×630
design/
  sticker-pack/ Contact sheet + manifest QA
scripts/
  build-stickers.mjs  Tái tạo sticker từ vector
  sticker-defs.mjs    Định nghĩa sticker
```

## Tích hợp backend

- Access token lưu trong `sessionStorage`; refresh token nằm trong cookie httpOnly do backend đặt.
- Mọi request đi qua `src/lib/api.ts`, tự refresh một lần khi gặp 401 rồi thử lại.
- Google/GitHub OAuth chuyển hướng sang backend và quay về `/auth/callback` để đổi one-time code.
- Gói dịch vụ lấy từ `GET /plans` qua `PlansProvider`; metadata trình bày dùng `src/data/plans.ts` làm fallback.
- Thanh toán SePay hỗ trợ gateway, chuyển khoản QR và mock payment khi backend bật `PAYMENT_MOCK_ENABLED`.

## Deploy

Cấu hình SPA rewrite có sẵn cho Vercel (`vercel.json`) và Netlify (`netlify.toml`).

- Build command: `npm run build`
- Output: `dist`
- Domain đích: `service.deepsi.space`
- Đặt `VITE_API_URL` trỏ tới API production và cấu hình CORS/credentials ở backend.

## Sticker

```bash
npm run stickers
```

Script dùng `sharp` để xử lý vector thành PNG 512×512 trong `public/stickers`. Contact sheet QA nằm ở `design/sticker-pack/contact-sheet.png`.
