import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Sticker } from "./Sticker";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  confirmDisabled?: boolean;
  danger?: boolean;
  eyebrow?: string;
  icon?: "trash" | "coin" | "lock" | "check";
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  confirmDisabled = false,
  danger = false,
  eyebrow = "Client / Xác nhận",
  icon = "lock",
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={eyebrow}
      title={title}
      size="sm"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} icon={icon} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="confirm-body">
        <Sticker name={icon} size={56} rotate={-5} />
        <div>{body}</div>
      </div>
    </Modal>
  );
}
