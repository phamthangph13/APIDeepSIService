import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import type { StickerName } from "../data/stickers";
import { Sticker } from "./Sticker";

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
  icon?: StickerName;
  rightSlot?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  minLength?: number;
};

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
  error,
  icon,
  rightSlot,
  required,
  disabled,
  inputMode,
  minLength,
}: FormFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={`field${error ? " field--error" : ""}`}>
      <label className="field__label" htmlFor={id}>
        <span>{label}</span>
        {required ? <span className="field__required">bắt buộc</span> : null}
      </label>
      <div className="field__control">
        {icon ? <Sticker name={icon} size={26} flat decorative className="field__icon" /> : null}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          inputMode={inputMode}
          minLength={minLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="field__input"
        />
        {rightSlot ? <div className="field__right">{rightSlot}</div> : null}
      </div>
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
