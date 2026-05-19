export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type Club = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  profileImg: string | null;
  activeRecruitment: boolean;
  recruitmentDisplayText: string | null;
};

export type ClubPage = {
  content: Club[];
  page: number;
  size: number;
  hasNext: boolean;
};

export type ClubEvent = {
  id: number;
  clubId: number;
  clubName: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
};

export type EventPage = {
  content: ClubEvent[];
  page: number;
  size: number;
  hasNext: boolean;
};

export type ClubMember = {
  id: number;
  name: string;
  major: string | null;
  email: string;
  birth: string | null;
  phone: string | null;
  image: string | null;
  status: "member" | "applicant" | "rejected";
};

export function saveAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("accessToken", token);
  window.dispatchEvent(new Event("auth-token-change"));
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
  window.dispatchEvent(new Event("auth-token-change"));
}

export async function apiFetch<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    redirect: "manual",
    headers: {
      Accept: "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (
    response.status === 0 ||
    response.status === 302 ||
    response.status === 401 ||
    response.status === 403 ||
    response.type === "opaqueredirect"
  ) {
    clearAuthToken();
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("API response was not JSON");
  }

  return response.json() as Promise<T>;
}
