import { PLAN_BY_ID, type Plan, type PlanId } from "../data/plans";
import { api } from "./api";

export type ApiPlan = {
  id: string;
  name: string;
  price_vnd: number;
  price_label: string;
  cadence: string;
  tagline: string;
  description: string;
  quota_label: string;
  monthly_tokens: number;
  daily_tokens: number;
  key_limit: number;
  retention_days: number;
  features?: string[];
};

const PLAN_IDS: PlanId[] = ["free", "plus", "ultral"];

export function mapApiPlan(raw: ApiPlan): Plan {
  const id = PLAN_IDS.includes(raw.id as PlanId) ? (raw.id as PlanId) : "free";
  const presentation = PLAN_BY_ID[id];
  return {
    ...presentation,
    id,
    name: raw.name || presentation.name,
    price: raw.price_vnd,
    priceLabel: raw.price_label || presentation.priceLabel,
    cadence: raw.cadence || presentation.cadence,
    tagline: raw.tagline || presentation.tagline,
    description: raw.description || presentation.description,
    quotaLabel: raw.quota_label || presentation.quotaLabel,
    monthlyTokens: raw.monthly_tokens,
    dailyTokens: raw.daily_tokens,
    keyLimit: raw.key_limit > 0 ? raw.key_limit : Number.POSITIVE_INFINITY,
    retentionDays: raw.retention_days,
    features: raw.features?.length ? raw.features : presentation.features,
  };
}

export async function fetchPlans(): Promise<Plan[]> {
  const plans = await api.get<ApiPlan[]>("/plans");
  return plans.map(mapApiPlan);
}
