import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import '../styles/OidcCallback.css';

export default function OidcCallback() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Completing sign-in…");
  const [statusType, setStatusType] = useState(""); // "", "success", "error"

  useEffect(() => {
    if (auth.isAuthenticated) {
      setStatus("Login successful! Redirecting to dashboard...");
      setStatusType("success");
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (auth.error) {
      setStatus("Login failed. Please try again.");
      setStatusType("error");
    }
  }, [auth, navigate]);

  return (
    <div className="callback-container">
      {statusType !== "error" && <div className="spinner"></div>}
      <div className={`callback-message ${statusType}`}>{status}</div>
    </div>
  );
}
