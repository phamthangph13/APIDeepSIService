import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, ButtonLink, ExternalButtonLink } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { DashboardShell } from "../components/DashboardShell";
import { Modal } from "../components/Modal";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { usePlans } from "../context/PlansContext";
import { useToast } from "../context/ToastContext";
import { SITE } from "../data/site";
import type { Plan, PlanId } from "../data/plans";
import {
  cancelRenewal,
  completeMockPayment,
  createCheckout,
  downgradeToFree,
  fetchBillingOverview,
  fetchOrder,
  type Invoice,
  type OrderStatus,
  type PaymentCheckout,
  type PaymentOrder,
} from "../lib/billing";
import { errorMessage } from "../lib/api";
import { copyText, formatDate, formatDateTime, formatNumber, formatVnd } from "../lib/format";
import { emptyUsageSummary } from "../lib/usage";
import { useApiQuery } from "../lib/useApiQuery";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  expired: "Hết hạn",
  cancelled: "Đã hủy",
  failed: "Thất bại",
};

function statusClass(status: OrderStatus): string {
  if (status === "paid") return "ok";
  if (status === "pending") return "warn";
  return "off";
}

function planActionLabel(plan: Plan, current: Plan): string {
  if (plan.id === current.id) return "Gói hiện tại";
  if (plan.id === "free") return "Chuyển về Free";
  if (plan.price > current.price) return "Nâng cấp";
  return "Chọn gói";
}

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
      <BillingContent />
    </DashboardShell>
  );
}

function BillingContent() {
  const { user, refresh } = useAuth();
  const { plans, byId } = usePlans();
  const { push } = useToast();
  const [params, setParams] = useSearchParams();
  const { data: overview, loading, error, reload } = useApiQuery(fetchBillingOverview, []);
  const [target, setTarget] = useState<PlanId | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkout, setCheckout] = useState<PaymentCheckout | null>(null);
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [mockBusy, setMockBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const gatewayFormRef = useRef<HTMLFormElement>(null);

  const currentPlan = overview?.plan ?? (user ? byId[user.plan] ?? byId.free : byId.free);
  const usage = overview?.usage ?? emptyUsageSummary();
  const invoices = overview?.invoices ?? [];
  const pendingOrder = overview?.pendingOrder ?? null;
  const targetPlan = target ? byId[target] : null;
  const canCancelRenewal = currentPlan.price > 0 && !overview?.cancelAtPeriodEnd;

  useEffect(() => {
    const status = params.get("status");
    if (!status) return;
    if (status === "success") {
      push("Thanh toán thành công", "success", "DeepSI đang xác nhận giao dịch và kích hoạt gói.");
      void refresh();
      void reload();
      window.setTimeout(() => {
        void refresh();
        void reload();
      }, 4000);
    } else if (status === "cancel") {
      push("Đã hủy thanh toán", "info", "Đơn hàng vẫn ở trạng thái chờ nếu bạn muốn tiếp tục.");
    } else if (status === "error") {
      push("Thanh toán chưa hoàn tất", "error", "SePay báo giao dịch lỗi. Bạn có thể thử lại.");
    }
    const next = new URLSearchParams(params);
    next.delete("status");
    setParams(next, { replace: true });
  }, [params, setParams, push, refresh, reload]);

  const checkOrder = useCallback(
    async (orderId: string, notify = false): Promise<boolean> => {
      try {
        const fresh = await fetchOrder(orderId);
        setOrder(fresh);
        if (fresh.status === "paid") {
          setCheckout(null);
          push("Đã nhận thanh toán", "success", "Gói dịch vụ đã được kích hoạt.");
          await Promise.all([refresh(), reload()]);
          return true;
        }
        if (fresh.status === "expired" || fresh.status === "cancelled" || fresh.status === "failed") {
          if (notify) {
            push("Đơn không còn hiệu lực", "error", STATUS_LABEL[fresh.status]);
          }
          return false;
        }
        if (notify) {
          push("Chưa nhận được thanh toán", "info", "Hệ thống sẽ tự kiểm tra lại sau vài giây.");
        }
      } catch (err) {
        if (notify) push("Không kiểm tra được đơn", "error", errorMessage(err));
      }
      return false;
    },
    [push, refresh, reload],
  );

  useEffect(() => {
    if (!checkout || checkout.mode !== "bank_transfer") return;
    const orderId = checkout.order.id;
    let active = true;
    const tick = async () => {
      if (!active) return;
      const paid = await checkOrder(orderId);
      if (paid) active = false;
    };
    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [checkout, checkOrder]);

  const handleConfirmPlan = async () => {
    if (!target) return;
    setCheckoutBusy(true);
    try {
      if (target === "free") {
        await downgradeToFree();
        push("Đã chuyển về gói Free", "success", "Các API key hiện có vẫn hoạt động.");
        setTarget(null);
        await Promise.all([refresh(), reload()]);
        return;
      }
      const result = await createCheckout(target);
      setTarget(null);
      setOrder(result.order);
      setCheckout(result);
      if (result.mode === "none") {
        push("Cổng thanh toán chưa sẵn sàng", "error", "Vui lòng liên hệ hỗ trợ.");
        setCheckout(null);
      }
    } catch (err) {
      push("Không thể tạo đơn thanh toán", "error", errorMessage(err));
    } finally {
      setCheckoutBusy(false);
    }
  };

  const handleResumePending = async () => {
    if (!pendingOrder) return;
    setCheckoutBusy(true);
    try {
      const result = await createCheckout(pendingOrder.planId);
      setOrder(result.order);
      setCheckout(result);
    } catch (err) {
      push("Không thể mở lại đơn", "error", errorMessage(err));
    } finally {
      setCheckoutBusy(false);
    }
  };

  const handleMockComplete = async () => {
    if (!checkout) return;
    setMockBusy(true);
    try {
      await completeMockPayment(checkout.order.id);
      push("Đã hoàn tất thanh toán mô phỏng", "success", "Gói dịch vụ đã được kích hoạt.");
      setCheckout(null);
      await Promise.all([refresh(), reload()]);
    } catch (err) {
      push("Không thể hoàn tất thanh toán", "error", errorMessage(err));
    } finally {
      setMockBusy(false);
    }
  };

  const handleCancelRenewal = async () => {
    setCancelBusy(true);
    try {
      await cancelRenewal();
      push("Đã hủy gia hạn", "info", "Gói vẫn có hiệu lực đến hết kỳ đã thanh toán.");
      setCancelOpen(false);
      await Promise.all([refresh(), reload()]);
    } catch (err) {
      push("Không thể hủy gia hạn", "error", errorMessage(err));
    } finally {
      setCancelBusy(false);
    }
  };

  const submitGateway = () => {
    gatewayFormRef.current?.submit();
  };

  const copyValue = async (label: string, value: string) => {
    const ok = await copyText(value);
    push(ok ? `Đã sao chép ${label}` : "Không thể sao chép", ok ? "success" : "error");
  };

  const paymentModeLabel =
    overview?.paymentMode === "gateway"
      ? "SePay Payment Gateway"
      : overview?.paymentMode === "bank_transfer"
        ? "Chuyển khoản ngân hàng"
        : overview?.paymentMode === "mock"
          ? "Thanh toán mô phỏng (development)"
          : "Chưa cấu hình";

  const checkoutBank = checkout?.bankTransfer;
  const checkoutPlan = checkout ? byId[checkout.order.planId as PlanId] : null;

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
            VAT. Thanh toán được xử lý qua SePay.
          </p>
        </div>
        <div className="dash-page__actions">
          <ButtonLink to="/pricing" variant="secondary" icon="coin" iconSide="right">
            So sánh gói
          </ButtonLink>
        </div>
      </header>

      {error ? (
        <div className="dash-empty">
          <Sticker name="shield" size={90} rotate={-5} />
          <h2>Không tải được thông tin gói.</h2>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => void reload()}>
            Thử lại
          </Button>
        </div>
      ) : null}
      {loading && !overview ? (
        <div className="dash-empty">
          <Sticker name="spark" size={90} rotate={-5} />
          <h2>Đang tải gói dịch vụ…</h2>
          <p>Kết nối tới máy chủ DeepSI.</p>
        </div>
      ) : null}

      {pendingOrder ? (
        <div className="welcome-banner">
          <Sticker name="coin" size={52} rotate={-6} />
          <div>
            <strong>Đơn {pendingOrder.invoiceNumber} đang chờ thanh toán.</strong>
            <p>
              Số tiền {formatVnd(pendingOrder.amountVnd)} · hết hạn{" "}
              {formatDateTime(pendingOrder.expiresAt)}. Tiếp tục để lấy lại mã chuyển khoản hoặc
              mở cổng thanh toán.
            </p>
          </div>
          <Button variant="primary" size="sm" icon="coin" onClick={handleResumePending} disabled={checkoutBusy}>
            {checkoutBusy ? "Đang mở…" : "Tiếp tục thanh toán"}
          </Button>
        </div>
      ) : null}

      <div className="billing-top">
        <section className="billing-current">
          <div className="billing-current__top">
            <span className="mono">Gói hiện tại</span>
            <Sticker name={currentPlan.sticker} size={64} rotate={-6} />
          </div>
          <div className="billing-current__name">
            <h2>{currentPlan.name}</h2>
            <span className="billing-current__badge">
              <span className="status-dot" />{" "}
              {overview?.cancelAtPeriodEnd ? "sẽ dừng gia hạn" : "đang hoạt động"}
            </span>
          </div>
          <p>{currentPlan.tagline}</p>
          <div className="billing-current__price">
            <strong>{currentPlan.priceLabel}</strong>
            <span>{currentPlan.cadence}</span>
          </div>
          <div className="billing-current__meta">
            <div>
              <span className="mono">Chu kỳ hiện tại</span>
              <strong>
                {overview?.planStartedAt && overview.planExpiresAt
                  ? `${formatDate(overview.planStartedAt)} — ${formatDate(overview.planExpiresAt)}`
                  : currentPlan.price > 0
                    ? "Đang cập nhật"
                    : "Không có kỳ hạn"}
              </strong>
            </div>
            <div>
              <span className="mono">Hạn mức</span>
              <strong>{formatNumber(currentPlan.monthlyTokens)} token / tháng</strong>
            </div>
            <div>
              <span className="mono">Đã dùng</span>
              <strong>
                {formatNumber(usage.totalTokens)} token ({Math.round(usage.usedRatio * 100)}%)
              </strong>
            </div>
          </div>
          <div className="dash-meter dash-meter--lg billing-current__meter">
            <span style={{ width: `${Math.min(100, usage.usedRatio * 100)}%` }} />
          </div>
          <div className="billing-current__actions">
            {canCancelRenewal ? (
              <Button variant="secondary" icon="lock" onClick={() => setCancelOpen(true)}>
                Hủy gia hạn
              </Button>
            ) : currentPlan.price === 0 ? (
              <ButtonLink to="/pricing" variant="primary" icon="bolt">
                Nâng cấp gói
              </ButtonLink>
            ) : null}
            <ExternalButtonLink
              href={`mailto:${SITE.supportEmail}?subject=${encodeURIComponent("Yêu cầu hóa đơn VAT — DeepSI Agent")}`}
              variant="ghost"
              icon="external"
            >
              Yêu cầu hóa đơn VAT
            </ExternalButtonLink>
          </div>
        </section>

        <aside className="billing-side">
          <section className="dash-panel">
            <header className="dash-panel__head">
              <span className="mono">Phương thức thanh toán</span>
              <Sticker name="coin" size={36} rotate={-5} flat decorative />
            </header>
            <div className="payment-card">
              <span className="mono">SePay / VND</span>
              <strong>{paymentModeLabel}</strong>
              <div>
                <span>{overview?.paymentConfigured ? "Sẵn sàng" : "Chưa cấu hình"}</span>
                <span>{currentPlan.price > 0 ? "Gia hạn theo tháng" : "Miễn phí"}</span>
              </div>
            </div>
            {overview?.bankTransfer ? (
              <p className="billing-side__fine">
                {overview.bankTransfer.bankCode} · {overview.bankTransfer.accountNumber} ·{" "}
                {overview.bankTransfer.accountHolder}
              </p>
            ) : null}
            <p className="billing-side__fine">
              DeepSI không lưu thông tin thẻ. Giao dịch được xử lý và xác nhận bởi SePay qua
              webhook bảo mật.
            </p>
          </section>

          <section className="dash-panel billing-help">
            <Sticker name="chat" size={44} rotate={-6} />
            <h3>Cần hóa đơn VAT?</h3>
            <p>
              Plus và Ultral đều có hóa đơn VAT. Ultral có thêm hợp đồng dịch vụ và đầu mối hỗ
              trợ riêng.
            </p>
            <a href={`mailto:${SITE.supportEmail}`} className="text-link">
              {SITE.supportEmail}
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
            <p>
              Gói trả phí được kích hoạt sau khi SePay xác nhận thanh toán. Gói Free chuyển
              ngay lập tức.
            </p>
          </div>
          <span className="mono">VND · đã gồm VAT</span>
        </div>

        <div className="billing-plan-grid">
          {plans.map((item) => {
            const current = item.id === currentPlan.id;
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
                    disabled={checkoutBusy}
                  >
                    {planActionLabel(item, currentPlan)}
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
            <InvoiceRow invoice={invoice} key={invoice.id} />
          ))}
          {invoices.length === 0 ? (
            <div className="key-list__empty">
              <p>Chưa có hóa đơn. Hóa đơn xuất hiện sau khi bạn thanh toán gói trả phí.</p>
            </div>
          ) : null}
        </div>
      </section>

      <p className="dash-page__fine">
        Thanh toán được xử lý bởi SePay. Nếu trạng thái chưa cập nhật sau khi chuyển khoản, hệ
        thống sẽ tự kiểm tra lại trong vài giây.
      </p>

      <ConfirmModal
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={handleConfirmPlan}
        confirmDisabled={checkoutBusy}
        title={
          target === "free"
            ? "Chuyển về gói Free?"
            : `Chọn gói ${targetPlan?.name ?? ""}?`
        }
        eyebrow="Client / Đổi gói"
        confirmLabel={
          checkoutBusy
            ? "Đang xử lý…"
            : target === "free"
              ? "Chuyển về Free"
              : `Thanh toán ${targetPlan?.priceLabel ?? ""}`
        }
        icon={target === "free" ? "lock" : "coin"}
        body={
          <>
            <p>
              {target === "free"
                ? "Gói Free có hạn mức theo ngày và 5 API key. Các key vượt giới hạn sẽ cần thu hồi hoặc nâng cấp lại."
                : `Gói ${targetPlan?.name} có ${targetPlan?.quotaLabel}. Bạn sẽ được chuyển đến cổng thanh toán SePay để hoàn tất giao dịch.`}
            </p>
            {targetPlan && targetPlan.price > 0 ? (
              <p className="muted">
                Giá niêm yết {formatVnd(targetPlan.price)} {targetPlan.cadence}. Gói được kích
                hoạt sau khi SePay xác nhận thanh toán.
              </p>
            ) : null}
          </>
        }
      />

      <ConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelRenewal}
        confirmDisabled={cancelBusy}
        title="Hủy gia hạn gói?"
        eyebrow="Client / Gia hạn"
        confirmLabel={cancelBusy ? "Đang hủy…" : "Hủy gia hạn"}
        icon="lock"
        body={
          <>
            <p>
              Gói {currentPlan.name} vẫn có hiệu lực đến hết kỳ đã thanh toán. Sau đó tài khoản
              chuyển về Free và không tự động trừ tiền.
            </p>
            <p className="muted">Bạn có thể nâng cấp lại bất cứ lúc nào.</p>
          </>
        }
      />

      <Modal
        open={checkout !== null}
        onClose={() => {
          setCheckout(null);
          setOrder(null);
        }}
        eyebrow="Client / Thanh toán"
        title={checkoutPlan ? `Thanh toán gói ${checkoutPlan.name}` : "Thanh toán gói dịch vụ"}
        size="md"
        footer={
          checkout ? (
            <div className="modal-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setCheckout(null);
                  setOrder(null);
                }}
              >
                Đóng
              </Button>
              {checkout.mode === "gateway" ? (
                <Button variant="primary" onClick={submitGateway} icon="external">
                  Mở cổng thanh toán
                </Button>
              ) : checkout.mode === "bank_transfer" ? (
                <Button
                  variant="primary"
                  onClick={() => void checkOrder(checkout.order.id, true)}
                  icon="check"
                >
                  Tôi đã chuyển khoản
                </Button>
              ) : checkout.mode === "mock" ? (
                <Button
                  variant="primary"
                  onClick={handleMockComplete}
                  disabled={mockBusy}
                  icon="check"
                >
                  {mockBusy ? "Đang xác nhận…" : "Hoàn tất thanh toán mô phỏng"}
                </Button>
              ) : null}
            </div>
          ) : null
        }
      >
        {checkout ? (
          <div className="payment-order">
            <div className="payment-order__summary">
              <div>
                <span className="mono">Hóa đơn</span>
                <strong className="mono">{checkout.order.invoiceNumber}</strong>
              </div>
              <div>
                <span className="mono">Số tiền</span>
                <strong>{formatVnd(checkout.order.amountVnd)}</strong>
              </div>
              <div>
                <span className="mono">Mã thanh toán</span>
                <strong className="mono">{checkout.order.paymentCode}</strong>
              </div>
              <div>
                <span className="mono">Trạng thái</span>
                <span className={`status-pill status-pill--${statusClass(order?.status ?? checkout.order.status)}`}>
                  {STATUS_LABEL[order?.status ?? checkout.order.status]}
                </span>
              </div>
            </div>

            {checkout.mode === "gateway" ? (
              <>
                <p className="payment-note">
                  Bạn sẽ được chuyển đến trang thanh toán an toàn của SePay. Sau khi hoàn tất,
                  trình duyệt quay lại trang này và gói được kích hoạt tự động.
                </p>
                <form
                  ref={gatewayFormRef}
                  action={checkout.action}
                  method={checkout.method ?? "POST"}
                  target="_self"
                  style={{ display: "none" }}
                >
                  {Object.entries(checkout.fields ?? {}).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                  ))}
                </form>
              </>
            ) : null}

            {checkout.mode === "bank_transfer" && checkoutBank ? (
              <div className="payment-bank">
                <div className="payment-bank__qr">
                  <img src={checkoutBank.qrUrl} alt="Mã QR chuyển khoản SePay" />
                  <span className="mono">Quét mã để chuyển khoản</span>
                </div>
                <div className="payment-bank__details">
                  <div className="payment-bank__line">
                    <span className="mono">Ngân hàng</span>
                    <strong>{checkoutBank.bankName || checkoutBank.bankCode}</strong>
                  </div>
                  <div className="payment-bank__line">
                    <span className="mono">Số tài khoản</span>
                    <strong className="mono">{checkoutBank.accountNumber}</strong>
                    <button
                      type="button"
                      className="payment-copy"
                      onClick={() => void copyValue("số tài khoản", checkoutBank.accountNumber)}
                      aria-label="Sao chép số tài khoản"
                    >
                      <Sticker name="copy" size={16} flat decorative />
                    </button>
                  </div>
                  <div className="payment-bank__line">
                    <span className="mono">Chủ tài khoản</span>
                    <strong>{checkoutBank.accountHolder}</strong>
                  </div>
                  <div className="payment-bank__line">
                    <span className="mono">Số tiền</span>
                    <strong>{formatVnd(checkoutBank.amountVnd)}</strong>
                  </div>
                  <div className="payment-bank__line payment-bank__line--content">
                    <span className="mono">Nội dung chuyển khoản</span>
                    <strong className="mono">{checkoutBank.content}</strong>
                    <button
                      type="button"
                      className="payment-copy"
                      onClick={() => void copyValue("nội dung", checkoutBank.content)}
                      aria-label="Sao chép nội dung chuyển khoản"
                    >
                      <Sticker name="copy" size={16} flat decorative />
                    </button>
                  </div>
                  <p className="payment-note">
                    Nhập đúng nội dung <strong>{checkoutBank.content}</strong> để hệ thống tự
                    động đối soát. Đơn hết hạn lúc {formatDateTime(checkout.order.expiresAt)}.
                  </p>
                </div>
              </div>
            ) : null}

            {checkout.mode === "mock" ? (
              <p className="payment-note">
                Đây là chế độ mô phỏng dành cho môi trường phát triển. Bấm nút bên dưới để đánh
                dấu đơn đã thanh toán và kích hoạt gói ngay, không phát sinh giao dịch thật.
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  return (
    <div className="invoice-row">
      <span className="mono">{invoice.invoiceNumber}</span>
      <span>{formatDate(invoice.createdAt)}</span>
      <span>{formatVnd(invoice.amountVnd)}</span>
      <span className={`status-pill status-pill--${statusClass(invoice.status)}`}>
        {STATUS_LABEL[invoice.status]}
      </span>
      <a
        className="invoice-row__download"
        href={`mailto:${SITE.supportEmail}?subject=${encodeURIComponent(`Hóa đơn ${invoice.invoiceNumber}`)}`}
        aria-label={`Yêu cầu hóa đơn ${invoice.invoiceNumber}`}
        title="Yêu cầu hóa đơn VAT"
      >
        <Sticker name="external" size={18} flat decorative />
      </a>
    </div>
  );
}
