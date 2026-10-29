import { useState, type FormEvent } from "react";
import { AdminShell } from "../components/AdminShell";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { usePlans } from "../context/PlansContext";
import { useToast } from "../context/ToastContext";
import type { PlanId } from "../data/plans";
import {
  listAdminUsers,
  updateAdminUserPlan,
  updateAdminUserRole,
  type AdminUserListItem,
} from "../lib/admin";
import type { UserRole } from "../lib/auth";
import { errorMessage } from "../lib/api";
import { formatCompact, formatRelative } from "../lib/format";
import { useApiQuery } from "../lib/useApiQuery";

const LIMIT = 20;

export function AdminUsers() {
  return (
    <AdminShell title="Người dùng" section="users">
      <AdminUsersContent />
    </AdminShell>
  );
}

function AdminUsersContent() {
  const { user: currentUser } = useAuth();
  const { plans, byId } = usePlans();
  const { push } = useToast();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [plan, setPlan] = useState<PlanId | "">("");
  const [offset, setOffset] = useState(0);
  const [roleTarget, setRoleTarget] = useState<AdminUserListItem | null>(null);
  const [roleBusy, setRoleBusy] = useState(false);
  const [planTarget, setPlanTarget] = useState<AdminUserListItem | null>(null);
  const [planDraft, setPlanDraft] = useState<PlanId>("free");
  const [months, setMonths] = useState(1);
  const [planBusy, setPlanBusy] = useState(false);

  const { data, loading, error, reload } = useApiQuery(
    () => listAdminUsers({ q: query, role, plan, limit: LIMIT, offset }),
    [query, role, plan, offset],
  );

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = Math.floor(offset / LIMIT) + 1;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOffset(0);
    setQuery(search);
  };

  const changeRole = async () => {
    if (!roleTarget) return;
    const nextRole: UserRole = roleTarget.user.role === "admin" ? "client" : "admin";
    setRoleBusy(true);
    try {
      await updateAdminUserRole(roleTarget.user.id, nextRole);
      push(
        nextRole === "admin" ? "Đã cấp quyền admin" : "Đã thu hồi quyền admin",
        "success",
        roleTarget.user.email,
      );
      setRoleTarget(null);
      await reload();
    } catch (err) {
      push("Không thể đổi quyền", "error", errorMessage(err));
    } finally {
      setRoleBusy(false);
    }
  };

  const openPlan = (item: AdminUserListItem) => {
    setPlanTarget(item);
    setPlanDraft(item.user.plan);
    setMonths(1);
  };

  const changePlan = async () => {
    if (!planTarget) return;
    setPlanBusy(true);
    try {
      await updateAdminUserPlan(planTarget.user.id, planDraft, planDraft === "free" ? 0 : months);
      push("Đã cập nhật gói", "success", `${planTarget.user.email} → ${byId[planDraft].name}`);
      setPlanTarget(null);
      await reload();
    } catch (err) {
      push("Không thể đổi gói", "error", errorMessage(err));
    } finally {
      setPlanBusy(false);
    }
  };

  return (
    <div className="dash-page">
      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">Admin / Người dùng</span>
          <h1>
            Tài khoản &amp; <em>quyền truy cập.</em>
          </h1>
          <p>
            Tìm kiếm tài khoản, đổi vai trò client/admin và điều chỉnh gói dịch vụ. Hành động thu
            hồi quyền admin của chính mình bị chặn ở phía server.
          </p>
        </div>
        <div className="dash-page__actions">
          <Button variant="secondary" onClick={() => void reload()} disabled={loading}>
            Làm mới
          </Button>
        </div>
      </header>

      <div className="admin-toolbar">
        <form className="admin-search" onSubmit={submitSearch}>
          <FormField
            label="Tìm kiếm"
            name="admin-user-search"
            value={search}
            onChange={setSearch}
            placeholder="Tên hoặc email"
            icon="search"
          />
          <Button type="submit" variant="primary" size="sm">
            Tìm
          </Button>
        </form>
        <div className="admin-filters">
          <label className="admin-field">
            <span className="mono">Vai trò</span>
            <select
              value={role}
              onChange={(event) => {
                setOffset(0);
                setRole(event.target.value as UserRole | "");
              }}
            >
              <option value="">Tất cả</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="mono">Gói</span>
            <select
              value={plan}
              onChange={(event) => {
                setOffset(0);
                setPlan(event.target.value as PlanId | "");
              }}
            >
              <option value="">Tất cả</option>
              {plans.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="dash-empty">
          <Sticker name="shield" size={90} rotate={-5} />
          <h2>Không tải được danh sách người dùng.</h2>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => void reload()}>
            Thử lại
          </Button>
        </div>
      ) : null}

      <section className="admin-table">
        <div className="admin-table__head admin-users-grid">
          <span className="mono">Tài khoản</span>
          <span className="mono">Vai trò</span>
          <span className="mono">Gói</span>
          <span className="mono">Key</span>
          <span className="mono">Token 30d</span>
          <span className="mono">Hoạt động</span>
          <span />
        </div>
        {users.map((item) => {
          const isSelf = item.user.id === currentUser?.id;
          return (
            <div className="admin-table__row admin-users-grid" key={item.user.id}>
              <div className="admin-user-cell">
                <span className={`avatar avatar--${item.user.avatarColor}`}>
                  {item.user.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{item.user.name}</strong>
                  <span className="mono">{item.user.email}</span>
                </div>
              </div>
              <span className={`admin-pill admin-pill--${item.user.role}`}>
                {item.user.role === "admin" ? "Admin" : "Client"}
              </span>
              <span className="admin-cell-text">{byId[item.user.plan]?.name ?? item.user.plan}</span>
              <span className="admin-cell-text mono">{item.keyCount}</span>
              <span className="admin-cell-text mono">{formatCompact(item.tokens30d)}</span>
              <span className="admin-cell-text">{formatRelative(item.lastSeen)}</span>
              <div className="admin-row-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRoleTarget(item)}
                  disabled={isSelf}
                  title={isSelf ? "Không thể tự thu hồi quyền admin" : undefined}
                >
                  {item.user.role === "admin" ? "Hạ quyền" : "Cấp admin"}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openPlan(item)}>
                  Đổi gói
                </Button>
              </div>
            </div>
          );
        })}
        {!loading && users.length === 0 ? (
          <div className="key-list__empty">
            <p>Không có người dùng phù hợp bộ lọc.</p>
          </div>
        ) : null}
        {loading && users.length === 0 ? (
          <div className="key-list__empty">
            <p>Đang tải người dùng…</p>
          </div>
        ) : null}
      </section>

      <div className="admin-pagination">
        <span className="mono">
          Trang {page} / {pages} · {total} tài khoản
        </span>
        <div>
          <Button
            variant="secondary"
            size="sm"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
          >
            Trước
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={offset + LIMIT >= total || loading}
            onClick={() => setOffset(offset + LIMIT)}
          >
            Sau
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={roleTarget !== null}
        onClose={() => setRoleTarget(null)}
        onConfirm={changeRole}
        confirmDisabled={roleBusy}
        eyebrow="Admin / Phân quyền"
        title={
          roleTarget?.user.role === "admin"
            ? "Thu hồi quyền admin?"
            : "Cấp quyền admin?"
        }
        confirmLabel={roleBusy ? "Đang cập nhật…" : roleTarget?.user.role === "admin" ? "Hạ quyền" : "Cấp admin"}
        icon="lock"
        body={
          <p>
            Tài khoản <strong>{roleTarget?.user.email}</strong> sẽ được đổi sang vai trò{" "}
            <strong>{roleTarget?.user.role === "admin" ? "client" : "admin"}</strong>. Người dùng
            cần đăng nhập lại để áp dụng đầy đủ.
          </p>
        }
      />

      <Modal
        open={planTarget !== null}
        onClose={() => setPlanTarget(null)}
        eyebrow="Admin / Gói dịch vụ"
        title="Đổi gói người dùng"
        size="sm"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setPlanTarget(null)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={() => void changePlan()} disabled={planBusy}>
              {planBusy ? "Đang cập nhật…" : "Lưu thay đổi"}
            </Button>
          </div>
        }
      >
        <div className="admin-modal-body">
          <p>
            Tài khoản <strong>{planTarget?.user.email}</strong>.
          </p>
          <label className="admin-field">
            <span className="mono">Gói</span>
            <select value={planDraft} onChange={(event) => setPlanDraft(event.target.value as PlanId)}>
              {plans.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {planDraft !== "free" ? (
            <label className="admin-field">
              <span className="mono">Số tháng</span>
              <select value={months} onChange={(event) => setMonths(Number(event.target.value))}>
                <option value={1}>1 tháng</option>
                <option value={3}>3 tháng</option>
                <option value={6}>6 tháng</option>
                <option value={12}>12 tháng</option>
              </select>
            </label>
          ) : null}
          <p className="admin-modal-note">
            Gói Free không có ngày hết hạn. Gói trả phí sẽ bắt đầu từ bây giờ và cộng dồn nếu tài
            khoản đang còn hạn.
          </p>
        </div>
      </Modal>
    </div>
  );
}
