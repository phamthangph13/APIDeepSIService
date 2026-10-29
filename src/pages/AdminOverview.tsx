import { AdminShell } from "../components/AdminShell";
import { Button, ButtonLink } from "../components/Button";
import { Sticker } from "../components/Sticker";
import { usePlans } from "../context/PlansContext";
import { fetchAdminStats } from "../lib/admin";
import { formatCompact, formatDateTime, formatNumber, formatVnd } from "../lib/format";
import { useApiQuery } from "../lib/useApiQuery";

export function AdminOverview() {
  return (
    <AdminShell title="Tổng quan" section="overview">
      <AdminOverviewContent />
    </AdminShell>
  );
}

function AdminOverviewContent() {
  const { data, loading, error, reload } = useApiQuery(fetchAdminStats, []);
  const { byId } = usePlans();

  if (error) {
    return (
      <div className="dash-empty">
        <Sticker name="shield" size={90} rotate={-5} />
        <h2>Không tải được số liệu admin.</h2>
        <p>{error}</p>
        <Button variant="secondary" onClick={() => void reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="dash-empty">
        <Sticker name="spark" size={90} rotate={-5} />
        <h2>Đang tổng hợp hệ thống…</h2>
        <p>Kết nối tới admin API của DeepSI.</p>
      </div>
    );
  }

  if (!data) return null;

  const plans = ["free", "plus", "ultral"] as const;

  return (
    <div className="dash-page">
      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">Admin / Tổng quan</span>
          <h1>
            Toàn cảnh <em>hệ thống.</em>
          </h1>
          <p>
            Người dùng, doanh thu, đơn hàng và lưu lượng token trong một màn hình. Số liệu được
            tổng hợp trực tiếp từ admin API.
          </p>
        </div>
        <div className="dash-page__actions">
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            Làm mới
          </Button>
          <ButtonLink to="/admin/users" variant="primary" icon="user" iconSide="right">
            Quản lý người dùng
          </ButtonLink>
        </div>
      </header>

      <div className="dash-stats">
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Người dùng</span>
            <Sticker name="user" size={32} rotate={-5} flat decorative />
          </div>
          <strong>{formatNumber(data.usersTotal)}</strong>
          <span className="dash-stat__sub">tài khoản client và admin</span>
        </article>
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">API key hoạt động</span>
            <Sticker name="key" size={32} rotate={5} flat decorative />
          </div>
          <strong>{formatNumber(data.activeKeys)}</strong>
          <span className="dash-stat__sub">key chưa thu hồi trên toàn hệ thống</span>
        </article>
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Doanh thu tháng</span>
            <Sticker name="coin" size={32} rotate={-4} flat decorative />
          </div>
          <strong>{formatVnd(data.revenueMonth)}</strong>
          <span className="dash-stat__sub">giao dịch đã thanh toán trong tháng</span>
        </article>
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Đơn chờ xử lý</span>
            <Sticker name="plane" size={32} rotate={4} flat decorative />
          </div>
          <strong>{formatNumber(data.pendingOrders)}</strong>
          <span className="dash-stat__sub">đơn hàng đang ở trạng thái pending</span>
        </article>
      </div>

      <div className="admin-kpi-strip">
        <div>
          <span className="mono">Token / 30 ngày</span>
          <strong>{formatCompact(data.tokens30d)}</strong>
        </div>
        <div>
          <span className="mono">Request / 30 ngày</span>
          <strong>{formatCompact(data.requests30d)}</strong>
        </div>
        <div>
          <span className="mono">Tỷ lệ token / request</span>
          <strong>
            {formatNumber(data.tokens30d / Math.max(1, data.requests30d))} token
          </strong>
        </div>
        <div>
          <span className="mono">Cập nhật lúc</span>
          <strong>{formatDateTime(data.generatedAt)}</strong>
        </div>
      </div>

      <div className="admin-overview-grid">
        <section className="dash-panel">
          <header className="dash-panel__head">
            <div>
              <span className="mono">Phân bổ</span>
              <h2>Người dùng theo gói</h2>
            </div>
            <span className="mono">{data.currency}</span>
          </header>
          <div className="admin-plan-list">
            {plans.map((planId) => {
              const count = data.usersByPlan[planId] ?? 0;
              const ratio = data.usersTotal > 0 ? (count / data.usersTotal) * 100 : 0;
              return (
                <div className="admin-plan-row" key={planId}>
                  <div className="admin-plan-row__top">
                    <strong>{byId[planId]?.name ?? planId}</strong>
                    <span className="mono">
                      {formatNumber(count)} · {Math.round(ratio)}%
                    </span>
                  </div>
                  <div className="admin-meter">
                    <span style={{ width: `${Math.min(100, ratio)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dash-panel">
          <header className="dash-panel__head">
            <div>
              <span className="mono">Lối tắt</span>
              <h2>Vận hành</h2>
            </div>
            <Sticker name="nodes" size={34} rotate={-5} flat decorative />
          </header>
          <div className="admin-shortcuts">
            <ButtonLink to="/admin/users" variant="secondary" full icon="user">
              Người dùng &amp; quyền
            </ButtonLink>
            <ButtonLink to="/admin/orders" variant="secondary" full icon="coin">
              Đơn hàng &amp; thanh toán
            </ButtonLink>
            <ButtonLink to="/admin/usage" variant="secondary" full icon="chart">
              Usage toàn hệ thống
            </ButtonLink>
            <ButtonLink to="/docs" variant="ghost" full icon="book">
              API documentation
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
