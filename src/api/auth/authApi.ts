import { requestJson } from "@/api/client";
import { messageResponseSchema } from "@/types/api";
import {
  loginResponseSchema,
  refreshResponseSchema,
  signupResponseSchema,
  type LoginForm,
  type SignupForm,
} from "@/types/auth";
import { currentUserResponseSchema } from "@/types/user";

export async function loginUser(values: LoginForm) {
  return requestJson(
    "/users/login",
    loginResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(values),
    },
  );
}

export async function signupUser(values: SignupForm) {
  return requestJson(
    "/users/register",
    signupResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(values),
    },
  );
}

export async function logoutUser() {
  return requestJson(
    "/users/logout",
    messageResponseSchema,
    {
      method: "POST",
    },
  );
}

export async function fetchCurrentUser() {
  return requestJson("/users/me", currentUserResponseSchema);
}

export async function refreshUserSession() {
  return requestJson(
    "/users/refresh",
    refreshResponseSchema,
    {
      method: "POST",
    },
  );
}
