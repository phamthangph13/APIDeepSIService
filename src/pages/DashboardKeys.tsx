import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, ButtonLink } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { CreateKeyModal } from "../components/CreateKeyModal";
import { DashboardShell } from "../components/DashboardShell";
import { Sticker } from "../components/Sticker";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PLAN_BY_ID } from "../data/plans";
import type { ApiKey, User } from "../lib/auth";
import { getApiKeys, revokeApiKey } from "../lib/auth";
import {
  copyText,
  formatDate,
  formatRelative,
  maskKey,
} from "../lib/format";

type Filter = "all" | "production" | "development";

export function DashboardKeys() {
  const { user } = useAuth();
  if (!user) {
    return (
      <DashboardShell title="API keys" section="keys">
        {null}
      </DashboardShell>
    );
  }
  return (
    <DashboardShell title="API keys" section="keys">
      <KeysContent user={user} />
    </DashboardShell>
  );
}

function KeysContent({ user }: { user: User }) {
  const [params, setParams] = useSearchParams();
  const [, setRefresh] = useState(0);
  const [createOpen, setCreateOpen] = useState(params.get("create") === "1");
  const [filter, setFilter] = useState<Filter>("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const { push } = useToast();
  const plan = PLAN_BY_ID[user.plan];
  const keys = getApiKeys(user.id);
  const activeKeys = keys.filter((key) => key.status === "active");
  const filtered = filter === "all" ? keys : keys.filter((key) => key.environment === filter);

  useEffect(() => {
    if (params.get("create") === "1") {
      setCreateOpen(true);
      const next = new URLSearchParams(params);
      next.delete("create");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const refreshKeys = () => setRefresh((value) => value + 1);

  const toggleReveal = (id: string) => {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = async (key: ApiKey) => {
    const ok = await copyText(key.key);
    push(ok ? "Đã sao chép API key" : "Không thể sao chép", ok ? "success" : "error");
  };

  const handleRevoke = () => {
    if (!revokeTarget) return;
    revokeApiKey(user.id, revokeTarget.id);
    push("Đã thu hồi API key", "info", "Mọi request dùng key này sẽ trả 401.");
    setRevokeTarget(null);
    refreshKeys();
  };

  return (
    <div className="dash-page">
      <header className="dash-page__head">
        <div>
          <span className="eyebrow eyebrow--plain">Client / API keys</span>
          <h1>
            Chìa khóa của <em>agent.</em>
          </h1>
          <p>
            Tạo key riêng cho từng môi trường và dịch vụ. Key chỉ hiển thị đầy đủ một lần khi
            tạo; sau đó chúng tôi chỉ lưu dạng băm.
          </p>
        </div>
        <div className="dash-page__actions">
          <Button variant="primary" icon="key" onClick={() => setCreateOpen(true)}>
            Tạo API key
          </Button>
          <ButtonLink to="/docs#authentication" variant="secondary" icon="book" iconSide="right">
            Cách xác thực
          </ButtonLink>
        </div>
      </header>

      <div className="keys-summary">
        <div>
          <span className="mono">Key đang hoạt động</span>
          <strong>
            {activeKeys.length}
            <em> / {Number.isFinite(plan.keyLimit) ? plan.keyLimit : "∞"}</em>
          </strong>
          <span className="keys-summary__note">giới hạn theo gói {plan.name}</span>
        </div>
        <div className="keys-summary__bar">
          <div className="dash-meter dash-meter--lg">
            <span
              style={{
                width: `${Number.isFinite(plan.keyLimit) ? Math.min(100, (activeKeys.length / plan.keyLimit) * 100) : 8}%`,
              }}
            />
          </div>
          <span className="mono">
            {Number.isFinite(plan.keyLimit) ? plan.keyLimit - activeKeys.length : "không giới hạn"} key còn lại
          </span>
        </div>
        <div className="keys-summary__tip">
          <Sticker name="shield" size={30} rotate={-5} flat decorative />
          <span>Xoay vòng key định kỳ và thu hồi ngay khi nghi ngờ bị lộ.</span>
        </div>
      </div>

      <div className="keys-toolbar">
        <div className="segmented segmented--sm" role="group" aria-label="Lọc key theo môi trường">
          {(
            [
              { id: "all", label: "Tất cả", count: keys.length },
              { id: "production", label: "Production", count: keys.filter((k) => k.environment === "production").length },
              { id: "development", label: "Development", count: keys.filter((k) => k.environment === "development").length },
            ] as Array<{ id: Filter; label: string; count: number }>
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`segmented__item${filter === item.id ? " is-active" : ""}`}
              onClick={() => setFilter(item.id)}
            >
              <span>{item.label}</span>
              <em className="mono">{item.count}</em>
            </button>
          ))}
        </div>
        <span className="mono keys-toolbar__note">
          {filtered.length} / {keys.length} key
        </span>
      </div>

      {keys.length === 0 ? (
        <div className="dash-empty">
          <Sticker name="key" size={120} rotate={-7} />
          <h2>Chưa có chìa khóa nào.</h2>
          <p>
            Tạo API key đầu tiên để agent của bạn có thể gọi endpoint. Miễn phí trên mọi gói,
            không cần thẻ.
          </p>
          <Button variant="primary" size="lg" icon="key" onClick={() => setCreateOpen(true)}>
            Tạo API key đầu tiên
          </Button>
          <span className="mono">Free · 5 key · 10.000 token/ngày</span>
        </div>
      ) : (
        <div className="key-list">
          <div className="key-list__head">
            <span className="mono">Tên / Môi trường</span>
            <span className="mono">Key</span>
            <span className="mono">Quyền</span>
            <span className="mono">Lần dùng cuối</span>
            <span className="mono">Trạng thái</span>
            <span />
          </div>
          {filtered.map((key) => {
            const isRevealed = revealed.has(key.id);
            return (
              <article className={`key-row${key.status === "revoked" ? " is-revoked" : ""}`} key={key.id}>
                <div className="key-row__identity">
                  <Sticker name="key" size={34} rotate={-4} flat decorative />
                  <div>
                    <strong>{key.name}</strong>
                    <span className="mono">
                      {key.environment === "production" ? "LIVE" : "TEST"} · tạo{" "}
                      {formatDate(key.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="key-row__value">
                  <code>{isRevealed ? key.key : maskKey(key.key)}</code>
                  <button
                    type="button"
                    onClick={() => toggleReveal(key.id)}
                    aria-label={isRevealed ? "Ẩn key" : "Hiện key"}
                    disabled={key.status === "revoked"}
                  >
                    <Sticker name="eye" size={18} flat decorative />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(key)}
                    aria-label="Sao chép key"
                    disabled={key.status === "revoked"}
                  >
                    <Sticker name="copy" size={18} flat decorative />
                  </button>
                </div>

                <div className="key-row__scopes">
                  {key.scopes.map((scope) => (
                    <span className="scope-tag" key={scope}>
                      {scope}
                    </span>
                  ))}
                </div>

                <span className="key-row__used">{formatRelative(key.lastUsed)}</span>

                <span className={`status-pill status-pill--${key.status === "active" ? "ok" : "off"}`}>
                  {key.status === "active" ? "active" : "revoked"}
                </span>

                <div className="key-row__actions">
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => setRevokeTarget(key)}
                    aria-label={`Thu hồi ${key.name}`}
                    disabled={key.status === "revoked"}
                  >
                    <Sticker name="trash" size={18} flat decorative />
                  </button>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 ? (
            <div className="key-list__empty">
              <p>Không có key nào trong môi trường này.</p>
              <button type="button" className="text-link" onClick={() => setFilter("all")}>
                Xem tất cả
              </button>
            </div>
          ) : null}
        </div>
      )}

      <div className="keys-note">
        <Sticker name="lock" size={36} rotate={-5} flat decorative />
        <div>
          <strong>Key không bao giờ được gửi qua email.</strong>
          <p>
            Nếu mất key, hãy tạo key mới và thu hồi key cũ. Chúng tôi không thể khôi phục key
            đã tạo.
          </p>
        </div>
        <ButtonLink to="/security" variant="ghost" size="sm" icon="arrow" iconSide="right">
          Chính sách bảo mật
        </ButtonLink>
      </div>

      <CreateKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refreshKeys}
        userId={user.id}
        planId={user.plan}
        existingCount={activeKeys.length}
      />

      <ConfirmModal
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Thu hồi API key?"
        eyebrow="Client / Thu hồi key"
        confirmLabel="Thu hồi key"
        danger
        icon="trash"
        body={
          <>
            <p>
              Key <strong>{revokeTarget?.name}</strong> sẽ ngừng hoạt động ngay lập tức. Mọi
              request đang dùng key này sẽ nhận lỗi 401.
            </p>
            <p className="muted">Hành động này không thể hoàn tác.</p>
          </>
        }
      />
    </div>
  );
}
