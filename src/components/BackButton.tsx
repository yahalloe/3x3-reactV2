import { Link } from "react-router-dom";
export function BackButton({ to = "/", label = "Back to Archive" }: { to?: string; label?: string }) {
  return <Link to={to} className="surface-link"><span aria-hidden="true">←</span>{label}</Link>;
}
