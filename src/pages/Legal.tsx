import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { Sticker } from "../components/Sticker";
import type { StickerName } from "../data/stickers";
import { SITE } from "../data/site";

type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

type LegalLayoutProps = {
  number: string;
  eyebrow: string;
  title: ReactNode;
  lede: string;
  sticker: StickerName;
  updated: string;
  sections: LegalSection[];
  note?: string;
};

function LegalLayout({
  number,
  eyebrow,
  title,
  lede,
  sticker,
  updated,
  sections,
  note,
}: LegalLayoutProps) {
  return (
    <PageShell title={eyebrow}>
      <PageIntro
        number={number}
        eyebrow={eyebrow}
        title={title}
        lede={lede}
        sticker={sticker}
        meta={`Cập nhật / ${updated}`}
      />

      <div className="legal">
        <div className="container legal__layout">
          <aside className="legal__toc" aria-label="Mục lục văn bản">
            <span className="mono">Trong trang này</span>
            <nav>
              {sections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>
            <div className="legal__toc-note">
              <Sticker name="book" size={42} rotate={-6} flat decorative />
              <p>
                Văn bản này là một phần của thỏa thuận giữa bạn và DeepSI. Nếu có câu hỏi, viết
                cho chúng tôi.
              </p>
              <a href={`mailto:${SITE.email}`} className="text-link">
                {SITE.email}
              </a>
            </div>
          </aside>

          <article className="legal__body">
            <div className="legal__meta">
              <span className="mono">Hiệu lực từ {updated}</span>
              <span className="mono">DeepSI / service.deepsi.space</span>
            </div>
            {note ? (
              <div className="legal__note">
                <Sticker name="spark" size={30} flat decorative />
                <p>{note}</p>
              </div>
            ) : null}
            {sections.map((section, index) => (
              <section className="legal__section" id={section.id} key={section.id}>
                <span className="mono legal__number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{section.title}</h2>
                  {section.body}
                </div>
              </section>
            ))}
            <div className="legal__foot">
              <Sticker name="shield" size={54} rotate={-5} flat decorative />
              <div>
                <strong>Một dịch vụ của deepsi.space.</strong>
                <p>
                  DeepSI Agent vận hành tại service.deepsi.space. Các câu hỏi về văn bản này
                  được gửi đến <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
                </p>
              </div>
              <Link to="/" className="text-link">
                Về trang chủ
                <Sticker name="arrow" size={18} rotate={-20} flat decorative />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </PageShell>
  );
}

export function LegalTerms() {
  return (
    <LegalLayout
      number="07"
      eyebrow="Pháp lý / Điều khoản"
      title={
        <>
          Điều khoản
          <br />
          <em>sử dụng.</em>
        </>
      }
      lede="Những quy tắc cơ bản khi bạn dùng DeepSI Agent. Viết ngắn, rõ và không giấu điều gì quan trọng."
      sticker="book"
      updated="01/01/2026"
      sections={[
        {
          id: "service",
          title: "Phạm vi dịch vụ",
          body: (
            <>
              <p>
                DeepSI Agent là dịch vụ API mô hình ngôn ngữ vận hành tại{" "}
                <strong>service.deepsi.space</strong>, thuộc deepsi.space. Dịch vụ cung cấp
                quyền truy cập vào các mô hình S1, M1, V1 và E1 thông qua giao diện tương thích
                OpenAI.
              </p>
              <p>
                Chúng tôi có thể bổ sung, thay đổi hoặc ngừng một mô hình cụ thể. Thay đổi ảnh
                hưởng đến hành vi mô hình sẽ được thông báo trước ít nhất 30 ngày, trừ trường
                hợp bảo mật khẩn cấp.
              </p>
            </>
          ),
        },
        {
          id: "account",
          title: "Tài khoản và bảo mật",
          body: (
            <>
              <p>
                Bạn chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản và API key của
                mình. Không chia sẻ key qua kênh công khai, không commit key vào kho mã nguồn.
              </p>
              <p>
                Thông báo ngay cho chúng tôi nếu bạn nghi ngờ key bị lộ. Chúng tôi hỗ trợ thu
                hồi key và kiểm tra log liên quan trong vòng 24 giờ làm việc.
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "Sử dụng được phép",
          body: (
            <>
              <p>Bạn không được dùng dịch vụ để:</p>
              <ul>
                <li>tạo nội dung vi phạm pháp luật Việt Nam hoặc quyền của bên thứ ba;</li>
                <li>phát tán mã độc, lừa đảo hoặc can thiệp trái phép vào hệ thống khác;</li>
                <li>thu thập dữ liệu cá nhân mà không có căn cứ hợp pháp;</li>
                <li>dò quét, làm quá tải hoặc vượt qua giới hạn kỹ thuật của dịch vụ.</li>
              </ul>
              <p>
                Chúng tôi có thể tạm ngưng key vi phạm để bảo vệ hệ thống và người dùng khác.
              </p>
            </>
          ),
        },
        {
          id: "billing",
          title: "Hạn mức và thanh toán",
          body: (
            <>
              <p>
                Gói Free miễn phí và không yêu cầu thẻ. Plus và Ultral được tính theo tháng,
                giá niêm yết bằng đồng Việt và đã bao gồm VAT. Thanh toán qua VNPay, Momo hoặc
                chuyển khoản.
              </p>
              <p>
                Khi hết hạn mức, yêu cầu trả mã 429 và không tự động phát sinh phí. Bạn có thể
                nâng cấp hoặc mua thêm hạn mức. Gói đã trả không được hoàn lại cho phần thời
                gian còn lại, trừ khi pháp luật yêu cầu.
              </p>
            </>
          ),
        },
        {
          id: "data",
          title: "Dữ liệu và sở hữu trí tuệ",
          body: (
            <>
              <p>
                Bạn giữ quyền đối với dữ liệu đầu vào và đầu ra do mình tạo ra. Bạn cấp cho
                DeepSI quyền xử lý dữ liệu đó chỉ để vận hành, bảo mật và cải thiện độ ổn định
                của dịch vụ.
              </p>
              <p>
                Chúng tôi không dùng dữ liệu API để huấn luyện mô hình. Log yêu cầu được giữ
                theo gói và có thể tắt hoàn toàn với Plus và Ultral. Xem thêm{" "}
                <Link to="/privacy">Chính sách quyền riêng tư</Link>.
              </p>
            </>
          ),
        },
        {
          id: "termination",
          title: "Tạm ngưng và chấm dứt",
          body: (
            <>
              <p>
                Bạn có thể ngừng dùng dịch vụ bất cứ lúc nào. Chúng tôi có thể tạm ngưng tài
                khoản nếu có vi phạm nghiêm trọng, nếu pháp luật yêu cầu, hoặc để ngăn chặn
                thiệt hại cho hệ thống.
              </p>
              <p>
                Khi chấm dứt, bạn có 30 ngày để tải log còn lưu. Sau thời gian đó, dữ liệu được
                xóa theo quy trình lưu trữ.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          title: "Giới hạn trách nhiệm",
          body: (
            <>
              <p>
                Dịch vụ được cung cấp “nguyên trạng”. Trong phạm vi pháp luật cho phép, DeepSI
                không chịu trách nhiệm cho thiệt hại gián tiếp, mất lợi nhuận hoặc mất dữ liệu
                phát sinh từ việc dùng dịch vụ.
              </p>
              <p>
                Với gói trả phí, tổng trách nhiệm của chúng tôi không vượt quá số tiền bạn đã
                trả trong 3 tháng liền trước sự kiện. Cam kết SLA được quy định riêng tại{" "}
                <Link to="/sla">trang SLA</Link>.
              </p>
            </>
          ),
        },
        {
          id: "law",
          title: "Luật áp dụng",
          body: (
            <p>
              Thỏa thuận này được điều chỉnh bởi pháp luật Việt Nam. Các bên ưu tiên giải quyết
              tranh chấp bằng thương lượng; nếu không đạt, tranh chấp được đưa ra tòa án có
              thẩm quyền tại Hà Nội.
            </p>
          ),
        },
      ]}
      note="Đây là bản tóm tắt dễ đọc. Trong trường hợp có khác biệt, bản tiếng Việt được lưu tại DeepSI là bản có hiệu lực."
    />
  );
}

export function LegalPrivacy() {
  return (
    <LegalLayout
      number="08"
      eyebrow="Pháp lý / Quyền riêng tư"
      title={
        <>
          Quyền riêng tư, <em>cụ thể.</em>
        </>
      }
      lede="Chúng tôi thu thập ít dữ liệu nhất có thể, giữ trong thời gian ngắn nhất cần thiết và không dùng dữ liệu API để huấn luyện."
      sticker="lock"
      updated="01/01/2026"
      sections={[
        {
          id: "collect",
          title: "Dữ liệu chúng tôi thu thập",
          body: (
            <>
              <p>Khi bạn tạo tài khoản, chúng tôi lưu:</p>
              <ul>
                <li>họ tên, email và phương thức đăng nhập;</li>
                <li>trạng thái gói dịch vụ và lịch sử thanh toán;</li>
                <li>metadata kỹ thuật của request: thời gian, mô hình, số token, độ trễ, mã lỗi.</li>
              </ul>
              <p>
                Chúng tôi không lưu mật khẩu dạng văn bản. Mật khẩu được băm trước khi lưu và
                không thể khôi phục, chỉ có thể đặt lại.
              </p>
            </>
          ),
        },
        {
          id: "api-data",
          title: "Dữ liệu bạn gửi qua API",
          body: (
            <>
              <p>
                Nội dung prompt và completion là của bạn. Mặc định, chúng tôi không lưu nội
                dung này lâu hơn thời gian cần để xử lý request và ghi log lỗi (nếu bạn bật
                log).
              </p>
              <p>
                Với gói Plus và Ultral, bạn có thể tắt log hoàn toàn trong client. Khi tắt,
                chúng tôi chỉ giữ số liệu tổng hợp về token và độ trễ, không giữ nội dung.
              </p>
              <p>
                <strong>Dữ liệu API không được dùng để huấn luyện mô hình.</strong>
              </p>
            </>
          ),
        },
        {
          id: "basis",
          title: "Cơ sở pháp lý",
          body: (
            <p>
              Chúng tôi xử lý dữ liệu để thực hiện hợp đồng cung cấp dịch vụ, để tuân thủ nghĩa
              vụ pháp lý (hóa đơn, thuế), và trên cơ sở lợi ích hợp pháp trong việc bảo mật,
              chống lạm dụng và cải thiện độ ổn định. Marketing chỉ được gửi khi bạn đồng ý và
              có thể hủy bất cứ lúc nào.
            </p>
          ),
        },
        {
          id: "retention",
          title: "Lưu trữ và xóa",
          body: (
            <>
              <ul>
                <li>Dữ liệu tài khoản: trong suốt thời gian tài khoản hoạt động.</li>
                <li>Log request: 7 ngày (Free), 30 ngày (Plus), 90 ngày (Ultral).</li>
                <li>Hóa đơn và chứng từ: theo thời hạn pháp luật yêu cầu.</li>
              </ul>
              <p>
                Khi bạn xóa tài khoản, dữ liệu cá nhân được xóa trong 30 ngày, trừ phần phải
                giữ để tuân thủ pháp luật.
              </p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "Chia sẻ với ai",
          body: (
            <p>
              Chúng tôi không bán dữ liệu. Dữ liệu chỉ được chia sẻ với nhà cung cấp hạ tầng
              cần thiết để vận hành dịch vụ (máy chủ, thanh toán, email giao dịch), theo hợp
              đồng bảo mật và trong phạm vi tối thiểu. Chúng tôi có thể tiết lộ dữ liệu khi
              pháp luật yêu cầu và sẽ thông báo cho bạn nếu được phép.
            </p>
          ),
        },
        {
          id: "rights",
          title: "Quyền của bạn",
          body: (
            <>
              <p>Bạn có quyền truy cập, sửa, xóa, hạn chế xử lý và phản đối việc xử lý dữ liệu cá nhân của mình. Bạn cũng có quyền khiếu nại với cơ quan bảo vệ dữ liệu có thẩm quyền.</p>
              <p>
                Gửi yêu cầu đến <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Chúng tôi
                phản hồi trong 30 ngày và có thể cần xác minh danh tính trước khi thực hiện.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies và lưu trữ cục bộ",
          body: (
            <p>
              Trang dịch vụ dùng localStorage để giữ phiên đăng nhập và dữ liệu demo của client.
              Chúng tôi không dùng cookie quảng cáo của bên thứ ba. Bạn có thể xóa dữ liệu cục
              bộ bất cứ lúc nào trong cài đặt trình duyệt.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Liên hệ",
          body: (
            <p>
              Câu hỏi về quyền riêng tư: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Địa
              chỉ vận hành: Hà Nội, Việt Nam.
            </p>
          ),
        },
      ]}
      note="Bản demo này lưu tài khoản trong localStorage của trình duyệt. Không có dữ liệu nào được gửi đến máy chủ DeepSI."
    />
  );
}

export function LegalSla() {
  return (
    <LegalLayout
      number="09"
      eyebrow="Pháp lý / SLA"
      title={
        <>
          Cam kết <em>vận hành.</em>
        </>
      }
      lede="Mức uptime, cách đo và cách bồi hoàn. Dành cho những hệ thống không thể dừng vì một dashboard báo đỏ."
      sticker="shield"
      updated="01/01/2026"
      sections={[
        {
          id: "commitment",
          title: "Cam kết uptime",
          body: (
            <>
              <p>
                DeepSI Agent cam kết độ khả dụng hàng tháng <strong>99,9%</strong> cho gói
                Ultral và <strong>99,5%</strong> cho gói Plus. Gói Free không có SLA, nhưng
                chúng tôi vận hành cùng một hạ tầng và cùng một quy trình giám sát.
              </p>
              <p>
                “Khả dụng” nghĩa là API trả phản hồi hợp lệ (không phải lỗi 5xx do DeepSI) cho
                các request đã xác thực, được đo theo từng phút.
              </p>
            </>
          ),
        },
        {
          id: "measurement",
          title: "Cách đo",
          body: (
            <>
              <p>
                Chúng tôi đo từ nhiều điểm bên ngoài Việt Nam và trong nước, mỗi phút một lần,
                với endpoint health công khai. Số liệu tháng được tổng hợp và công bố trong
                trang trạng thái.
              </p>
              <p>
                Uptime = (tổng số phút trong tháng − số phút không khả dụng) / tổng số phút
                trong tháng.
              </p>
            </>
          ),
        },
        {
          id: "credits",
          title: "Bồi hoàn",
          body: (
            <>
              <p>Nếu uptime thấp hơn cam kết, bạn được bồi hoàn tín dụng dịch vụ:</p>
              <ul>
                <li>99,0% – 99,49%: 10% phí tháng;</li>
                <li>95,0% – 98,99%: 25% phí tháng;</li>
                <li>dưới 95,0%: 50% phí tháng.</li>
              </ul>
              <p>
                Yêu cầu bồi hoàn gửi trong 30 ngày kể từ sự kiện, kèm request_id hoặc log.
                Tín dụng được trừ vào hóa đơn kế tiếp, không quy đổi thành tiền mặt.
              </p>
            </>
          ),
        },
        {
          id: "exclusions",
          title: "Trường hợp loại trừ",
          body: (
            <ul>
              <li>Bảo trì đã thông báo trước ít nhất 48 giờ;</li>
              <li>sự cố do nhà cung cấp hạ tầng hoặc mạng ngoài tầm kiểm soát hợp lý;</li>
              <li>request bị chặn do vi phạm điều khoản hoặc vượt hạn mức;</li>
              <li>lỗi 4xx, timeout do client, hoặc cấu hình sai phía người dùng;</li>
              <li>bất khả kháng theo pháp luật.</li>
            </ul>
          ),
        },
        {
          id: "maintenance",
          title: "Bảo trì",
          body: (
            <p>
              Bảo trì định kỳ được thực hiện trong khung 02:00–04:00 giờ Việt Nam và thông báo
              trước 48 giờ. Bảo trì khẩn cấp có thể diễn ra ngay, nhưng chúng tôi cố gắng giữ
              thời gian gián đoạn dưới 5 phút và cập nhật liên tục trên trang trạng thái.
            </p>
          ),
        },
        {
          id: "incidents",
          title: "Kênh sự cố",
          body: (
            <>
              <p>
                Ultral có kênh Slack hoặc Telegram riêng với đầu mối kỹ thuật. Plus nhận thông
                báo qua email trong 24 giờ làm việc. Mọi khách hàng đều xem được lịch sử sự cố
                công khai.
              </p>
              <p>
                Khi báo sự cố, gửi kèm thời điểm, mã lỗi và <code>request_id</code> để chúng
                tôi tra cứu nhanh hơn.
              </p>
            </>
          ),
        },
      ]}
      note="SLA này áp dụng cho dịch vụ tại service.deepsi.space. Các dịch vụ khác của deepsi.space có cam kết riêng."
    />
  );
}

export function LegalSecurity() {
  return (
    <LegalLayout
      number="10"
      eyebrow="Pháp lý / Bảo mật"
      title={
        <>
          Bảo mật <em>theo thiết kế.</em>
        </>
      }
      lede="Cách chúng tôi bảo vệ key, dữ liệu và hạ tầng — cùng những điều bạn nên làm ở phía mình."
      sticker="shield"
      updated="01/01/2026"
      sections={[
        {
          id: "infrastructure",
          title: "Hạ tầng",
          body: (
            <p>
              Hạ tầng đặt tại Việt Nam với ba vùng: Hà Nội, Đà Nẵng và TP.HCM. Hệ thống chạy
              trong mạng riêng, tách biệt môi trường production và staging. Truy cập quản trị
              yêu cầu xác thực đa yếu tố và được ghi log.
            </p>
          ),
        },
        {
          id: "encryption",
          title: "Mã hóa",
          body: (
            <p>
              Dữ liệu truyền qua TLS 1.2 trở lên. Dữ liệu lưu trữ được mã hóa ở tầng ổ đĩa.
              Mật khẩu được băm bằng thuật toán một chiều có salt; API key được lưu dưới dạng
              băm và chỉ hiển thị đầy đủ một lần khi tạo.
            </p>
          ),
        },
        {
          id: "keys",
          title: "API key",
          body: (
            <>
              <p>
                Mỗi key có tiền tố môi trường, quyền truy cập và có thể thu hồi tức thì. Chúng
                tôi khuyến nghị tạo key riêng cho từng dịch vụ, đặt hạn mức và xoay vòng định
                kỳ.
              </p>
              <p>
                Không đưa key vào mã client, không commit vào git, không gửi qua chat. Nếu key
                bị lộ, thu hồi ngay trong client và tạo key mới.
              </p>
            </>
          ),
        },
        {
          id: "training",
          title: "Dữ liệu huấn luyện",
          body: (
            <p>
              Dữ liệu gửi qua API không được dùng để huấn luyện mô hình. Chúng tôi không bán
              dữ liệu và không chia sẻ nội dung prompt với bên thứ ba ngoài nhà cung cấp hạ
              tầng cần thiết để xử lý request.
            </p>
          ),
        },
        {
          id: "compliance",
          title: "Tuân thủ",
          body: (
            <p>
              Chúng tôi tuân thủ pháp luật Việt Nam về dữ liệu và an ninh mạng. Với khách hàng
              doanh nghiệp, chúng tôi cung cấp phụ lục xử lý dữ liệu (DPA), hóa đơn VAT và hợp
              đồng dịch vụ. Gửi yêu cầu đến <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
          ),
        },
        {
          id: "report",
          title: "Báo cáo lỗ hổng",
          body: (
            <>
              <p>
                Nếu phát hiện lỗ hổng, gửi mô tả và bước tái hiện đến{" "}
                <a href={`mailto:security@deepsi.space`}>security@deepsi.space</a>. Chúng tôi
                xác nhận trong 48 giờ, không theo đuổi pháp lý với nghiên cứu bảo mật thiện chí
                và ghi nhận đóng góp nếu bạn đồng ý.
              </p>
              <p>Vui lòng không kiểm thử gây gián đoạn dịch vụ hoặc truy cập dữ liệu người khác.</p>
            </>
          ),
        },
        {
          id: "access",
          title: "Kiểm soát truy cập",
          body: (
            <p>
              Nguyên tắc quyền tối thiểu, xác thực đa yếu tố, log truy cập và rà soát định kỳ.
              Nhân sự chỉ truy cập dữ liệu khách hàng khi có yêu cầu hỗ trợ cụ thể và được ghi
              nhận. Môi trường production không truy cập trực tiếp từ máy cá nhân.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Liên hệ bảo mật",
          body: (
            <p>
              <a href="mailto:security@deepsi.space">security@deepsi.space</a> — cho báo cáo
              lỗ hổng. <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> — cho câu
              hỏi về cấu hình và tuân thủ.
            </p>
          ),
        },
      ]}
      note="Trang này mô tả cam kết của dịch vụ. Bản demo chạy hoàn toàn trong trình duyệt và không gửi dữ liệu ra ngoài."
    />
  );
}
