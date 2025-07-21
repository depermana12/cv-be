import { z } from "zod";

export const timeRangeSchema = z.object({
  timeRange: z.enum(["week", "month", "all"]).optional().default("all"),
});

export const daysSchema = z.object({
  days: z.coerce.number().min(1).max(365).default(30),
});

export const goalSchema = z.object({
  goal: z.coerce.number().min(1).max(1000).default(20),
});
