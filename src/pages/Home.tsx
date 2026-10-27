import { Link } from "react-router-dom";
import { AgentCore } from "../components/AgentCore";
import { ButtonLink } from "../components/Button";
import { CodeTabs } from "../components/CodeBlock";
import { FAQ } from "../components/FAQ";
import { Logo } from "../components/Logo";
import { Marquee } from "../components/Marquee";
import { PageShell } from "../components/PageShell";
import { PricingCards } from "../components/PricingCards";
import { SectionHead } from "../components/SectionHead";
import { Sticker } from "../components/Sticker";
import { MODELS } from "../data/models";
import { PLANS } from "../data/plans";
import { CAPABILITIES, SITE, STATS, STEPS, USE_CASES } from "../data/site";
import { formatCompact, formatVnd } from "../lib/format";

const MARQUEE_ITEMS = [
  "DEEPSI-S1 / SUY LUẬN SÂU",
  "DEEPSI-M1 / PHẢN HỒI NHANH",
  "DEEPSI-V1 / THỊ GIÁC",
  "DEEPSI-E1 / EMBEDDING",
  "TOOL CALLING",
  "STREAMING",
  "JSON MODE",
  "OPENAI-COMPATIBLE",
  "3 VÙNG TẠI VIỆT NAM",
];

const CURL_CODE = `curl https://api.service.deepsi.space/v1/chat/completions \\
  -H "Authorization: Bearer $DEEPSI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepsi-s1",
    "messages": [
      { "role": "user", "content": "Tóm tắt ticket #4821." }
    ],
    "stream": true
  }'`;

const TS_CODE = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSI_API_KEY,
  baseURL: "https://api.service.deepsi.space/v1",
});

const stream = await client.chat.completions.create({
  model: "deepsi-s1",
  messages: [{ role: "user", content: "Tóm tắt ticket #4821." }],
  stream: true,
});`;

const PY_CODE = `from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["DEEPSI_API_KEY"],
    base_url="https://api.service.deepsi.space/v1",
)

stream = client.chat.completions.create(
    model="deepsi-s1",
    messages=[{"role": "user", "content": "Tóm tắt ticket #4821."}],
    stream=True,
)`;

export function Home() {
  return (
    <PageShell title="API LLM cho agent của mọi hệ thống">
      <section className="hero" data-index-section="0">
        <div className="hero__grid container">
          <div className="hero__copy">
            <div className="hero__top" data-hero-fade>
              <Logo />
              <span className="mono hero__top-note">Service 02 / Inference</span>
            </div>

            <span className="eyebrow hero__kicker" data-hero-fade>
              API LLM cho agent của mọi hệ thống
            </span>

            <h1 className="hero__title">
              <span className="line">
                <span data-hero-line>Bộ não cho</span>
              </span>
              <span className="line">
                <span data-hero-line>
                  <em>agent</em> của bạn.
                </span>
              </span>
              <span className="line hero__title-sub">
                <span data-hero-line>Không phải một cụm GPU.</span>
              </span>
            </h1>

            <p className="hero__lede" data-hero-fade>
              DeepSI Agent là API LLM tương thích OpenAI, đặt tại Việt Nam. Một khóa, bốn mô
              hình, tính bằng đồng Việt — để agent của bạn có thể suy nghĩ mà không phải tự
              dựng hạ tầng.
            </p>

            <div className="hero__actions" data-hero-fade>
              <ButtonLink to="/register" variant="primary" size="lg" icon="key">
                Tạo API key miễn phí
              </ButtonLink>
              <ButtonLink to="/docs" variant="secondary" size="lg" icon="book" iconSide="right">
                Đọc tài liệu
              </ButtonLink>
            </div>

            <div className="hero__meta" data-hero-fade>
              <span>
                <Sticker name="check" size={17} flat decorative />
                10.000 token/ngày
              </span>
              <span>
                <Sticker name="check" size={17} flat decorative />
                Không cần thẻ
              </span>
              <span>
                <Sticker name="check" size={17} flat decorative />
                OpenAI-compatible
              </span>
            </div>
          </div>

          <div className="hero__visual" data-hero-fade>
            <AgentCore className="hero__core" />
            <div className="hero__console">
              <div className="console-card">
                <div className="console-card__top">
                  <span className="mono">POST /v1/chat/completions</span>
                  <span className="console-card__live">
                    <i />
                    200 OK
                  </span>
                </div>
                <div className="console-card__body">
                  <div className="console-card__method">
                    <span className="mono">request.json</span>
                    <span className="mono">deepsi-s1</span>
                  </div>
                  <pre className="console-code">{`{
  "model": "deepsi-s1",
  "messages": [
    { "role": "system", "content": "Bạn là agent vận hành." },
    { "role": "user", "content": "Kiểm tra tồn kho SKU-1042." }
  ],
  "tools": ["inventory.lookup"],
  "stream": true
}`}</pre>
                  <div className="console-response">
                    <div className="console-response__head">
                      <span className="mono">assistant</span>
                      <span className="console-response__tokens mono">842 token · 1.2s</span>
                    </div>
                    <p>
                      Còn 12 sản phẩm trong kho Hà Nội. Đã giữ 2 đơn vị cho đơn #8821.
                      <span className="console-cursor" />
                    </p>
                  </div>
                  <div className="console-trace">
                    <span>
                      <i className="is-done" /> plan
                    </span>
                    <span>
                      <i className="is-done" /> tool
                    </span>
                    <span>
                      <i className="is-done" /> observe
                    </span>
                    <span>
                      <i className="is-live" /> answer
                    </span>
                  </div>
                </div>
                <div className="console-card__foot">
                  <span>128k context</span>
                  <span>stream: true</span>
                  <span>region: HAN</span>
                </div>
              </div>
              <Sticker
                name="key"
                size={104}
                rotate={-9}
                className="hero__sticker hero__sticker--key"
                loading="eager"
              />
              <Sticker
                name="plug"
                size={72}
                rotate={5}
                className="hero__sticker hero__sticker--plug"
                loading="eager"
              />
            </div>
          </div>
        </div>

        <div className="hero__foot container">
          <a href="#tong-quan" className="hero__scroll">
            <span className="mono">Cuộn để xem</span>
            <Sticker name="arrow" size={26} rotate={110} flat decorative />
          </a>
          <span className="hero__note">Dành cho những hệ thống không ngủ.</span>
          <span className="mono hero__page">01 / 06</span>
        </div>

        <span className="hero__big-type" aria-hidden="true">
          AGENT
        </span>
        <span className="reg-mark hero__reg" aria-hidden="true" />
      </section>

      <Marquee items={MARQUEE_ITEMS} speed={38} />

      <section className="manifesto" id="tong-quan">
        <div className="container manifesto__grid">
          <div className="manifesto__side" data-reveal>
            <span className="mono">01 / Tuyên ngôn</span>
            <Sticker name="nodes" size={72} rotate={-7} />
            <span className="manifesto__side-line" />
            <span className="mono muted">Inference, not infrastructure.</span>
          </div>

          <div className="manifesto__main">
            <h2 className="manifesto__title" data-reveal>
              Agent không cần thêm một dashboard. Nó cần{" "}
              <span className="marker">một lời gọi hàm đáng tin.</span>
            </h2>
            <div className="manifesto__body">
              <p data-reveal>
                Phần lớn hạ tầng AI được xây cho con người ngồi trước màn hình. Agent thì khác:
                nó gọi API lúc 3 giờ sáng, thử lại khi timeout, và không đọc thông báo lỗi.
                DeepSI Agent được thiết kế cho kiểu người dùng đó — ổn định, dễ đoán, và đủ đơn
                giản để một lập trình viên có thể tích hợp trong một buổi chiều.
              </p>
              <p className="manifesto__sign" data-reveal>
                — Đội ngũ DeepSI, 2026
              </p>
            </div>
          </div>
        </div>

        <div className="container manifesto__stats">
          {STATS.map((stat) => (
            <div className="stat" key={stat.label} data-reveal>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <em className="mono">{stat.note}</em>
            </div>
          ))}
        </div>
      </section>

      <section className="capabilities section" id="nang-luc" data-index-section="1">
        <div className="container">
          <SectionHead
            number="02"
            eyebrow="Năng lực"
            title={
              <>
                Đủ sâu để làm việc.
                <br />
                <em>Đủ gọn để bắt đầu.</em>
              </>
            }
            lede="Một lớp suy luận dùng chung cho mọi agent trong hệ thống của bạn. Không cần thêm một SDK, một bảng điều khiển hay một hợp đồng mới."
            sticker="nodes"
          />

          <div className="capability-grid">
            {CAPABILITIES.map((item, index) => (
              <article
                className={`capability-card capability-card--${item.tone} capability-card--${item.span}`}
                key={item.number}
                data-reveal
              >
                <div className="capability-card__top">
                  <span className="mono">{item.number}</span>
                  <Sticker name={item.sticker} size={58} rotate={index % 2 === 0 ? -5 : 6} flat={item.tone === "moss"} decorative />
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="capability-card__note">
                  <span className="mono">{item.note}</span>
                  <Sticker name="arrow" size={20} rotate={-15} flat decorative />
                </div>
                {index === 0 ? (
                  <div className="route-visual" aria-hidden="true">
                    <span className="route-visual__endpoint mono">/v1</span>
                    <span className="route-visual__line" />
                    <div className="route-visual__models">
                      <span>M1</span>
                      <span>S1</span>
                      <span>V1</span>
                      <span>E1</span>
                    </div>
                  </div>
                ) : null}
                {index === 1 ? (
                  <div className="compat-visual" aria-hidden="true">
                    <span className="mono">baseURL</span>
                    <code>api.service.deepsi.space/v1</code>
                  </div>
                ) : null}
                {index === 2 ? (
                  <div className="residency-visual" aria-hidden="true">
                    <span className="residency-dot" />
                    <span className="residency-dot" />
                    <span className="residency-dot" />
                    <span className="mono">HAN · DAD · SGN</span>
                  </div>
                ) : null}
                {index === 3 ? (
                  <div className="ledger-visual" aria-hidden="true">
                    <span>
                      <em className="mono">input</em>
                      <strong>1.284.020</strong>
                    </span>
                    <span>
                      <em className="mono">output</em>
                      <strong>462.880</strong>
                    </span>
                    <span>
                      <em className="mono">total</em>
                      <strong>1.746.900</strong>
                    </span>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="models section">
        <div className="container">
          <SectionHead
            number="03"
            eyebrow="Mô hình"
            title={
              <>
                Bốn mô hình.
                <br />
                <em>Một hợp đồng API.</em>
              </>
            }
            lede="Chọn mô hình theo công việc, không theo nhà cung cấp. Mọi mô hình dùng chung endpoint, key và cách tính token."
            sticker="cube"
          />

          <div className="model-ledger">
            <div className="model-ledger__head">
              <span aria-hidden="true" />
              <span className="mono">Mô hình</span>
              <span className="mono">Vai trò</span>
              <span className="mono">Ngữ cảnh</span>
              <span className="mono">Phù hợp nhất</span>
              <span className="mono">Gói</span>
              <span aria-hidden="true" />
            </div>
            {MODELS.map((model, index) => (
              <Link to="/docs#models" className="model-row" key={model.id} data-reveal>
                <span className="model-row__index mono">{String(index + 1).padStart(2, "0")}</span>
                <span className="model-row__name">
                  <Sticker name={model.sticker} size={34} flat decorative />
                  <strong>{model.name}</strong>
                </span>
                <span className="model-row__role">{model.role}</span>
                <span className="model-row__context mono">{model.context}</span>
                <span className="model-row__best">{model.bestFor}</span>
                <span className="model-row__plans mono">{model.plans}</span>
                <span className="model-row__arrow">
                  <Sticker name="arrow" size={22} rotate={-20} flat decorative />
                </span>
              </Link>
            ))}
          </div>
          <p className="model-note" data-reveal>
            Đổi model bằng đúng một trường <code>model</code> trong request. Không cần tạo key
            mới, không cần đổi endpoint.
          </p>
        </div>
      </section>

      <section className="integration section" id="tich-hop" data-index-section="2">
        <div className="container">
          <SectionHead
            number="04"
            eyebrow="Tích hợp"
            title={
              <>
                Từ zero đến agent
                <br />
                <em>trong bốn dòng.</em>
              </>
            }
            lede="Không cần học một SDK mới. Đổi base URL, dán key, và giữ nguyên phần còn lại của hệ thống."
            sticker="terminal"
          />

          <div className="integration__grid">
            <div className="steps">
              {STEPS.map((step, index) => (
                <div className="step" key={step.number} data-reveal>
                  <div className="step__marker">
                    <span className="mono">{step.number}</span>
                    <Sticker name={step.sticker} size={34} flat decorative />
                  </div>
                  <div className="step__copy">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                  {index < STEPS.length - 1 ? <span className="step__line" /> : null}
                </div>
              ))}
              <div className="integration__badges" data-reveal>
                <span className="mono">Hoạt động với</span>
                <div>
                  <span>OpenAI SDK</span>
                  <span>LangChain</span>
                  <span>LlamaIndex</span>
                  <span>Vercel AI SDK</span>
                </div>
              </div>
            </div>

            <div className="integration__code" data-reveal>
              <CodeTabs
                tabs={[
                  { label: "cURL", language: "bash", filename: "request.sh", code: CURL_CODE },
                  { label: "TypeScript", language: "ts", filename: "agent.ts", code: TS_CODE },
                  { label: "Python", language: "py", filename: "agent.py", code: PY_CODE },
                ]}
              />
              <div className="integration__response">
                <span className="status-dot" />
                <span className="mono">200 OK · 1.2s · 842 token</span>
                <span className="mono integration__response-note">streaming</span>
              </div>
              <Sticker name="terminal" size={78} rotate={-7} className="integration__sticker" />
            </div>
          </div>
        </div>
      </section>

      <section className="use-cases">
        <div className="container">
          <div className="use-cases__head">
            <span className="eyebrow eyebrow--plain" data-reveal>
              Dành cho ai
            </span>
            <h2 data-reveal>
              Dành cho những hệ thống <em>không ngủ.</em>
            </h2>
            <p data-reveal>
              Nếu agent của bạn gọi API lúc 3 giờ sáng, chúng tôi đã nghĩ đến nó.
            </p>
          </div>
          <div className="use-cases__grid">
            {USE_CASES.map((item, index) => (
              <article className="use-case" key={item.title} data-reveal>
                <div className="use-case__top">
                  <span className="mono">{item.label}</span>
                  <Sticker name={item.sticker} size={52} rotate={index % 2 === 0 ? -6 : 5} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing section" id="bang-gia" data-index-section="3">
        <div className="container">
          <SectionHead
            number="05"
            eyebrow="Bảng giá"
            title={
              <>
                Ba mức.
                <br />
                <em>Không có phí ẩn.</em>
              </>
            }
            lede="Bắt đầu miễn phí. Nâng cấp khi agent có người dùng thật. Giá niêm yết bằng đồng Việt, không tự động trừ thêm."
            sticker="coin"
          />

          <PricingCards />

          <div className="pricing__foot" data-reveal>
            <p>
              Tất cả gói đều có API key miễn phí. Thanh toán bằng VNPay, Momo hoặc chuyển
              khoản.
            </p>
            <Link to="/pricing" className="text-link">
              So sánh chi tiết
              <Sticker name="arrow" size={19} rotate={-15} flat decorative />
            </Link>
          </div>

          <div className="pricing__note" data-reveal>
            <Sticker name="lock" size={24} flat decorative />
            <span>
              Giá đã bao gồm VAT. Hủy bất cứ lúc nào. Không tự động gia hạn nếu bạn không bật.
            </span>
            <span className="mono">{PLANS.length} gói · 1 bảng giá</span>
          </div>
        </div>
      </section>

      <section className="faq-section section">
        <div className="container">
          <SectionHead
            number="06"
            eyebrow="Hỏi đáp"
            title={
              <>
                Những câu hỏi
                <br />
                <em>trước khi bắt đầu.</em>
              </>
            }
            lede="Nếu câu trả lời chưa có ở đây, viết cho chúng tôi. Con người sẽ trả lời."
            sticker="chat"
          />

          <div className="faq-grid">
            <aside className="faq-aside" data-reveal>
              <Sticker name="chat" size={92} rotate={-7} />
              <h3>Không tìm thấy câu trả lời?</h3>
              <p>
                Gửi một email ngắn. Chúng tôi đọc mọi tin nhắn và trả lời trong 24 giờ làm việc.
              </p>
              <a href={`mailto:${SITE.supportEmail}`} className="text-link">
                {SITE.supportEmail}
                <Sticker name="external" size={19} flat decorative />
              </a>
              <span className="mono faq-aside__note">Support / 24h</span>
            </aside>
            <div className="faq-wrap">
              <FAQ />
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__grid">
          <div className="cta__copy">
            <span className="eyebrow eyebrow--plain" data-reveal>
              Bắt đầu / 4 phút
            </span>
            <h2 data-reveal>
              Bắt đầu bằng
              <br />
              <em>một API key.</em>
            </h2>
            <p data-reveal>
              Miễn phí. Không cần thẻ. Không có phí ẩn. Agent của bạn có thể gọi endpoint đầu
              tiên ngay hôm nay.
            </p>
            <div className="cta__actions" data-reveal>
              <ButtonLink to="/register" variant="light" size="lg" icon="key">
                Tạo tài khoản miễn phí
              </ButtonLink>
              <ButtonLink to="/docs" variant="ghost" size="lg" icon="book" iconSide="right">
                Đọc tài liệu
              </ButtonLink>
            </div>
          </div>
          <div className="cta__visual" data-reveal>
            <div className="cta__sticker-wrap">
              <Sticker name="key" size={230} rotate={-8} />
              <Sticker name="spark" size={84} rotate={12} className="cta__spark" />
              <span className="cta__sticker-note mono">API KEY / FREE</span>
            </div>
            <div className="cta__mini">
              <span className="mono">service.deepsi.space</span>
              <span className="mono">không cần thẻ</span>
            </div>
          </div>
        </div>
        <span className="cta__big-type" aria-hidden="true">
          API
        </span>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <Logo />
              <p>
                API LLM cho agent của mọi hệ thống. Một dịch vụ riêng của deepsi.space, dành
                cho những ai đang xây dựng bằng API thay vì bằng dashboard.
              </p>
              <div className="footer__stickers" aria-hidden="true">
                <Sticker name="key" size={46} rotate={-8} flat />
                <Sticker name="spark" size={38} rotate={7} flat />
                <Sticker name="shield" size={42} rotate={-4} flat />
              </div>
            </div>

            <div className="footer__col">
              <span className="mono">Sản phẩm</span>
              <a href="#tong-quan">Tổng quan</a>
              <a href="#nang-luc">Năng lực</a>
              <Link to="/pricing">Bảng giá</Link>
              <Link to="/docs">Tài liệu</Link>
            </div>
            <div className="footer__col">
              <span className="mono">Client</span>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Tạo tài khoản</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/dashboard/keys">API keys</Link>
            </div>
            <div className="footer__col">
              <span className="mono">Công ty</span>
              <a href="https://deepsi.space" target="_blank" rel="noreferrer">
                deepsi.space
              </a>
              <a href="mailto:hello@deepsi.space">Liên hệ</a>
              <a href="https://deepsi.space" target="_blank" rel="noreferrer">
                Về DeepSI
              </a>
              <span className="footer__soon">Tuyển dụng · sắp mở</span>
            </div>
            <div className="footer__col">
              <span className="mono">Pháp lý</span>
              <Link to="/terms">Điều khoản</Link>
              <Link to="/privacy">Quyền riêng tư</Link>
              <Link to="/sla">SLA</Link>
              <Link to="/security">Bảo mật</Link>
            </div>
          </div>

          <div className="footer__wordmark" aria-hidden="true">
            DEEPSI
          </div>

          <div className="footer__bottom">
            <span className="mono">© 2026 DeepSI. Một dịch vụ của deepsi.space.</span>
            <span className="footer__status">
              <span className="status-dot" />
              <span className="mono">Tất cả hệ thống hoạt động</span>
            </span>
            <span className="mono">Made in Vietnam · service.deepsi.space</span>
          </div>
        </div>
      </footer>
    </PageShell>
  );
}
