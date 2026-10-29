import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { ButtonLink } from "../components/Button";
import { FormField } from "../components/FormField";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { resendVerification, verifyEmail } from "../lib/auth";

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"busy" | "ok" | "error">("busy");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const started = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setState("error");
      setMessage("Thiếu mã xác nhận trong liên kết. Hãy mở đúng liên kết từ email.");
      return;
    }
    void verifyEmail(token).then((result) => {
      if (result.error) {
        setState("error");
        setMessage(result.error);
        return;
      }
      setState("ok");
      setMessage(result.message ?? "Email đã được xác nhận.");
    });
  }, [token]);

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendBusy(true);
    const result = await resendVerification(email.trim());
    setResendBusy(false);
    setMessage(result.message ?? result.error ?? "Đã xử lý yêu cầu.");
  };

  const home = user?.role === "admin" ? "/admin" : "/dashboard";
  const homeLabel = user?.role === "admin" ? "Vào admin console" : "Vào client";

  return (
    <AuthLayout
      mode="verify"
      footer={
        <p className="auth-switch">
          {user ? (
            <Link to={home}>{homeLabel}</Link>
          ) : (
            <Link to="/login">Đăng nhập</Link>
          )}
        </p>
      }
    >
      <div className="auth-result">
        <Sticker name={state === "ok" ? "check" : state === "busy" ? "spark" : "shield"} size={78} rotate={-6} />
        <h2>
          {state === "busy"
            ? "Đang xác nhận email…"
            : state === "ok"
              ? "Email đã được xác nhận."
              : "Chưa thể xác nhận."}
        </h2>
        <p>{message}</p>
        {state === "ok" ? (
          <ButtonLink to={user ? home : "/login"} variant="primary" size="md" full icon="arrow" iconSide="right">
            {user ? homeLabel : "Đăng nhập ngay"}
          </ButtonLink>
        ) : null}
        {state === "error" ? (
          <div className="auth-form">
            <FormField
              label="Gửi lại liên kết xác nhận"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ban@congty.vn"
              autoComplete="email"
              icon="user"
            />
            <button
              type="button"
              className="btn btn--secondary btn--md btn--full"
              onClick={handleResend}
              disabled={resendBusy || !email.trim()}
            >
              {resendBusy ? "Đang gửi…" : "Gửi lại email xác nhận"}
            </button>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
}
