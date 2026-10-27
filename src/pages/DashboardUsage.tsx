import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { DashboardShell } from "../components/DashboardShell";
import { Sticker } from "../components/Sticker";
import { UsageChart } from "../components/UsageChart";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PLAN_BY_ID } from "../data/plans";
import type { User } from "../lib/auth";
import {
  formatCompact,
  formatDate,
  formatNumber,
} from "../lib/format";
import { getUsageSummary } from "../lib/usage";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

export function DashboardUsage() {
  const { user } = useAuth();
  if (!user) {
    return (
      <DashboardShell title="Sử dụng" section="usage">
        {null}
      </DashboardShell>
    );
  }
  return (
    <DashboardShell title="Sử dụng" section="usage">
      <UsageContent user={user} />
    </DashboardShell>
  );
}

function UsageContent({ user }: { user: User }) {
  const [range, setRange] = useState<Range>(30);
  const summary = useMemo(() => getUsageSummary(user, range), [user, range]);
  const plan = PLAN_BY_ID[user.plan];
  const { push } = useToast();

  const exportCsv = () => {
    const header = "ngay,token,request,input,output";
    const rows = summary.days.map(
      (day) => `${day.date.slice(0, 10)},${day.tokens},${day.requests},${day.input},${day.output}`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deepsi-usage-${range}d.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    push("Đã xuất CSV", "success", `${summary.days.length} ngày sử dụng.`);
  };

  const recentDays = [...summary.days].reverse().slice(0, 14);
  const maxDay = Math.max(1, ...summary.days.map((day) => day.tokens));

  return (
    <div className="dash-page">
      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">Client / Sử dụng</span>
          <h1>
            Bạn đã tiêu <em>bao nhiêu?</em>
          </h1>
          <p>
            Token, request, độ trễ và lỗi — theo ngày và theo mô hình. Số liệu được tổng hợp từ
            log của tài khoản.
          </p>
        </div>
        <div className="dash-page__actions">
          <Button variant="secondary" icon="chart" onClick={exportCsv}>
            Xuất CSV
          </Button>
          <Button
            variant="ghost"
            icon="external"
            onClick={() =>
              push("Bảng điều khiển sự cố", "info", "Bản demo chưa kết nối trang trạng thái.")
            }
          >
            Trạng thái hệ thống
          </Button>
        </div>
      </header>

      <div className="usage-toolbar">
        <div className="segmented segmented--sm" role="group" aria-label="Khoảng thời gian">
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
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

      <div className="dash-stats dash-stats--usage">
        <article className="dash-stat">
          <div className="dash-stat__top">
            <span className="mono">Tổng token</span>
            <Sticker name="bolt" size={32} rotate={-5} flat decorative />
          </div>
          <strong>{formatCompact(summary.totalTokens)}</strong>
          <span className="dash-stat__sub">
            {Math.round(summary.usedRatio * 100)}% hạn mức tháng
          </span>
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
          <span className="dash-stat__sub">chủ yếu 429 · không có 5xx</span>
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
            <span className="mono">cao nhất {formatCompact(Math.max(...summary.days.map((d) => d.tokens)))}</span>
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
            <span className="mono">Hạn mức tháng</span>
            <strong>{formatCompact(plan.monthlyTokens)}</strong>
            <em>token</em>
          </div>
          <div>
            <span className="mono">Còn lại</span>
            <strong>{formatCompact(Math.max(0, plan.monthlyTokens - summary.totalTokens))}</strong>
            <em>token</em>
          </div>
        </div>
      </section>

      <div className="dash-grid dash-grid--usage">
        <section className="dash-panel">
          <header className="dash-panel__head">
            <div>
              <span className="mono">Phân bổ</span>
              <h2>Theo mô hình</h2>
            </div>
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
          </div>
          <div className="model-usage__note">
            <Sticker name="nodes" size={30} rotate={-5} flat decorative />
            <p>
              M1 chiếm phần lớn request. Nếu agent cần suy luận nhiều bước, thử S1 cho các tác
              vụ đã xác định.
            </p>
          </div>
        </section>

        <section className="dash-panel">
          <header className="dash-panel__head">
            <div>
              <span className="mono">Theo ngày</span>
              <h2>14 ngày gần nhất</h2>
            </div>
          </header>
          <div className="usage-days">
            <div className="usage-days__head">
              <span className="mono">Ngày</span>
              <span className="mono">Token</span>
              <span className="mono">Request</span>
            </div>
            {recentDays.map((day) => (
              <div className="usage-days__row" key={day.date}>
                <span>{formatDate(day.date)}</span>
                <span className="usage-days__tokens">
                  <i style={{ width: `${Math.max(4, (day.tokens / maxDay) * 100)}%` }} />
                  <em>{formatCompact(day.tokens)}</em>
                </span>
                <span>{formatNumber(day.requests)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="usage-note">
        <Sticker name="lock" size={36} rotate={-5} flat decorative />
        <div>
          <strong>Log được giữ {user.plan === "free" ? "7" : user.plan === "plus" ? "30" : "90"} ngày.</strong>
          <p>
            Bạn có thể tắt log nội dung trong phần gói dịch vụ. Số liệu token và độ trễ vẫn
            được giữ để tính hạn mức.
          </p>
        </div>
        <span className="mono">retention / {user.plan}</span>
      </div>
    </div>
  );
}
