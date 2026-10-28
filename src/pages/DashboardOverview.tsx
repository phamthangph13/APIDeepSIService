import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, ButtonLink } from "../components/Button";
import { DashboardShell } from "../components/DashboardShell";
import { Sparkline } from "../components/Sparkline";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { usePlans } from "../context/PlansContext";
import { useToast } from "../context/ToastContext";
import { SITE } from "../data/site";
import type { User } from "../lib/auth";
import { listApiKeys } from "../lib/auth";
import {
  copyText,
  formatCompact,
  formatDate,
  formatNumber,
  formatRelative,
  greeting,
  maskKey,
} from "../lib/format";
import {
  emptyUsageSummary,
  getRecentActivity,
  getTodayUsage,
  getUsageSummary,
} from "../lib/usage";
import { useApiQuery } from "../lib/useApiQuery";

export function DashboardOverview() {
  const { user } = useAuth();
  if (!user) {
    return (
      <DashboardShell title="Tổng quan" section="overview">
        {null}
      </DashboardShell>
    );
  }
  return (
    <DashboardShell title="Tổng quan" section="overview">
      <OverviewContent user={user} />
    </DashboardShell>
  );
}

function OverviewContent({ user }: { user: User }) {
  const { byId } = usePlans();
  const { data, loading, error, reload } = useApiQuery(async () => {
    const [summary, today, activity, keys] = await Promise.all([
      getUsageSummary(30),
      getTodayUsage(),
      getRecentActivity(7),
      listApiKeys(),
    ]);
    return { summary, today, activity, keys };
  }, []);

  const summary = data?.summary ?? emptyUsageSummary();
  const today = data?.today.days.at(-1) ?? {
    date: "",
    label: "",
    tokens: 0,
    requests: 0,
    input: 0,
    output: 0,
  };
  const activity = data?.activity ?? [];
  const keys = data?.keys ?? [];
  const sparkline = useMemo(() => summary.days.map((day) => day.tokens), [summary.days]);
  const plan = byId[user.plan] ?? byId.free;
  const { push } = useToast();
  const [params] = useSearchParams();
  const [welcome, setWelcome] = useState(params.get("welcome") === "1");
  const [copied, setCopied] = useState(false);
  const activeKeys = keys.filter((key) => key.status === "active");

  const dateLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handleCopy = async () => {
    const ok = await copyText(SITE.baseUrl);
    setCopied(ok);
    push(ok ? "Đã sao chép base URL" : "Không thể sao chép", ok ? "success" : "error");
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="dash-page">
      {welcome ? (
        <div className="welcome-banner">
          <Sticker name="spark" size={52} rotate={-6} />
          <div>
            <strong>Chào mừng đến {SITE.name}.</strong>
            <p>
              Tài khoản đã sẵn sàng. Tạo API key đầu tiên, dán base URL và gọi endpoint — mất
              khoảng bốn phút.
            </p>
          </div>
          <ButtonLink to="/dashboard/keys?create=1" variant="primary" size="sm" icon="key">
            Tạo key đầu tiên
          </ButtonLink>
          <button
            type="button"
            className="welcome-banner__close"
            onClick={() => setWelcome(false)}
            aria-label="Đóng lời chào"
          >
            <Sticker name="plus" size={18} rotate={45} flat decorative />
          </button>
        </div>
      ) : null}

      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">
            {greeting()} / {dateLabel}
          </span>
          <h1>
            {user.name.split(" ").slice(-1)[0]}, <em>hôm nay thế nào?</em>
          </h1>
          <p>
            Đây là trạng thái agent của bạn trong 30 ngày gần nhất. Số liệu được đồng bộ từ máy
            chủ DeepSI.
          </p>
        </div>
        <div className="dash-page__actions">
          <ButtonLink to="/dashboard/keys?create=1" variant="primary" icon="key">
            Tạo API key
          </ButtonLink>
          <ButtonLink to="/docs" variant="secondary" icon="book" iconSide="right">
            Tài liệu
          </ButtonLink>
        </div>
      </header>

      {error ? (
        <div className="dash-empty">
          <Sticker name="shield" size={90} rotate={-5} />
          <h2>Không tải được dữ liệu client.</h2>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => void reload()}>
            Thử lại
          </Button>
        </div>
      ) : null}
      {loading && !data ? (
        <div className="dash-empty">
          <Sticker name="spark" size={90} rotate={-5} />
          <h2>Đang tải dữ liệu…</h2>
          <p>Kết nối tới máy chủ DeepSI.</p>
        </div>
      ) : null}

      <div className="dash-stats">
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Token hôm nay</span>
            <Sticker name="bolt" size={34} rotate={-5} flat decorative />
          </div>
          <strong>{formatCompact(today.tokens)}</strong>
          <span className="dash-stat__sub">
            / {formatCompact(plan.dailyTokens)} token · {formatNumber(today.requests)} request
          </span>
          <div className="dash-meter">
            <span
              style={{
                width: `${plan.dailyTokens > 0 ? Math.min(100, (today.tokens / plan.dailyTokens) * 100) : 0}%`,
              }}
            />
          </div>
        </article>

        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Request / 30 ngày</span>
            <Sticker name="chart" size={34} rotate={5} flat decorative />
          </div>
          <strong>{formatCompact(summary.totalRequests)}</strong>
          <span className="dash-stat__sub">
            {formatCompact(summary.totalTokens)} token đã xử lý
          </span>
          <Sparkline values={sparkline} width={220} height={42} />
        </article>

        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Độ trễ p95</span>
            <Sticker name="plane" size={34} rotate={-6} flat decorative />
          </div>
          <strong>{summary.p95Latency}ms</strong>
          <span className="dash-stat__sub">trung bình {summary.avgLatency}ms</span>
          <span className="dash-stat__flag">
            <span className="status-dot" /> theo log 30 ngày
          </span>
        </article>

        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Tỷ lệ lỗi</span>
            <Sticker name="shield" size={34} rotate={5} flat decorative />
          </div>
          <strong>{summary.errorRate.toFixed(2)}%</strong>
          <span className="dash-stat__sub">tính trên toàn bộ request 30 ngày</span>
          <span className="dash-stat__flag dash-stat__flag--muted">
            <Sticker name="check" size={15} flat decorative /> dữ liệu từ usage log
          </span>
        </article>
      </div>

      <div className="dash-grid dash-grid--overview">
        <section className="dash-panel dash-panel--usage">
          <header className="dash-panel__head">
            <div>
              <span className="mono">Usage / 30 ngày</span>
              <h2>Token theo ngày</h2>
            </div>
            <Link to="/dashboard/usage" className="text-link">
              Xem chi tiết
              <Sticker name="arrow" size={18} rotate={-15} flat decorative />
            </Link>
          </header>
          <div className="overview-chart">
            <Sparkline values={sparkline} width={760} height={170} />
            <div className="overview-chart__axis">
              <span className="mono">30 ngày trước</span>
              <span className="mono">hôm nay</span>
            </div>
          </div>
          <div className="overview-chart__legend">
            <div>
              <span className="mono">Đã dùng</span>
              <strong>{formatNumber(summary.totalTokens)}</strong>
              <em>token / 30 ngày</em>
            </div>
            <div>
              <span className="mono">Hạn mức tháng</span>
              <strong>{formatNumber(plan.monthlyTokens)}</strong>
              <em>token</em>
            </div>
            <div>
              <span className="mono">Còn lại</span>
              <strong>{formatNumber(Math.max(0, plan.monthlyTokens - summary.totalTokens))}</strong>
              <em>token</em>
            </div>
          </div>
        </section>

        <aside className="dash-side">
          <section className="dash-panel dash-panel--plan">
            <header className="dash-panel__head">
              <span className="mono">Gói hiện tại</span>
              <Sticker name={plan.sticker} size={42} rotate={-6} flat decorative />
            </header>
            <div className="plan-summary">
              <h2>{plan.name}</h2>
              <p>{plan.tagline}</p>
              <div className="plan-summary__price">
                <strong>{plan.priceLabel}</strong>
                <span>{plan.cadence}</span>
              </div>
            </div>
            <div className="plan-summary__quota">
              <div>
                <span className="mono">Đã dùng tháng này</span>
                <strong>{Math.round(summary.usedRatio * 100)}%</strong>
              </div>
              <div className="dash-meter dash-meter--lg">
                <span style={{ width: `${summary.usedRatio * 100}%` }} />
              </div>
              <p>
                {formatNumber(summary.totalTokens)} / {formatNumber(plan.monthlyTokens)} token
              </p>
            </div>
            <ButtonLink to="/dashboard/billing" variant="secondary" size="sm" full icon="coin">
              Quản lý gói
            </ButtonLink>
          </section>

          <section className="dash-panel dash-panel--endpoint">
            <header className="dash-panel__head">
              <span className="mono">Endpoint</span>
              <span className="status-dot" />
            </header>
            <div className="endpoint-box">
              <span className="method method--post">POST</span>
              <code>{SITE.baseUrl.replace(/^https?:\/\//, "")}</code>
              <button type="button" onClick={handleCopy} aria-label="Sao chép base URL">
                <Sticker name={copied ? "check" : "copy"} size={20} flat decorative />
              </button>
            </div>
            <p className="endpoint-note">
              OpenAI-compatible. Đổi base URL trong SDK hiện tại và dùng key DeepSI.
            </p>
            <Link to="/docs#quickstart" className="text-link">
              Xem quickstart
              <Sticker name="arrow" size={18} rotate={-15} flat decorative />
            </Link>
          </section>
        </aside>
      </div>

      <div className="dash-grid dash-grid--lower">
        <section className="dash-panel">
          <header className="dash-panel__head">
            <div>
              <span className="mono">Hoạt động gần đây</span>
              <h2>Request cuối</h2>
            </div>
            <Link to="/dashboard/usage" className="text-link">
              Tất cả
              <Sticker name="arrow" size={18} rotate={-15} flat decorative />
            </Link>
          </header>
          <div className="activity-table">
            <div className="activity-table__head">
              <span className="mono">Thời gian</span>
              <span className="mono">Mô hình</span>
              <span className="mono">Token</span>
              <span className="mono">Độ trễ</span>
              <span className="mono">Trạng thái</span>
            </div>
            {activity.map((row) => (
              <div className="activity-row" key={row.id}>
                <span className="mono">{formatRelative(row.time)}</span>
                <span>
                  <strong>{row.model}</strong>
                  <em className="mono">{row.endpoint}</em>
                </span>
                <span>{formatNumber(row.tokens)}</span>
                <span>{row.latency}ms</span>
                <span className={`status-pill status-pill--${row.status < 400 ? "ok" : "warn"}`}>
                  {row.status}
                </span>
              </div>
            ))}
            {activity.length === 0 ? (
              <div className="key-list__empty">
                <p>Chưa có request nào. Gọi endpoint đầu tiên để thấy log tại đây.</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="dash-panel">
          <header className="dash-panel__head">
            <div>
              <span className="mono">API keys</span>
              <h2>{activeKeys.length} key đang hoạt động</h2>
            </div>
            <Link to="/dashboard/keys" className="text-link">
              Quản lý
              <Sticker name="arrow" size={18} rotate={-15} flat decorative />
            </Link>
          </header>
          <div className="mini-keys">
            {keys.slice(0, 3).map((key) => (
              <div className="mini-key" key={key.id}>
                <Sticker name="key" size={30} rotate={-4} flat decorative />
                <div>
                  <strong>{key.name}</strong>
                  <span className="mono">{maskKey(key)}</span>
                </div>
                <span
                  className={`status-pill status-pill--${key.status === "active" ? "ok" : "off"}`}
                >
                  {key.status === "active" ? "active" : "revoked"}
                </span>
              </div>
            ))}
            {keys.length === 0 ? (
              <div className="mini-keys__empty">
                <p>Chưa có key nào. Tạo key đầu tiên để bắt đầu.</p>
                <ButtonLink to="/dashboard/keys?create=1" variant="primary" size="sm" icon="key">
                  Tạo API key
                </ButtonLink>
              </div>
            ) : null}
          </div>
          <div className="dash-tip">
            <Sticker name="lock" size={30} rotate={-5} flat decorative />
            <p>
              Đặt hạn mức riêng cho từng key để một agent lỗi không đốt hết hạn mức của hệ
              thống.
            </p>
          </div>
        </section>
      </div>

      <div className="dash-onboard">
        <div className="dash-onboard__head">
          <span className="eyebrow eyebrow--plain">Bắt đầu / 3 bước</span>
          <h2>Một buổi chiều là đủ.</h2>
          <p>
            Nếu đây là lần đầu, đây là đường ngắn nhất từ tài khoản mới đến request đầu tiên.
          </p>
        </div>
        <div className="dash-onboard__steps">
          <div>
            <span className="mono">01</span>
            <Sticker name="key" size={40} rotate={-6} flat decorative />
            <strong>Tạo API key</strong>
            <p>Chọn môi trường, quyền và hạn mức. Key chỉ hiện đầy đủ một lần.</p>
            <Link to="/dashboard/keys?create=1">Tạo key</Link>
          </div>
          <div>
            <span className="mono">02</span>
            <Sticker name="terminal" size={40} rotate={5} flat decorative />
            <strong>Dán base URL</strong>
            <p>Giữ nguyên SDK OpenAI. Chỉ đổi base URL và dùng key DeepSI.</p>
            <Link to="/docs#quickstart">Xem quickstart</Link>
          </div>
          <div>
            <span className="mono">03</span>
            <Sticker name="chart" size={40} rotate={-4} flat decorative />
            <strong>Theo dõi usage</strong>
            <p>Xem token, độ trễ và lỗi theo ngày. Đặt cảnh báo trước khi chạm hạn mức.</p>
            <Link to="/dashboard/usage">Xem usage</Link>
          </div>
        </div>
      </div>

      <p className="dash-page__fine">
        Tài khoản tạo ngày {formatDate(user.createdAt)} · Dữ liệu được đồng bộ từ máy chủ
        DeepSI.
      </p>
    </div>
  );
}
