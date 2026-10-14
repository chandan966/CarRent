async function authRequest(action, { method = "GET", body } = {}) {
  const response = await fetch(`/api/auth/${action}`, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Authentication request failed.");
  }
  return result;
}

export async function getCurrentUser() {
  const result = await authRequest("me");
  return result.user || null;
}

export async function signIn(credentials) {
  const result = await authRequest("login", { method: "POST", body: credentials });
  return result.user;
}

export async function signUp(account) {
  const result = await authRequest("signup", { method: "POST", body: account });
  return result.user;
}

export async function signOut() {
  await authRequest("logout", { method: "POST", body: {} });
}

export async function updateAccountProfile(profile) {
  const result = await authRequest("profile", { method: "PATCH", body: profile });
  return result.user;
}
