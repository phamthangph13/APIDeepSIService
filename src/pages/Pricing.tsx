import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ButtonLink } from "../components/Button";
import { FAQ } from "../components/FAQ";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { PricingCards } from "../components/PricingCards";
import { SectionHead } from "../components/SectionHead";
import { Sticker } from "../components/Sticker";
import { usePlans } from "../context/PlansContext";
import type { Plan } from "../data/plans";
import { SITE } from "../data/site";

const STATIC_COMPARE_ROWS: Array<{ label: string; values: [string, string, string] }> = [
  { label: "Mô hình", values: ["M1 · E1", "S1 · M1 · V1 · E1", "Tất cả + beta"] },
  { label: "Ưu tiên xử lý", values: ["Tiêu chuẩn", "Ưu tiên", "Ưu tiên cao nhất"] },
  { label: "Streaming & JSON mode", values: ["Có", "Có", "Có"] },
  { label: "Tool calling", values: ["Cơ bản", "Đầy đủ", "Đầy đủ"] },
  { label: "Vision (PDF, ảnh)", values: ["—", "Có", "Có"] },
  { label: "Embeddings", values: ["Có", "Có", "Có"] },
  { label: "Hỗ trợ", values: ["Cộng đồng", "Email / 24h", "Slack · Telegram"] },
  { label: "SLA", values: ["—", "99,5%", "99,9%"] },
  { label: "Hóa đơn VAT", values: ["—", "Có", "Có"] },
  { label: "Hợp đồng dịch vụ", values: ["—", "—", "Có"] },
];

function buildCompareRows(plans: Plan[]) {
  return [
    { label: "Giá mỗi tháng", values: plans.map((plan) => plan.priceLabel) },
    { label: "Hạn mức token", values: plans.map((plan) => plan.quotaLabel) },
    {
      label: "API key",
      values: plans.map((plan) =>
        Number.isFinite(plan.keyLimit) ? String(plan.keyLimit) : "Không giới hạn",
      ),
    },
    { label: "Log yêu cầu", values: plans.map((plan) => `${plan.retentionDays} ngày`) },
    ...STATIC_COMPARE_ROWS,
  ];
}

const PRICING_FAQS = [
  {
    q: "Thanh toán bằng cách nào?",
    a: "VNPay, Momo hoặc chuyển khoản ngân hàng. Plus và Ultral được kích hoạt ngay sau khi thanh toán thành công; hóa đơn VAT được gửi qua email trong 24 giờ làm việc.",
  },
  {
    q: "Nâng cấp giữa tháng có bị tính hai lần không?",
    a: "Không. Phần chưa dùng của gói cũ được quy đổi theo tỷ lệ và trừ vào kỳ thanh toán đầu tiên của gói mới. Bạn chỉ trả phần chênh lệch.",
  },
  {
    q: "Vượt hạn mức token thì điều gì xảy ra?",
    a: "Yêu cầu tạm dừng với mã 429, không tự động trừ thêm tiền. Bạn có thể nâng cấp, mua thêm hạn mức hoặc chờ kỳ tiếp theo. Hạn mức riêng cho từng key giúp kiểm soát chi phí theo môi trường.",
  },
  {
    q: "Có thể hủy bất cứ lúc nào?",
    a: "Có. Hủy trong trang Gói dịch vụ; gói vẫn có hiệu lực đến hết kỳ đã trả. Không có phí hủy, không tự động gia hạn nếu bạn không bật.",
  },
  {
    q: "Gói Free có thật sự miễn phí mãi mãi?",
    a: "Có. 10.000 token mỗi ngày, 5 API key, không cần thẻ. Chúng tôi giữ gói này để bất kỳ ai cũng có thể thử một ý tưởng trước khi cam kết.",
  },
  {
    q: "Tôi cần hóa đơn cho công ty thì sao?",
    a: `Plus và Ultral đều hỗ trợ hóa đơn VAT. Với Ultral, chúng tôi cung cấp thêm hợp đồng dịch vụ và đầu mối hỗ trợ riêng. Gửi yêu cầu đến ${SITE.supportEmail}.`,
  },
];

export function Pricing() {
  const { plans } = usePlans();
  const compareRows = useMemo(() => buildCompareRows(plans), [plans]);

  return (
    <PageShell title="Bảng giá">
      <PageIntro
        number="04"
        eyebrow="Bảng giá / Minh bạch"
        title={
          <>
            Ba mức.
            <br />
            <em>Không phí ẩn.</em>
          </>
        }
        lede="Bắt đầu miễn phí. Nâng cấp khi agent có người dùng thật. Giá niêm yết bằng đồng Việt, tính theo token, không có phí nền tảng."
        sticker="coin"
        meta="Pricing / VND · 2026"
      >
        <ButtonLink to="/register" variant="primary" size="lg" icon="key">
          Tạo API key miễn phí
        </ButtonLink>
        <ButtonLink to="/docs" variant="secondary" size="lg" icon="book" iconSide="right">
          Đọc tài liệu
        </ButtonLink>
      </PageIntro>

      <section className="pricing pricing--page">
        <div className="container">
          <PricingCards />

          <div className="pricing__foot" data-reveal>
            <p>
              Mọi gói đều có API key miễn phí. Không tính phí trên mỗi key, không có hợp đồng
              tối thiểu. Thanh toán bằng VNPay, Momo hoặc chuyển khoản.
            </p>
            <Link to="/docs#rate-limits" className="text-link">
              Xem giới hạn kỹ thuật
              <Sticker name="arrow" size={19} rotate={-15} flat decorative />
            </Link>
          </div>

          <div className="pricing__note" data-reveal>
            <Sticker name="lock" size={24} flat decorative />
            <span>
              Giá đã bao gồm VAT. Hủy bất cứ lúc nào. Không tự động gia hạn nếu bạn không bật.
            </span>
            <span className="mono">3 gói · 1 bảng giá</span>
          </div>
        </div>
      </section>

      <section className="compare section">
        <div className="container">
          <SectionHead
            number="05"
            eyebrow="So sánh"
            title={
              <>
                Từng dòng.
                <br />
                <em>Không cần hỏi lại.</em>
              </>
            }
            lede="Những khác biệt thật sự giữa ba gói. Nếu một dòng không quan trọng với bạn, gói nhỏ hơn có lẽ đã đủ."
            sticker="chart"
          />

          <div className="compare-table" data-reveal>
            <div className="compare-table__head">
              <span className="mono">Hạng mục</span>
              {plans.map((plan) => (
                <span key={plan.id} className="compare-table__plan">
                  <strong>{plan.name}</strong>
                  <em className="mono">{plan.priceLabel}</em>
                </span>
              ))}
            </div>
            {compareRows.map((row) => (
              <div className="compare-table__row" key={row.label}>
                <span className="compare-table__label">{row.label}</span>
                {row.values.map((value, index) => (
                  <span
                    className={`compare-table__value${value === "—" ? " is-off" : ""}${
                      index === 1 ? " is-featured" : ""
                    }`}
                    key={`${row.label}-${index}`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="compare-callout" data-reveal>
            <Sticker name="spark" size={58} rotate={-6} />
            <div>
              <h3>Chưa chắc nên chọn gói nào?</h3>
              <p>
                Bắt đầu bằng Free. Khi log cho thấy agent của bạn cần S1 hoặc V1 thường xuyên,
                Plus sẽ rẻ hơn việc ghép nhiều nhà cung cấp. Khi vận hành không thể chờ, Ultral
                là mức cuối.
              </p>
            </div>
            <ButtonLink to="/register" variant="secondary" icon="arrow" iconSide="right">
              Bắt đầu miễn phí
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="pricing-faq section">
        <div className="container container--narrow">
          <SectionHead
            number="06"
            eyebrow="Hỏi đáp về giá"
            title={
              <>
                Tiền và hạn mức,
                <br />
                <em>nói rõ ngay.</em>
              </>
            }
            lede="Không có điều khoản ẩn trong phần chân trang. Nếu còn thắc mắc, gửi email cho chúng tôi."
            sticker="coin"
          />
          <FAQ items={PRICING_FAQS} />
        </div>
      </section>

      <section className="cta cta--compact">
        <div className="container cta__grid">
          <div className="cta__copy">
            <span className="eyebrow eyebrow--plain" data-reveal>
              Bắt đầu / 4 phút
            </span>
            <h2 data-reveal>
              Thử trước.
              <br />
              <em>Trả tiền sau.</em>
            </h2>
            <p data-reveal>
              Gói Free không cần thẻ, không cần chờ duyệt. Tạo tài khoản, tạo key và gọi endpoint
              đầu tiên ngay hôm nay.
            </p>
            <div className="cta__actions" data-reveal>
              <ButtonLink to="/register" variant="light" size="lg" icon="key">
                Tạo tài khoản miễn phí
              </ButtonLink>
              <ButtonLink to="/docs" variant="ghost" size="lg" icon="book" iconSide="right">
                Đọc tài liệu
              </ButtonLink>
            </div>
          </div>
          <div className="cta__visual" data-reveal>
            <div className="cta__sticker-wrap">
              <Sticker name="coin" size={210} rotate={-8} />
              <Sticker name="spark" size={78} rotate={11} className="cta__spark" />
              <span className="cta__sticker-note mono">FREE / 0Đ</span>
            </div>
            <div className="cta__mini">
              <span className="mono">{SITE.domain}</span>
              <span className="mono">không cần thẻ</span>
            </div>
          </div>
        </div>
        <span className="cta__big-type" aria-hidden="true">
          VND
        </span>
      </section>
    </PageShell>
  );
}
