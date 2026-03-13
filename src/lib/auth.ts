import type { User } from "@/types";

const TOKEN_KEY = "token";
const USER_KEY = "nomnom-user";

export const isAuthenticated = () => Boolean(localStorage.getItem(TOKEN_KEY));

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const saveAuth = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};
