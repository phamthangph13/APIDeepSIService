export type PlanId = "free" | "plus" | "ultral";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  cadence: string;
  tagline: string;
  description: string;
  sticker: "spark" | "bolt" | "star";
  accent: "sage" | "moss" | "paper";
  popular?: boolean;
  quotaLabel: string;
  monthlyTokens: number;
  dailyTokens: number;
  keyLimit: number;
  retentionDays: number;
  features: string[];
  notIncluded?: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "0đ",
    cadence: "mãi mãi",
    tagline: "Đủ để một agent bắt đầu.",
    description:
      "Dành cho sinh viên, side project và những ý tưởng cần được thử trước khi cam kết.",
    sticker: "spark",
    accent: "sage",
    quotaLabel: "10.000 token/ngày",
    monthlyTokens: 300_000,
    dailyTokens: 10_000,
    keyLimit: 5,
    retentionDays: 7,
    features: [
      "10.000 token mỗi ngày",
      "5 API key miễn phí",
      "2 mô hình: M1 và E1",
      "Log yêu cầu trong 7 ngày",
      "Tương thích OpenAI SDK",
      "Hỗ trợ qua cộng đồng",
    ],
    notIncluded: ["Mô hình S1 và V1", "Ưu tiên xử lý"],
    cta: "Bắt đầu miễn phí",
  },
  {
    id: "plus",
    name: "Plus",
    price: 1_499_000,
    priceLabel: "1.499.000đ",
    cadence: "/ tháng",
    tagline: "Cho sản phẩm đang có người dùng.",
    description:
      "Mức phổ biến cho team nhỏ, SaaS và các agent đã qua giai đoạn thử nghiệm.",
    sticker: "bolt",
    accent: "moss",
    popular: true,
    quotaLabel: "2.000.000 token/tháng",
    monthlyTokens: 2_000_000,
    dailyTokens: 70_000,
    keyLimit: 20,
    retentionDays: 30,
    features: [
      "2.000.000 token mỗi tháng",
      "20 API key miễn phí",
      "Tất cả mô hình S1, M1, V1, E1",
      "Ưu tiên xử lý",
      "Log yêu cầu trong 30 ngày",
      "Hỗ trợ email trong 24 giờ",
      "Tool calling & JSON mode",
    ],
    cta: "Chọn Plus",
  },
  {
    id: "ultral",
    name: "Ultral",
    price: 2_499_000,
    priceLabel: "2.499.000đ",
    cadence: "/ tháng",
    tagline: "Khi agent là một phần của vận hành.",
    description:
      "Cho hệ thống chạy liên tục, khối lượng lớn và những yêu cầu không thể chờ.",
    sticker: "star",
    accent: "paper",
    quotaLabel: "5.000.000 token/tháng",
    monthlyTokens: 5_000_000,
    dailyTokens: 180_000,
    keyLimit: Number.POSITIVE_INFINITY,
    retentionDays: 90,
    features: [
      "5.000.000 token mỗi tháng",
      "API key không giới hạn",
      "Tất cả mô hình + mô hình beta",
      "Ưu tiên cao nhất",
      "Log yêu cầu trong 90 ngày",
      "Hỗ trợ Slack / Telegram",
      "SLA 99,9% & báo cáo sự cố",
      "Hóa đơn VAT, hợp đồng dịch vụ",
    ],
    cta: "Chọn Ultral",
  },
];

export const PLAN_BY_ID = Object.fromEntries(PLANS.map((plan) => [plan.id, plan])) as Record<
  PlanId,
  Plan
>;

export function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}
