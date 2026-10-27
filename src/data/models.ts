import type { StickerName } from "./stickers";

export type Model = {
  id: string;
  name: string;
  role: string;
  context: string;
  summary: string;
  bestFor: string;
  sticker: StickerName;
  plans: string;
  tone: "moss" | "clay" | "sage" | "paper";
};

export const MODELS: Model[] = [
  {
    id: "deepsi-s1",
    name: "DeepSI-S1",
    role: "Suy luận sâu",
    context: "128K",
    summary:
      "Mô hình chủ lực cho agent nhiều bước. Biết lập kế hoạch, gọi công cụ và tự kiểm tra trước khi trả lời.",
    bestFor: "Phân tích, lập kế hoạch, agent vận hành",
    sticker: "spark",
    plans: "Plus · Ultral",
    tone: "moss",
  },
  {
    id: "deepsi-m1",
    name: "DeepSI-M1",
    role: "Phản hồi nhanh",
    context: "64K",
    summary:
      "Độ trễ thấp cho chat, phân loại, trích xuất và những tác vụ cần xong trước khi người dùng kịp chớp mắt.",
    bestFor: "Chat, phân loại, trích xuất dữ liệu",
    sticker: "bolt",
    plans: "Free · Plus · Ultral",
    tone: "clay",
  },
  {
    id: "deepsi-v1",
    name: "DeepSI-V1",
    role: "Thị giác",
    context: "32K",
    summary:
      "Đọc ảnh, PDF và bảng biểu. Đưa tài liệu thật vào agent mà không cần một pipeline OCR riêng.",
    bestFor: "Ảnh, PDF, bảng biểu, hoá đơn",
    sticker: "eye",
    plans: "Plus · Ultral",
    tone: "sage",
  },
  {
    id: "deepsi-e1",
    name: "DeepSI-E1",
    role: "Embedding",
    context: "8K",
    summary:
      "Vector gọn và ổn định cho tìm kiếm ngữ nghĩa, RAG và phân cụm. Cùng một hợp đồng API với phần còn lại.",
    bestFor: "RAG, tìm kiếm, phân cụm",
    sticker: "nodes",
    plans: "Free · Plus · Ultral",
    tone: "paper",
  },
];
