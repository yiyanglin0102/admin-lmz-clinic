import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export default function OidcCallback() {
  const auth = useAuth();
  useEffect(() => {
    // The library completes the flow automatically via onSigninCallback in index.js.
  }, [auth]);

  return <div style={{ padding: 24 }}>Completing sign-in…</div>;
}
