const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://port-0-dongnea-mhfzs5l502d0035e.sel3.cloudtype.app";

export type User = {
  id: number;
  email: string;
  name: string;
};

export type Club = {
  id: number;
  name: string;
  description: string;
  category: string;
  profileImg: string | null;
  activeRecruitment: boolean;
  recruitmentDisplayText: string;
};

export type Recruitment = {
  id: number;
  title: string;
  summary: string | null;
  startDate: string | null;
  endDate: string | null;
  alwaysOpen: boolean;
  active: boolean;
};

export type ClubDetail = Club & {
  activityDescription: string | null;
  contact: string | null;
  instagramUrl: string | null;
  recruitments: Recruitment[];
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
  description: string;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
};

export type ClubActivityRecord = {
  id: number;
  clubId: number;
  clubName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
};

export type ClubNotice = {
  id: number;
  clubId: number;
  clubName: string;
  title: string;
  content: string;
  noticeDate: string;
  badge: string | null;
  pinned: boolean;
};

export type EventPage = {
  content: ClubEvent[];
  page: number;
  size: number;
  hasNext: boolean;
};

type ClubListParams = {
  page?: number;
  size?: number;
  category?: string;
  keyword?: string;
  hasActiveRecruitment?: boolean;
};

type EventListParams = {
  page?: number;
  size?: number;
  keyword?: string;
  clubId?: number;
  fromDate?: string;
  toDate?: string;
};

type RecentEventParams = {
  size?: number;
};

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken");
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
}

function buildUrl(path: string, params?: Record<string, string>) {
  const url = new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  params?: Record<string, string>
): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401) {
    clearAuthToken();
    throw new Error("로그인이 필요합니다.");
  }

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getMyInfo() {
  return apiFetch<User>("/api/users/me");
}

export function getClubs({
  page = 0,
  size = 20,
  category,
  keyword,
  hasActiveRecruitment,
}: ClubListParams = {}) {
  return apiFetch<ClubPage>(
    "/api/clubs",
    {},
    {
      page: String(page),
      size: String(size),
      category: category ?? "",
      keyword: keyword ?? "",
      hasActiveRecruitment:
        hasActiveRecruitment === undefined ? "" : String(hasActiveRecruitment),
    }
  );
}

export function getEvents({
  page = 0,
  size = 20,
  keyword,
  clubId,
  fromDate,
  toDate,
}: EventListParams = {}) {
  return apiFetch<EventPage>(
    "/api/events",
    {},
    {
      page: String(page),
      size: String(size),
      keyword: keyword ?? "",
      clubId: clubId === undefined ? "" : String(clubId),
      fromDate: fromDate ?? "",
      toDate: toDate ?? "",
    }
  );
}

export function getRecentEvents({ size = 3 }: RecentEventParams = {}) {
  return apiFetch<ClubEvent[]>(
    "/api/events/recent",
    {},
    {
      size: String(size),
    }
  );
}

export function getClub(clubId: number) {
  return apiFetch<ClubDetail>(`/api/clubs/${clubId}`);
}

export async function getJoinedClubs() {
  return apiFetch<Club[]>("/api/users/me/clubs");
}

export function getClubActivityRecords(clubId: number) {
  return apiFetch<ClubActivityRecord[]>(`/api/clubs/${clubId}/activities`);
}

export function getClubNotices(clubId: number) {
  return apiFetch<ClubNotice[]>(`/api/clubs/${clubId}/notices`);
}

export function submitApplication(
  recruitmentId: number,
  answers: Record<string, unknown>
) {
  return apiFetch<string>(`/api/applications?recruitmentId=${recruitmentId}`, {
    method: "POST",
    body: JSON.stringify(answers),
  });
}
