import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import '../styles/Login.css';
import { cognitoLogout } from '../authConfig';
import { createSession } from "../services/account";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const createdOnce = useRef(false);
  const [sessionMsg, setSessionMsg] = useState("");

  const onSignIn = () => auth.signinRedirect();
  const onSignOut = () => cognitoLogout(auth);

  // Kick off session creation once after login
  useEffect(() => {
    if (!auth.isAuthenticated || createdOnce.current) return;

    (async () => {
      try {
        createdOnce.current = true;
        setSessionMsg("Securing your session…");

        // Prefer ID token (JWT) so your API authorizer can identify the user
        const idToken =
          auth.user?.id_token ||
          auth.user?.id_token_hint ||
          auth.user?.access_token; // fallback if you use access token

        await createSession(
          { deviceHint: navigator.userAgent },        // optional payload
          { authToken: idToken }                      // pass token for Authorization header
        );

        setSessionMsg("Session ready. Redirecting…");
        // optional redirect
        setTimeout(() => navigate("/dashboard"), 900);
      } catch (e) {
        console.error("createSession failed:", e);
        setSessionMsg(`Could not create session: ${e?.message || e}`);
      }
    })();
  }, [auth.isAuthenticated, auth.user, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin Dashboard Login</h1>
          <p>Use your organization account</p>
        </div>

        {auth.isLoading && <div className="login-form">Loading…</div>}
        {auth.error && (
          <div className="login-error">
            <span>{auth.error.message}</span>
          </div>
        )}

        {!auth.isAuthenticated ? (
          <button className="login-button" onClick={onSignIn} disabled={auth.isLoading}>
            {auth.isLoading ? 'Redirecting…' : 'Continue with Cognito'}
          </button>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p>Signed in as <b>{auth.user?.profile?.email || 'user'}</b></p>
            {sessionMsg && <p style={{ marginTop: 8 }}>{sessionMsg}</p>}
            <button className="login-button" onClick={onSignOut}>Sign out</button>
          </div>
        )}

        <div className="login-footer">
          <p>Need help? <a href="/support">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
