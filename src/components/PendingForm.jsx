import { useId, useState } from "react";
import { InternalStatus } from "./InternalStatus.jsx";

function validateField(field, value) {
  const normalized = value.trim();
  if (field.required && !normalized) return "此项为必填项。";
  if (field.type === "email" && normalized && !/^\S+@\S+\.\S+$/.test(normalized)) {
    return "请输入有效的邮箱地址。";
  }
  if (field.validation === "phone" && normalized && !/^[+()\d\s-]{6,}$/.test(normalized)) {
    return "请输入有效的联系电话。";
  }
  return "";
}

export function PendingForm({ title, fields, backendText, publicMode = false, publicButtonText = "在线提交即将开放", publicReason = "在线提交功能正在完善中。" }) {
  const pendingReasonId = useId();
  const [values, setValues] = useState(() => Object.fromEntries(
    fields.map((field) => [field.name, field.defaultValue || ""]),
  ));
  const [touched, setTouched] = useState({});

  return (
    <form className="pending-form" noValidate onSubmit={(event) => event.preventDefault()}>
      <div className="pending-form__heading">
        <h2>{title}</h2>
        <InternalStatus as="p" status="TODO">{backendText}</InternalStatus>
      </div>

      <div className="pending-form__fields">
        {fields.map((field) => {
          const error = touched[field.name] ? validateField(field, values[field.name]) : "";
          const errorId = `${field.name}-error`;
          const commonProps = {
            id: field.name,
            name: field.name,
            value: values[field.name],
            required: field.required,
            readOnly: field.readOnly,
            autoComplete: field.autoComplete,
            inputMode: field.inputMode,
            "aria-required": field.required || undefined,
            "aria-invalid": Boolean(error),
            "aria-describedby": error ? errorId : undefined,
            onBlur: () => setTouched((current) => ({ ...current, [field.name]: true })),
            onChange: (event) => setValues((current) => ({ ...current, [field.name]: event.target.value })),
          };

          return (
            <label key={field.name} htmlFor={field.name}>
              <span>
                {field.label}
                {field.required ? <><span aria-hidden="true"> *</span><span className="sr-only">（必填）</span></> : null}
              </span>
              {field.as === "textarea" ? (
                <textarea {...commonProps} rows={field.rows || 5} />
              ) : field.as === "select" ? (
                <select {...commonProps}>
                  {field.options.map((option) => <option key={option || "placeholder"} value={option}>{option || "请选择"}</option>)}
                </select>
              ) : (
                <input {...commonProps} type={field.type || "text"} />
              )}
              {error ? <span className="pending-form__error" id={errorId} role="alert">{error}</span> : null}
            </label>
          );
        })}
      </div>

      <button type="submit" disabled aria-describedby={pendingReasonId}>
        {publicMode ? publicButtonText : "提交功能待接入"}
      </button>
      <p className="pending-form__reason" id={pendingReasonId}>
        {publicMode ? publicReason : "当前表单只用于内部界面与验证测试，不会传输或保存数据。"}
      </p>
    </form>
  );
}
