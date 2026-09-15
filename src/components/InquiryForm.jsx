import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const buildEnv = import.meta.env ?? {};
const inquiryEnabled = buildEnv.VITE_INQUIRY_ENABLED === "true";

const initialValues = {
  name: "",
  company: "",
  role: "",
  email: "",
  city: "",
  phone: "",
  product: "Mantis Standard",
  application: "",
  message: "",
  website: "",
};

const applicationOptions = [
  "科研测试",
  "商业服务",
  "家庭服务",
  "仓储物流",
  "柔性制造",
  "特种行业",
  "其他",
];

function validate(values) {
  const errors = {};
  for (const field of ["name", "company", "city", "phone", "application"]) {
    if (!values[field].trim()) errors[field] = "请填写此项。";
  }
  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "请输入有效的邮箱地址。";
  }
  if (values.phone && !/^[+()\d\s-]{6,30}$/.test(values.phone.trim())) {
    errors.phone = "请输入有效的联系电话。";
  }
  return errors;
}

function Field({ label, name, required = false, error, children }) {
  const errorId = error ? `inquiry-${name}-error` : undefined;
  return (
    <label className="inquiry-form__field" htmlFor={`inquiry-${name}`}>
      <span>{label}{required ? <b aria-hidden="true"> *</b> : null}</span>
      {children(errorId)}
      {error ? <small id={errorId} role="alert">{error}</small> : null}
    </label>
  );
}

export function InquiryForm() {
  const formRef = useRef(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState("idle");
  const [message, setMessage] = useState(
    "",
  );

  function fieldProps(name, options = {}) {
    return {
      id: `inquiry-${name}`,
      name,
      value: values[name],
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `inquiry-${name}-error` : undefined,
      onChange: (event) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
      },
      ...options,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!inquiryEnabled) return;
    if (submitState === "submitting") return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitState("error");
      setMessage("请先检查标记的必填项。");
      const firstField = Object.keys(nextErrors)[0];
      formRef.current?.elements.namedItem(firstField)?.focus();
      return;
    }

    setSubmitState("submitting");
    setMessage("正在发送询盘…");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "发送失败，请稍后重试。");
      setSubmitState("success");
      setMessage(result.message || "询盘已发送，我们会通过你留下的联系方式回复。");
    } catch (error) {
      setSubmitState("error");
      setMessage(error.message || "发送失败，请稍后重试。");
    }
  }

  return (
    <form className="inquiry-form" ref={formRef} noValidate aria-busy={submitState === "submitting"} onSubmit={handleSubmit}>
      {!inquiryEnabled ? <div className="inquiry-availability" role="status"><strong>在线提交功能准备中</strong><p>目前可先整理下方需求信息。在线提交开放前，可通过上方商务邮箱联系我们。</p></div> : null}
      <header className="inquiry-form__header">
        <div>
          <h2>需求信息</h2>
        </div>
        <span><b>*</b> 为必填项</span>
      </header>

      <div className="inquiry-form__grid">
        <Field label="姓名" name="name" required error={errors.name}>
          {(errorId) => <input {...fieldProps("name", { autoComplete: "name", required: true })} aria-describedby={errorId} maxLength="80" />}
        </Field>
        <Field label="公司 / 机构" name="company" required error={errors.company}>
          {(errorId) => <input {...fieldProps("company", { autoComplete: "organization", required: true })} aria-describedby={errorId} maxLength="120" />}
        </Field>
        <Field label="职位名称" name="role" error={errors.role}>
          {(errorId) => <input {...fieldProps("role", { autoComplete: "organization-title" })} aria-describedby={errorId} maxLength="80" />}
        </Field>
        <Field label="电子邮箱" name="email" error={errors.email}>
          {(errorId) => <input {...fieldProps("email", { type: "email", autoComplete: "email" })} aria-describedby={errorId} maxLength="160" />}
        </Field>
        <Field label="所在城市" name="city" required error={errors.city}>
          {(errorId) => <input {...fieldProps("city", { autoComplete: "address-level2", required: true })} aria-describedby={errorId} maxLength="80" />}
        </Field>
        <Field label="联系电话" name="phone" required error={errors.phone}>
          {(errorId) => <input {...fieldProps("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", required: true })} aria-describedby={errorId} maxLength="30" />}
        </Field>
        <Field label="意向产品" name="product" error={errors.product}>
          {(errorId) => <input {...fieldProps("product", { readOnly: true })} aria-describedby={errorId} />}
        </Field>
        <Field label="应用场景" name="application" required error={errors.application}>
          {(errorId) => (
            <select {...fieldProps("application", { required: true })} aria-describedby={errorId}>
              <option value="">请选择</option>
              {applicationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          )}
        </Field>
        <label className="inquiry-form__field inquiry-form__field--message" htmlFor="inquiry-message">
          <span>需求说明</span>
          <textarea {...fieldProps("message")} rows="3" maxLength="2000" placeholder="请说明产品需求、任务场景或合作意向。" />
        </label>
      </div>

      <label className="inquiry-form__trap" aria-hidden="true">
        网站
        <input {...fieldProps("website", { tabIndex: -1, autoComplete: "off" })} />
      </label>

      <footer className="inquiry-form__footer">
        <p>了解我们如何处理你提交的信息，请查看 <Link to="/policy/privacy">隐私政策</Link>。</p>
        <button type="submit" disabled={!inquiryEnabled || submitState === "submitting"}>
          <span>{!inquiryEnabled ? "在线提交准备中" : submitState === "submitting" ? "发送中" : "提交需求"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </footer>

      <p className="inquiry-form__status" data-state={submitState} role={submitState === "error" ? "alert" : "status"} aria-live="polite">
        {message}
      </p>
    </form>
  );
}
