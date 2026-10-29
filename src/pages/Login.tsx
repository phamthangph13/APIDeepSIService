import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { OAuthButtons } from "../components/OAuthButtons";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function Login() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(() => params.get("oauth_error") ?? "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const nextParam = params.get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
  const destinationFor = (role: string | undefined) => {
    if (role === "admin") return "/admin";
    return next.startsWith("/admin") ? "/dashboard" : next;
  };

  useEffect(() => {
    if (user) navigate(destinationFor(user.role), { replace: true });
  }, [user, next, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
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
    if (result.requiresEmailVerification) {
      setNotice(result.message ?? "Kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
      return;
    }
    push("Đã đăng nhập", "success", `Chào mừng trở lại, ${result.user?.name ?? "bạn"}.`);
    navigate(destinationFor(result.user?.role), { replace: true });
  };

  return (
    <AuthLayout
      mode="login"
      footer={
        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản miễn phí</Link>
          <br />
          Quản trị viên? <Link to="/admin/login">Đăng nhập admin</Link>
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
          <span className="mono">Phiên đăng nhập được bảo vệ bằng cookie.</span>
          <Link to="/forgot-password" className="auth-form__link">
            Quên mật khẩu?
          </Link>
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? <p className="form-note">{notice}</p> : null}

        <Button type="submit" variant="primary" size="lg" full disabled={busy} icon="arrow" iconSide="right">
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
    </AuthLayout>
  );
}
