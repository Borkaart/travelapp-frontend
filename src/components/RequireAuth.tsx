import { Navigate, useLocation } from "react-router-dom";
import { getToken, isJwtExpired, clearToken } from "../auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isJwtExpired(token)) {
    clearToken();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
