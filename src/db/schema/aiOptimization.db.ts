import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { cv } from "./cv.db";
import { users } from "./user.db";

export const optimizationStatusEnum = pgEnum("optimization_status", [
  "pending",
  "processing",
  "done",
  "error",
]);

export const optimizationTypeEnum = pgEnum("optimization_type", [
  "section",
  "score",
  "full_cv",
]);

export const optimizationRequests = pgTable("optimization_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  type: optimizationTypeEnum("type").notNull(),
  status: optimizationStatusEnum("status").default("pending").notNull(),

  targetRole: varchar("target_role", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  promptVersion: varchar("prompt_version", { length: 20 }),
  errorMessage: text("error_message"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cvScores = pgTable("cv_scores", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  optimizationRequestId: integer("optimization_request_id")
    .notNull()
    .references(() => optimizationRequests.id, { onDelete: "cascade" }),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score").notNull(),
  dimensions: jsonb("dimensions").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const optimizationRequestsRelations = relations(
  optimizationRequests,
  ({ one, many }) => ({
    cv: one(cv, {
      fields: [optimizationRequests.cvId],
      references: [cv.id],
    }),
    user: one(users, {
      fields: [optimizationRequests.userId],
      references: [users.id],
    }),
    cvScores: many(cvScores),
  }),
);

export const cvScoresRelations = relations(cvScores, ({ one }) => ({
  optimizationRequest: one(optimizationRequests, {
    fields: [cvScores.optimizationRequestId],
    references: [optimizationRequests.id],
  }),
  cv: one(cv, {
    fields: [cvScores.cvId],
    references: [cv.id],
  }),
}));
