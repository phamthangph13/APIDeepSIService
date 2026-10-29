import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { OAuthButtons } from "../components/OAuthButtons";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { usePlans } from "../context/PlansContext";
import { useToast } from "../context/ToastContext";
import type { PlanId } from "../data/plans";

const PLAN_IDS: PlanId[] = ["free", "plus", "ultral"];

function scorePassword(value: string): number {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, register } = useAuth();
  const { byId } = usePlans();
  const { push } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planParam = params.get("plan");
  const plan = PLAN_IDS.includes(planParam as PlanId) ? byId[planParam as PlanId] : null;
  const score = scorePassword(password);

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (name.trim().length < 2) {
      setError("Nhập tên bạn muốn dùng trong client, ít nhất 2 ký tự.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email chưa đúng định dạng.");
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
    if (!terms) {
      setError("Bạn cần đồng ý với điều khoản để tạo tài khoản.");
      return;
    }
    setBusy(true);
    const result = await register(name, email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.requiresEmailVerification) {
      setNotice(result.message ?? "Tài khoản đã được tạo. Kiểm tra email để xác nhận trước khi đăng nhập.");
      return;
    }
    push("Tài khoản đã được tạo", "success", "Tạo API key đầu tiên trong Client → API keys.");
    navigate("/dashboard?welcome=1", { replace: true });
  };

  return (
    <AuthLayout
      mode="register"
      footer={
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      }
    >
      {plan ? (
        <div className="plan-hint">
          <Sticker name={plan.sticker} size={34} rotate={-5} flat decorative />
          <span>
            Bạn đang chọn gói <strong>{plan.name}</strong> · {plan.priceLabel}
            {plan.price > 0 ? " / tháng" : " mãi mãi"}. Có thể đổi sau khi tạo tài khoản.
          </span>
          <Link to="/pricing">Đổi</Link>
        </div>
      ) : null}

      <OAuthButtons next="/dashboard" />

      <div className="auth-divider">
        <span>hoặc bằng email</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Tên"
          name="name"
          value={name}
          onChange={setName}
          placeholder="Nguyễn Minh Anh"
          autoComplete="name"
          icon="user"
          required
        />
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
        <div>
          <FormField
            label="Mật khẩu"
            name="password"
            type={show ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="Ít nhất 8 ký tự"
            autoComplete="new-password"
            icon="lock"
            required
            hint="Dùng ít nhất 8 ký tự, tốt hơn nếu có số và chữ hoa."
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
          {password ? (
            <div className={`strength strength--${score}`} aria-hidden="true">
              {[1, 2, 3, 4].map((step) => (
                <span key={step} className={step <= score ? "is-on" : ""} />
              ))}
              <em className="mono">
                {score <= 1 ? "yếu" : score === 2 ? "ổn" : score === 3 ? "tốt" : "mạnh"}
              </em>
            </div>
          ) : null}
        </div>

        <label className="checkline checkline--terms">
          <input
            type="checkbox"
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
          />
          <span className="checkline__box">
            <Sticker name="check" size={13} flat decorative />
          </span>
          <span>
            Tôi đồng ý với <Link to="/terms">Điều khoản</Link> và{" "}
            <Link to="/privacy">Chính sách quyền riêng tư</Link>.
          </span>
        </label>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? <p className="form-note">{notice}</p> : null}

        <Button type="submit" variant="primary" size="lg" full disabled={busy} icon="key">
          {busy ? "Đang tạo tài khoản…" : "Tạo tài khoản miễn phí"}
        </Button>
        <p className="auth-form__fine">
          Không cần thẻ. Không tự động trừ tiền. Bạn có thể xóa tài khoản bất cứ lúc nào.
        </p>
      </form>
    </AuthLayout>
  );
}
