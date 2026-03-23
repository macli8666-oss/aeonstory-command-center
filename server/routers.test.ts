import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", () => ({
  listTopics: vi.fn().mockResolvedValue([
    { id: 1, title: "庞贝古城的最后一天", civilizationId: "rome", civilization: "罗马", period: "公元79年", status: "pending", priority: 0 },
    { id: 2, title: "古埃及金字塔的建造之谜", civilizationId: "egypt", civilization: "古埃及", period: "公元前2560年", status: "completed", priority: 1 },
  ]),
  getTopicById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) return Promise.resolve({ id: 1, title: "庞贝古城的最后一天", civilizationId: "rome", status: "pending", topicId: 1 });
    return Promise.resolve(undefined);
  }),
  createTopic: vi.fn().mockResolvedValue(3),
  batchCreateTopics: vi.fn().mockResolvedValue([10, 11, 12]),
  updateTopic: vi.fn().mockResolvedValue(undefined),
  deleteTopic: vi.fn().mockResolvedValue(undefined),
  getNextPendingTopic: vi.fn().mockResolvedValue({ id: 1, title: "庞贝古城的最后一天" }),
  listProductions: vi.fn().mockResolvedValue([]),
  listCompletedProductions: vi.fn().mockResolvedValue([]),
  getProductionById: vi.fn().mockImplementation((id: number) => {
    if (id === 10) return Promise.resolve({ id: 10, topicId: 1, status: "completed", reviewStatus: null });
    return Promise.resolve(undefined);
  }),
  createProduction: vi.fn().mockResolvedValue(10),
  updateProduction: vi.fn().mockResolvedValue(undefined),
  getRunningProduction: vi.fn().mockResolvedValue(undefined),
  getProductionLogs: vi.fn().mockResolvedValue([]),
  createProductionLog: vi.fn().mockResolvedValue(1),
  updateProductionLog: vi.fn().mockResolvedValue(undefined),
  getProductionStats: vi.fn().mockResolvedValue({
    totalTopics: 5, pendingTopics: 3, totalProductions: 10, completed: 7, failed: 1, running: 0,
  }),
  getSetting: vi.fn().mockResolvedValue(undefined),
  upsertSetting: vi.fn().mockResolvedValue(undefined),
  getN8nConfig: vi.fn().mockResolvedValue({ baseUrl: "", apiKey: "", workflowId: "" }),
  // Social accounts
  listSocialAccounts: vi.fn().mockResolvedValue([
    { id: 1, platform: "youtube", accountName: "AeonStory", accountId: "UC123", status: "connected", apiConfig: { channelId: "UC123", apiKey: "key" } },
    { id: 2, platform: "tiktok", accountName: "AeonStory_TK", accountId: "tk456", status: "pending", apiConfig: {} },
  ]),
  getSocialAccountById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) return Promise.resolve({ id: 1, platform: "youtube", accountName: "AeonStory", accountId: "UC123", status: "connected", apiConfig: { channelId: "UC123", apiKey: "key" } });
    if (id === 2) return Promise.resolve({ id: 2, platform: "tiktok", accountName: "AeonStory_TK", accountId: "tk456", status: "pending", apiConfig: {} });
    return Promise.resolve(undefined);
  }),
  createSocialAccount: vi.fn().mockResolvedValue(3),
  updateSocialAccount: vi.fn().mockResolvedValue(undefined),
  deleteSocialAccount: vi.fn().mockResolvedValue(undefined),
  // Publications
  listPublications: vi.fn().mockResolvedValue([
    { id: 1, productionId: 10, socialAccountId: 1, platform: "youtube", status: "published", views: 1500, likes: 120, comments: 35 },
  ]),
  getPublicationsByProduction: vi.fn().mockResolvedValue([
    { id: 1, productionId: 10, socialAccountId: 1, platform: "youtube", status: "published" },
  ]),
  createPublication: vi.fn().mockResolvedValue(5),
  updatePublication: vi.fn().mockResolvedValue(undefined),
  deletePublication: vi.fn().mockResolvedValue(undefined),
  getPublicationStats: vi.fn().mockResolvedValue({ published: 3, totalViews: 5000, totalLikes: 400, totalComments: 85 }),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          topics: [
            { title: "AI生成选题1", civilizationId: "china", civilization: "华夏", period: "唐朝", description: "测试描述1" },
            { title: "AI生成选题2", civilizationId: "rome", civilization: "罗马", period: "公元前44年", description: "测试描述2" },
            { title: "AI生成选题3", civilizationId: "egypt", civilization: "古埃及", period: "公元前2560年", description: "测试描述3" },
          ],
        }),
      },
    }],
  }),
}));

type CookieCall = { name: string; options: Record<string, unknown> };

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  const user = {
    id: 1, openId: "sample-user", email: "sample@example.com", name: "Sample User",
    loginMethod: "manus", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: (name: string, options: Record<string, unknown>) => { clearedCookies.push({ name, options }); } } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ========== Auth Tests ==========
describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

// ========== Topic Tests ==========
describe("topic router", () => {
  it("lists all topics", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topic.list({});
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("庞贝古城的最后一天");
  });

  it("gets a topic by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topic.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.title).toBe("庞贝古城的最后一天");
  });

  it("creates a new topic", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topic.create({
      title: "丝绸之路的兴衰", civilizationId: "silkroad", civilization: "丝绸之路", period: "公元前130年",
    });
    expect(result.id).toBe(3);
  });

  it("deletes a topic", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topic.delete({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("AI generates batch topics", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topic.aiGenerate({ count: 3 });
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
    expect(result.topics).toHaveLength(3);
    expect(result.topics[0].title).toBe("AI生成选题1");
  });

  it("AI generates with civilization filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topic.aiGenerate({ count: 5, civilization: "华夏" });
    expect(result.success).toBe(true);
  });

  it("AI generates with theme filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topic.aiGenerate({ count: 5, theme: "战争与征服" });
    expect(result.success).toBe(true);
  });
});

// ========== Production Tests ==========
describe("production router", () => {
  it("returns pipeline steps", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const steps = await caller.production.steps();
    expect(steps).toHaveLength(11);
    expect(steps[0].name).toBe("文明色调匹配");
    expect(steps[10].name).toBe("更新状态");
  });

  it("returns production stats", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const stats = await caller.production.stats();
    expect(stats.totalTopics).toBe(5);
    expect(stats.completed).toBe(7);
    expect(stats.running).toBe(0);
  });

  it("triggers production for next pending topic", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.trigger({});
    expect(result.success).toBe(true);
    expect(result.productionId).toBe(10);
    expect(result.topicId).toBe(1);
  });

  it("prevents triggering when a production is already running", async () => {
    const db = await import("./db");
    (db.getRunningProduction as any).mockResolvedValueOnce({ id: 5, status: "running" });
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.trigger({});
    expect(result.success).toBe(false);
    expect(result.error).toContain("运行中");
  });

  it("lists productions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("lists completed productions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.completed({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("reviews a production - approve", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.review({ productionId: 10, action: "approve" });
    expect(result.success).toBe(true);
  });

  it("reviews a production - reject", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.review({ productionId: 10, action: "reject", note: "画面有问题" });
    expect(result.success).toBe(true);
  });

  it("reports assets for a production", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.reportAssets({
      productionId: 10,
      videoUrl: "https://example.com/video.mp4",
      thumbnailUrl: "https://example.com/thumb.jpg",
      images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    });
    expect(result.success).toBe(true);
  });

  it("finishes a production", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.finish({ productionId: 10, status: "completed" });
    expect(result.success).toBe(true);
  });

  it("updates step progress", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.production.updateStep({
      productionId: 10, stepNumber: 3, stepName: "内容安全审核", status: "completed", durationMs: 5000,
    });
    expect(result.success).toBe(true);
  });
});

// ========== n8n Config Tests ==========
describe("n8nConfig router", () => {
  it("gets n8n config", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const config = await caller.n8nConfig.get();
    expect(config).toHaveProperty("baseUrl");
    expect(config).toHaveProperty("apiKey");
    expect(config).toHaveProperty("workflowId");
  });

  it("saves n8n config", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.n8nConfig.save({
      baseUrl: "http://100.64.0.1:5678", apiKey: "test-api-key", workflowId: "JMZr7Wb4Wgv1TUuE",
    });
    expect(result.success).toBe(true);
  });

  it("tests n8n connection - fails for invalid host", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.n8nConfig.test({ baseUrl: "http://invalid-host-that-does-not-exist:5678" });
    expect(result.success).toBe(false);
    expect(result.message).toBeTruthy();
  });
});

// ========== Social Media Tests ==========
describe("social router", () => {
  it("returns supported platforms list", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const platforms = await caller.social.platforms();
    expect(platforms.length).toBeGreaterThan(0);
    const youtube = platforms.find(p => p.id === "youtube");
    expect(youtube).toBeDefined();
    expect(youtube?.name).toBe("YouTube");
    const bilibili = platforms.find(p => p.id === "bilibili");
    expect(bilibili).toBeDefined();
  });

  it("lists social accounts", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const accounts = await caller.social.list();
    expect(accounts).toHaveLength(2);
    expect(accounts[0].platform).toBe("youtube");
    expect(accounts[1].platform).toBe("tiktok");
  });

  it("gets social account by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const account = await caller.social.getById({ id: 1 });
    expect(account).toBeDefined();
    expect(account?.accountName).toBe("AeonStory");
  });

  it("creates a social account", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.social.create({
      platform: "instagram", accountName: "AeonStory_IG", accountId: "ig789",
      apiConfig: { businessAccountId: "biz123", accessToken: "token456" },
    });
    expect(result.id).toBe(3);
  });

  it("updates a social account", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.social.update({ id: 1, status: "connected", followerCount: 5000 });
    expect(result.success).toBe(true);
  });

  it("deletes a social account", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.social.delete({ id: 2 });
    expect(result.success).toBe(true);
  });

  it("tests connection - succeeds with valid config", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.social.testConnection({ id: 1 });
    expect(result.success).toBe(true);
    expect(result.message).toContain("成功");
  });

  it("tests connection - fails with empty config", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.social.testConnection({ id: 2 });
    expect(result.success).toBe(false);
    expect(result.message).toContain("配置不完整");
  });
});

// ========== Publication Tests ==========
describe("publication router", () => {
  it("lists publications", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const pubs = await caller.publication.list({ limit: 10 });
    expect(pubs).toHaveLength(1);
    expect(pubs[0].platform).toBe("youtube");
  });

  it("gets publications by production", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const pubs = await caller.publication.byProduction({ productionId: 10 });
    expect(pubs).toHaveLength(1);
  });

  it("returns publication stats", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const stats = await caller.publication.stats();
    expect(stats.published).toBe(3);
    expect(stats.totalViews).toBe(5000);
    expect(stats.totalLikes).toBe(400);
    expect(stats.totalComments).toBe(85);
  });

  it("creates a publication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.publication.create({
      productionId: 10, socialAccountId: 1, platform: "youtube", title: "庞贝古城", description: "测试",
    });
    expect(result.id).toBe(5);
  });

  it("updates a publication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.publication.update({
      id: 1, status: "published", views: 2000, likes: 150, comments: 40,
    });
    expect(result.success).toBe(true);
  });

  it("deletes a publication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.publication.delete({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("publishes to all connected accounts", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.publication.publishToAll({ productionId: 10 });
    expect(result.success).toBe(true);
    expect(result.count).toBe(1); // Only 1 connected account (youtube)
    expect(result.publications?.[0]?.platform).toBe("youtube");
  });
});
