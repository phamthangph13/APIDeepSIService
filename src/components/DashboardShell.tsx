import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Navigate, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PLAN_BY_ID } from "../data/plans";
import { initials } from "../lib/format";
import { Logo } from "./Logo";
import { Sticker } from "./Sticker";

export type DashSection = "overview" | "keys" | "usage" | "billing";

const TABS: Array<{
  to: string;
  label: string;
  number: string;
  sticker: "chart" | "key" | "bolt" | "coin";
  section: DashSection;
  end?: boolean;
}> = [
  { to: "/dashboard", label: "Tổng quan", number: "01", sticker: "chart", section: "overview", end: true },
  { to: "/dashboard/keys", label: "API keys", number: "02", sticker: "key", section: "keys" },
  { to: "/dashboard/usage", label: "Sử dụng", number: "03", sticker: "bolt", section: "usage" },
  { to: "/dashboard/billing", label: "Gói dịch vụ", number: "04", sticker: "coin", section: "billing" },
];

type DashboardShellProps = {
  children: ReactNode;
  title: string;
  section: DashSection;
};

export function DashboardShell({ children, title, section }: DashboardShellProps) {
  const { user, loading, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `${title} — Client — DeepSI Agent`;
  }, [title]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (loading) {
    return (
      <div className="dash-loading">
        <Sticker name="spark" size={64} rotate={-8} />
        <span className="mono">Đang mở client…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const plan = PLAN_BY_ID[user.plan];

  const handleLogout = () => {
    logout();
    push("Đã đăng xuất khỏi DeepSI Agent", "info");
    navigate("/");
  };

  return (
    <div className="dash">
      <header className="dash-bar">
        <div className="dash-bar__brand">
          <Logo compact />
          <div className="dash-bar__crumb">
            <span className="mono">Client</span>
            <span className="dash-bar__slash">/</span>
            <strong>{title}</strong>
          </div>
        </div>

        <div className="dash-bar__status">
          <span className="status-dot" />
          <span className="mono">API trực tuyến</span>
          <span className="mono dash-bar__region">3 vùng · Hà Nội · Đà Nẵng · TP.HCM</span>
        </div>

        <div className="dash-bar__right" ref={menuRef}>
          <Link to="/" className="dash-bar__site">
            <span>Về trang chủ</span>
            <Sticker name="external" size={19} flat decorative />
          </Link>
          <button
            type="button"
            className="dash-account"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className={`avatar avatar--${user.avatarColor}`}>{initials(user.name)}</span>
            <span className="dash-account__copy">
              <strong>{user.name}</strong>
              <span className="mono">{plan.name}</span>
            </span>
            <Sticker name="arrow" size={18} rotate={menuOpen ? -80 : 20} flat decorative />
          </button>
          {menuOpen ? (
            <div className="account-menu account-menu--dash" role="menu">
              <div className="account-menu__head">
                <span className={`avatar avatar--${user.avatarColor} avatar--lg`}>
                  {initials(user.name)}
                </span>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="account-menu__links">
                <Link to="/dashboard" role="menuitem" onClick={() => setMenuOpen(false)}>
                  <Sticker name="chart" size={22} flat decorative />
                  <span>Tổng quan</span>
                </Link>
                <Link to="/dashboard/billing" role="menuitem" onClick={() => setMenuOpen(false)}>
                  <Sticker name="coin" size={22} flat decorative />
                  <span>Gói dịch vụ</span>
                </Link>
              </div>
              <button type="button" className="account-menu__logout" role="menuitem" onClick={handleLogout}>
                <Sticker name="logout" size={22} flat decorative />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <nav className="dash-tabs" aria-label="Khu vực client">
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
        <span className="mono">DeepSI Agent / service.deepsi.space</span>
        <span className="dash-foot__status">
          <span className="status-dot" />
          <span className="mono">Tất cả hệ thống hoạt động</span>
        </span>
        <span className="mono">© 2026 DeepSI</span>
      </footer>
    </div>
  );
}
