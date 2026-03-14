import { Navigate, useLocation } from "react-router-dom";
import { getToken, isJwtExpired, clearToken } from "../auth";
import { useAuth } from "../shared/context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = getToken();
  const { user, isLoading } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isJwtExpired(token)) {
    clearToken();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to profile setup if not completed, EXCEPT if they are already going to /profile/setup
  if (user && !user.isProfileCompleted && location.pathname !== "/profile/setup") {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
}
