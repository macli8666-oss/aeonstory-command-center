/**
 * 生产任务Worker
 * 执行11步生产流程的实际逻辑
 */

import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { getDb } from '../db';
import {
  productionLogs,
  productions,
} from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// AI服务导入
import * as ollamaService from './aiServices/ollama';
import * as comfyuiService from './aiServices/comfyui';
import * as ttsService from './aiServices/tts';
import * as videoGenService from './aiServices/videoGen';

// Redis连接
const connection = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

// 文明色调映射表
const CIVILIZATION_COLORS: Record<string, { primary: string; secondary: string }> = {
  '华夏': { primary: '#C8102E', secondary: '#FFD700' },
  '罗马': { primary: '#800020', secondary: '#DAA520' },
  '古埃及': { primary: '#E4A010', secondary: '#4169E1' },
  '古希腊': { primary: '#0033A0', secondary: '#FFFFFF' },
  '维京': { primary: '#1C3A57', secondary: '#A0522D' },
};

/**
 * Worker任务处理器
 */
export const productionWorker = new Worker(
  'aeonstory-production',
  async (job: Job) => {
    const { productionId, topicId, topicTitle, civilization, period, description } = job.data;

    console.log(`\n[Worker] 开始处理生产任务 #${productionId}: ${topicTitle}`);

    try {
      // 步骤1: 文明色调匹配
      const colors = await executeStep(productionId, 1, '文明色调匹配', async () => {
        const matched = CIVILIZATION_COLORS[civilization] || { primary: '#333333', secondary: '#999999' };
        return matched;
      });
      job.updateProgress(9); // 1/11 ≈ 9%

      // 步骤2: AI脚本撰写
      const script = await executeStep(productionId, 2, 'AI脚本撰写', async () => {
        const generatedScript = await ollamaService.generateScript({
          title: topicTitle,
          civilization,
          period,
          description,
        });
        return generatedScript;
      });
      job.updateProgress(18); // 2/11 ≈ 18%

      // 步骤3: 内容安全审核
      const moderation = await executeStep(productionId, 3, '内容安全审核', async () => {
        const result = await ollamaService.moderateContent(script);
        if (!result.safe) {
          throw new Error(`内容审核未通过: ${result.message}`);
        }
        return result;
      });
      job.updateProgress(27); // 3/11 ≈ 27%

      // 步骤4: AI配音生成
      const voice = await executeStep(productionId, 4, 'AI配音生成', async () => {
        const audioResult = await ttsService.generateVoice(script);
        return audioResult;
      });
      job.updateProgress(36); // 4/11 ≈ 36%

      // 步骤5: AI场景图生成
      const scenes = ollamaService.extractSceneDescriptions(script);
      const sceneImages = await executeStep(productionId, 5, 'AI场景图生成', async () => {
        const images = await comfyuiService.generateSceneImages(scenes);
        return images;
      });
      job.updateProgress(45); // 5/11 ≈ 45%

      // 步骤6: 视频合成
      const video = await executeStep(productionId, 6, '视频合成', async () => {
        const videoResult = await videoGenService.synthesizeVideo({
          scenes: sceneImages.map((img, idx) => ({
            imageUrl: img.imageUrl,
            duration: 30, // 每个场景30秒
          })),
          audioUrl: voice.audioUrl,
          transitions: 'fade',
        });
        return videoResult;
      });
      job.updateProgress(55); // 6/11 ≈ 55%

      // 步骤7: 全平台文案生成
      const captions = await executeStep(productionId, 7, '全平台文案生成', async () => {
        const platformCaptions = await ollamaService.generateSocialCaptions({
          script,
          title: topicTitle,
          platforms: ['douyin', 'bilibili', 'youtube'],
        });
        return platformCaptions;
      });
      job.updateProgress(64); // 7/11 ≈ 64%

      // 步骤8: 缩略图生成
      const thumbnail = await executeStep(productionId, 8, '缩略图生成', async () => {
        const thumbResult = await comfyuiService.generateThumbnail({
          title: topicTitle,
          civilization,
          mainScene: scenes[0]?.description,
        });
        return thumbResult;
      });
      job.updateProgress(73); // 8/11 ≈ 73%

      // 步骤9: 质量检查
      const quality = await executeStep(productionId, 9, '质量检查', async () => {
        const issues: string[] = [];

        // 检查脚本长度
        if (script.length < 500) {
          issues.push('脚本过短');
        }

        // 检查场景数量
        if (scenes.length < 3) {
          issues.push('场景数量不足');
        }

        // 检查视频
        if (!video.videoUrl || video.videoUrl.includes('placeholder')) {
          issues.push('视频为占位符');
        }

        return {
          passed: issues.length === 0,
          issues,
          message: issues.length === 0 ? '质量检查通过' : `发现问题: ${issues.join(', ')}`,
        };
      });
      job.updateProgress(82); // 9/11 ≈ 82%

      // 步骤10: 上报资源到数据库
      await executeStep(productionId, 10, '上报资源', async () => {
        const db = await getDb();
        if (!db) throw new Error('数据库未连接');

        // 收集所有场景图片URL
        const imageUrls = sceneImages.map(img => img.imageUrl);

        // 更新生产记录：视频、缩略图、图片、脚本、文案
        await db
          .update(productions)
          .set({
            videoUrl: video.videoUrl,
            thumbnailUrl: thumbnail.imageUrl,
            imagesJson: imageUrls,
            scriptJson: { script, scenes },
            copyJson: captions,
          })
          .where(eq(productions.id, productionId));

        return { success: true };
      });
      job.updateProgress(91); // 10/11 ≈ 91%

      // 步骤11: 更新状态为完成
      await executeStep(productionId, 11, '完成生产', async () => {
        const db = await getDb();
        if (!db) throw new Error('数据库未连接');

        await db
          .update(productions)
          .set({
            status: 'completed',
            currentStep: '11',
            currentStepName: '完成生产',
            completedAt: new Date(),
          })
          .where(eq(productions.id, productionId));

        return { success: true };
      });
      job.updateProgress(100);

      console.log(`[Worker] 生产任务 #${productionId} 完成！`);

      return {
        success: true,
        productionId,
        summary: {
          script: script.substring(0, 200) + '...',
          videoUrl: video.videoUrl,
          thumbnailUrl: thumbnail.imageUrl,
          quality: quality.passed ? 'good' : 'warning',
        },
      };
    } catch (error: any) {
      console.error(`[Worker] 生产任务 #${productionId} 失败:`, error);

      // 更新状态为失败
      const db = await getDb();
      if (db) {
        await db
          .update(productions)
          .set({
            status: 'failed',
            errorMessage: error.message || String(error),
          })
          .where(eq(productions.id, productionId));
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // 一次只处理一个生产任务（避免资源耗尽）
  }
);

/**
 * 通用步骤执行器
 */
async function executeStep<T>(
  productionId: number,
  stepNumber: number,
  stepName: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const db = await getDb();
  if (!db) throw new Error('数据库未连接');

  console.log(`[Worker] 步骤${stepNumber}: ${stepName} - 开始`);

  // 更新数据库：标记步骤开始
  await db
    .update(productions)
    .set({
      currentStep: String(stepNumber).padStart(2, '0'),
      currentStepName: stepName,
    })
    .where(eq(productions.id, productionId));

  await db.insert(productionLogs).values({
    productionId,
    stepNumber,
    stepName,
    status: 'running',
    startedAt: new Date(),
  });

  try {
    // 执行实际逻辑
    const result = await fn();

    const durationMs = Date.now() - startTime;

    console.log(`[Worker] 步骤${stepNumber}: ${stepName} - 完成 (${durationMs}ms)`);

    // 更新数据库：标记步骤完成
    await db
      .update(productionLogs)
      .set({
        status: 'completed',
        completedAt: new Date(),
        output: JSON.stringify(result).substring(0, 5000), // 限制输出大小
        durationMs,
      })
      .where(eq(productionLogs.productionId, productionId))
      .where(eq(productionLogs.stepNumber, stepNumber));

    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    console.error(`[Worker] 步骤${stepNumber}: ${stepName} - 失败:`, error);

    // 更新数据库：标记步骤失败
    await db
      .update(productionLogs)
      .set({
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error.message || String(error),
        durationMs,
      })
      .where(eq(productionLogs.productionId, productionId))
      .where(eq(productionLogs.stepNumber, stepNumber));

    throw error;
  }
}

/**
 * Worker事件监听
 */
productionWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} 完成`);
});

productionWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} 失败:`, err);
});

productionWorker.on('error', (err) => {
  console.error('[Worker] Worker错误:', err);
});

console.log('[Worker] 生产任务Worker已启动，等待任务...');

/**
 * 优雅关闭
 */
export async function shutdownWorker() {
  await productionWorker.close();
  await connection.quit();
  console.log('[Worker] Worker已关闭');
}
