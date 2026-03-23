import { integer, serial, pgTable, text, timestamp, varchar, jsonb, pgEnum } from "drizzle-orm/pg-core";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const topicStatusEnum = pgEnum("topic_status", ["pending", "in_progress", "completed", "failed", "paused"]);
export const productionStatusEnum = pgEnum("production_status", ["queued", "running", "completed", "failed", "cancelled"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const logStatusEnum = pgEnum("log_status", ["running", "completed", "failed", "skipped"]);
export const accountStatusEnum = pgEnum("account_status", ["connected", "disconnected", "error", "pending"]);
export const publicationStatusEnum = pgEnum("publication_status", ["draft", "scheduled", "publishing", "published", "failed"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 选题表 - 管理所有待生产的历史选题
 */
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  civilizationId: varchar("civilizationId", { length: 50 }).notNull().default("default"),
  civilization: varchar("civilization", { length: 100 }).notNull().default(""),
  period: varchar("period", { length: 200 }).default(""),
  description: text("description"),
  status: topicStatusEnum("status").default("pending").notNull(),
  priority: integer("priority").default(0).notNull(),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;

/**
 * 生产记录表 - 每次流水线执行的记录
 */
export const productions = pgTable("productions", {
  id: serial("id").primaryKey(),
  topicId: integer("topicId").notNull(),
  status: productionStatusEnum("status").default("queued").notNull(),
  currentStep: varchar("currentStep", { length: 50 }).default(""),
  currentStepName: varchar("currentStepName", { length: 100 }).default(""),
  totalSteps: integer("totalSteps").default(11).notNull(),
  completedSteps: integer("completedSteps").default(0).notNull(),
  reviewStatus: reviewStatusEnum("reviewStatus").default("pending").notNull(),
  reviewNote: text("reviewNote"),
  videoUrl: text("videoUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  imagesJson: jsonb("imagesJson"),
  scriptJson: jsonb("scriptJson"),
  copyJson: jsonb("copyJson"),
  qualityResult: varchar("qualityResult", { length: 20 }),
  safetyResult: varchar("safetyResult", { length: 20 }),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Production = typeof productions.$inferSelect;
export type InsertProduction = typeof productions.$inferInsert;

/**
 * 生产步骤日志表 - 每个步骤的详细执行记录
 */
export const productionLogs = pgTable("production_logs", {
  id: serial("id").primaryKey(),
  productionId: integer("productionId").notNull(),
  stepNumber: integer("stepNumber").notNull(),
  stepName: varchar("stepName", { length: 100 }).notNull(),
  status: logStatusEnum("status").default("running").notNull(),
  output: text("output"),
  errorMessage: text("errorMessage"),
  durationMs: integer("durationMs"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ProductionLog = typeof productionLogs.$inferSelect;
export type InsertProductionLog = typeof productionLogs.$inferInsert;

/**
 * 系统设置表 - 存储n8n连接配置等
 */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * 社交媒体账号表 - 管理各平台的API配置和连接状态
 */
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(),
  accountName: varchar("accountName", { length: 200 }).notNull(),
  accountId: varchar("accountId", { length: 200 }).default(""),
  status: accountStatusEnum("status").default("pending").notNull(),
  apiConfig: jsonb("apiConfig"),
  lastSyncAt: timestamp("lastSyncAt"),
  followerCount: integer("followerCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

/**
 * 发布记录表 - 跟踪每个视频在各平台的发布状态和数据
 */
export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  productionId: integer("productionId").notNull(),
  socialAccountId: integer("socialAccountId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  status: publicationStatusEnum("status").default("draft").notNull(),
  externalId: varchar("externalId", { length: 200 }),
  externalUrl: text("externalUrl"),
  title: varchar("title", { length: 500 }),
  description: text("description"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  errorMessage: text("errorMessage"),
  publishedAt: timestamp("publishedAt"),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Publication = typeof publications.$inferSelect;
export type InsertPublication = typeof publications.$inferInsert;
