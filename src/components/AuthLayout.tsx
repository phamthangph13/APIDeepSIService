import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../data/site";
import { Logo } from "./Logo";
import { Sticker } from "./Sticker";

export type AuthMode = "login" | "register" | "forgot" | "reset" | "oauth" | "verify";

const COPY: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    lede: string;
    quote: string;
    quoteNote: string;
    asideLabel: string;
  }
> = {
  login: {
    eyebrow: "Client / Đăng nhập",
    title: "Chào mừng trở lại.",
    lede: "Đăng nhập để quản lý API key, xem usage và điều chỉnh gói dịch vụ.",
    quote: "Một API key. Một endpoint. Agent của bạn có thể bắt đầu suy nghĩ trong 30 giây.",
    quoteNote: "Không cần thẻ. Không cần chờ duyệt.",
    asideLabel: "Client console / 06",
  },
  register: {
    eyebrow: "Client / Tạo tài khoản",
    title: "Bắt đầu bằng\nmột API key.",
    lede: "Miễn phí. Không cần thẻ. Agent của bạn có thể gọi endpoint ngay sau khi đăng ký.",
    quote: "Đừng dựng thêm một cụm GPU. Hãy dựng thêm một sản phẩm.",
    quoteNote: "Free · 10.000 token mỗi ngày · 5 API key",
    asideLabel: "New client / 01",
  },
  forgot: {
    eyebrow: "Client / Khôi phục",
    title: "Quên mật khẩu?",
    lede: "Nhập email đã đăng ký. Chúng tôi sẽ tạo một liên kết để bạn đặt lại mật khẩu.",
    quote: "Chuyện quên mật khẩu xảy ra. Chúng tôi giữ phần còn lại đơn giản.",
    quoteNote: "Liên kết có hiệu lực trong 30 phút.",
    asideLabel: "Recovery / 02",
  },
  reset: {
    eyebrow: "Client / Mật khẩu mới",
    title: "Đặt lại mật khẩu.",
    lede: "Chọn một mật khẩu mới cho tài khoản DeepSI Agent của bạn.",
    quote: "Một mật khẩu mới. Một phiên mới. Tiếp tục công việc.",
    quoteNote: "Mật khẩu được băm trước khi lưu.",
    asideLabel: "Recovery / 03",
  },
  oauth: {
    eyebrow: "Client / OAuth",
    title: "Đang hoàn tất đăng nhập.",
    lede: "DeepSI đang xác thực tài khoản từ nhà cung cấp bạn đã chọn.",
    quote: "Một cú nhấp. Không thêm mật khẩu mới.",
    quoteNote: "Google và GitHub được hỗ trợ.",
    asideLabel: "OAuth / 04",
  },
  verify: {
    eyebrow: "Client / Xác nhận email",
    title: "Xác nhận email.",
    lede: "Một bước ngắn để bảo vệ tài khoản và bật đăng nhập.",
    quote: "Email đúng người. Tài khoản đúng chủ.",
    quoteNote: "Liên kết xác nhận có thời hạn.",
    asideLabel: "Verify / 05",
  },
};

type AuthLayoutProps = {
  mode: AuthMode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ mode, children, footer }: AuthLayoutProps) {
  const copy = COPY[mode];

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-aside__grain" aria-hidden="true" />
        <div className="auth-aside__top">
          <Logo light />
          <span className="mono auth-aside__label">{copy.asideLabel}</span>
        </div>

        <div className="auth-aside__quote">
          <span className="eyebrow eyebrow--plain auth-aside__eyebrow">DEEPSI / SERVICE 02</span>
          <blockquote>“{copy.quote}”</blockquote>
          <p>{copy.quoteNote}</p>
        </div>

        <div className="auth-aside__stickers" aria-hidden="true">
          <Sticker name="key" size={96} rotate={-8} className="auth-sticker auth-sticker--key" />
          <Sticker name="shield" size={74} rotate={7} className="auth-sticker auth-sticker--shield" />
          <Sticker name="spark" size={58} rotate={-4} className="auth-sticker auth-sticker--spark" />
        </div>

        <div className="auth-aside__foot">
          <span className="status-dot" />
          <span className="mono">API trực tuyến · 3 vùng</span>
          <span className="auth-aside__parent mono">một dịch vụ của {SITE.parent}</span>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main__top">
          <Link to="/" className="auth-back">
            <Sticker name="arrow" size={20} rotate={-135} flat decorative />
            <span>Về trang chủ</span>
          </Link>
          <span className="mono auth-main__domain">{SITE.domain}</span>
        </div>

        <div className="auth-card">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="auth-card__title">{copy.title}</h1>
          <p className="auth-card__lede">{copy.lede}</p>
          {children}
        </div>

        {footer ? <div className="auth-main__footer">{footer}</div> : null}
      </main>
    </div>
  );
}
