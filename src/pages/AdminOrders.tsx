import { useState } from "react";
import { AdminShell } from "../components/AdminShell";
import { Button } from "../components/Button";
import { Sticker } from "../components/Sticker";
import { usePlans } from "../context/PlansContext";
import { listAdminOrders } from "../lib/admin";
import type { OrderStatus } from "../lib/billing";
import { formatDateTime, formatVnd } from "../lib/format";
import { useApiQuery } from "../lib/useApiQuery";

const LIMIT = 20;

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

export function AdminOrders() {
  return (
    <AdminShell title="Đơn hàng" section="orders">
      <AdminOrdersContent />
    </AdminShell>
  );
}

function AdminOrdersContent() {
  const { byId } = usePlans();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [offset, setOffset] = useState(0);
  const { data, loading, error, reload } = useApiQuery(
    () => listAdminOrders({ status, limit: LIMIT, offset }),
    [status, offset],
  );

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = Math.floor(offset / LIMIT) + 1;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="dash-page">
      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">Admin / Đơn hàng</span>
          <h1>
            Thanh toán &amp; <em>doanh thu.</em>
          </h1>
          <p>
            Theo dõi toàn bộ đơn hàng SePay, trạng thái thanh toán và lịch sử giao dịch trên hệ
            thống.
          </p>
        </div>
        <div className="dash-page__actions">
          <label className="admin-field admin-field--inline">
            <span className="mono">Trạng thái</span>
            <select
              value={status}
              onChange={(event) => {
                setOffset(0);
                setStatus(event.target.value as OrderStatus | "");
              }}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="expired">Hết hạn</option>
              <option value="cancelled">Đã hủy</option>
              <option value="failed">Thất bại</option>
            </select>
          </label>
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            Làm mới
          </Button>
        </div>
      </header>

      {error ? (
        <div className="dash-empty">
          <Sticker name="shield" size={90} rotate={-5} />
          <h2>Không tải được đơn hàng.</h2>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => void reload()}>
            Thử lại
          </Button>
        </div>
      ) : null}

      <section className="admin-table">
        <div className="admin-table__head admin-orders-grid">
          <span className="mono">Hóa đơn</span>
          <span className="mono">Gói</span>
          <span className="mono">Số tiền</span>
          <span className="mono">Trạng thái</span>
          <span className="mono">Provider</span>
          <span className="mono">Tạo lúc</span>
          <span className="mono">Thanh toán</span>
        </div>
        {orders.map((order) => (
          <div className="admin-table__row admin-orders-grid" key={order.id}>
            <div className="admin-order-cell">
              <strong className="mono">{order.invoiceNumber}</strong>
              <span className="mono">{order.paymentCode}</span>
            </div>
            <span className="admin-cell-text">{byId[order.planId as keyof typeof byId]?.name ?? order.planId}</span>
            <span className="admin-cell-text mono">{formatVnd(order.amountVnd)}</span>
            <span className={`status-pill status-pill--${statusClass(order.status)}`}>
              {STATUS_LABEL[order.status]}
            </span>
            <span className="admin-cell-text mono">{order.provider}</span>
            <span className="admin-cell-text">{formatDateTime(order.createdAt)}</span>
            <span className="admin-cell-text">
              {order.paidAt ? formatDateTime(order.paidAt) : "—"}
            </span>
          </div>
        ))}
        {!loading && orders.length === 0 ? (
          <div className="key-list__empty">
            <p>Không có đơn hàng phù hợp bộ lọc.</p>
          </div>
        ) : null}
        {loading && orders.length === 0 ? (
          <div className="key-list__empty">
            <p>Đang tải đơn hàng…</p>
          </div>
        ) : null}
      </section>

      <div className="admin-pagination">
        <span className="mono">
          Trang {page} / {pages} · {total} đơn hàng
        </span>
        <div>
          <Button
            variant="secondary"
            size="sm"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
          >
            Trước
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={offset + LIMIT >= total || loading}
            onClick={() => setOffset(offset + LIMIT)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
