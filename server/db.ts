import { eq, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  InsertUser, users, topics, productions, productionLogs, settings,
  socialAccounts, publications,
  type InsertTopic, type InsertProduction, type InsertProductionLog,
  type InsertSocialAccount, type InsertPublication,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Topic Helpers ==========

export async function listTopics(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(topics).where(eq(topics.status, status as any)).orderBy(asc(topics.priority), desc(topics.createdAt));
  }
  return db.select().from(topics).orderBy(asc(topics.priority), desc(topics.createdAt));
}

export async function getTopicById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return result[0];
}

export async function createTopic(data: InsertTopic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(topics).values(data).returning({ id: topics.id });
  return result[0].id;
}

export async function batchCreateTopics(items: InsertTopic[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (items.length === 0) return [];
  const result = await db.insert(topics).values(items).returning({ id: topics.id });
  return result.map(r => r.id);
}

export async function updateTopic(id: number, data: Partial<InsertTopic>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(topics).set(data).where(eq(topics.id, id));
}

export async function deleteTopic(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(topics).where(eq(topics.id, id));
}

export async function getNextPendingTopic() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(topics)
    .where(eq(topics.status, "pending"))
    .orderBy(asc(topics.priority), asc(topics.createdAt))
    .limit(1);
  return result[0];
}

// ========== Production Helpers ==========

export async function listProductions(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productions).orderBy(desc(productions.createdAt)).limit(limit);
}

export async function getProductionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(productions).where(eq(productions.id, id)).limit(1);
  return result[0];
}

export async function createProduction(data: InsertProduction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productions).values(data).returning({ id: productions.id });
  return result[0].id;
}

export async function updateProduction(id: number, data: Partial<InsertProduction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productions).set(data).where(eq(productions.id, id));
}

export async function getRunningProduction() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(productions)
    .where(eq(productions.status, "running"))
    .orderBy(desc(productions.createdAt))
    .limit(1);
  return result[0];
}

export async function listCompletedProductions(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productions)
    .where(eq(productions.status, "completed"))
    .orderBy(desc(productions.completedAt))
    .limit(limit);
}

// ========== Production Log Helpers ==========

export async function getProductionLogs(productionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productionLogs)
    .where(eq(productionLogs.productionId, productionId))
    .orderBy(asc(productionLogs.stepNumber));
}

export async function createProductionLog(data: InsertProductionLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productionLogs).values(data).returning({ id: productionLogs.id });
  return result[0].id;
}

export async function updateProductionLog(id: number, data: Partial<InsertProductionLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productionLogs).set(data).where(eq(productionLogs.id, id));
}

// ========== Settings Helpers ==========

export async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result[0]?.value;
}

export async function upsertSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(settings).values({ key, value }).onConflictDoUpdate({
    target: settings.key,
    set: { value, updatedAt: new Date() }
  });
}

export async function getN8nConfig() {
  const [baseUrl, apiKey, workflowId] = await Promise.all([
    getSetting("n8n_base_url"),
    getSetting("n8n_api_key"),
    getSetting("n8n_workflow_id"),
  ]);
  return {
    baseUrl: baseUrl || ENV.n8nBaseUrl || "",
    apiKey: apiKey || ENV.n8nApiKey || "",
    workflowId: workflowId || ENV.n8nWorkflowId || "",
  };
}

// ========== Stats Helpers ==========

export async function getProductionStats() {
  const db = await getDb();
  if (!db) return { totalTopics: 0, pendingTopics: 0, totalProductions: 0, completed: 0, failed: 0, running: 0 };
  const allProductions = await db.select().from(productions);
  const allTopics = await db.select().from(topics);
  return {
    totalTopics: allTopics.length,
    pendingTopics: allTopics.filter(t => t.status === "pending").length,
    totalProductions: allProductions.length,
    completed: allProductions.filter(p => p.status === "completed").length,
    failed: allProductions.filter(p => p.status === "failed").length,
    running: allProductions.filter(p => p.status === "running").length,
  };
}

// ========== Social Account Helpers ==========

export async function listSocialAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(socialAccounts).orderBy(asc(socialAccounts.platform));
}

export async function getSocialAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id)).limit(1);
  return result[0];
}

export async function createSocialAccount(data: InsertSocialAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialAccounts).values(data).returning({ id: socialAccounts.id });
  return result[0].id;
}

export async function updateSocialAccount(id: number, data: Partial<InsertSocialAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialAccounts).set(data).where(eq(socialAccounts.id, id));
}

export async function deleteSocialAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
}

// ========== Publication Helpers ==========

export async function listPublications(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publications).orderBy(desc(publications.createdAt)).limit(limit);
}

export async function getPublicationsByProduction(productionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publications)
    .where(eq(publications.productionId, productionId))
    .orderBy(desc(publications.createdAt));
}

export async function createPublication(data: InsertPublication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(publications).values(data).returning({ id: publications.id });
  return result[0].id;
}

export async function updatePublication(id: number, data: Partial<InsertPublication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(publications).set(data).where(eq(publications.id, id));
}

export async function deletePublication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(publications).where(eq(publications.id, id));
}

export async function getPublicationStats() {
  const db = await getDb();
  if (!db) return { total: 0, published: 0, draft: 0, failed: 0, totalViews: 0, totalLikes: 0, totalComments: 0 };
  const all = await db.select().from(publications);
  return {
    total: all.length,
    published: all.filter(p => p.status === "published").length,
    draft: all.filter(p => p.status === "draft").length,
    failed: all.filter(p => p.status === "failed").length,
    totalViews: all.reduce((s, p) => s + (p.views ?? 0), 0),
    totalLikes: all.reduce((s, p) => s + (p.likes ?? 0), 0),
    totalComments: all.reduce((s, p) => s + (p.comments ?? 0), 0),
  };
}
