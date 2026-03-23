#!/usr/bin/env tsx
/**
 * 独立Worker进程启动脚本
 * 可以单独运行：tsx server/worker.ts
 * 或者集成到主进程中
 */

import './productionWorker';

console.log('[Worker] 启动脚本执行完成，Worker正在后台运行...');

// 保持进程运行
process.on('SIGTERM', async () => {
  console.log('[Worker] 收到SIGTERM信号，准备关闭...');
  const { shutdownWorker } = await import('./_core/productionWorker');
  await shutdownWorker();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] 收到SIGINT信号，准备关闭...');
  const { shutdownWorker } = await import('./_core/productionWorker');
  await shutdownWorker();
  process.exit(0);
});
