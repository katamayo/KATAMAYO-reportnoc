import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import * as reportService from "../services/report.service.js";

const router = Router();

// All report routes require authentication
router.use(requireAuth);

// ─── Validation Schemas ──────────────────────────────────────────

const createReportSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  shift: z.number().int().min(1).max(3),
  troubleshooting: z.number().int().min(0),
  aktivasi: z.number().int().min(0),
  replacementOnu: z.number().int().min(0),
  checkOnu: z.number().int().min(0),
  notes: z.string().nullable().optional(),
});

const updateReportSchema = createReportSchema.partial();

const statsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM"),
});

// ─── Routes ──────────────────────────────────────────────────────

/**
 * GET /api/reports/stats?month=YYYY-MM
 * Dashboard aggregated statistics.
 * IMPORTANT: This must be declared BEFORE /:id to avoid route conflict.
 */
router.get("/stats", async (req, res) => {
  try {
    const parsed = statsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: parsed.error.flatten(),
      });
      return;
    }

    const stats = await reportService.getReportStats(parsed.data);
    res.json(stats);
  } catch (error) {
    console.error("GET /reports/stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/reports
 * Create a new daily report.
 */
router.post("/", async (req, res) => {
  try {
    const parsed = createReportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const report = await reportService.createReport(
      parsed.data,
      req.user!.id
    );
    res.status(201).json(report);
  } catch (error: any) {
    // Handle unique constraint violation
    if (error?.code === "23505") {
      res.status(409).json({
        error:
          "A report already exists for this date, shift, and operator combination.",
      });
      return;
    }
    console.error("POST /reports error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/reports
 * List reports with pagination and optional filters.
 */
router.get("/", async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const shift = req.query.shift ? Number(req.query.shift) : undefined;
    const userId = req.query.userId as string | undefined;

    const result = await reportService.listReports({
      page,
      limit,
      from,
      to,
      shift,
      userId,
    });

    res.json(result);
  } catch (error) {
    console.error("GET /reports error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/reports/:id
 * Get a single report by ID.
 */
router.get("/:id", async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }
    res.json(report);
  } catch (error) {
    console.error("GET /reports/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/reports/:id
 * Update an existing report (owner only).
 */
router.put("/:id", async (req, res) => {
  try {
    const parsed = updateReportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const result = await reportService.updateReport(
      req.params.id,
      parsed.data,
      req.user!.id
    );

    if ("error" in result) {
      if (result.error === "not_found") {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      if (result.error === "forbidden") {
        res.status(403).json({ error: "You can only edit your own reports" });
        return;
      }
    }

    res.json(result.data);
  } catch (error) {
    console.error("PUT /reports/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a report (owner only).
 */
router.delete("/:id", async (req, res) => {
  try {
    const result = await reportService.deleteReport(
      req.params.id,
      req.user!.id
    );

    if ("error" in result) {
      if (result.error === "not_found") {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      if (result.error === "forbidden") {
        res
          .status(403)
          .json({ error: "You can only delete your own reports" });
        return;
      }
    }

    res.status(204).send();
  } catch (error) {
    console.error("DELETE /reports/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
