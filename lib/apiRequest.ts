import toast from "react-hot-toast";
import type { ZodType } from "zod";

import { apiClient, getApiErrorMessage } from "@/lib/http/client";

type SetLoading = (value: boolean) => void;
type Callback = () => void;

function normalizeEndpoint(endpoint: string) {
  const withLeadingSlash = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return withLeadingSlash.replace(/^\/api\//, "/");
}

export async function makePostRequest<TRequest, TResponse = unknown>(
  setLoading: SetLoading,
  endpoint: string,
  data: TRequest,
  resourceName: string,
  reset?: Callback,
  redirect?: Callback,
  schema?: ZodType<TResponse>
) {
  try {
    setLoading(true);
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const response = await apiClient.post<unknown>(normalizedEndpoint, data);
    const parsedResponse = schema ? schema.parse(response.data) : response.data;

    toast.success(`New ${resourceName} Created Successfully`);
    if (typeof reset === "function") reset();
    if (typeof redirect === "function") redirect();
    return parsedResponse as TResponse;
  } catch (error) {
    toast.error(getApiErrorMessage(error));
    return null;
  } finally {
    setLoading(false);
  }
}

export async function makePutRequest<TRequest, TResponse = unknown>(
  setLoading: SetLoading,
  endpoint: string,
  data: TRequest,
  resourceName: string,
  redirect?: Callback,
  reset?: Callback,
  schema?: ZodType<TResponse>
) {
  try {
    setLoading(true);
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    const response = await apiClient.put<unknown>(normalizedEndpoint, data);
    const parsedResponse = schema ? schema.parse(response.data) : response.data;

    toast.success(`${resourceName} Updated Successfully`);
    if (typeof reset === "function") reset();
    if (typeof redirect === "function") redirect();
    return parsedResponse as TResponse;
  } catch (error) {
    toast.error(getApiErrorMessage(error));
    return null;
  } finally {
    setLoading(false);
  }
}
