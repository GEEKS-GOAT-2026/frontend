const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://port-0-dongnea-mhfzs5l502d0035e.sel3.cloudtype.app";

export type User = {
  id: number;
  email: string;
  name: string;
  manager?: boolean;
  managedClubs?: ManagedClub[];
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
  imageUrl: string | null;
};

export type ClubImageType = "PROFILE" | "EVENT" | "ACTIVITY" | "NOTICE";

export type ClubImageUploadResponse = {
  imageUrl: string;
  path: string;
};

export type ManagedClub = {
  clubId: number;
  clubName: string;
  role: string;
};

export type ApplicationResponse = {
  id: number;
  recruitmentId: number;
  recruitmentTitle: string;
  clubId: number;
  clubName: string;
  userId: number;
  userName: string;
  userEmail: string;
  answers: Record<string, unknown>;
  status: string;
};

export type ClubMember = {
  id: number;
  applicationId?: number | null;
  clubMemberId?: number | null;
  name: string;
  major?: string | null;
  studentId?: string | null;
  studentNumber?: string | null;
  department?: string | null;
  email: string;
  birth?: string | null;
  phone: string | null;
  image: string | null;
  status: "member" | "applicant" | "rejected" | "left" | string;
  answers?: Record<string, unknown> | null;
  applicationAnswers?: Record<string, unknown> | null;
  application?: {
    answers?: Record<string, unknown> | null;
  } | null;
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

type ClubMemberParams = {
  status?: "member" | "applicant";
  keyword?: string;
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

  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get("Content-Length");
  const contentType = response.headers.get("Content-Type");

  if (contentLength === "0" || !contentType?.includes("application/json")) {
    return undefined as T;
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

export function createEvent(
  clubId: number,
  event: {
    title: string;
    description: string;
    eventDate: string;
    location: string;
    imageUrl?: string;
    published?: boolean;
  }
) {
  return apiFetch<ClubEvent>(
    "/api/events",
    {
      method: "POST",
      body: JSON.stringify(event),
    },
    {
      clubId: String(clubId),
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

export function getMyApplications() {
  return apiFetch<ApplicationResponse[]>("/api/applications/me");
}

export function getClubApplications(clubId: number) {
  return apiFetch<ApplicationResponse[]>(`/api/clubs/${clubId}/applications`);
}

export function getClubActivityRecords(clubId: number) {
  return apiFetch<ClubActivityRecord[]>(`/api/clubs/${clubId}/activities`);
}

export function createClubActivityRecord(
  clubId: number,
  activity: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    imageUrl?: string;
  }
) {
  return apiFetch<ClubActivityRecord>(`/api/clubs/${clubId}/activities`, {
    method: "POST",
    body: JSON.stringify(activity),
  });
}

export function getClubNotices(clubId: number) {
  return apiFetch<ClubNotice[]>(`/api/clubs/${clubId}/notices`);
}

export function createClubNotice(
  clubId: number,
  notice: {
    title: string;
    content: string;
    noticeDate: string;
    badge?: string;
    pinned?: boolean;
    imageUrl?: string | null;
  }
) {
  return apiFetch<ClubNotice>(`/api/clubs/${clubId}/notices`, {
    method: "POST",
    body: JSON.stringify(notice),
  });
}

export async function uploadClubImage(
  clubId: number,
  file: File,
  type: ClubImageType
) {
  const token = getAccessToken();
  const formData = new FormData();

  formData.append("clubId", String(clubId));
  formData.append("file", file);
  formData.append("type", type);

  let response: Response;

  try {
    response = await fetch(buildUrl(`/api/clubs/${clubId}/images`), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch {
    throw new Error(
      "이미지 업로드 서버에 연결하지 못했습니다. 백엔드 배포에 이미지 업로드 API가 반영됐는지 확인해주세요."
    );
  }

  if (response.status === 401) {
    clearAuthToken();
    throw new Error("로그인이 필요합니다.");
  }

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패: ${response.status}`);
  }

  return response.json() as Promise<ClubImageUploadResponse>;
}

export async function uploadClubImageForPost(
  clubId: number,
  file: File,
  type: ClubImageType
) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("type", type);

  let response: Response;

  try {
    response = await fetch("/api/club-image-upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error(
      "이미지 업로드 서버에 연결하지 못했습니다. 배포 API에 이미지 업로드 기능이 반영됐는지 확인해주세요."
    );
  }

  if (response.type === "opaqueredirect" || response.status === 0) {
    clearAuthToken();
    throw new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
  }

  if (response.status === 401) {
    clearAuthToken();
    throw new Error("로그인이 필요합니다.");
  }

  if (response.status >= 300 && response.status < 400) {
    clearAuthToken();
    throw new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
  }

  if (response.status === 404) {
    throw new Error(
      "이미지 업로드 API를 찾을 수 없습니다. 배포 API에 /api/clubs/{clubId}/images 경로가 필요합니다."
    );
  }

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패: ${response.status}`);
  }

  return response.json() as Promise<ClubImageUploadResponse>;
}

export function getClubMembers(
  clubId: number,
  { status, keyword }: ClubMemberParams = {}
) {
  return apiFetch<ClubMember[]>(
    `/api/clubs/${clubId}/members`,
    {},
    {
      status: status ?? "",
      keyword: keyword ?? "",
    }
  );
}

export function submitApplication(
  recruitmentId: number,
  answers: Record<string, unknown>
) {
  return apiFetch<ApplicationResponse>("/api/applications", {
    method: "POST",
    body: JSON.stringify({
      recruitmentId,
      answers,
    }),
  });
}

export function leaveMyClub(clubId: number) {
  return apiFetch<void>(`/api/users/me/clubs/${clubId}`, {
    method: "DELETE",
  });
}

export function transferPresident(clubId: number, targetEmail: string) {
  return apiFetch<void>(`/api/clubs/${clubId}/managers/president/transfer`, {
    method: "PATCH",
    body: JSON.stringify({ targetEmail }),
  });
}

export function acceptClubMember(clubId: number, memberId: number) {
  return apiFetch<ClubMember>(`/api/clubs/${clubId}/members/${memberId}/accept`, {
    method: "PATCH",
  });
}

export function updateApplicationStatus(applicationId: number, status: string) {
  return apiFetch<ApplicationResponse>(`/api/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function rejectClubMember(clubId: number, memberId: number) {
  return apiFetch<void>(`/api/clubs/${clubId}/members/${memberId}`, {
    method: "DELETE",
  });
}
