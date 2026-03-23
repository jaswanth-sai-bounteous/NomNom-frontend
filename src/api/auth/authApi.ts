import { api } from "@/api/client";
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
  const response = await api.post("/users/login", values);
  return loginResponseSchema.parse(response.data);
}

export async function signupUser(values: SignupForm) {
  const response = await api.post("/users/register", values);
  return signupResponseSchema.parse(response.data);
}

export async function logoutUser() {
  const response = await api.post("/users/logout");
  return messageResponseSchema.parse(response.data);
}

export async function fetchCurrentUser() {
  const response = await api.get("/users/me");
  return currentUserResponseSchema.parse(response.data);
}

export async function refreshUserSession() {
  const response = await api.post("/users/refresh");
  return refreshResponseSchema.parse(response.data);
}
