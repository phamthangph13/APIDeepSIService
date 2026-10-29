import { useEffect, type ReactNode } from "react";
import { Link, Navigate, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { SITE } from "../data/site";
import { initials } from "../lib/format";
import { Logo } from "./Logo";
import { Sticker } from "./Sticker";

export type AdminSection = "overview" | "users" | "orders" | "usage";

const TABS: Array<{
  to: string;
  label: string;
  number: string;
  sticker: "chart" | "user" | "coin" | "bolt";
  section: AdminSection;
  end?: boolean;
}> = [
  { to: "/admin", label: "Tổng quan", number: "01", sticker: "chart", section: "overview", end: true },
  { to: "/admin/users", label: "Người dùng", number: "02", sticker: "user", section: "users" },
  { to: "/admin/orders", label: "Đơn hàng", number: "03", sticker: "coin", section: "orders" },
  { to: "/admin/usage", label: "Sử dụng", number: "04", sticker: "bolt", section: "usage" },
];

type AdminShellProps = {
  children: ReactNode;
  title: string;
  section: AdminSection;
};

export function AdminShell({ children, title, section }: AdminShellProps) {
  const { user, loading, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} · Admin · DeepSI Agent`;
  }, [title]);

  if (loading) {
    return (
      <div className="dash-loading">
        <Sticker name="shield" size={64} rotate={-8} />
        <span className="mono">Đang mở admin console…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = async () => {
    await logout();
    push("Đã đăng xuất khỏi admin console", "info");
    navigate("/login");
  };

  return (
    <div className="dash admin">
      <header className="dash-bar">
        <div className="dash-bar__brand">
          <Logo compact />
          <div className="dash-bar__crumb">
            <span className="mono">Admin</span>
            <span className="dash-bar__slash">/</span>
            <strong>{title}</strong>
          </div>
        </div>

        <div className="admin-bar__mode mono">
          <span className="status-dot" />
          Quản trị hệ thống
        </div>

        <div className="dash-bar__right">
          <Link to="/" className="dash-bar__site">
            <span>Về trang chủ</span>
            <Sticker name="external" size={19} flat decorative />
          </Link>
          <div className="admin-account">
            <span className={`avatar avatar--${user.avatarColor}`}>{initials(user.name)}</span>
            <div className="admin-account__copy">
              <strong>{user.name}</strong>
              <span className="mono">Quản trị viên</span>
            </div>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => void handleLogout()}>
            <Sticker name="logout" size={17} flat decorative />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      <nav className="dash-tabs" aria-label="Khu vực quản trị">
        <div className="dash-tabs__inner">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `dash-tab${isActive ? " is-active" : ""}${tab.section === section ? " is-current" : ""}`
              }
            >
              <span className="dash-tab__num mono">{tab.number}</span>
              <Sticker name={tab.sticker} size={24} flat decorative />
              <span className="dash-tab__label">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-main__inner">{children}</div>
      </main>

      <footer className="dash-foot">
        <span className="mono">{SITE.name} / admin</span>
        <span className="dash-foot__status">
          <span className="status-dot" />
          <span className="mono">Admin API hoạt động</span>
        </span>
        <span className="mono">© 2026 DeepSI</span>
      </footer>
    </div>
  );
}
