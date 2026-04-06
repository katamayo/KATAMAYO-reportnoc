import { eq, and, gte, lte, sql, desc, asc, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { dailyReport, user } from "../db/schema/index.js";
import { generateWhatsAppSummary } from "./whatsapp.service.js";

// ─── Types ───────────────────────────────────────────────────────

export interface CreateReportInput {
  reportDate: string; // YYYY-MM-DD
  shift: number; // 1, 2, or 3
  troubleshooting: number;
  aktivasi: number;
  replacementOnu: number;
  checkOnu: number;
  notes?: string | null;
}

export interface ListReportsFilter {
  page?: number;
  limit?: number;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  shift?: number;
  userId?: string;
}

export interface StatsQuery {
  month: string; // YYYY-MM
}

// ─── Service Functions ───────────────────────────────────────────

/**
 * Create a new daily report with auto-generated WhatsApp summary.
 */
export async function createReport(data: CreateReportInput, userId: string) {
  // Fetch user name for WA summary
  const [operator] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const whatsappSummary = generateWhatsAppSummary({
    ...data,
    operatorName: operator?.name || "Unknown Operator",
  });

  const [report] = await db
    .insert(dailyReport)
    .values({
      reportDate: data.reportDate,
      shift: data.shift,
      troubleshooting: data.troubleshooting,
      aktivasi: data.aktivasi,
      replacementOnu: data.replacementOnu,
      checkOnu: data.checkOnu,
      notes: data.notes || null,
      whatsappSummary,
      userId,
    })
    .returning();

  return report;
}

/**
 * List reports with pagination and optional filters.
 */
export async function listReports(filters: ListReportsFilter) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  if (filters.from) {
    conditions.push(gte(dailyReport.reportDate, filters.from));
  }
  if (filters.to) {
    conditions.push(lte(dailyReport.reportDate, filters.to));
  }
  if (filters.shift) {
    conditions.push(eq(dailyReport.shift, filters.shift));
  }
  if (filters.userId) {
    conditions.push(eq(dailyReport.userId, filters.userId));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(dailyReport)
    .where(whereClause);

  // Get paginated data with operator info (join)
  const data = await db
    .select({
      id: dailyReport.id,
      reportDate: dailyReport.reportDate,
      shift: dailyReport.shift,
      troubleshooting: dailyReport.troubleshooting,
      aktivasi: dailyReport.aktivasi,
      replacementOnu: dailyReport.replacementOnu,
      checkOnu: dailyReport.checkOnu,
      notes: dailyReport.notes,
      whatsappSummary: dailyReport.whatsappSummary,
      userId: dailyReport.userId,
      createdAt: dailyReport.createdAt,
      updatedAt: dailyReport.updatedAt,
      operatorName: user.name,
      operatorEmail: user.email,
    })
    .from(dailyReport)
    .leftJoin(user, eq(dailyReport.userId, user.id))
    .where(whereClause)
    .orderBy(desc(dailyReport.reportDate), asc(dailyReport.shift))
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
}

/**
 * Get a single report by ID with operator details.
 */
export async function getReportById(id: string) {
  const [report] = await db
    .select({
      id: dailyReport.id,
      reportDate: dailyReport.reportDate,
      shift: dailyReport.shift,
      troubleshooting: dailyReport.troubleshooting,
      aktivasi: dailyReport.aktivasi,
      replacementOnu: dailyReport.replacementOnu,
      checkOnu: dailyReport.checkOnu,
      notes: dailyReport.notes,
      whatsappSummary: dailyReport.whatsappSummary,
      userId: dailyReport.userId,
      createdAt: dailyReport.createdAt,
      updatedAt: dailyReport.updatedAt,
      operatorName: user.name,
      operatorEmail: user.email,
    })
    .from(dailyReport)
    .leftJoin(user, eq(dailyReport.userId, user.id))
    .where(eq(dailyReport.id, id))
    .limit(1);

  return report || null;
}

/**
 * Update an existing report. Only the original submitter can update.
 */
export async function updateReport(
  id: string,
  data: Partial<CreateReportInput>,
  userId: string
) {
  // Check ownership
  const existing = await getReportById(id);
  if (!existing) return { error: "not_found" as const };
  if (existing.userId !== userId) return { error: "forbidden" as const };

  // Rebuild WA summary if metrics changed
  let whatsappSummary = existing.whatsappSummary;
  const updatedMetrics = {
    reportDate: data.reportDate || existing.reportDate,
    shift: data.shift ?? existing.shift,
    troubleshooting: data.troubleshooting ?? existing.troubleshooting,
    aktivasi: data.aktivasi ?? existing.aktivasi,
    replacementOnu: data.replacementOnu ?? existing.replacementOnu,
    checkOnu: data.checkOnu ?? existing.checkOnu,
    notes: data.notes !== undefined ? data.notes : existing.notes,
    operatorName: existing.operatorName || "Unknown",
  };

  whatsappSummary = generateWhatsAppSummary(updatedMetrics);

  const [updated] = await db
    .update(dailyReport)
    .set({
      ...(data.reportDate && { reportDate: data.reportDate }),
      ...(data.shift !== undefined && { shift: data.shift }),
      ...(data.troubleshooting !== undefined && {
        troubleshooting: data.troubleshooting,
      }),
      ...(data.aktivasi !== undefined && { aktivasi: data.aktivasi }),
      ...(data.replacementOnu !== undefined && {
        replacementOnu: data.replacementOnu,
      }),
      ...(data.checkOnu !== undefined && { checkOnu: data.checkOnu }),
      ...(data.notes !== undefined && { notes: data.notes }),
      whatsappSummary,
      updatedAt: new Date(),
    })
    .where(eq(dailyReport.id, id))
    .returning();

  return { data: updated };
}

/**
 * Delete a report. Only the original submitter can delete.
 */
export async function deleteReport(id: string, userId: string) {
  const existing = await getReportById(id);
  if (!existing) return { error: "not_found" as const };
  if (existing.userId !== userId) return { error: "forbidden" as const };

  await db.delete(dailyReport).where(eq(dailyReport.id, id));
  return { success: true };
}

/**
 * Get aggregated statistics for dashboard charts.
 * Returns daily breakdown + totals for a whole month.
 */
export async function getReportStats(query: StatsQuery) {
  const { month } = query; // "YYYY-MM"
  const [year, monthNum] = month.split("-").map(Number);

  // First and last day of the month
  const fromDate = `${year}-${String(monthNum).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthNum, 0).getDate();
  const toDate = `${year}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Daily breakdown: sum of all operators' reports per date
  const dailyBreakdown = await db
    .select({
      date: dailyReport.reportDate,
      shifts: sql<string>`STRING_AGG(DISTINCT ${dailyReport.shift}::text, ',')`,
      troubleshooting: sql<number>`COALESCE(SUM(${dailyReport.troubleshooting}), 0)::int`,
      aktivasi: sql<number>`COALESCE(SUM(${dailyReport.aktivasi}), 0)::int`,
      replacementOnu: sql<number>`COALESCE(SUM(${dailyReport.replacementOnu}), 0)::int`,
      checkOnu: sql<number>`COALESCE(SUM(${dailyReport.checkOnu}), 0)::int`,
    })
    .from(dailyReport)
    .where(
      and(
        gte(dailyReport.reportDate, fromDate),
        lte(dailyReport.reportDate, toDate)
      )
    )
    .groupBy(dailyReport.reportDate)
    .orderBy(asc(dailyReport.reportDate));

  // Overall totals
  const [totals] = await db
    .select({
      totalReports: count(),
      troubleshooting: sql<number>`COALESCE(SUM(${dailyReport.troubleshooting}), 0)::int`,
      aktivasi: sql<number>`COALESCE(SUM(${dailyReport.aktivasi}), 0)::int`,
      replacementOnu: sql<number>`COALESCE(SUM(${dailyReport.replacementOnu}), 0)::int`,
      checkOnu: sql<number>`COALESCE(SUM(${dailyReport.checkOnu}), 0)::int`,
    })
    .from(dailyReport)
    .where(
      and(
        gte(dailyReport.reportDate, fromDate),
        lte(dailyReport.reportDate, toDate)
      )
    );

  const totalReports = Number(totals?.totalReports || 0);
  const daysWithData = dailyBreakdown.length || 1;

  return {
    month,
    totalReports,
    avgDailyReports: Math.round(totalReports / daysWithData),
    totals: {
      troubleshooting: totals?.troubleshooting || 0,
      aktivasi: totals?.aktivasi || 0,
      replacementOnu: totals?.replacementOnu || 0,
      checkOnu: totals?.checkOnu || 0,
    },
    dailyBreakdown,
  };
}
