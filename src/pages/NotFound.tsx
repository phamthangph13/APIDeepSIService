import { ButtonLink } from "../components/Button";
import { PageShell } from "../components/PageShell";
import { Sticker } from "../components/Sticker";
import { MENU_ITEMS } from "../data/site";

export function NotFound() {
  return (
    <PageShell title="Không tìm thấy trang">
      <section className="notfound">
        <div className="container notfound__grid">
          <div className="notfound__copy">
            <span className="eyebrow" data-hero-fade>
              Lỗi / 404
            </span>
            <h1 data-hero-line>
              404
            </h1>
            <h2>
              Trang này không tồn tại.
              <br />
              <em>Nhưng endpoint thì có.</em>
            </h2>
            <p>
              Có thể liên kết đã cũ, hoặc bạn gõ nhầm một ký tự. Đừng lo — API vẫn đang chạy
              bình thường.
            </p>
            <div className="notfound__actions">
              <ButtonLink to="/" variant="primary" size="lg" icon="arrow">
                Về trang chủ
              </ButtonLink>
              <ButtonLink to="/docs" variant="secondary" size="lg" icon="book" iconSide="right">
                Đọc tài liệu
              </ButtonLink>
            </div>
            <div className="notfound__links">
              <span className="mono">Hoặc đi tới</span>
              {MENU_ITEMS.slice(0, 4).map((item) => (
                <a href={item.href} key={item.number}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="notfound__visual" data-hero-fade>
            <span className="notfound__big mono">404</span>
            <Sticker name="search" size={220} rotate={-8} className="notfound__sticker" />
            <Sticker name="arrow" size={76} rotate={140} className="notfound__arrow" />
            <span className="mono notfound__note">không tìm thấy / nhưng vẫn trực tuyến</span>
          </div>
        </div>
        <span className="notfound__wordmark" aria-hidden="true">
          MISSING
        </span>
      </section>
    </PageShell>
  );
}
