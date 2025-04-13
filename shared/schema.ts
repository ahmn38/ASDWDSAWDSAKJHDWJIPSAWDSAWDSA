import { pgTable, text, serial, integer, timestamp, varchar, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  badgeNumber: text("badge_number"),
  role: text("role").notNull().default("detective"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  badgeNumber: true,
  role: true
});

// Cases table schema
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  crimeType: text("crime_type"),
  crimeDate: timestamp("crime_date"),
  status: text("status").notNull().default("active"),
  priority: text("priority").default("medium"),
  leadDetectiveId: integer("lead_detective_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCaseSchema = createInsertSchema(cases).pick({
  caseNumber: true,
  title: true,
  description: true,
  location: true,
  crimeType: true,
  crimeDate: true,
  status: true,
  priority: true,
  leadDetectiveId: true,
});

// Evidence table schema
export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id).notNull(),
  evidenceNumber: text("evidence_number").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  location: text("location"),
  status: text("status").default("collected"),
  collectedBy: text("collected_by"),
  collectedAt: timestamp("collected_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEvidenceSchema = createInsertSchema(evidence).pick({
  caseId: true,
  evidenceNumber: true,
  type: true,
  description: true,
  location: true,
  status: true,
  collectedBy: true,
  collectedAt: true,
  notes: true,
});

// Witnesses table schema
export const witnesses = pgTable("witnesses", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  relationship: text("relationship"),
  reliability: text("reliability").default("unknown"),
  interviewStatus: text("interview_status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWitnessSchema = createInsertSchema(witnesses).pick({
  caseId: true,
  firstName: true,
  lastName: true,
  contactPhone: true,
  contactEmail: true,
  relationship: true,
  reliability: true,
  interviewStatus: true,
  notes: true,
});

// Activity log schema
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  caseId: true,
  userId: true,
  activityType: true,
  description: true,
});

// AI Analysis schema
export const aiAnalyses = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id).notNull(),
  analysisType: text("analysis_type").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalyses).pick({
  caseId: true,
  analysisType: true,
  content: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;

export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

export type Witness = typeof witnesses.$inferSelect;
export type InsertWitness = z.infer<typeof insertWitnessSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
