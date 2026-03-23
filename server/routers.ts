import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import {
  listTopics, getTopicById, createTopic, updateTopic, deleteTopic, getNextPendingTopic,
  listProductions, getProductionById, createProduction, updateProduction, getRunningProduction,
  getProductionLogs, createProductionLog, getProductionStats, listCompletedProductions,
  batchCreateTopics, getSetting, upsertSetting, getN8nConfig,
  listSocialAccounts, getSocialAccountById, createSocialAccount, updateSocialAccount, deleteSocialAccount,
  listPublications, getPublicationsByProduction, createPublication, updatePublication, deletePublication, getPublicationStats,
} from "./db";
import { triggerProduction } from "./_core/productionEngine";

// Pipeline step definitions
const PIPELINE_STEPS = [
  { number: 1, name: "文明色调匹配", icon: "🎨" },
  { number: 2, name: "AI脚本撰写", icon: "✍️" },
  { number: 3, name: "内容安全审核", icon: "🛡️" },
  { number: 4, name: "AI配音生成", icon: "🎙️" },
  { number: 5, name: "AI场景图生成", icon: "🖼️" },
  { number: 6, name: "视频合成", icon: "🎬" },
  { number: 7, name: "全平台文案生成", icon: "📝" },
  { number: 8, name: "缩略图生成", icon: "🖼️" },
  { number: 9, name: "质量检查", icon: "🔍" },
  { number: 10, name: "发布到各平台", icon: "🚀" },
  { number: 11, name: "更新状态", icon: "✅" },
];

// Supported social platforms
const SOCIAL_PLATFORMS = [
  { id: "youtube", name: "YouTube", icon: "📺", color: "#FF0000", apiFields: ["channelId", "apiKey", "clientId", "clientSecret", "refreshToken"] },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000", apiFields: ["appId", "appSecret", "accessToken"] },
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E4405F", apiFields: ["businessAccountId", "accessToken"] },
  { id: "twitter", name: "X / Twitter", icon: "🐦", color: "#1DA1F2", apiFields: ["apiKey", "apiSecret", "accessToken", "accessTokenSecret"] },
  { id: "bilibili", name: "哔哩哔哩", icon: "📺", color: "#00A1D6", apiFields: ["sessdata", "biliJct", "dedeUserId"] },
  { id: "xiaohongshu", name: "小红书", icon: "📕", color: "#FE2C55", apiFields: ["cookie", "xsCommon"] },
  { id: "douyin", name: "抖音", icon: "🎶", color: "#000000", apiFields: ["openId", "accessToken", "clientKey", "clientSecret"] },
  { id: "wechat", name: "微信视频号", icon: "💬", color: "#07C160", apiFields: ["appId", "appSecret"] },
  { id: "facebook", name: "Facebook", icon: "📘", color: "#1877F2", apiFields: ["pageId", "accessToken"] },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========== 选题管理 ==========
  topic: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => listTopics(input?.status)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getTopicById(input.id)),

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        civilizationId: z.string().default("default"),
        civilization: z.string().default(""),
        period: z.string().optional(),
        description: z.string().optional(),
        priority: z.number().default(0),
        tags: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createTopic(input);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        civilizationId: z.string().optional(),
        civilization: z.string().optional(),
        period: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed", "failed", "paused"]).optional(),
        priority: z.number().optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTopic(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTopic(input.id);
        return { success: true };
      }),

    reorder: publicProcedure
      .input(z.object({
        items: z.array(z.object({ id: z.number(), priority: z.number() })),
      }))
      .mutation(async ({ input }) => {
        for (const item of input.items) {
          await updateTopic(item.id, { priority: item.priority });
        }
        return { success: true };
      }),

    // AI批量生成选题
    aiGenerate: publicProcedure
      .input(z.object({
        count: z.number().min(1).max(50).default(10),
        civilizationId: z.string().optional(),
        civilization: z.string().optional(),
        theme: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const civFilter = input.civilization ? `重点关注${input.civilization}文明` : "覆盖多个文明（华夏、古埃及、罗马、古希腊、古印度、波斯、玛雅、维京、蒙古、日本、奥斯曼、丝绸之路等）";
        const themeFilter = input.theme ? `围绕主题：${input.theme}` : "选择有故事性、戏剧性、视觉冲击力的历史事件或人物";

        const response = await invokeLLM({
          messages: [
            { role: "system", content: `你是一个历史内容策划专家，擅长为短视频频道策划引人入胜的历史选题。你需要生成适合制作成5-10分钟历史动画短视频的选题。每个选题要有明确的叙事角度和视觉潜力。` },
            { role: "user", content: `请生成${input.count}个历史短视频选题。${civFilter}。${themeFilter}。\n\n要求：\n- 每个选题要有独特的叙事角度，不要泛泛而谈\n- 标题要吸引眼球，适合短视频平台\n- 要有具体的时间段和文明归属\n- 简介要突出故事的核心冲突或悬念` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "topic_list",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "选题标题，15-30字" },
                        civilizationId: { type: "string", description: "文明ID" },
                        civilization: { type: "string", description: "文明中文名" },
                        period: { type: "string", description: "时间段" },
                        description: { type: "string", description: "选题简介，50-100字" },
                      },
                      required: ["title", "civilizationId", "civilization", "period", "description"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["topics"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") throw new Error("AI生成失败：无返回内容");
        const parsed = JSON.parse(content);
        const topicItems = parsed.topics;
        if (!Array.isArray(topicItems) || topicItems.length === 0) throw new Error("AI生成失败：返回格式异常");

        const insertItems = topicItems.map((t: any, i: number) => ({
          title: t.title,
          civilizationId: t.civilizationId || "default",
          civilization: t.civilization || "",
          period: t.period || "",
          description: t.description || "",
          status: "pending" as const,
          priority: i,
        }));

        const ids = await batchCreateTopics(insertItems);
        return { success: true, count: ids.length, topics: topicItems };
      }),
  }),

  // ========== 生产控制 ==========
  production: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => listProductions(input?.limit ?? 20)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getProductionById(input.id)),

    getLogs: publicProcedure
      .input(z.object({ productionId: z.number() }))
      .query(async ({ input }) => getProductionLogs(input.productionId)),

    getRunning: publicProcedure.query(async () => getRunningProduction()),

    stats: publicProcedure.query(async () => getProductionStats()),

    steps: publicProcedure.query(() => PIPELINE_STEPS),

    completed: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => listCompletedProductions(input?.limit ?? 20)),

    // 触发生产
    trigger: publicProcedure
      .input(z.object({ topicId: z.number().optional() }).optional())
      .mutation(async ({ input }) => {
        let topicId = input?.topicId;
        if (!topicId) {
          const next = await getNextPendingTopic();
          if (!next) return { success: false, error: "没有待处理的选题" };
          topicId = next.id;
        }

        const running = await getRunningProduction();
        if (running) return { success: false, error: "已有生产任务在运行中，请等待完成" };

        const topic = await getTopicById(topicId);
        if (!topic) return { success: false, error: "选题不存在" };

        await updateTopic(topicId, { status: "in_progress" });

        const productionId = await createProduction({
          topicId,
          status: "running",
          currentStep: "01",
          currentStepName: "准备中",
          startedAt: new Date(),
        });

        // 使用BullMQ生产引擎
        const result = await triggerProduction({
          productionId,
          topicId,
          topicTitle: topic.title,
          civilization: topic.civilization || "",
          period: topic.period || "",
          description: topic.description || "",
        });

        return {
          success: true,
          productionId,
          topicId,
          jobId: result.jobId,
          topicTitle: topic.title
        };
      }),

    // 更新生产步骤进度（n8n webhook回调）
    updateStep: publicProcedure
      .input(z.object({
        productionId: z.number(),
        stepNumber: z.number(),
        stepName: z.string(),
        status: z.enum(["running", "completed", "failed", "skipped"]),
        output: z.string().optional(),
        errorMessage: z.string().optional(),
        durationMs: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { productionId, stepNumber, stepName, status, output, errorMessage, durationMs } = input;

        await createProductionLog({
          productionId, stepNumber, stepName, status,
          output: output ?? null,
          errorMessage: errorMessage ?? null,
          durationMs: durationMs ?? null,
          completedAt: status === "completed" || status === "failed" ? new Date() : undefined,
        });

        const updateData: any = {
          currentStep: String(stepNumber).padStart(2, "0"),
          currentStepName: stepName,
          completedSteps: stepNumber,
        };

        if (status === "failed") {
          updateData.status = "failed";
          updateData.errorMessage = errorMessage;
          updateData.completedAt = new Date();
        } else if (stepNumber >= 11 && status === "completed") {
          updateData.status = "completed";
          updateData.completedAt = new Date();
        }

        await updateProduction(productionId, updateData);
        return { success: true };
      }),

    // 审核成品
    review: publicProcedure
      .input(z.object({
        productionId: z.number(),
        action: z.enum(["approve", "reject"]),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const prod = await getProductionById(input.productionId);
        if (!prod) throw new Error("生产记录不存在");
        await updateProduction(input.productionId, {
          reviewStatus: input.action === "approve" ? "approved" : "rejected",
          reviewNote: input.note ?? null,
        });
        if (input.action === "reject") {
          await updateTopic(prod.topicId, { status: "pending" });
        }
        return { success: true };
      }),

    // 上报成品资源（n8n回调）
    reportAssets: publicProcedure
      .input(z.object({
        productionId: z.number(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        images: z.array(z.string()).optional(),
        script: z.any().optional(),
        copy: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.videoUrl) updateData.videoUrl = input.videoUrl;
        if (input.thumbnailUrl) updateData.thumbnailUrl = input.thumbnailUrl;
        if (input.images) updateData.imagesJson = input.images;
        if (input.script) updateData.scriptJson = input.script;
        if (input.copy) updateData.copyJson = input.copy;
        await updateProduction(input.productionId, updateData);
        return { success: true };
      }),

    finish: publicProcedure
      .input(z.object({
        productionId: z.number(),
        status: z.enum(["completed", "failed", "cancelled"]),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateProduction(input.productionId, {
          status: input.status,
          errorMessage: input.errorMessage,
          completedAt: new Date(),
        });
        const prod = await getProductionById(input.productionId);
        if (prod) {
          const topicStatus = input.status === "completed" ? "completed" : "failed";
          await updateTopic(prod.topicId, { status: topicStatus });
        }
        return { success: true };
      }),
  }),

  // ========== n8n连接配置 ==========
  n8nConfig: router({
    get: publicProcedure.query(async () => getN8nConfig()),

    save: publicProcedure
      .input(z.object({
        baseUrl: z.string(),
        apiKey: z.string(),
        workflowId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await upsertSetting("n8n_base_url", input.baseUrl);
        await upsertSetting("n8n_api_key", input.apiKey);
        await upsertSetting("n8n_workflow_id", input.workflowId);
        return { success: true };
      }),

    test: publicProcedure
      .input(z.object({
        baseUrl: z.string(),
        apiKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const headers: Record<string, string> = {};
          if (input.apiKey) headers["X-N8N-API-KEY"] = input.apiKey;
          const res = await fetch(`${input.baseUrl.replace(/\/$/, "")}/api/v1/workflows`, {
            headers,
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) {
            const data = await res.json();
            const workflows = data.data ?? [];
            return {
              success: true,
              message: `连接成功，发现 ${workflows.length} 个工作流`,
              workflows: workflows.map((w: any) => ({ id: w.id, name: w.name, active: w.active })),
            };
          }
          return { success: false, message: `连接失败: HTTP ${res.status}`, workflows: [] };
        } catch (err: any) {
          return { success: false, message: `连接失败: ${err.message}`, workflows: [] };
        }
      }),
  }),

  // ========== 社交媒体管理 ==========
  social: router({
    platforms: publicProcedure.query(() => SOCIAL_PLATFORMS),

    list: publicProcedure.query(async () => listSocialAccounts()),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getSocialAccountById(input.id)),

    create: publicProcedure
      .input(z.object({
        platform: z.string(),
        accountName: z.string().min(1),
        accountId: z.string().optional(),
        apiConfig: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createSocialAccount({
          platform: input.platform,
          accountName: input.accountName,
          accountId: input.accountId || "",
          apiConfig: input.apiConfig || {},
          status: "pending",
        });
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        accountName: z.string().optional(),
        accountId: z.string().optional(),
        status: z.enum(["connected", "disconnected", "error", "pending"]).optional(),
        apiConfig: z.any().optional(),
        followerCount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateSocialAccount(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSocialAccount(input.id);
        return { success: true };
      }),

    // 测试连接（模拟）
    testConnection: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const account = await getSocialAccountById(input.id);
        if (!account) throw new Error("账号不存在");
        const config = account.apiConfig as Record<string, any> | null;
        const hasConfig = config && Object.values(config).some(v => v && String(v).length > 0);
        if (hasConfig) {
          await updateSocialAccount(input.id, { status: "connected", lastSyncAt: new Date() });
          return { success: true, message: "连接成功" };
        }
        await updateSocialAccount(input.id, { status: "error" });
        return { success: false, message: "API配置不完整，请填写必要的凭证" };
      }),
  }),

  // ========== 发布管理 ==========
  publication: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ input }) => listPublications(input?.limit ?? 50)),

    byProduction: publicProcedure
      .input(z.object({ productionId: z.number() }))
      .query(async ({ input }) => getPublicationsByProduction(input.productionId)),

    stats: publicProcedure.query(async () => getPublicationStats()),

    create: publicProcedure
      .input(z.object({
        productionId: z.number(),
        socialAccountId: z.number(),
        platform: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createPublication({
          productionId: input.productionId,
          socialAccountId: input.socialAccountId,
          platform: input.platform,
          title: input.title,
          description: input.description,
          status: "draft",
        });
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "scheduled", "publishing", "published", "failed"]).optional(),
        externalId: z.string().optional(),
        externalUrl: z.string().optional(),
        views: z.number().optional(),
        likes: z.number().optional(),
        comments: z.number().optional(),
        shares: z.number().optional(),
        errorMessage: z.string().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updatePublication(id, { ...data, lastSyncAt: new Date() });
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePublication(input.id);
        return { success: true };
      }),

    // 批量发布到所有已连接平台
    publishToAll: publicProcedure
      .input(z.object({ productionId: z.number() }))
      .mutation(async ({ input }) => {
        const accounts = await listSocialAccounts();
        const connected = accounts.filter(a => a.status === "connected");
        if (connected.length === 0) return { success: false, error: "没有已连接的社交媒体账号" };

        const prod = await getProductionById(input.productionId);
        if (!prod) return { success: false, error: "生产记录不存在" };

        const topic = await getTopicById(prod.topicId);

        const results = [];
        for (const account of connected) {
          const pubId = await createPublication({
            productionId: input.productionId,
            socialAccountId: account.id,
            platform: account.platform,
            title: topic?.title || "",
            status: "scheduled",
          });
          results.push({ publicationId: pubId, platform: account.platform, accountName: account.accountName });
        }

        return { success: true, count: results.length, publications: results };
      }),
  }),
});

export type AppRouter = typeof appRouter;
