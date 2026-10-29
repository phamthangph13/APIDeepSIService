import { useState } from "react";
import { AdminShell } from "../components/AdminShell";
import { Button } from "../components/Button";
import { Sticker } from "../components/Sticker";
import { UsageChart } from "../components/UsageChart";
import { fetchAdminUsage } from "../lib/admin";
import { formatCompact, formatDate, formatNumber } from "../lib/format";
import { emptyUsageSummary } from "../lib/usage";
import { useApiQuery } from "../lib/useApiQuery";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

export function AdminUsage() {
  return (
    <AdminShell title="Sử dụng" section="usage">
      <AdminUsageContent />
    </AdminShell>
  );
}

function AdminUsageContent() {
  const [range, setRange] = useState<Range>(30);
  const { data, loading, error, reload } = useApiQuery(() => fetchAdminUsage(range), [range]);
  const summary = data ?? emptyUsageSummary();
  const maxTokens = Math.max(1, ...summary.days.map((day) => day.tokens));

  return (
    <div className="dash-page">
      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">Admin / Sử dụng</span>
          <h1>
            Lưu lượng <em>toàn hệ thống.</em>
          </h1>
          <p>
            Token, request, độ trễ và lỗi trên toàn bộ người dùng. Khoảng thời gian được tính theo
            múi giờ vận hành của DeepSI.
          </p>
        </div>
        <div className="dash-page__actions">
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            Làm mới
          </Button>
        </div>
      </header>

      <div className="usage-toolbar">
        <div className="segmented segmented--sm" role="group" aria-label="Khoảng thời gian">
          {RANGES.map((item) => (
            <button
              type="button"
              key={item}
              className={`segmented__item${range === item ? " is-active" : ""}`}
              onClick={() => setRange(item)}
            >
              <span>{item} ngày</span>
            </button>
          ))}
        </div>
        <span className="mono usage-toolbar__note">
          {formatDate(summary.days[0]?.date ?? new Date())} —{" "}
          {formatDate(summary.days[summary.days.length - 1]?.date ?? new Date())}
        </span>
      </div>

      {error ? (
        <div className="dash-empty">
          <Sticker name="shield" size={90} rotate={-5} />
          <h2>Không tải được usage toàn hệ thống.</h2>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => void reload()}>
            Thử lại
          </Button>
        </div>
      ) : null}
      {loading && !data ? (
        <div className="dash-empty">
          <Sticker name="spark" size={90} rotate={-5} />
          <h2>Đang tổng hợp usage…</h2>
          <p>Kết nối tới admin API của DeepSI.</p>
        </div>
      ) : null}

      <div className="dash-stats dash-stats--usage">
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Tổng token</span>
            <Sticker name="bolt" size={32} rotate={-5} flat decorative />
          </div>
          <strong>{formatCompact(summary.totalTokens)}</strong>
          <span className="dash-stat__sub">trong {range} ngày</span>
        </article>
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Request</span>
            <Sticker name="plane" size={32} rotate={5} flat decorative />
          </div>
          <strong>{formatCompact(summary.totalRequests)}</strong>
          <span className="dash-stat__sub">
            ~{Math.round(summary.totalTokens / Math.max(1, summary.totalRequests))} token / request
          </span>
        </article>
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Độ trễ p95</span>
            <Sticker name="chart" size={32} rotate={-4} flat decorative />
          </div>
          <strong>{summary.p95Latency}ms</strong>
          <span className="dash-stat__sub">trung bình {summary.avgLatency}ms</span>
        </article>
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Tỷ lệ lỗi</span>
            <Sticker name="shield" size={32} rotate={5} flat decorative />
          </div>
          <strong>{summary.errorRate.toFixed(2)}%</strong>
          <span className="dash-stat__sub">request có status từ 400 trở lên</span>
        </article>
      </div>

      <section className="dash-panel dash-panel--chart">
        <header className="dash-panel__head">
          <div>
            <span className="mono">Biểu đồ / {range} ngày</span>
            <h2>Token theo ngày</h2>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-swatch legend-swatch--moss" /> token
            </span>
            <span className="mono">cao nhất {formatCompact(maxTokens)}</span>
          </div>
        </header>
        <UsageChart data={summary.days} range={range} />
        <div className="chart-foot">
          <div>
            <span className="mono">Input</span>
            <strong>{formatCompact(summary.inputTokens)}</strong>
            <em>token</em>
          </div>
          <div>
            <span className="mono">Output</span>
            <strong>{formatCompact(summary.outputTokens)}</strong>
            <em>token</em>
          </div>
          <div>
            <span className="mono">Ngày có dữ liệu</span>
            <strong>{summary.days.filter((day) => day.requests > 0).length}</strong>
            <em>ngày</em>
          </div>
          <div>
            <span className="mono">Model hoạt động</span>
            <strong>{summary.models.length}</strong>
            <em>model</em>
          </div>
        </div>
      </section>

      <section className="dash-panel">
        <header className="dash-panel__head">
          <div>
            <span className="mono">Phân bổ</span>
            <h2>Theo mô hình</h2>
          </div>
          <span className="mono">{formatNumber(summary.totalTokens)} token</span>
        </header>
        <div className="model-usage">
          {summary.models.map((model) => (
            <div className="model-usage__row" key={model.id}>
              <div className="model-usage__top">
                <strong>{model.name}</strong>
                <span className="mono">{Math.round(model.share * 100)}%</span>
              </div>
              <div className="model-usage__bar">
                <span style={{ width: `${model.share * 100}%` }} />
              </div>
              <div className="model-usage__meta">
                <span>{formatNumber(model.tokens)} token</span>
                <span>{formatNumber(model.requests)} request</span>
              </div>
            </div>
          ))}
          {summary.models.length === 0 ? (
            <div className="key-list__empty">
              <p>Chưa có dữ liệu mô hình trong khoảng thời gian này.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
