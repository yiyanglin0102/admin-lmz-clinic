import { useEffect, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import "../styles/OidcCallback.css";

export default function OidcCallback() {
  const auth = useAuth();

  useEffect(() => {
    // The library completes the flow automatically via onSigninCallback in index.js.
  }, [auth]);

  const { text, tone } = useMemo(() => {
    if (auth?.error) return { text: "Login failed. Please try again.", tone: "error" };
    if (auth?.isAuthenticated) return { text: "Login successful! Redirecting…", tone: "success" };
    return { text: "Completing sign-in…", tone: "info" };
  }, [auth?.isAuthenticated, auth?.error]);

  return (
    <div className="oidc-root">
      <div className="oidc-card">
        {tone !== "error" && <div className="oidc-spinner" aria-hidden="true" />}
        <div className={`oidc-message ${tone}`}>{text}</div>
      </div>
    </div>
  );
}
