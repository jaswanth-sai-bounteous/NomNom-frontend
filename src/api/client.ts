import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { clearAuth, getStoredUser, saveAuth } from "@/lib/auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const REFRESH_ENDPOINT = "/users/refresh";
const AUTH_EXCLUDED_ENDPOINTS = new Set([
  "/users/login",
  "/users/register",
  "/users/logout",
  REFRESH_ENDPOINT,
]);

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const getRequestPath = (url?: string) => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return new URL(url).pathname;
  }

  return url;
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await refreshClient.post(REFRESH_ENDPOINT);
        const nextToken =
          response.data &&
          typeof response.data === "object" &&
          "token" in response.data &&
          typeof response.data.token === "string"
            ? response.data.token
            : null;

        const user = getStoredUser();

        if (nextToken && user) {
          saveAuth(nextToken, user);
        }

        return nextToken;
      } catch {
        clearAuth();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const requestPath = getRequestPath(originalRequest?.url);

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      AUTH_EXCLUDED_ENDPOINTS.has(requestPath)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const nextToken = await refreshSession();

    if (!nextToken) {
      return Promise.reject(error);
    }

    return api(originalRequest);
  },
);
