import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Sticker } from "../components/Sticker";
import { useToast } from "../context/ToastContext";
import { DEMO_CREDENTIALS, requestPasswordReset } from "../lib/auth";

type SentState = { token: string | null; exists: boolean; email: string } | null;

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<SentState>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email chưa đúng định dạng.");
      return;
    }
    setBusy(true);
    const result = requestPasswordReset(email);
    setBusy(false);
    setSent({ ...result, email: email.trim().toLowerCase() });
    if (result.exists) {
      push("Đã tạo liên kết đặt lại", "success", "Liên kết có hiệu lực trong 30 phút.");
    }
  };

  return (
    <AuthLayout
      mode="forgot"
      footer={
        <p className="auth-switch">
          Nhớ ra rồi? <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      }
    >
      {sent ? (
        <div className="auth-result">
          <Sticker name={sent.exists ? "check" : "search"} size={78} rotate={-6} />
          <h2>{sent.exists ? "Kiểm tra email của bạn." : "Chưa tìm thấy tài khoản."}</h2>
          {sent.exists ? (
            <>
              <p>
                Trong môi trường production, một email chứa liên kết đặt lại sẽ được gửi đến{" "}
                <strong>{sent.email}</strong>. Liên kết có hiệu lực trong 30 phút.
              </p>
              <div className="demo-reset">
                <span className="mono">Demo / không gửi email thật</span>
                <p>Bản demo chạy trong trình duyệt, nên liên kết được tạo ngay tại đây:</p>
                {sent.token ? (
                  <Link to={`/reset-password?token=${sent.token}`} className="btn btn--primary btn--md btn--full">
                    <span>Đặt lại mật khẩu ngay</span>
                    <Sticker name="arrow" size={20} rotate={-12} flat decorative />
                  </Link>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p>
                Email <strong>{sent.email}</strong> chưa có tài khoản DeepSI Agent. Bạn có thể
                tạo tài khoản mới miễn phí — quá trình mất chưa đến một phút.
              </p>
              <Link to="/register" className="btn btn--primary btn--md btn--full">
                <span>Tạo tài khoản miễn phí</span>
                <Sticker name="key" size={20} rotate={-8} flat decorative />
              </Link>
            </>
          )}
          <button type="button" className="auth-result__back" onClick={() => setSent(null)}>
            <Sticker name="arrow" size={18} rotate={-135} flat decorative />
            <span>Dùng email khác</span>
          </button>
        </div>
      ) : (
        <>
          <div className="auth-icon-head">
            <Sticker name="lock" size={64} rotate={-6} />
            <div>
              <span className="mono">Khôi phục tài khoản</span>
              <p>Nhập email đã đăng ký. Chúng tôi sẽ tạo liên kết đặt lại mật khẩu.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ban@congty.vn"
              autoComplete="email"
              icon="user"
              required
              hint="Dùng đúng email bạn đã đăng ký."
            />

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="primary" size="lg" full disabled={busy} icon="plane" iconSide="right">
              {busy ? "Đang tạo liên kết…" : "Gửi liên kết đặt lại"}
            </Button>
          </form>

          <button
            type="button"
            className="demo-card"
            onClick={() => {
              setEmail(DEMO_CREDENTIALS.email);
              setError("");
            }}
          >
            <Sticker name="user" size={38} rotate={-5} flat decorative />
            <span>
              <strong>Dùng email demo</strong>
              <em className="mono">{DEMO_CREDENTIALS.email}</em>
            </span>
            <Sticker name="arrow" size={20} rotate={-15} flat decorative />
          </button>
        </>
      )}
    </AuthLayout>
  );
}
