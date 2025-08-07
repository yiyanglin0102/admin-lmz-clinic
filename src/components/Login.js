import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('yiyanglin0102');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const API_BASE = 'https://f5oprozl21.execute-api.ap-southeast-1.amazonaws.com/prod';
  // const API_ENDPOINT = `${API_BASE}/{proxy+}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // // Validate inputs
      // if (!username.trim() || !password.trim()) {
      //   throw new Error('Username and password are required');
      // }

      // const response = await fetch(API_ENDPOINT.replace('{proxy+}', 'login'), {
      //   method: 'POST',
      //   mode: 'cors',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Accept': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     username: username.trim(),
      //     password: password.trim()
      //   }),
      // });

      // // Handle non-2xx responses
      // if (!response.ok) {
      //   const errorData = await response.json().catch(() => ({}));
      //   throw new Error(
      //     errorData.message || 
      //     errorData.error || 
      //     `Login failed with status ${response.status}`
      //   );
      // }

      // const data = await response.json();

      // // Validate response structure
      // if (!data.idToken || !data.accessToken) {
      //   throw new Error('Invalid server response: Missing tokens');
      // }

      // // Store tokens and redirect
      // localStorage.setItem('idToken', data.idToken);
      // localStorage.setItem('accessToken', data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin Dashboard Login</h1>
          <p>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z" />
                <path d="M11 7h2v7h-2zm0 8h2v2h-2z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                <span style={{ marginLeft: '8px' }}>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Need help? <a href="/support">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;