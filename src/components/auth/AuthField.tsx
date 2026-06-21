import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AuthField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-ink-2">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-ink-4">{hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition-shadow placeholder:text-ink-4 focus:border-primary focus:ring-2 focus:ring-primary-muted";

export function AuthTextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  maxLength,
  inputMode,
  className = "",
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      maxLength={maxLength}
      inputMode={inputMode}
      className={`${inputClass} ${className}`}
    />
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required,
  minLength,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={`${inputClass} pr-10 ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-4 hover:text-ink-2"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function PinInput({
  value,
  onChange,
  label,
  autoComplete = "current-password",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[12px] font-semibold text-white/80">{label}</label>
      )}
      <input
        type="password"
        inputMode="numeric"
        autoComplete={autoComplete}
        required
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="• • • • • •"
        className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3.5 text-center font-mono text-[22px] tracking-[0.4em] text-white outline-none placeholder:text-white/25 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
      <div className="mt-2 flex justify-center gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i < value.length ? "bg-primary" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function AuthMessage({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "border-destructive-border bg-destructive-muted text-destructive",
    success: "border-success-border bg-success-muted text-success",
    info: "border-primary-border bg-primary-muted text-primary",
  };
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-[12px] font-medium leading-relaxed ${styles[tone]}`}>
      {children}
    </div>
  );
}

export function AuthSubmitButton({
  busy,
  children,
  disabled,
}: {
  busy?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
      ) : null}
      {children}
    </button>
  );
}

export { inputClass };
