import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function ResetPassword() {
  const [params] = useSearchParams();
  const tokenParam = params.get("token") ?? "";
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { resetPassword } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!token.trim()) {
      setError("Dán liên kết hoặc mã đặt lại mật khẩu.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (password.length > 72) {
      setError("Mật khẩu không được dài quá 72 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Hai mật khẩu chưa khớp nhau.");
      return;
    }
    setBusy(true);
    const result = await resetPassword(token.trim(), password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    push("Mật khẩu đã được đặt lại", "success", "Bạn đã được đăng nhập vào client.");
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthLayout
      mode="reset"
      footer={
        <p className="auth-switch">
          Chưa có liên kết? <Link to="/forgot-password">Yêu cầu lại</Link>
        </p>
      }
    >
      <div className="auth-icon-head">
        <Sticker name="key" size={64} rotate={-6} />
        <div>
          <span className="mono">Mật khẩu mới</span>
          <p>
            {tokenParam
              ? "Liên kết hợp lệ trong 30 phút. Chọn mật khẩu mới cho tài khoản của bạn."
              : "Dán liên kết đặt lại hoặc mã bạn nhận được, rồi chọn mật khẩu mới."}
          </p>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {!tokenParam ? (
          <FormField
            label="Liên kết hoặc mã đặt lại"
            name="token"
            value={token}
            onChange={setToken}
            placeholder="Dán token từ email"
            autoComplete="one-time-code"
            icon="key"
            required
          />
        ) : (
          <div className="token-note">
            <Sticker name="check" size={20} flat decorative />
            <span className="mono">Đã nhận liên kết đặt lại · {tokenParam.slice(0, 8)}…</span>
          </div>
        )}

        <FormField
          label="Mật khẩu mới"
          name="password"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Ít nhất 8 ký tự"
          autoComplete="new-password"
          icon="lock"
          required
          rightSlot={
            <button
              type="button"
              className="field__reveal"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <Sticker name="eye" size={22} flat decorative />
            </button>
          }
        />

        <FormField
          label="Nhập lại mật khẩu"
          name="confirm"
          type={show ? "text" : "password"}
          value={confirm}
          onChange={setConfirm}
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          icon="lock"
          required
        />

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" full disabled={busy} icon="shield">
          {busy ? "Đang cập nhật…" : "Đặt lại mật khẩu"}
        </Button>
        <p className="auth-form__fine">
          Sau khi đặt lại, mọi phiên cũ trên thiết bị khác được đăng xuất. Key API không bị ảnh
          hưởng.
        </p>
      </form>
    </AuthLayout>
  );
}
