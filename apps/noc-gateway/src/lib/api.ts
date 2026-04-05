const API_BASE = "http://localhost:3001/api";

/**
 * Wrapper around fetch that includes credentials (cookies) for auth.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || "Request failed", body);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Report Types ────────────────────────────────────────────────

export interface Report {
  id: string;
  reportDate: string;
  shift: number;
  troubleshooting: number;
  aktivasi: number;
  replacementOnu: number;
  checkOnu: number;
  notes: string | null;
  whatsappSummary: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  operatorName: string | null;
  operatorEmail: string | null;
}

export interface PaginatedReports {
  data: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportStats {
  month: string;
  totalReports: number;
  avgDailyReports: number;
  totals: {
    troubleshooting: number;
    aktivasi: number;
    replacementOnu: number;
    checkOnu: number;
  };
  dailyBreakdown: {
    date: string;
    troubleshooting: number;
    aktivasi: number;
    replacementOnu: number;
    checkOnu: number;
  }[];
}

export interface CreateReportPayload {
  reportDate: string;
  shift: number;
  troubleshooting: number;
  aktivasi: number;
  replacementOnu: number;
  checkOnu: number;
  notes?: string | null;
}

// ─── API Functions ───────────────────────────────────────────────

export const reportApi = {
  create(data: CreateReportPayload) {
    return apiFetch<Report>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list(params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    shift?: number;
  }) {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.from) search.set("from", params.from);
    if (params?.to) search.set("to", params.to);
    if (params?.shift) search.set("shift", String(params.shift));
    const qs = search.toString();
    return apiFetch<PaginatedReports>(`/reports${qs ? `?${qs}` : ""}`);
  },

  getById(id: string) {
    return apiFetch<Report>(`/reports/${id}`);
  },

  getStats(month: string) {
    return apiFetch<ReportStats>(`/reports/stats?month=${month}`);
  },

  update(id: string, data: Partial<CreateReportPayload>) {
    return apiFetch<Report>(`/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiFetch<void>(`/reports/${id}`, { method: "DELETE" });
  },
};
