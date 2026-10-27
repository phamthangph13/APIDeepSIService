import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { OAuthButtons } from "../components/OAuthButtons";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { DEMO_CREDENTIALS } from "../lib/auth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, next, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Nhập email và mật khẩu để tiếp tục.");
      return;
    }
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    push("Đã đăng nhập", "success", `Chào mừng trở lại, ${result.user?.name ?? "bạn"}.`);
    navigate(next, { replace: true });
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
    push("Đã điền tài khoản demo", "info", "Bấm Đăng nhập để tiếp tục.");
  };

  return (
    <AuthLayout
      mode="login"
      footer={
        <p className="auth-switch">
          Chưa có tài khoản?{" "}
          <Link to="/register">Tạo tài khoản miễn phí</Link>
        </p>
      }
    >
      <OAuthButtons next={next} />

      <div className="auth-divider">
        <span>hoặc bằng email</span>
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
        />
        <FormField
          label="Mật khẩu"
          name="password"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Mật khẩu của bạn"
          autoComplete="current-password"
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

        <div className="auth-form__row">
          <label className="checkline">
            <input type="checkbox" defaultChecked />
            <span className="checkline__box">
              <Sticker name="check" size={13} flat decorative />
            </span>
            <span>Giữ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="auth-form__link">
            Quên mật khẩu?
          </Link>
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" full disabled={busy} icon="arrow" iconSide="right">
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>

      <button type="button" className="demo-card" onClick={fillDemo}>
        <Sticker name="user" size={38} rotate={-5} flat decorative />
        <span>
          <strong>Dùng tài khoản demo</strong>
          <em className="mono">{DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}</em>
        </span>
        <Sticker name="arrow" size={20} rotate={-15} flat decorative />
      </button>
    </AuthLayout>
  );
}
