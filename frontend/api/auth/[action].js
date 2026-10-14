import { handleAuthRequest } from "../_lib/auth.js";

export default async function authHandler(request, response) {
  return handleAuthRequest(request, response);
}
