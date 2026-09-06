import { Link } from "react-router-dom";
import { InternalStatus } from "./InternalStatus.jsx";

export function EmptyState({
  eyebrow,
  title,
  description,
  status = "TODO",
  statusText,
  action,
}) {
  return (
    <div className="empty-state">
      <p>{eyebrow}</p>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
        {statusText ? <InternalStatus as="p" status={status}>{statusText}</InternalStatus> : null}
        {action ? <Link className="text-link" to={action.href}>{action.label}</Link> : null}
      </div>
    </div>
  );
}
