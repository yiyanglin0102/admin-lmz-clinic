// src/authConfig.js
export const COGNITO_ISSUER =
  "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ObNjh6rA6"; // your user pool issuer

export const COGNITO_CLIENT_ID = "1qb72c2jn6ph7403mllq4lpba5";

// Hosted UI domain from Cognito (App integration → Hosted UI)
export const COGNITO_HOSTED_DOMAIN =
  "https://us-east-1obnjh6ra6.auth.us-east-1.amazoncognito.com";

// Derive base URL from the current environment (localhost, CloudFront, custom domain)
const ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

// Helpers to normalize URLs
const stripTrailingSlash = (u) => (u.endsWith("/") ? u.slice(0, -1) : u);

// Always reflect the actual origin (e.g., http://localhost:3000)
export const APP_BASE_URL = ORIGIN;

// Build URIs used by OIDC
export const REDIRECT_URI = `${stripTrailingSlash(APP_BASE_URL)}/callback`;
// Use NO trailing slash for logout to match your current Cognito “Allowed sign-out URLs”
export const LOGOUT_URI = stripTrailingSlash(APP_BASE_URL);

const authConfig = {
  authority: COGNITO_ISSUER,
  client_id: COGNITO_CLIENT_ID,
  redirect_uri: REDIRECT_URI,    // must be in Allowed callback URLs
  response_type: "code",
  scope: "openid",               // add " email profile" only if enabled in Cognito
  automaticSilentRenew: false,   // keep off unless you add/whitelist silent-renew.html
  monitorSession: false,         // Cognito doesn't support check_session_iframe
  // If you later enable silent renew, also set:
  // silent_redirect_uri: `${APP_BASE_URL}/silent-renew.html`,
};

export function cognitoLogout(auth) {
  // Clear local user to avoid accidental auto-renew after redirect
  try { auth?.removeUser?.(); } catch {}

  const url =
    `${COGNITO_HOSTED_DOMAIN}/logout?client_id=${encodeURIComponent(
      COGNITO_CLIENT_ID
    )}&logout_uri=${encodeURIComponent(LOGOUT_URI)}`;

  window.location.assign(url);
}

export default authConfig;
