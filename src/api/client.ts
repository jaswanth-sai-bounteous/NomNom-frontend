import { z } from "zod";

import { clearAuth, getStoredUser, saveAuth } from "@/lib/auth";
import { clearUserStores, syncUserStores } from "@/lib/storeSync";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const AUTH_REFRESH_ENDPOINT = "/users/refresh";
const AUTH_EXCLUDED_REFRESH_ENDPOINTS = new Set([
  "/users/login",
  "/users/register",
  "/users/logout",
  AUTH_REFRESH_ENDPOINT,
]);

let refreshPromise: Promise<string | null> | null = null;

const getErrorMessage = (data: unknown, fallbackMessage: string) => {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallbackMessage;
};

export async function requestJson<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await requestWithAutoRefresh(endpoint, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, `Request failed with status ${response.status}`),
    );
  }

  return schema.parse(data);
}

const createRequestInit = (init?: RequestInit): RequestInit => ({
  credentials: "include",
  ...init,
  headers: {
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...init?.headers,
  },
});

const fetchJsonResponse = async (endpoint: string, init?: RequestInit) => {
  try {
    return await fetch(`${API_BASE_URL}${endpoint}`, createRequestInit(init));
  } catch {
    throw new Error(
      "Could not reach the backend server. Check that the API is running and CORS allows your frontend origin.",
    );
  }
};

/*
  Input: none.
  Output: the newest access token string, or null when refresh fails.
*/
const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetchJsonResponse(AUTH_REFRESH_ENDPOINT, {
        method: "POST",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || typeof data !== "object" || typeof data.token !== "string") {
        clearAuth();
        clearUserStores();
        return null;
      }

      const storedUser = getStoredUser();

      if (storedUser) {
        saveAuth(data.token, storedUser);
        syncUserStores(storedUser);
      }

      return data.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

/*
  Input: request endpoint + request options.
  Output: a successful response, retrying once after refresh if access token expired.
*/
const requestWithAutoRefresh = async (endpoint: string, init?: RequestInit) => {
  const response = await fetchJsonResponse(endpoint, init);

  if (response.status !== 401 || AUTH_EXCLUDED_REFRESH_ENDPOINTS.has(endpoint)) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();

  if (!refreshedToken) {
    return response;
  }

  return fetchJsonResponse(endpoint, init);
};

export const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
