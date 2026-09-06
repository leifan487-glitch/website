const buildEnv = import.meta.env ?? {};
const showInternalStatus = buildEnv.VITE_SHOW_INTERNAL_STATUS === "true"
  || (
    buildEnv.MODE !== "production"
    && buildEnv.VITE_PUBLIC_PREVIEW !== "true"
    && buildEnv.VITE_SHOW_INTERNAL_STATUS !== "false"
  );

export function InternalStatus({ status, children, as: Tag = "span", className = "", ...props }) {
  if (!showInternalStatus) return null;
  return (
    <Tag className={`internal-status ${className}`.trim()} data-content-status={status} {...props}>
      {status}{children ? " · " : ""}{children}
    </Tag>
  );
}
