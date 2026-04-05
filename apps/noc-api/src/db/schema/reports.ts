import {
  pgTable,
  uuid,
  date,
  integer,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.js";

// ─── Daily Report Table ──────────────────────────────────────────
export const dailyReport = pgTable(
  "daily_report",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportDate: date("report_date").notNull(),
    shift: integer("shift").notNull(), // 1, 2, or 3
    troubleshooting: integer("troubleshooting").notNull().default(0),
    aktivasi: integer("aktivasi").notNull().default(0),
    replacementOnu: integer("replacement_onu").notNull().default(0),
    checkOnu: integer("check_onu").notNull().default(0),
    notes: text("notes"),
    whatsappSummary: text("whatsapp_summary"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // One report per operator per shift per day
    unique("daily_report_unique").on(
      table.reportDate,
      table.shift,
      table.userId
    ),
  ]
);

// ─── Relations ───────────────────────────────────────────────────
export const dailyReportRelations = relations(dailyReport, ({ one }) => ({
  operator: one(user, {
    fields: [dailyReport.userId],
    references: [user.id],
  }),
}));

export const userReportRelations = relations(user, ({ many }) => ({
  reports: many(dailyReport),
}));
