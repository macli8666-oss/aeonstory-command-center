/**
 * 生产引擎核心
 * 使用BullMQ管理11步生产流程
 */

import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis连接配置
const connection = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

// 创建生产任务队列
export const productionQueue = new Queue('aeonstory-production', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // 保留1天
      count: 100,
    },
    removeOnFail: {
      age: 604800, // 保留7天
    },
  },
});

/**
 * 触发生产流程
 */
export async function triggerProduction(params: {
  productionId: number;
  topicId: number;
  topicTitle: string;
  civilization: string;
  period: string;
  description: string;
}): Promise<{ success: boolean; jobId: string }> {
  console.log(`[ProductionEngine] 触发生产 #${params.productionId}: ${params.topicTitle}`);

  // 添加任务到队列
  const job = await productionQueue.add('execute', params, {
    jobId: `prod-${params.productionId}`,
  });

  console.log(`[ProductionEngine] 任务已加入队列，Job ID: ${job.id}`);

  return {
    success: true,
    jobId: job.id!,
  };
}

/**
 * 获取任务状态
 */
export async function getProductionJobStatus(jobId: string) {
  const job = await productionQueue.getJob(jobId);

  if (!job) {
    return { exists: false };
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    exists: true,
    state,
    progress,
    data: job.data,
    failedReason: job.failedReason,
  };
}

/**
 * 清理队列（用于测试）
 */
export async function cleanQueue() {
  await productionQueue.obliterate({ force: true });
  console.log('[ProductionEngine] 队列已清空');
}

/**
 * 关闭连接
 */
export async function shutdown() {
  await productionQueue.close();
  await connection.quit();
  console.log('[ProductionEngine] 已关闭连接');
}
