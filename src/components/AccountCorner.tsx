import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { initials } from "../lib/format";
import { Sticker } from "./Sticker";

const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
];

export function AccountCorner() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const hidden = HIDDEN_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (hidden) return null;

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } finally {
      push("Đã đăng xuất khỏi DeepSI Agent", "info");
      navigate("/");
    }
  };

  return (
    <div className="account-corner" ref={rootRef}>
      {user ? (
        <>
          <button
            type="button"
            className="account-chip"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span className={`avatar avatar--${user.avatarColor}`}>{initials(user.name)}</span>
            <span className="account-chip__copy">
              <span className="mono">{user.role === "admin" ? "Admin" : "Client"}</span>
              <strong>{user.name}</strong>
            </span>
            <Sticker name="arrow" size={19} rotate={open ? -80 : 20} flat decorative />
          </button>
          {open ? (
            <div className="account-menu" role="menu">
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
                <Link to="/dashboard" role="menuitem" onClick={() => setOpen(false)}>
                  <Sticker name="chart" size={22} flat decorative />
                  <span>Tổng quan client</span>
                </Link>
                <Link to="/dashboard/keys" role="menuitem" onClick={() => setOpen(false)}>
                  <Sticker name="key" size={22} flat decorative />
                  <span>API keys</span>
                </Link>
                <Link to="/dashboard/billing" role="menuitem" onClick={() => setOpen(false)}>
                  <Sticker name="coin" size={22} flat decorative />
                  <span>Gói dịch vụ</span>
                </Link>
              </div>
              <button
                type="button"
                className="account-menu__logout"
                role="menuitem"
                onClick={() => void handleLogout()}
              >
                <Sticker name="logout" size={22} flat decorative />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <Link to="/login" className="account-stamp" aria-label="Đăng nhập client">
          <Sticker name="user" size={28} rotate={-5} flat decorative />
          <span className="account-stamp__copy">
            <span className="mono">Client</span>
            <strong>Đăng nhập</strong>
          </span>
        </Link>
      )}
    </div>
  );
}
