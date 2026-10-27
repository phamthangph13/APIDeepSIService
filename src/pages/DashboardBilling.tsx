import { useState } from "react";
import { Button, ButtonLink } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { DashboardShell } from "../components/DashboardShell";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PLANS, PLAN_BY_ID, type PlanId } from "../data/plans";
import type { User } from "../lib/auth";
import { formatDate, formatNumber, formatVnd } from "../lib/format";
import { getUsageSummary } from "../lib/usage";

export function DashboardBilling() {
  const { user } = useAuth();
  if (!user) {
    return (
      <DashboardShell title="Gói dịch vụ" section="billing">
        {null}
      </DashboardShell>
    );
  }
  return (
    <DashboardShell title="Gói dịch vụ" section="billing">
      <BillingContent user={user} />
    </DashboardShell>
  );
}

function BillingContent({ user }: { user: User }) {
  const { setPlan } = useAuth();
  const { push } = useToast();
  const [target, setTarget] = useState<PlanId | null>(null);
  const plan = PLAN_BY_ID[user.plan];
  const summary = getUsageSummary(user, 30);

  const created = new Date(user.createdAt);
  const cycleEnd = new Date(created);
  cycleEnd.setMonth(cycleEnd.getMonth() + 1);
  if (cycleEnd.getTime() < Date.now()) {
    cycleEnd.setTime(Date.now() + 1000 * 60 * 60 * 24 * 12);
  }

  const targetPlan = target ? PLAN_BY_ID[target] : null;

  const handleChange = () => {
    if (!target) return;
    setPlan(target);
    push(
      target === "free" ? "Đã chuyển về gói Free" : `Đã chọn gói ${PLAN_BY_ID[target].name}`,
      "success",
      target === "free"
        ? "Gói mới có hiệu lực ngay. Key hiện có vẫn hoạt động."
        : "Bản demo kích hoạt ngay, không phát sinh thanh toán.",
    );
    setTarget(null);
  };

  const invoices = [
    {
      id: "INV-2026-001",
      date: cycleEnd,
      amount: plan.price,
      status: "Đã thanh toán",
    },
    {
      id: "INV-2025-012",
      date: new Date(created.getTime() - 1000 * 60 * 60 * 24 * 30),
      amount: plan.price,
      status: "Đã thanh toán",
    },
    {
      id: "INV-2025-011",
      date: new Date(created.getTime() - 1000 * 60 * 60 * 24 * 60),
      amount: plan.price,
      status: "Đã thanh toán",
    },
  ];

  return (
    <div className="dash-page">
      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">Client / Gói dịch vụ</span>
          <h1>
            Trả cho phần <em>bạn dùng.</em>
          </h1>
          <p>
            Nâng cấp, hạ cấp hoặc hủy bất cứ lúc nào. Giá niêm yết bằng đồng Việt, đã bao gồm
            VAT. Không có phí nền tảng.
          </p>
        </div>
        <div className="dash-page__actions">
          <ButtonLink to="/pricing" variant="secondary" icon="coin" iconSide="right">
            So sánh gói
          </ButtonLink>
        </div>
      </header>

      <div className="billing-top">
        <section className="billing-current">
          <div className="billing-current__top">
            <span className="mono">Gói hiện tại</span>
            <Sticker name={plan.sticker} size={64} rotate={-6} />
          </div>
          <div className="billing-current__name">
            <h2>{plan.name}</h2>
            <span className="billing-current__badge">
              <span className="status-dot" /> đang hoạt động
            </span>
          </div>
          <p>{plan.tagline}</p>
          <div className="billing-current__price">
            <strong>{plan.priceLabel}</strong>
            <span>{plan.cadence}</span>
          </div>
          <div className="billing-current__meta">
            <div>
              <span className="mono">Chu kỳ hiện tại</span>
              <strong>
                {formatDate(created)} — {formatDate(cycleEnd)}
              </strong>
            </div>
            <div>
              <span className="mono">Hạn mức</span>
              <strong>{formatNumber(plan.monthlyTokens)} token / tháng</strong>
            </div>
            <div>
              <span className="mono">Đã dùng</span>
              <strong>
                {formatNumber(summary.totalTokens)} token ({Math.round(summary.usedRatio * 100)}%)
              </strong>
            </div>
          </div>
          <div className="dash-meter dash-meter--lg billing-current__meter">
            <span style={{ width: `${summary.usedRatio * 100}%` }} />
          </div>
          <div className="billing-current__actions">
            {plan.price > 0 ? (
              <Button
                variant="secondary"
                icon="arrow"
                iconSide="right"
                onClick={() => setTarget("free")}
              >
                Hủy gia hạn
              </Button>
            ) : (
              <ButtonLink to="/pricing" variant="primary" icon="bolt">
                Nâng cấp gói
              </ButtonLink>
            )}
            <Button
              variant="ghost"
              icon="external"
              onClick={() =>
                push("Hóa đơn", "info", "Bản demo chưa kết nối cổng thanh toán hoặc xuất PDF.")
              }
            >
              Tải hóa đơn
            </Button>
          </div>
        </section>

        <aside className="billing-side">
          <section className="dash-panel">
            <header className="dash-panel__head">
              <span className="mono">Phương thức thanh toán</span>
              <Sticker name="coin" size={36} rotate={-5} flat decorative />
            </header>
            <div className="payment-card">
              <span className="mono">Visa · demo</span>
              <strong>•••• •••• •••• 4242</strong>
              <div>
                <span>NGUYEN MINH ANH</span>
                <span>09/29</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              full
              icon="arrow"
              iconSide="right"
              onClick={() =>
                push("Chưa kết nối cổng thanh toán", "info", "Bản demo không lưu thông tin thẻ thật.")
              }
            >
              Cập nhật phương thức
            </Button>
            <p className="billing-side__fine">
              Thanh toán thật qua VNPay, Momo hoặc chuyển khoản. Bản demo không xử lý giao dịch.
            </p>
          </section>

          <section className="dash-panel billing-help">
            <Sticker name="chat" size={44} rotate={-6} />
            <h3>Cần hóa đơn VAT?</h3>
            <p>
              Plus và Ultral đều có hóa đơn VAT. Ultral có thêm hợp đồng dịch vụ và đầu mối hỗ
              trợ riêng.
            </p>
            <a href="mailto:support@deepsi.space" className="text-link">
              support@deepsi.space
              <Sticker name="external" size={17} flat decorative />
            </a>
          </section>
        </aside>
      </div>

      <section className="billing-plans">
        <div className="billing-plans__head">
          <div>
            <span className="eyebrow eyebrow--plain">Đổi gói</span>
            <h2>Ba mức, một hợp đồng.</h2>
            <p>Thay đổi có hiệu lực ngay. Phần chưa dùng được quy đổi theo tỷ lệ.</p>
          </div>
          <span className="mono">VND · đã gồm VAT</span>
        </div>

        <div className="billing-plan-grid">
          {PLANS.map((item) => {
            const current = item.id === user.plan;
            return (
              <article
                className={`billing-plan${current ? " is-current" : ""}${item.popular ? " is-popular" : ""}`}
                key={item.id}
              >
                <div className="billing-plan__top">
                  <span className="mono">
                    {item.id === "free" ? "01" : item.id === "plus" ? "02" : "03"}
                  </span>
                  <Sticker name={item.sticker} size={44} rotate={-5} flat decorative />
                </div>
                <h3>{item.name}</h3>
                <p>{item.tagline}</p>
                <div className="billing-plan__price">
                  <strong>{item.priceLabel}</strong>
                  <span>{item.cadence}</span>
                </div>
                <ul>
                  {item.features.slice(0, 4).map((feature) => (
                    <li key={feature}>
                      <Sticker name="check" size={15} flat decorative />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {current ? (
                  <span className="billing-plan__current">
                    <Sticker name="check" size={16} flat decorative /> Gói hiện tại
                  </span>
                ) : (
                  <Button
                    variant={item.id === "ultral" ? "primary" : "secondary"}
                    size="sm"
                    full
                    onClick={() => setTarget(item.id)}
                  >
                    {item.price > plan.price ? "Nâng cấp" : item.id === "free" ? "Chuyển về Free" : "Chọn gói"}
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="dash-panel billing-invoices">
        <header className="dash-panel__head">
          <div>
            <span className="mono">Lịch sử</span>
            <h2>Hóa đơn</h2>
          </div>
          <span className="mono">{invoices.length} hóa đơn</span>
        </header>
        <div className="invoice-table">
          <div className="invoice-table__head">
            <span className="mono">Mã</span>
            <span className="mono">Ngày</span>
            <span className="mono">Số tiền</span>
            <span className="mono">Trạng thái</span>
            <span />
          </div>
          {invoices.map((invoice) => (
            <div className="invoice-row" key={invoice.id}>
              <span className="mono">{invoice.id}</span>
              <span>{formatDate(invoice.date)}</span>
              <span>{invoice.amount === 0 ? "0đ" : formatVnd(invoice.amount)}</span>
              <span className="status-pill status-pill--ok">{invoice.status}</span>
              <button
                type="button"
                className="invoice-row__download"
                onClick={() =>
                  push("Chưa có PDF", "info", "Bản demo chưa kết nối hệ thống hóa đơn.")
                }
                aria-label={`Tải ${invoice.id}`}
              >
                <Sticker name="external" size={18} flat decorative />
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="dash-page__fine">
        Đây là bản demo. Thay đổi gói chỉ lưu trong trình duyệt và không phát sinh thanh toán.
      </p>

      <ConfirmModal
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={handleChange}
        title={
          target === "free"
            ? "Chuyển về gói Free?"
            : `Chọn gói ${targetPlan?.name ?? ""}?`
        }
        eyebrow="Client / Đổi gói"
        confirmLabel={target === "free" ? "Chuyển về Free" : `Xác nhận ${targetPlan?.name ?? ""}`}
        icon={target === "free" ? "lock" : "coin"}
        body={
          <>
            <p>
              {target === "free"
                ? "Gói Free có 10.000 token mỗi ngày và 5 API key. Các key vượt giới hạn sẽ cần thu hồi hoặc nâng cấp lại."
                : `Gói ${targetPlan?.name} có ${targetPlan?.quotaLabel}. Thay đổi có hiệu lực ngay trong bản demo.`}
            </p>
            {targetPlan && targetPlan.price > 0 ? (
              <p className="muted">
                Giá niêm yết {formatVnd(targetPlan.price)} {targetPlan.cadence}. Trong production,
                bạn sẽ được chuyển đến cổng thanh toán.
              </p>
            ) : null}
          </>
        }
      />
    </div>
  );
}
