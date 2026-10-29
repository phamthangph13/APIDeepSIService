import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { ButtonLink } from "../components/Button";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";

export function OAuthCallback() {
  const [params] = useSearchParams();
  const code = params.get("code") ?? "";
  const next = params.get("next") || "/dashboard";
  const oauthError = params.get("error_description") || params.get("error") || "";
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState(oauthError);
  const [busy, setBusy] = useState(!oauthError);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (oauthError) {
      setBusy(false);
      return;
    }
    if (!code) {
      setError("Thiếu mã xác thực OAuth. Hãy thử đăng nhập lại.");
      setBusy(false);
      return;
    }
    void completeOAuth(code).then((result) => {
      if (result.accessToken && result.user) {
        const target =
          result.user.role === "admin"
            ? "/admin"
            : next.startsWith("/admin")
              ? "/dashboard"
              : next;
        navigate(target, { replace: true });
        return;
      }
      setError(result.error ?? "Không thể hoàn tất đăng nhập OAuth.");
      setBusy(false);
    });
  }, [code, completeOAuth, navigate, next, oauthError]);

  return (
    <AuthLayout
      mode="oauth"
      footer={
        <p className="auth-switch">
          <Link to="/login">Quay lại đăng nhập bằng email</Link>
        </p>
      }
    >
      <div className="auth-result">
        <Sticker name={busy ? "spark" : "shield"} size={78} rotate={-6} />
        <h2>{busy ? "Đang xác thực tài khoản…" : "Đăng nhập OAuth chưa hoàn tất."}</h2>
        {busy ? (
          <p>Vui lòng đợi trong giây lát. Bạn sẽ được chuyển vào client ngay khi xong.</p>
        ) : (
          <>
            <p>{error}</p>
            <ButtonLink to="/login" variant="primary" size="md" full icon="arrow" iconSide="right">
              Thử lại
            </ButtonLink>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
