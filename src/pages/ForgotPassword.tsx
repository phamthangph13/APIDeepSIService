import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Sticker } from "../components/Sticker";
import { useToast } from "../context/ToastContext";
import { requestPasswordReset } from "../lib/auth";

type SentState = {
  message: string;
  debugToken?: string;
  resetUrl?: string;
  email: string;
};

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<SentState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email chưa đúng định dạng.");
      return;
    }
    setBusy(true);
    const result = await requestPasswordReset(email);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent({
      message:
        result.message ??
        "Nếu email này có tài khoản, chúng tôi đã gửi liên kết đặt lại mật khẩu.",
      debugToken: result.debugToken,
      resetUrl: result.resetUrl,
      email: email.trim().toLowerCase(),
    });
    push("Đã gửi yêu cầu đặt lại", "success", "Kiểm tra hộp thư và thư mục spam.");
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
          <Sticker name="check" size={78} rotate={-6} />
          <h2>Kiểm tra email của bạn.</h2>
          <p>
            {sent.message} Địa chỉ nhận: <strong>{sent.email}</strong>. Liên kết có hiệu lực
            trong 30 phút.
          </p>
          {sent.resetUrl ? (
            <div className="dev-reset">
              <span className="mono">Môi trường phát triển / không gửi email thật</span>
              <p>Máy chủ đang trả liên kết trực tiếp để bạn hoàn tất luồng đặt lại:</p>
              <Link
                to={new URL(sent.resetUrl).pathname + new URL(sent.resetUrl).search}
                className="btn btn--primary btn--md btn--full"
              >
                <span>Đặt lại mật khẩu ngay</span>
                <Sticker name="arrow" size={20} rotate={-12} flat decorative />
              </Link>
            </div>
          ) : null}
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
              <p>Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
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
              {busy ? "Đang gửi…" : "Gửi liên kết đặt lại"}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
