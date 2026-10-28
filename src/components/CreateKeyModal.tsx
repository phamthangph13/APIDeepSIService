import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { usePlans } from "../context/PlansContext";
import type { PlanId } from "../data/plans";
import { createApiKey, type ApiKey } from "../lib/auth";
import { errorMessage } from "../lib/api";
import { copyText } from "../lib/format";
import { Button } from "./Button";
import { FormField } from "./FormField";
import { Modal } from "./Modal";
import { Sticker } from "./Sticker";

type CreateKeyModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  planId: PlanId;
  existingCount: number;
};

const SCOPE_OPTIONS = [
  { id: "chat", label: "Chat", hint: "chat.completions" },
  { id: "embeddings", label: "Embeddings", hint: "embeddings" },
  { id: "vision", label: "Vision", hint: "image input" },
  { id: "models", label: "Models", hint: "models.list" },
];

export function CreateKeyModal({
  open,
  onClose,
  onCreated,
  planId,
  existingCount,
}: CreateKeyModalProps) {
  const [step, setStep] = useState<"form" | "reveal">("form");
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"production" | "development">("production");
  const [scopes, setScopes] = useState<string[]>(["chat"]);
  const [expires, setExpires] = useState("never");
  const [created, setCreated] = useState<ApiKey | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { push } = useToast();
  const { byId } = usePlans();
  const plan = byId[planId] ?? byId.free;
  const limitReached = Number.isFinite(plan.keyLimit) && existingCount >= plan.keyLimit;

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setName("");
    setEnvironment("production");
    setScopes(["chat"]);
    setExpires("never");
    setCreated(null);
    setError("");
    setBusy(false);
  }, [open]);

  const toggleScope = (scope: string) => {
    setScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope],
    );
  };

  const handleCreate = async () => {
    if (limitReached) {
      setError(`Gói ${plan.name} đã đạt giới hạn ${plan.keyLimit} key. Nâng cấp để tạo thêm.`);
      return;
    }
    if (name.trim().length < 2) {
      setError("Đặt cho key một cái tên dễ nhớ, ít nhất 2 ký tự.");
      return;
    }
    if (scopes.length === 0) {
      setError("Chọn ít nhất một quyền cho key.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const key = await createApiKey({
        name,
        environment,
        scopes,
        expiresInDays: expires === "never" ? null : Number(expires),
      });
      setCreated(key);
      setStep("reveal");
      onCreated();
      push("Đã tạo API key mới", "success", "Key chỉ hiển thị đầy đủ một lần.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!created?.key) return;
    const ok = await copyText(created.key);
    push(ok ? "Đã sao chép API key" : "Không thể sao chép", ok ? "success" : "error");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={step === "form" ? "Client / API key" : "Client / Đã tạo"}
      title={step === "form" ? "Tạo API key mới" : "Lưu key ở nơi an toàn."}
      size="md"
      footer={
        step === "form" ? (
          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreate} icon="key" disabled={busy || limitReached}>
              {busy ? "Đang tạo…" : "Tạo key"}
            </Button>
          </div>
        ) : (
          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
            <Button variant="primary" onClick={handleCopy} icon="copy">
              Sao chép key
            </Button>
          </div>
        )
      }
    >
      {step === "form" ? (
        <div className="key-form">
          <div className="key-form__note">
            <Sticker name="spark" size={24} flat decorative />
            <span>
              API key miễn phí trên mọi gói. Gói {plan.name} hiện có {existingCount}/
              {Number.isFinite(plan.keyLimit) ? plan.keyLimit : "∞"} key.
            </span>
          </div>

          <FormField
            label="Tên key"
            name="key-name"
            value={name}
            onChange={setName}
            placeholder="Ví dụ: Production · Website"
            hint="Tên chỉ hiển thị trong client, không ảnh hưởng đến key."
            icon="key"
            required
          />

          <div className="field">
            <span className="field__label">
              <span>Môi trường</span>
            </span>
            <div className="segmented" role="group" aria-label="Môi trường của key">
              <button
                type="button"
                className={`segmented__item${environment === "production" ? " is-active" : ""}`}
                onClick={() => setEnvironment("production")}
              >
                <span className="mono">Live</span>
                <span>Production</span>
              </button>
              <button
                type="button"
                className={`segmented__item${environment === "development" ? " is-active" : ""}`}
                onClick={() => setEnvironment("development")}
              >
                <span className="mono">Test</span>
                <span>Development</span>
              </button>
            </div>
          </div>

          <div className="field">
            <span className="field__label">
              <span>Quyền truy cập</span>
              <span className="field__required">chọn ít nhất 1</span>
            </span>
            <div className="scope-grid">
              {SCOPE_OPTIONS.map((scope) => {
                const checked = scopes.includes(scope.id);
                return (
                  <button
                    key={scope.id}
                    type="button"
                    className={`scope-chip${checked ? " is-checked" : ""}`}
                    onClick={() => toggleScope(scope.id)}
                    aria-pressed={checked}
                  >
                    <span className="scope-chip__box">
                      {checked ? <Sticker name="check" size={14} flat decorative /> : null}
                    </span>
                    <span>
                      <strong>{scope.label}</strong>
                      <em>{scope.hint}</em>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="field">
            <span className="field__label">
              <span>Thời hạn</span>
            </span>
            <select
              className="select"
              value={expires}
              onChange={(event) => setExpires(event.target.value)}
            >
              <option value="never">Không hết hạn</option>
              <option value="30">30 ngày</option>
              <option value="90">90 ngày</option>
              <option value="365">1 năm</option>
            </select>
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          {limitReached ? (
            <p className="form-note">
              Đã đạt giới hạn key của gói {plan.name}. Bạn vẫn có thể dùng các key hiện có hoặc{" "}
              <a href="/dashboard/billing">nâng cấp gói</a>.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="key-reveal">
          <div className="key-reveal__badge">
            <Sticker name="check" size={42} flat />
            <span className="mono">Key đã sẵn sàng</span>
          </div>
          <p>
            Đây là lần duy nhất bạn thấy key đầy đủ. DeepSI không lưu key dạng văn bản sau khi
            bạn đóng cửa sổ này.
          </p>
          <div className="key-reveal__value">
            <code>{created?.key ?? ""}</code>
            <button type="button" onClick={handleCopy} aria-label="Sao chép API key">
              <Sticker name="copy" size={22} flat decorative />
            </button>
          </div>
          <div className="key-reveal__meta">
            <span className="mono">{created?.environment === "production" ? "LIVE" : "TEST"}</span>
            <span className="mono">{created?.scopes.join(" · ")}</span>
            <span className="mono">{expires === "never" ? "không hết hạn" : `${expires} ngày`}</span>
          </div>
          <div className="key-reveal__warning">
            <Sticker name="shield" size={24} flat decorative />
            <span>Đừng commit key vào git. Dùng biến môi trường hoặc secret manager.</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
