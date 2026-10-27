import type { Plan, PlanId } from "../data/plans";
import { PLAN_BY_ID } from "../data/plans";
import type { User } from "./auth";

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
  status: "200" | "429" | "500";
  endpoint: string;
};

function mulberry32(seed: number): () => number {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dayLabel(date: Date, range: number): string {
  if (range <= 7) {
    return new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
}

export function getUsageSummary(user: User, range = 30): UsageSummary {
  const plan: Plan = PLAN_BY_ID[user.plan as PlanId] ?? PLAN_BY_ID.free;
  const random = mulberry32(seedFromString(`${user.id}:${user.plan}:${range}`));
  const planFactor: Record<PlanId, number> = { free: 0.52, plus: 0.58, ultral: 0.61 };
  const baseRatio = planFactor[user.plan as PlanId] ?? 0.52;
  const quota = plan.monthlyTokens;
  const totalTarget = Math.round(quota * (baseRatio + random() * 0.12) * (range / 30));
  const rawWeights: number[] = [];
  for (let i = 0; i < range; i += 1) {
    const weekday = new Date(Date.now() - (range - i) * 86_400_000).getDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.72 : 1;
    rawWeights.push((0.65 + random() * 0.7) * weekendFactor);
  }
  const weightSum = rawWeights.reduce((sum, weight) => sum + weight, 0);
  const days: DayUsage[] = [];
  let assigned = 0;
  for (let i = 0; i < range; i += 1) {
    const date = new Date(Date.now() - (range - 1 - i) * 86_400_000);
    const tokens =
      i === range - 1 ? totalTarget - assigned : Math.round((rawWeights[i] / weightSum) * totalTarget);
    assigned += tokens;
    const inputShare = 0.62 + random() * 0.12;
    const input = Math.round(tokens * inputShare);
    const output = tokens - input;
    const tokensPerRequest = user.plan === "free" ? 340 : user.plan === "plus" ? 410 : 520;
    days.push({
      date: date.toISOString(),
      label: dayLabel(date, range),
      tokens,
      requests: Math.max(1, Math.round(tokens / (tokensPerRequest * (0.85 + random() * 0.3)))),
      input,
      output,
    });
  }

  const totalTokens = days.reduce((sum, day) => sum + day.tokens, 0);
  const totalRequests = days.reduce((sum, day) => sum + day.requests, 0);
  const inputTokens = days.reduce((sum, day) => sum + day.input, 0);
  const outputTokens = days.reduce((sum, day) => sum + day.output, 0);
  const avgLatency =
    user.plan === "free"
      ? 520 + Math.round(random() * 160)
      : user.plan === "plus"
        ? 310 + Math.round(random() * 120)
        : 230 + Math.round(random() * 90);
  const p95Latency = avgLatency + 280 + Math.round(random() * 180);
  const errorRate = 0.08 + random() * 0.62;

  const modelSpec: Array<{ id: string; name: string; share: number }> =
    user.plan === "free"
      ? [
          { id: "deepsi-m1", name: "DeepSI-M1", share: 0.68 },
          { id: "deepsi-e1", name: "DeepSI-E1", share: 0.32 },
        ]
      : user.plan === "plus"
        ? [
            { id: "deepsi-m1", name: "DeepSI-M1", share: 0.46 },
            { id: "deepsi-s1", name: "DeepSI-S1", share: 0.3 },
            { id: "deepsi-v1", name: "DeepSI-V1", share: 0.16 },
            { id: "deepsi-e1", name: "DeepSI-E1", share: 0.08 },
          ]
        : [
            { id: "deepsi-m1", name: "DeepSI-M1", share: 0.38 },
            { id: "deepsi-s1", name: "DeepSI-S1", share: 0.38 },
            { id: "deepsi-v1", name: "DeepSI-V1", share: 0.16 },
            { id: "deepsi-e1", name: "DeepSI-E1", share: 0.08 },
          ];

  const models = modelSpec.map((model) => ({
    ...model,
    tokens: Math.round(totalTokens * model.share),
    requests: Math.round(totalRequests * model.share),
  }));

  return {
    days,
    totalTokens,
    totalRequests,
    avgLatency,
    p95Latency,
    errorRate,
    models,
    quota,
    usedRatio: Math.min(1, totalTokens / Math.max(1, quota)),
    inputTokens,
    outputTokens,
  };
}

export function getTodayUsage(user: User): DayUsage {
  const summary = getUsageSummary(user, 1);
  return summary.days[0];
}

export function getRecentActivity(user: User): ActivityRow[] {
  const random = mulberry32(seedFromString(`${user.id}:activity`));
  const models =
    user.plan === "free"
      ? ["DeepSI-M1", "DeepSI-E1"]
      : ["DeepSI-S1", "DeepSI-M1", "DeepSI-V1", "DeepSI-E1"];
  const endpoints = ["/chat/completions", "/embeddings", "/chat/completions", "/chat/completions"];
  const rows: ActivityRow[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(Date.now() - i * 1000 * 60 * (i === 0 ? 8 : 47 + random() * 80));
    const statusRoll = random();
    rows.push({
      id: `act_${i}`,
      time: date.toISOString(),
      model: models[Math.floor(random() * models.length)],
      tokens: Math.round(220 + random() * 4200),
      latency: Math.round(210 + random() * 640),
      status: statusRoll > 0.965 ? "429" : statusRoll > 0.94 ? "500" : "200",
      endpoint: endpoints[Math.floor(random() * endpoints.length)],
    });
  }
  return rows;
}

export function getSparkline(user: User): number[] {
  const summary = getUsageSummary(user, 14);
  return summary.days.map((day) => day.tokens);
}
