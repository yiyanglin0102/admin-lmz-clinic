import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import authConfig from "./authConfig";
import "./styles/index.css";

// Send users to /dashboard after successful sign-in
const onSigninCallback = () => {
  // Clear query/hash AND move to /dashboard in one shot
  window.history.replaceState({}, document.title, "/dashboard");
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider {...authConfig} onSigninCallback={onSigninCallback}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
