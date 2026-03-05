import axios, { AxiosError, type AxiosInstance } from "axios";

function resolveRequestTimeoutMs() {
  const parsedTimeout = Number.parseInt(process.env.API_TIMEOUT_MS ?? "", 10);

  if (!Number.isNaN(parsedTimeout) && parsedTimeout > 0) {
    return parsedTimeout;
  }

  return 30_000;
}

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function resolveWebBaseUrl() {
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.APP_URL;

  if (envBaseUrl) return normalizeApiBaseUrl(envBaseUrl);

  if (typeof window !== "undefined") return "/api";

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return normalizeApiBaseUrl(`https://${vercelUrl}`);
  }

  return normalizeApiBaseUrl("http://localhost:3000");
}

export function createApiClient(baseUrl: string): AxiosInstance {
  return axios.create({
    baseURL: normalizeApiBaseUrl(baseUrl),
    timeout: resolveRequestTimeoutMs(),
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
}

export const apiClient = axios.create({
  baseURL: resolveWebBaseUrl(),
  timeout: resolveRequestTimeoutMs(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message ?? axiosError.message;
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
