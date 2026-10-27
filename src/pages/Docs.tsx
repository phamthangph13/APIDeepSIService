import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ButtonLink } from "../components/Button";
import { CodeBlock, CodeTabs } from "../components/CodeBlock";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { Sticker } from "../components/Sticker";
import { MODELS } from "../data/models";
import { SITE } from "../data/site";
import { copyText } from "../lib/format";
import { useToast } from "../context/ToastContext";

const QUICKSTART_CURL = `curl ${SITE.baseUrl}/chat/completions \\
  -H "Authorization: Bearer $DEEPSI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepsi-m1",
    "messages": [
      { "role": "user", "content": "Xin chào, bạn là ai?" }
    ]
  }'`;

const QUICKSTART_TS = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSI_API_KEY,
  baseURL: "${SITE.baseUrl}",
});

const response = await client.chat.completions.create({
  model: "deepsi-m1",
  messages: [{ role: "user", content: "Xin chào, bạn là ai?" }],
});

console.log(response.choices[0].message.content);`;

const QUICKSTART_PY = `from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["DEEPSI_API_KEY"],
    base_url="${SITE.baseUrl}",
)

response = client.chat.completions.create(
    model="deepsi-m1",
    messages=[{"role": "user", "content": "Xin chào, bạn là ai?"}],
)

print(response.choices[0].message.content)`;

const AUTH_CODE = `Authorization: Bearer dsi_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`;

const STREAM_TS = `const stream = await client.chat.completions.create({
  model: "deepsi-s1",
  messages: [{ role: "user", content: "Lập kế hoạch kiểm kê kho." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`;

const RESPONSE_JSON = `{
  "id": "chatcmpl_dsi_9f2c1a",
  "object": "chat.completion",
  "created": 1772006400,
  "model": "deepsi-m1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Tôi là DeepSI Agent, một API LLM..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 42,
    "total_tokens": 60
  }
}`;

const TOOL_REQUEST = `{
  "model": "deepsi-s1",
  "messages": [
    { "role": "system", "content": "Bạn là agent vận hành kho." },
    { "role": "user", "content": "Còn bao nhiêu SKU-1042 ở Hà Nội?" }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "inventory_lookup",
        "description": "Tra tồn kho theo SKU và kho.",
        "parameters": {
          "type": "object",
          "properties": {
            "sku": { "type": "string" },
            "warehouse": { "type": "string" }
          },
          "required": ["sku"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}`;

const TOOL_RESPONSE = `{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_dsi_01",
            "type": "function",
            "function": {
              "name": "inventory_lookup",
              "arguments": "{\\"sku\\":\\"SKU-1042\\",\\"warehouse\\":\\"HAN\\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}`;

const EMBEDDING_CODE = `const embedding = await client.embeddings.create({
  model: "deepsi-e1",
  input: ["Chính sách đổi trả trong 30 ngày."],
  dimensions: 1024,
});

console.log(embedding.data[0].embedding.length); // 1024`;

const ERROR_JSON = `{
  "error": {
    "type": "rate_limit_exceeded",
    "code": "daily_quota_exhausted",
    "message": "Hạn mức token hôm nay của gói Free đã hết.",
    "request_id": "req_dsi_7a41c9"
  }
}`;

const CHAPTERS = [
  { id: "quickstart", number: "01", label: "Bắt đầu" },
  { id: "authentication", number: "02", label: "Xác thực" },
  { id: "chat", number: "03", label: "Chat" },
  { id: "models", number: "04", label: "Mô hình" },
  { id: "tools", number: "05", label: "Tool calling" },
  { id: "embeddings", number: "06", label: "Embeddings" },
  { id: "errors", number: "07", label: "Lỗi" },
  { id: "rate-limits", number: "08", label: "Giới hạn" },
];

const ERROR_ROWS = [
  { code: "400", type: "invalid_request_error", meaning: "JSON sai, thiếu trường hoặc tham số không hợp lệ." },
  { code: "401", type: "authentication_error", meaning: "Key thiếu, sai hoặc đã bị thu hồi." },
  { code: "403", type: "permission_error", meaning: "Key không có quyền cho endpoint hoặc mô hình này." },
  { code: "404", type: "not_found_error", meaning: "Model hoặc endpoint không tồn tại." },
  { code: "429", type: "rate_limit_exceeded", meaning: "Vượt hạn mức token, request hoặc concurrent." },
  { code: "500", type: "server_error", meaning: "Lỗi phía DeepSI. Thử lại với backoff lũy thừa." },
  { code: "503", type: "overloaded_error", meaning: "Mô hình đang quá tải. Thử lại sau vài giây." },
];

export function Docs() {
  const [active, setActive] = useState("quickstart");
  const { push } = useToast();

  useEffect(() => {
    document.title = "Tài liệu API — DeepSI Agent";
  }, []);

  useEffect(() => {
    const sections = CHAPTERS.map((chapter) => document.getElementById(chapter.id)).filter(
      (section): section is HTMLElement => Boolean(section),
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-22% 0px -66% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const endpoint = useMemo(() => `${SITE.baseUrl}/chat/completions`, []);

  const handleCopyEndpoint = async () => {
    const ok = await copyText(SITE.baseUrl);
    push(ok ? "Đã sao chép base URL" : "Không thể sao chép", ok ? "success" : "error");
  };

  return (
    <PageShell title="Tài liệu API">
      <PageIntro
        number="05"
        eyebrow="Tài liệu / API v1"
        title={
          <>
            Một endpoint.
            <br />
            <em>Bốn mô hình.</em>
          </>
        }
        lede="Mọi thứ bạn cần để đưa DeepSI Agent vào hệ thống: xác thực, chat completions, streaming, tool calling, embeddings và cách xử lý lỗi."
        sticker="book"
        meta="Docs / v1 · OpenAI-compatible"
      >
        <ButtonLink to="/register" variant="primary" size="lg" icon="key">
          Tạo API key
        </ButtonLink>
        <ButtonLink to="/dashboard/keys" variant="secondary" size="lg" icon="terminal" iconSide="right">
          Mở client
        </ButtonLink>
      </PageIntro>

      <nav className="docs-chapters" aria-label="Chương tài liệu">
        <div className="container docs-chapters__inner">
          <span className="mono docs-chapters__label">Chương</span>
          {CHAPTERS.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className={`docs-chapter${active === chapter.id ? " is-active" : ""}`}
            >
              <span className="mono">{chapter.number}</span>
              <span>{chapter.label}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="docs">
        <div className="container docs__layout">
          <aside className="docs__margin" aria-hidden="true">
            <span className="mono">DEEPSI / API</span>
            <span className="docs__margin-rule" />
            <span className="mono">v1 · 2026</span>
            <Sticker name="code" size={64} rotate={-6} className="docs__margin-sticker" />
            <span className="mono docs__margin-note">base_url</span>
            <button type="button" className="docs__endpoint" onClick={handleCopyEndpoint}>
              <code>api.service.deepsi.space/v1</code>
              <Sticker name="copy" size={17} flat decorative />
            </button>
          </aside>

          <div className="docs__content">
            <section className="docs-section" id="quickstart">
              <div className="docs-section__head">
                <span className="mono docs-section__number">01</span>
                <div>
                  <h2>Bắt đầu trong bốn phút.</h2>
                  <p>
                    Tạo tài khoản, tạo một API key, rồi gọi endpoint đầu tiên. Không cần thẻ,
                    không cần chờ duyệt.
                  </p>
                </div>
              </div>

              <ol className="docs-steps">
                <li>
                  <span className="mono">01</span>
                  <div>
                    <strong>Tạo API key</strong>
                    <p>
                      Mở <Link to="/dashboard/keys">Client → API keys</Link> và tạo key cho môi
                      trường bạn đang dùng. Key chỉ hiển thị đầy đủ một lần.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="mono">02</span>
                  <div>
                    <strong>Đặt biến môi trường</strong>
                    <CodeBlock
                      code={`export DEEPSI_API_KEY="dsi_live_..."`}
                      language="bash"
                      filename=".env"
                      tone="light"
                    />
                  </div>
                </li>
                <li>
                  <span className="mono">03</span>
                  <div>
                    <strong>Gọi endpoint</strong>
                    <p>
                      DeepSI Agent tương thích OpenAI SDK. Đổi <code>baseURL</code> và dùng key
                      DeepSI; phần còn lại giữ nguyên.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="docs-endpoint-card">
                <div>
                  <span className="method method--post">POST</span>
                  <code>{endpoint}</code>
                </div>
                <button type="button" onClick={handleCopyEndpoint} aria-label="Sao chép base URL">
                  <Sticker name="copy" size={20} flat decorative />
                </button>
              </div>

              <CodeTabs
                tabs={[
                  { label: "cURL", language: "bash", filename: "quickstart.sh", code: QUICKSTART_CURL },
                  { label: "TypeScript", language: "ts", filename: "quickstart.ts", code: QUICKSTART_TS },
                  { label: "Python", language: "py", filename: "quickstart.py", code: QUICKSTART_PY },
                ]}
              />
            </section>

            <section className="docs-section" id="authentication">
              <div className="docs-section__head">
                <span className="mono docs-section__number">02</span>
                <div>
                  <h2>Xác thực bằng bearer token.</h2>
                  <p>
                    Mọi request cần header <code>Authorization</code>. Key production bắt đầu
                    bằng <code>dsi_live_</code>; key development bắt đầu bằng <code>dsi_test_</code>.
                  </p>
                </div>
              </div>
              <CodeBlock code={AUTH_CODE} language="http" filename="headers" tone="light" />
              <div className="docs-callout docs-callout--sage">
                <Sticker name="shield" size={40} rotate={-5} flat decorative />
                <div>
                  <strong>Không đưa key vào mã phía client.</strong>
                  <p>
                    Gọi API từ server hoặc một proxy có kiểm soát. Dùng biến môi trường, secret
                    manager hoặc vault; không commit key vào git.
                  </p>
                </div>
              </div>
              <div className="docs-table">
                <div className="docs-table__row docs-table__row--head">
                  <span className="mono">Tiền tố</span>
                  <span className="mono">Môi trường</span>
                  <span className="mono">Dùng cho</span>
                </div>
                <div className="docs-table__row">
                  <code>dsi_live_</code>
                  <span>Production</span>
                  <span>Hệ thống thật, có tính phí theo gói</span>
                </div>
                <div className="docs-table__row">
                  <code>dsi_test_</code>
                  <span>Development</span>
                  <span>Thử nghiệm, dữ liệu log tách riêng</span>
                </div>
              </div>
            </section>

            <section className="docs-section" id="chat">
              <div className="docs-section__head">
                <span className="mono docs-section__number">03</span>
                <div>
                  <h2>Chat completions.</h2>
                  <p>
                    Endpoint trung tâm cho hội thoại, suy luận và agent. Hỗ trợ system prompt,
                    multi-turn, streaming và JSON mode.
                  </p>
                </div>
              </div>

              <div className="docs-field-list">
                <div>
                  <code>model</code>
                  <span>Bắt buộc. Một trong bốn mã mô hình bên dưới.</span>
                </div>
                <div>
                  <code>messages</code>
                  <span>Mảng tin nhắn với role system, user, assistant hoặc tool.</span>
                </div>
                <div>
                  <code>stream</code>
                  <span>Mặc định false. Đặt true để nhận server-sent events.</span>
                </div>
                <div>
                  <code>temperature</code>
                  <span>0–2. Mặc định 0.7. Dùng 0–0.3 cho trích xuất và phân loại.</span>
                </div>
                <div>
                  <code>max_tokens</code>
                  <span>Giới hạn token đầu ra của một completion.</span>
                </div>
                <div>
                  <code>response_format</code>
                  <span>Đặt {"{"} type: "json_object" {"}"} để nhận JSON hợp lệ.</span>
                </div>
              </div>

              <h3 className="docs-subhead">Streaming</h3>
              <p>
                Với <code>stream: true</code>, phản hồi được gửi theo từng chunk. Client nên
                xử lý <code>delta.content</code> và giữ kết nối mở đến khi gặp{" "}
                <code>[DONE]</code>.
              </p>
              <CodeBlock code={STREAM_TS} language="ts" filename="stream.ts" />

              <h3 className="docs-subhead">Response</h3>
              <CodeBlock code={RESPONSE_JSON} language="json" filename="200 OK" />
            </section>

            <section className="docs-section" id="models">
              <div className="docs-section__head">
                <span className="mono docs-section__number">04</span>
                <div>
                  <h2>Bốn mô hình, một hợp đồng.</h2>
                  <p>
                    Đổi mô hình bằng trường <code>model</code>. Không cần key mới, endpoint mới
                    hay SDK mới.
                  </p>
                </div>
              </div>

              <div className="docs-models">
                {MODELS.map((model) => (
                  <article className="docs-model" key={model.id}>
                    <div className="docs-model__top">
                      <Sticker name={model.sticker} size={40} flat decorative />
                      <code>{model.id}</code>
                      <span className="mono">{model.context}</span>
                    </div>
                    <h3>{model.role}</h3>
                    <p>{model.summary}</p>
                    <div className="docs-model__meta">
                      <span>{model.bestFor}</span>
                      <span className="mono">{model.plans}</span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="docs-table">
                <div className="docs-table__row docs-table__row--head">
                  <span className="mono">Mô hình</span>
                  <span className="mono">Input / 1M token</span>
                  <span className="mono">Output / 1M token</span>
                </div>
                <div className="docs-table__row">
                  <code>deepsi-s1</code>
                  <span>18.000đ</span>
                  <span>54.000đ</span>
                </div>
                <div className="docs-table__row">
                  <code>deepsi-m1</code>
                  <span>4.500đ</span>
                  <span>13.500đ</span>
                </div>
                <div className="docs-table__row">
                  <code>deepsi-v1</code>
                  <span>12.000đ</span>
                  <span>36.000đ</span>
                </div>
                <div className="docs-table__row">
                  <code>deepsi-e1</code>
                  <span>1.200đ</span>
                  <span>—</span>
                </div>
              </div>
              <p className="docs-footnote">
                Giá trên áp dụng cho hạn mức vượt gói. Trong hạn mức tháng, token đã bao gồm
                trong giá gói. Xem <Link to="/pricing">bảng giá</Link> để biết chi tiết.
              </p>
            </section>

            <section className="docs-section" id="tools">
              <div className="docs-section__head">
                <span className="mono docs-section__number">05</span>
                <div>
                  <h2>Tool calling cho agent.</h2>
                  <p>
                    Mô tả công cụ bằng JSON Schema. Mô hình quyết định khi nào gọi, trả về{" "}
                    <code>tool_calls</code>, và chờ kết quả để tiếp tục.
                  </p>
                </div>
              </div>
              <CodeBlock code={TOOL_REQUEST} language="json" filename="request.json" />
              <p>
                Thực thi công cụ ở phía bạn, rồi gửi kết quả trở lại với role{" "}
                <code>tool</code> và đúng <code>tool_call_id</code>.
              </p>
              <CodeBlock code={TOOL_RESPONSE} language="json" filename="assistant / tool_calls" />
              <div className="docs-callout">
                <Sticker name="nodes" size={40} rotate={5} flat decorative />
                <div>
                  <strong>Agent vòng lặp, không phải một lần gọi.</strong>
                  <p>
                    DeepSI-S1 được huấn luyện để lập kế hoạch nhiều bước. Với tác vụ phức tạp,
                    hãy cho mô hình tối đa 5–8 vòng công cụ trước khi buộc trả lời.
                  </p>
                </div>
              </div>
            </section>

            <section className="docs-section" id="embeddings">
              <div className="docs-section__head">
                <span className="mono docs-section__number">06</span>
                <div>
                  <h2>Embeddings cho RAG.</h2>
                  <p>
                    Vector 1024 chiều, ổn định giữa các lần gọi. Cùng một API key và cùng một
                    hợp đồng với phần còn lại.
                  </p>
                </div>
              </div>
              <CodeBlock code={EMBEDDING_CODE} language="ts" filename="embedding.ts" />
              <div className="docs-inline-stats">
                <span>
                  <strong>1024</strong>
                  <em className="mono">chiều mặc định</em>
                </span>
                <span>
                  <strong>8K</strong>
                  <em className="mono">token mỗi input</em>
                </span>
                <span>
                  <strong>2.048</strong>
                  <em className="mono">input mỗi request</em>
                </span>
              </div>
            </section>

            <section className="docs-section" id="errors">
              <div className="docs-section__head">
                <span className="mono docs-section__number">07</span>
                <div>
                  <h2>Lỗi có cấu trúc.</h2>
                  <p>
                    Mọi lỗi trả về cùng một shape, kèm <code>request_id</code> để tra log. Dùng
                    mã HTTP để quyết định thử lại hay dừng.
                  </p>
                </div>
              </div>
              <CodeBlock code={ERROR_JSON} language="json" filename="429 Too Many Requests" />
              <div className="docs-table docs-table--errors">
                <div className="docs-table__row docs-table__row--head">
                  <span className="mono">Mã</span>
                  <span className="mono">Loại</span>
                  <span className="mono">Ý nghĩa</span>
                </div>
                {ERROR_ROWS.map((row) => (
                  <div className="docs-table__row" key={row.code}>
                    <code>{row.code}</code>
                    <span className="mono docs-error-type">{row.type}</span>
                    <span>{row.meaning}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="docs-section" id="rate-limits">
              <div className="docs-section__head">
                <span className="mono docs-section__number">08</span>
                <div>
                  <h2>Giới hạn, không bất ngờ.</h2>
                  <p>
                    Hạn mức tính theo token và theo phút. Khi vượt, API trả 429 kèm header thời
                    gian chờ; không tự động trừ thêm tiền.
                  </p>
                </div>
              </div>

              <div className="docs-limit-grid">
                <div>
                  <span className="mono">Free</span>
                  <strong>10K</strong>
                  <p>token / ngày · 20 request / phút</p>
                </div>
                <div>
                  <span className="mono">Plus</span>
                  <strong>2M</strong>
                  <p>token / tháng · 120 request / phút</p>
                </div>
                <div>
                  <span className="mono">Ultral</span>
                  <strong>5M</strong>
                  <p>token / tháng · 600 request / phút</p>
                </div>
              </div>

              <p>
                Header phản hồi cho biết phần còn lại:{" "}
                <code>x-ratelimit-remaining-tokens</code>,{" "}
                <code>x-ratelimit-remaining-requests</code> và{" "}
                <code>x-ratelimit-reset</code>. Với lỗi 429, dùng exponential backoff bắt đầu từ
                1 giây, tối đa 30 giây.
              </p>

              <div className="docs-callout docs-callout--clay">
                <Sticker name="terminal" size={40} rotate={-5} flat decorative />
                <div>
                  <strong>Cần giới hạn theo từng key?</strong>
                  <p>
                    Đặt hạn mức riêng cho key production và development trong client để tránh
                    một agent lỗi đốt hết hạn mức của cả hệ thống.
                  </p>
                </div>
              </div>
            </section>

            <div className="docs-end">
              <Sticker name="key" size={92} rotate={-7} />
              <div>
                <span className="eyebrow eyebrow--plain">Bước tiếp theo</span>
                <h2>Sẵn sàng gọi endpoint đầu tiên?</h2>
                <p>
                  Tạo tài khoản miễn phí, tạo key và dán base URL. Nếu gặp lỗi, gửi{" "}
                  <code>request_id</code> cho chúng tôi.
                </p>
              </div>
              <div className="docs-end__actions">
                <ButtonLink to="/register" variant="primary" icon="key">
                  Tạo API key
                </ButtonLink>
                <a href={`mailto:${SITE.supportEmail}`} className="text-link">
                  {SITE.supportEmail}
                  <Sticker name="external" size={18} flat decorative />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
