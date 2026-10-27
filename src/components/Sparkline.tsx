type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

export function Sparkline({ values, width = 240, height = 64, className = "" }: SparklineProps) {
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - 6 - ((value - min) / range) * (height - 12);
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  const last = points[points.length - 1];

  return (
    <svg
      className={`sparkline${className ? ` ${className}` : ""}`}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Xu hướng sử dụng 14 ngày gần nhất"
    >
      <polygon points={area} fill="var(--moss)" opacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--moss)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last ? <circle cx={last[0]} cy={last[1]} r="3" fill="var(--clay)" /> : null}
    </svg>
  );
}
