import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    // Keep the DOM around the same; the route content shows a lightweight state.
    return <div>Loading…</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
