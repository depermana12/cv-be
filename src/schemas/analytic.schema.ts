import { z } from "zod";

export const timeRangeSchema = z.object({
  timeRange: z.enum(["week", "month", "all"]).optional().default("all"),
});

export const daysSchema = z.object({
  days: z.coerce.number().min(1).max(365).default(30),
});

export const monthYearSchema = z.object({
  year: z.coerce.number().min(2020).max(2100),
  month: z.coerce.number().min(1).max(12),
});
