// src/authConfig.js
export const COGNITO_ISSUER =
  "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ObNjh6rA6"; // your user pool issuer

export const COGNITO_CLIENT_ID = "1qb72c2jn6ph7403mllq4lpba5";

// Always reflect the actual origin you run on (e.g., http://localhost:3000)
export const APP_BASE_URL = window.location.origin;

// Your Hosted UI domain from Cognito (App integration → Hosted UI)
export const COGNITO_HOSTED_DOMAIN =
  "https://us-east-1obnjh6ra6.auth.us-east-1.amazoncognito.com";

const authConfig = {
  authority: COGNITO_ISSUER,
  client_id: COGNITO_CLIENT_ID,
  redirect_uri: `${APP_BASE_URL}/callback`, // must be in Allowed callback URLs
  response_type: "code",
  scope: "openid", // add " email profile" only if those scopes are enabled in Cognito
  automaticSilentRenew: false, // keep off unless you add silent-renew.html and whitelist it
  monitorSession: false,       // Cognito doesn't support check_session_iframe
  // If you later want to use silent renew, also add:
  // silent_redirect_uri: `${APP_BASE_URL}/silent-renew.html`,
};

export default authConfig;

export function cognitoLogout() {
  const logoutUri = `${APP_BASE_URL}/`; // must be in Allowed sign-out URLs
  const url =
    `${COGNITO_HOSTED_DOMAIN}/logout?client_id=${encodeURIComponent(
      COGNITO_CLIENT_ID
    )}&logout_uri=${encodeURIComponent(logoutUri)}`;
  window.location.assign(url);
}
