import React from 'react';
import { useAuth } from 'react-oidc-context';
import '../styles/Login.css';
import { cognitoLogout } from '../authConfig';

const Login = () => {
  const auth = useAuth();

  const onSignIn = () => auth.signinRedirect();
const onSignOut = () => cognitoLogout(auth);

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
