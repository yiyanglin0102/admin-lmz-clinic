import { useEffect, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import "../styles/OidcCallback.css";

export default function OidcCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Decide what text to show
  const { text, tone } = useMemo(() => {
    if (auth?.error) return { text: "Login failed. Please try again.", tone: "error" };
    if (auth?.isAuthenticated) return { text: "Login successful! Redirecting…", tone: "success" };
    return { text: "Completing sign-in…", tone: "info" };
  }, [auth?.isAuthenticated, auth?.error]);

  // Once authenticated, wait 1.5s and navigate
  useEffect(() => {
    if (auth.isAuthenticated) {
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [auth.isAuthenticated, navigate]);
  return (
    <div className="oidc-root">
      <div className="oidc-card">
        {tone !== "error" && <div className="oidc-spinner" />}
        <div className={`oidc-message ${tone}`}>{text}</div>
      </div>
    </div>
  );
}
