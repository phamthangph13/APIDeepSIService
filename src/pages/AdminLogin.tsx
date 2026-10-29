import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function safeAdminNext(value: string | null): string {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  if (value === "/admin/login" || value.startsWith("/admin/login?")) return "/admin";
  return value;
}

export function AdminLogin() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, login, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const next = safeAdminNext(params.get("next"));

  useEffect(() => {
    if (!user) return;
    navigate(user.role === "admin" ? next : "/dashboard", { replace: true });
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
    if (result.error) {
      setBusy(false);
      setError(result.error);
      return;
    }
    if (result.requiresEmailVerification) {
      setBusy(false);
      setNotice(result.message ?? "Kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
      return;
    }
    if (!result.user || result.user.role !== "admin") {
      await logout();
      setBusy(false);
      setError("Tài khoản này không có quyền truy cập admin console.");
      return;
    }
    setBusy(false);
    push("Đã đăng nhập admin", "success", `Chào mừng trở lại, ${result.user.name}.`);
    navigate(next, { replace: true });
  };

  return (
    <AuthLayout
      mode="admin"
      footer={
        <p className="auth-switch">
          Bạn là client? <Link to="/login">Đăng nhập client</Link>
        </p>
      }
    >
      <div className="auth-icon-head">
        <Sticker name="shield" size={64} rotate={-6} />
        <div>
          <span className="mono">Admin console</span>
          <p>Chỉ tài khoản có vai trò quản trị mới có thể truy cập khu vực này.</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email quản trị"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="admin@deepsi.space"
          autoComplete="username"
          icon="user"
          required
        />
        <FormField
          label="Mật khẩu"
          name="password"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Mật khẩu quản trị"
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
          <span className="mono">Phiên quản trị được bảo vệ bằng cookie HttpOnly.</span>
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

        <Button type="submit" variant="primary" size="lg" full disabled={busy} icon="shield">
          {busy ? "Đang xác thực…" : "Vào admin console"}
        </Button>
      </form>
    </AuthLayout>
  );
}
