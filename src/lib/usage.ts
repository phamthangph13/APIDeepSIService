import { api } from "./api";

export type DayUsage = {
  date: string;
  label: string;
  tokens: number;
  requests: number;
  input: number;
  output: number;
};

export type ModelUsage = {
  id: string;
  name: string;
  share: number;
  tokens: number;
  requests: number;
};

export type UsageSummary = {
  days: DayUsage[];
  totalTokens: number;
  totalRequests: number;
  avgLatency: number;
  p95Latency: number;
  errorRate: number;
  models: ModelUsage[];
  quota: number;
  usedRatio: number;
  inputTokens: number;
  outputTokens: number;
};

export type ActivityRow = {
  id: string;
  time: string;
  model: string;
  tokens: number;
  latency: number;
  status: number;
  endpoint: string;
};

export type ApiUsageSummary = {
  days?: Array<{
    date: string;
    label: string;
    tokens: number;
    requests: number;
    input: number;
    output: number;
  }>;
  total_tokens?: number;
  total_requests?: number;
  avg_latency_ms?: number;
  p95_latency_ms?: number;
  error_rate?: number;
  models?: Array<{
    id: string;
    name: string;
    share: number;
    tokens: number;
    requests: number;
  }>;
  quota?: number;
  used_ratio?: number;
  input_tokens?: number;
  output_tokens?: number;
};

type ApiActivityRow = {
  id: string;
  time: string;
  model: string;
  tokens: number;
  latency_ms: number;
  status: number;
  endpoint: string;
};

export function mapUsageSummary(raw: ApiUsageSummary): UsageSummary {
  return {
    days: (raw.days ?? []).map((day) => ({
      date: day.date,
      label: day.label,
      tokens: day.tokens,
      requests: day.requests,
      input: day.input,
      output: day.output,
    })),
    totalTokens: raw.total_tokens ?? 0,
    totalRequests: raw.total_requests ?? 0,
    avgLatency: raw.avg_latency_ms ?? 0,
    p95Latency: raw.p95_latency_ms ?? 0,
    errorRate: raw.error_rate ?? 0,
    models: (raw.models ?? []).map((model) => ({
      id: model.id,
      name: model.name,
      share: model.share,
      tokens: model.tokens,
      requests: model.requests,
    })),
    quota: raw.quota ?? 0,
    usedRatio: raw.used_ratio ?? 0,
    inputTokens: raw.input_tokens ?? 0,
    outputTokens: raw.output_tokens ?? 0,
  };
}

export function emptyUsageSummary(): UsageSummary {
  return {
    days: [],
    totalTokens: 0,
    totalRequests: 0,
    avgLatency: 0,
    p95Latency: 0,
    errorRate: 0,
    models: [],
    quota: 0,
    usedRatio: 0,
    inputTokens: 0,
    outputTokens: 0,
  };
}

export async function getUsageSummary(range: 7 | 30 | 90): Promise<UsageSummary> {
  return mapUsageSummary(await api.get<ApiUsageSummary>(`/usage?range=${range}`));
}

export async function getTodayUsage(): Promise<UsageSummary> {
  return mapUsageSummary(await api.get<ApiUsageSummary>("/usage/today"));
}

export async function getRecentActivity(limit = 7): Promise<ActivityRow[]> {
  const rows = await api.get<ApiActivityRow[]>(`/usage/activity?limit=${limit}`);
  return rows.map((row) => ({
    id: row.id,
    time: row.time,
    model: row.model,
    tokens: row.tokens,
    latency: row.latency_ms,
    status: row.status,
    endpoint: row.endpoint,
  }));
}
