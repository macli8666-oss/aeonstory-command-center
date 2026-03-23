# AeonStory 生产引擎架构设计

## 📊 当前环境检查结果

### ✅ 可用资源
- **Ollama**: qwen2.5:14b, qwen3:32b, llama-guard3:8b, deepseek-r1 70B等
- **ComfyUI**: 运行在8188端口，FLUX.1-dev可用
- **硬件**: M3 Ultra + 96GB RAM
- **指挥中心**: Express + tRPC + PostgreSQL

### ❌ 需要补充
- **TTS**: 暂用macOS say命令或API调用
- **视频生成**: 先用模拟/占位符
- **BullMQ**: 需要安装 + Redis

---

## 🏗️ 技术架构

### 核心组件

```
指挥中心 (Express + tRPC)
    ↓
ProductionEngine (后台任务引擎)
    ↓
BullMQ (任务队列) ← Redis
    ↓
Worker进程 (执行各步骤)
    ↓
AI服务层 (Ollama/ComfyUI/TTS)
    ↓
数据库 (PostgreSQL - 进度更新)
    ↓
前端轮询 (实时显示进度)
```

### 技术选型

| 组件 | 技术 | 原因 |
|------|------|------|
| 任务队列 | BullMQ | 持久化、可靠、TypeScript支持好 |
| 消息存储 | Redis | BullMQ依赖，也可用于缓存 |
| 实时更新 | 轮询(2-3秒) | 简单可靠，Console已有轮询机制 |
| AI调度 | 直接HTTP调用 | Ollama/ComfyUI都提供HTTP API |

---

## 🎬 完整11步流程映射

### 第一阶段实现（核心功能）

| 步骤 | 名称 | AI模型/工具 | 实现状态 | 预计耗时 |
|------|------|------------|---------|---------|
| 1 | 文明色调匹配 | 配置映射表 | ✅ 已实现 | <1s |
| 2 | AI脚本撰写 | qwen2.5:14b / qwen3:32b | ✅ 已实现 | 10-30s |
| 3 | 内容安全审核 | llama-guard3:8b | ✅ 可用 | 2-5s |
| 4 | AI配音生成 | macOS `say` / API | 🟡 简化实现 | 5-10s |
| 5 | AI场景图生成 | ComfyUI + FLUX.1-dev | ✅ 可用 | 30-45s |
| 6 | 视频合成 | 占位符 | 🟡 暂模拟 | - |
| 7 | 全平台文案生成 | qwen2.5:14b | ✅ 可用 | 5-10s |
| 8 | 缩略图生成 | ComfyUI | ✅ 可用 | 20-30s |
| 9 | 质量检查 | 规则检查 | 🟡 简化实现 | <1s |
| 10 | 发布到各平台 | API对接 | 🟡 暂模拟 | - |
| 11 | 更新状态 | 数据库操作 | ✅ 已实现 | <1s |

**总耗时估算**: 约2-3分钟（不含视频生成）

### 第二阶段扩展（未来）
- 步骤4: 接入CosyVoice/GPT-SoVITS
- 步骤6: 接入LTX-Video或Stable Video Diffusion
- 步骤10: 真实平台API对接（YouTube/TikTok等）

---

## 💻 代码结构

```
server/
├── _core/
│   ├── llm.ts                    # Ollama封装（已有）
│   ├── productionEngine.ts       # 【新建】核心引擎
│   ├── productionWorker.ts       # 【新建】BullMQ Worker
│   └── aiServices/               # 【新建】AI服务封装
│       ├── ollama.ts             # Ollama统一接口
│       ├── comfyui.ts            # ComfyUI图像生成
│       ├── tts.ts                # TTS语音合成
│       └── videoGen.ts           # 视频生成（占位）
├── routers.ts                    # 修改trigger逻辑
└── db.ts                         # 已有

client/
└── src/pages/Console.tsx         # 修改：增强轮询逻辑
```

---

## 🔄 工作流程详解

### 1. 触发流程

```typescript
// routers.ts - production.trigger
async trigger({ topicId }) {
  // 1. 创建生产记录
  const productionId = await createProduction({ topicId, status: 'queued' });

  // 2. 添加到BullMQ队列（异步执行）
  await productionQueue.add('execute', { productionId, topicId });

  // 3. 立即返回
  return { success: true, productionId };
}
```

### 2. Worker执行

```typescript
// productionWorker.ts
productionQueue.process('execute', async (job) => {
  const { productionId, topicId } = job.data;
  const topic = await getTopicById(topicId);

  try {
    // 步骤1: 文明色调匹配
    await executeStep(productionId, 1, '文明色调匹配', async () => {
      return matchCivilizationColors(topic.civilization);
    });

    // 步骤2: AI脚本撰写
    const script = await executeStep(productionId, 2, 'AI脚本撰写', async () => {
      return await ollamaService.generateScript(topic);
    });

    // 步骤3: 内容审核
    await executeStep(productionId, 3, '内容安全审核', async () => {
      return await ollamaService.moderateContent(script);
    });

    // 步骤4: TTS配音
    await executeStep(productionId, 4, 'AI配音生成', async () => {
      return await ttsService.generateVoice(script);
    });

    // 步骤5: 场景图生成
    const images = await executeStep(productionId, 5, 'AI场景图生成', async () => {
      return await comfyuiService.generateSceneImages(script);
    });

    // ... 步骤6-11

    // 完成
    await finishProduction(productionId, 'completed');

  } catch (error) {
    await finishProduction(productionId, 'failed', error.message);
  }
});

// 通用步骤执行器
async function executeStep(productionId, stepNumber, stepName, fn) {
  // 标记开始
  await updateStep(productionId, stepNumber, stepName, 'running');

  const startTime = Date.now();

  try {
    // 执行实际逻辑
    const result = await fn();

    // 标记完成
    await updateStep(productionId, stepNumber, stepName, 'completed', {
      output: JSON.stringify(result),
      durationMs: Date.now() - startTime
    });

    return result;
  } catch (error) {
    await updateStep(productionId, stepNumber, stepName, 'failed', {
      errorMessage: error.message,
      durationMs: Date.now() - startTime
    });
    throw error;
  }
}
```

### 3. 前端实时显示

```typescript
// Console.tsx
useEffect(() => {
  const interval = setInterval(async () => {
    if (runningProduction) {
      const updated = await trpc.production.getById.query({
        id: runningProduction.id
      });

      setProduction(updated);
      updateProgressBar(updated.completedSteps, updated.totalSteps);

      // 完成后停止轮询
      if (updated.status === 'completed' || updated.status === 'failed') {
        clearInterval(interval);
      }
    }
  }, 2000); // 每2秒更新

  return () => clearInterval(interval);
}, [runningProduction]);
```

---

## 📦 依赖安装

```json
// package.json 新增
{
  "dependencies": {
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.2"
  }
}
```

---

## 🚀 实施计划

### Phase 1: 基础框架（2-3小时）
1. ✅ 安装BullMQ + Redis
2. ✅ 创建ProductionEngine类
3. ✅ 创建Worker进程
4. ✅ 修改trigger mutation
5. ✅ 测试步骤1-3

### Phase 2: AI集成（3-4小时）
1. ✅ 封装Ollama服务（脚本、审核、文案）
2. ✅ 封装ComfyUI服务（图像、缩略图）
3. ✅ 简单TTS实现（macOS say）
4. ✅ 测试完整流程

### Phase 3: 前端优化（1-2小时）
1. ✅ 增强Console进度显示
2. ✅ 添加步骤详情弹窗
3. ✅ 错误处理和重试机制

### Phase 4: 完善（持续）
- 接入真实TTS服务
- 接入视频生成
- 平台发布API对接
- 性能优化和监控

---

## ✅ 验证清单

### 环境准备
- [ ] Redis安装并运行
- [ ] BullMQ依赖安装
- [ ] Ollama运行（已✓）
- [ ] ComfyUI运行（已✓）

### 功能测试
- [ ] 创建选题 → 触发生产
- [ ] Worker自动执行
- [ ] 进度实时更新
- [ ] 生产完成/失败处理
- [ ] 错误恢复机制

### 性能验证
- [ ] 单个生产<3分钟
- [ ] 并发3个生产任务
- [ ] 内存占用<30GB
- [ ] 无内存泄漏

---

## 🎯 关键优势

相比n8n方案：
✅ **更简单**: 无需额外服务，代码完全可控
✅ **更可靠**: 任务持久化，可重试，有监控
✅ **更高效**: 无HTTP往返延迟
✅ **更易维护**: TypeScript全栈，类型安全
✅ **更强大**: 可以访问所有Node.js生态

---

## 🤔 待讨论问题

1. **Redis部署方式**
   - 本地安装？
   - Docker容器？
   - 已有Redis可复用？

2. **Worker进程**
   - 和指挥中心同进程？
   - 独立进程（推荐）？

3. **图像生成细节**
   - ComfyUI workflow模板在哪？
   - FLUX模型路径？
   - 需要几张场景图？

4. **优先级**
   - 先实现完整流程（简化版）？
   - 还是逐步完善每个步骤？

---

**准备好了吗？需要我现在开始实施，还是先讨论细节？**
