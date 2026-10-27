import { useState } from "react";
import type { DayUsage } from "../lib/usage";
import { formatCompact, formatNumber } from "../lib/format";

type UsageChartProps = {
  data: DayUsage[];
  range: number;
  className?: string;
};

const W = 900;
const H = 300;
const PAD = { top: 18, right: 14, bottom: 40, left: 54 };

export function UsageChart({ data, range, className = "" }: UsageChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((day) => day.tokens));
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const slot = chartW / Math.max(1, data.length);
  const barW = Math.max(3, slot * (range > 30 ? 0.5 : 0.62));
  const labelStep = range <= 7 ? 1 : range <= 30 ? 5 : 15;

  const active = hover !== null ? data[hover] : null;

  return (
    <div className={`usage-chart${className ? ` ${className}` : ""}`}>
      <div className="usage-chart__canvas">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Biểu đồ token theo ngày trong ${range} ngày`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PAD.top + chartH * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="var(--line)"
                  strokeDasharray="2 6"
                />
                <text x={PAD.left - 10} y={y + 4} textAnchor="end" className="chart-axis">
                  {ratio === 0 ? "0" : formatCompact(max * ratio)}
                </text>
              </g>
            );
          })}

          {data.map((day, index) => {
            const height = Math.max(2, (day.tokens / max) * chartH);
            const x = PAD.left + index * slot + (slot - barW) / 2;
            const y = PAD.top + chartH - height;
            const isActive = hover === index;
            return (
              <g
                key={day.date}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${day.label}: ${formatNumber(day.tokens)} token, ${formatNumber(day.requests)} request`}
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={height}
                  rx={2}
                  fill={isActive ? "var(--clay)" : "var(--moss)"}
                />
                <rect x={x - 4} y={PAD.top} width={barW + 8} height={chartH} fill="transparent" />
              </g>
            );
          })}

          {data.map((day, index) =>
            index % labelStep === 0 ? (
              <text
                key={`label-${day.date}`}
                x={PAD.left + index * slot + slot / 2}
                y={H - 14}
                textAnchor="middle"
                className="chart-axis"
              >
                {day.label}
              </text>
            ) : null,
          )}

          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + chartH}
            y2={PAD.top + chartH}
            stroke="var(--line-strong)"
          />
        </svg>
      </div>

      {active ? (
        <div
          className="usage-chart__tip"
          style={{
            left: `${((PAD.left + (hover ?? 0) * slot + slot / 2) / W) * 100}%`,
          }}
        >
          <span className="mono">{active.label}</span>
          <strong>{formatNumber(active.tokens)} token</strong>
          <span>{formatNumber(active.requests)} request</span>
        </div>
      ) : null}

      <div className="usage-chart__legend">
        <span>
          <i className="legend-swatch legend-swatch--moss" /> Token
        </span>
        <span className="mono">di chuột để xem chi tiết</span>
      </div>
    </div>
  );
}
