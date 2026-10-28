import {
  LLM_BASE_URL,
  PARENT_DOMAIN,
  PARENT_URL,
  SECURITY_EMAIL,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_NAME,
  SUPPORT_EMAIL,
} from "../lib/env";
import type { StickerName } from "./stickers";

export const SITE = {
  name: SITE_NAME,
  parent: PARENT_DOMAIN,
  parentUrl: PARENT_URL,
  domain: SITE_DOMAIN,
  baseUrl: LLM_BASE_URL,
  email: SITE_EMAIL,
  supportEmail: SUPPORT_EMAIL,
  securityEmail: SECURITY_EMAIL,
  status: "Tất cả hệ thống hoạt động",
  tagline: "Bộ não cho agent của bạn.",
  description:
    "API LLM tương thích OpenAI cho agent, trợ lý và hệ thống tự động. Một khóa, nhiều mô hình, tính bằng đồng Việt.",
} as const;

export type MenuItem = {
  number: string;
  label: string;
  short: string;
  description: string;
  href: string;
  sticker: StickerName;
  quote: string;
  meta: string;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    number: "01",
    label: "Tổng quan",
    short: "Một endpoint cho mọi agent",
    description:
      `DeepSI Agent là lớp suy luận của ${SITE.parent}: một API tương thích OpenAI, đặt tại Việt Nam, cho mọi hệ thống cần thêm khả năng suy nghĩ.`,
    href: "/#tong-quan",
    sticker: "spark",
    quote: "Agent không cần thêm một dashboard. Nó cần một lời gọi hàm đáng tin.",
    meta: "Service 02 / Inference",
  },
  {
    number: "02",
    label: "Năng lực",
    short: "Routing, tool calling, vision",
    description:
      "Một hợp đồng API cho bốn mô hình: suy luận sâu, phản hồi nhanh, thị giác và embedding. Đổi model bằng một dòng JSON.",
    href: "/#nang-luc",
    sticker: "nodes",
    quote: "Bốn mô hình. Một hợp đồng API. Không cần viết lại lớp tích hợp.",
    meta: "Models / S1 · M1 · V1 · E1",
  },
  {
    number: "03",
    label: "Tích hợp",
    short: "Từ zero đến agent trong 4 dòng",
    description:
      "Đổi base URL, dán API key và gọi endpoint. SDK OpenAI, LangChain, LlamaIndex và hầu hết client hiện có đều chạy được.",
    href: "/#tich-hop",
    sticker: "terminal",
    quote: "Không cần học một SDK mới. Chỉ cần đổi một dòng base URL.",
    meta: "Quickstart / 4 phút",
  },
  {
    number: "04",
    label: "Bảng giá",
    short: "Free, Plus và Ultral",
    description:
      "Bắt đầu miễn phí, nâng cấp khi agent có người dùng thật. Giá niêm yết bằng đồng Việt, không có phí ẩn.",
    href: "/pricing",
    sticker: "coin",
    quote: "Trả cho phần bạn dùng. Không trả cho một cụm GPU đang ngủ.",
    meta: "Pricing / VND",
  },
  {
    number: "05",
    label: "Tài liệu",
    short: "API reference & quickstart",
    description:
      "Endpoint, xác thực, streaming, tool calling và xử lý lỗi. Tất cả trong một trang, không cần rời khỏi tab.",
    href: "/docs",
    sticker: "book",
    quote: "Tài liệu tốt là tài liệu bạn không phải mở ticket để hỏi.",
    meta: "Docs / v1",
  },
  {
    number: "06",
    label: "Client",
    short: "Quản lý key & usage",
    description:
      "Tạo API key miễn phí, xem token đã dùng, quản lý gói và theo dõi độ trễ. Tất cả trong một workspace gọn gàng.",
    href: "/dashboard",
    sticker: "key",
    quote: "API key miễn phí trên mọi gói. Không cần thẻ để bắt đầu.",
    meta: "Console / Client",
  },
];

export const CAPABILITIES = [
  {
    number: "01",
    title: "Một endpoint, mọi mô hình",
    body: "Đổi giữa S1, M1, V1 và E1 bằng đúng một trường trong JSON. Không viết lại lớp tích hợp, không quản lý bốn SDK.",
    note: "Model routing / một hợp đồng API",
    sticker: "nodes" as StickerName,
    tone: "moss" as const,
    span: "wide" as const,
  },
  {
    number: "02",
    title: "Tương thích OpenAI",
    body: "Giữ nguyên SDK, client và thói quen hiện có. Chỉ đổi base URL và dán key DeepSI.",
    note: "Drop-in / OpenAI-compatible",
    sticker: "plug" as StickerName,
    tone: "paper" as const,
    span: "narrow" as const,
  },
  {
    number: "03",
    title: "Dữ liệu ở lại Việt Nam",
    body: "Hạ tầng đặt tại Việt Nam, log có thể tắt, dữ liệu không dùng để huấn luyện. Những câu hỏi khó về compliance có câu trả lời rõ ràng.",
    note: "Data residency / không train",
    sticker: "shield" as StickerName,
    tone: "sage" as const,
    span: "narrow" as const,
  },
  {
    number: "04",
    title: "Tính tiền theo token",
    body: "Không phí nền tảng, không hợp đồng tối thiểu. Bạn thấy số token trước khi trả tiền và có thể đặt hạn mức cho từng key.",
    note: "Metered / minh bạch",
    sticker: "coin" as StickerName,
    tone: "clay" as const,
    span: "wide" as const,
  },
];

export const STEPS = [
  {
    number: "01",
    title: "Tạo tài khoản",
    body: "Email, Google hoặc GitHub. Không cần thẻ, không cần chờ duyệt.",
    sticker: "user" as StickerName,
  },
  {
    number: "02",
    title: "Tạo API key",
    body: "Đặt tên, chọn quyền, giới hạn hạn mức. Key miễn phí trên mọi gói.",
    sticker: "key" as StickerName,
  },
  {
    number: "03",
    title: "Gọi endpoint",
    body: "Đổi base URL trong SDK hiện tại. Agent của bạn bắt đầu suy nghĩ.",
    sticker: "plane" as StickerName,
  },
];

export const USE_CASES = [
  {
    title: "SaaS có trợ lý",
    body: "Thêm một trợ lý biết đọc dữ liệu, gọi công cụ và trả lời trong ngữ cảnh sản phẩm.",
    sticker: "cube" as StickerName,
    label: "Product",
  },
  {
    title: "CSKH tự động",
    body: "Phân loại ticket, tóm tắt hội thoại và soạn câu trả lời trước khi chuyển cho người thật.",
    sticker: "chat" as StickerName,
    label: "Support",
  },
  {
    title: "Công cụ nội bộ",
    body: "Agent đọc tài liệu, tra bảng, chạy quy trình và trả kết quả về Slack hoặc email.",
    sticker: "terminal" as StickerName,
    label: "Ops",
  },
  {
    title: "Nghiên cứu & RAG",
    body: "Embedding ổn định, cửa sổ ngữ cảnh lớn và một endpoint để thử nghiệm nhanh.",
    sticker: "search" as StickerName,
    label: "Research",
  },
];

export const FAQS = [
  {
    q: "DeepSI Agent có phải là một công ty khác không?",
    a: `Không. Đây là dịch vụ hạ tầng thuộc ${SITE.parent}, cùng đội ngũ và cùng triết lý: đưa công cụ AI đến gần người xây dựng Việt Nam hơn. ${SITE.domain} là mặt tiền dành riêng cho API và agent.`,
  },
  {
    q: "Tôi có cần thẻ tín dụng để bắt đầu?",
    a: "Không. Gói Free không yêu cầu thẻ. Bạn có thể tạo tài khoản, tạo API key và gọi thử ngay trong vài phút.",
  },
  {
    q: "API có tương thích với OpenAI SDK không?",
    a: `Có. DeepSI Agent giữ cùng cấu trúc request/response cho chat completions, streaming và tool calling. Bạn chỉ cần đổi base URL thành ${SITE.baseUrl} và dùng key DeepSI.`,
  },
  {
    q: "Dữ liệu của tôi được xử lý ở đâu?",
    a: "Hạ tầng đặt tại Việt Nam. Dữ liệu không được dùng để huấn luyện mô hình. Với gói Plus và Ultral, bạn có thể tắt log yêu cầu hoàn toàn; log của Free được giữ 7 ngày để bạn tra lỗi.",
  },
  {
    q: "Tôi có thể tạo bao nhiêu API key?",
    a: "Free: 5 key. Plus: 20 key. Ultral: không giới hạn. Mọi gói đều cho tạo key miễn phí, không tính thêm phí trên mỗi key.",
  },
  {
    q: "Nếu vượt hạn mức token thì sao?",
    a: "Yêu cầu sẽ tạm dừng, không tự động trừ thêm tiền. Bạn có thể nâng cấp gói, mua thêm hạn mức hoặc đặt giới hạn riêng cho từng API key để kiểm soát chi phí.",
  },
  {
    q: "Có hỗ trợ hóa đơn VAT không?",
    a: "Có. Plus và Ultral đều có thể xuất hóa đơn VAT. Ultral có thêm hợp đồng dịch vụ và đầu mối hỗ trợ riêng qua Slack hoặc Telegram.",
  },
];

export const STATS = [
  { value: "3", label: "vùng hạ tầng", note: "Hà Nội · Đà Nẵng · TP.HCM" },
  { value: "99,9%", label: "uptime cam kết", note: "SLA cho Ultral" },
  { value: "< 400ms", label: "độ trễ p50", note: "M1, prompt ngắn" },
  { value: "24/7", label: "giám sát", note: "không có giờ nghỉ" },
];
