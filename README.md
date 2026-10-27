# DeepSI Agent — service.deepsi.space

Giao diện dịch vụ API LLM dành cho agent, thuộc `deepsi.space`. Website giới thiệu dịch vụ, bảng giá, tài liệu API và client console để tạo/quản lý API key.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

```bash
npm run build     # type-check + build production
npm run preview   # xem bản build
```

## Tài khoản demo

- Email: `demo@deepsi.space`
- Mật khẩu: `deepsi2026`
- Gói: Plus, có sẵn hai API key.

Trang đăng nhập có nút **Dùng tài khoản demo** để điền nhanh thông tin.

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
  context/      Auth + Toast
  data/         Kế hoạch giá, mô hình, sticker, nội dung site
  lib/          Auth demo, storage, usage, format
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

## Lưu ý triển khai

Đây là bản giao diện/demo phía client. Tài khoản, phiên đăng nhập, API key và usage được lưu trong `localStorage`; mật khẩu được băm bằng Web Crypto. OAuth Google/GitHub và thanh toán hiện là luồng mô phỏng vì chưa có credential/backend thật. Khi nối backend, thay các hàm trong `src/lib/auth.ts` và `src/context/AuthContext.tsx`.

## Deploy

Cấu hình SPA rewrite có sẵn cho Vercel (`vercel.json`) và Netlify (`netlify.toml`).

- Build command: `npm run build`
- Output: `dist`
- Domain đích: `service.deepsi.space`

## Sticker

```bash
npm run stickers
```

Script dùng `sharp` để xử lý vector thành PNG 512×512 trong `public/stickers`. Contact sheet QA nằm ở `design/sticker-pack/contact-sheet.png`.
