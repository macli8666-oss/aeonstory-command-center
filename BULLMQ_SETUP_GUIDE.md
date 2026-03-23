# BullMQ 生产引擎启动指南

## ✅ 已完成的工作

### 1. 架构升级
- ❌ 移除n8n依赖
- ✅ 使用BullMQ + Redis任务队列
- ✅ 创建ProductionEngine核心引擎
- ✅ 创建ProductionWorker后台任务处理器
- ✅ 封装AI服务层（Ollama、ComfyUI、TTS、视频生成）

### 2. 代码结构
```
server/
├── _core/
│   ├── index.ts                    # 主进程入口（已更新）
│   ├── productionEngine.ts         # 【新建】BullMQ队列管理
│   ├── productionWorker.ts         # 【新建】Worker任务处理器
│   └── aiServices/                 # 【新建】AI服务封装层
│       ├── ollama.ts               # Ollama LLM服务
│       ├── comfyui.ts              # ComfyUI图像生成
│       ├── tts.ts                  # TTS语音合成
│       └── videoGen.ts             # 视频生成（占位符）
└── routers.ts                      # 【已修改】使用ProductionEngine
```

---

## 🚀 快速启动

### 前置条件

✅ Redis已运行（Docker容器 aeonstory-redis）
✅ Ollama已运行（localhost:11434）
✅ ComfyUI已运行（localhost:8188）
✅ PostgreSQL已运行（Docker容器 aeonstory-postgres）

验证命令：
```bash
# 检查Redis
docker ps | grep redis

# 检查Ollama
curl http://localhost:11434/v1/models

# 检查ComfyUI
curl http://localhost:8188/system_stats

# 检查PostgreSQL
docker ps | grep postgres
```

### 启动指挥中心（包含Worker）

```bash
cd /Users/supermac/aeonstory/command-center
pnpm dev
```

启动后应该看到：
```
[Worker] 生产任务Worker已启动，等待任务...
Server running on http://localhost:3001/
```

---

## 🧪 测试流程

### 1. 访问指挥中心

浏览器打开：http://localhost:3001

### 2. 创建选题（或使用现有选题）

进入"选题库" → "创建新选题"

示例选题：
- 标题：秦始皇统一六国的战略布局
- 文明：华夏
- 时期：战国末期
- 简介：从远交近攻到横扫六国，秦国如何在短短十年间完成统一大业？

### 3. 触发生产

进入"生产控制台" → 点击"触发生产"

### 4. 观察实时进度

Console页面会每2秒刷新，显示当前执行的步骤：

```
进度：45%
当前步骤：5/11 - AI场景图生成
已完成：
  ✅ 1. 文明色调匹配 (1s)
  ✅ 2. AI脚本撰写 (25s)
  ✅ 3. 内容安全审核 (3s)
  ✅ 4. AI配音生成 (8s)
  🔄 5. AI场景图生成 (进行中...)
```

### 5. 查看生产日志

点击生产记录 → 查看详细日志

---

## 📊 11步生产流程说明

| 步骤 | 名称 | AI模型/工具 | 预计耗时 | 状态 |
|------|------|------------|---------|------|
| 1 | 文明色调匹配 | 配置映射表 | <1s | ✅ 已实现 |
| 2 | AI脚本撰写 | qwen2.5:14b | 10-30s | ✅ 已实现 |
| 3 | 内容安全审核 | llama-guard3:8b | 2-5s | ✅ 已实现 |
| 4 | AI配音生成 | macOS say | 5-10s | ✅ 简化实现 |
| 5 | AI场景图生成 | ComfyUI + FLUX.1-dev | 30-45s | ✅ 已实现 |
| 6 | 视频合成 | 占位符 | - | 🟡 暂模拟 |
| 7 | 全平台文案生成 | qwen2.5:14b | 5-10s | ✅ 已实现 |
| 8 | 缩略图生成 | ComfyUI | 20-30s | ✅ 已实现 |
| 9 | 质量检查 | 规则检查 | <1s | ✅ 已实现 |
| 10 | 上报资源 | 数据库操作 | <1s | ✅ 已实现 |
| 11 | 完成生产 | 数据库操作 | <1s | ✅ 已实现 |

**总耗时估算**：约2-3分钟（不含视频生成）

---

## 🔧 配置说明

### Redis配置（已运行）

Docker容器：aeonstory-redis
端口：6379
连接信息：localhost:6379（无密码）

### Ollama模型

已安装的模型：
- qwen2.5:14b - 脚本生成、文案生成
- llama-guard3:8b - 内容审核
- qwen3:32b - 备用（更强性能）

### ComfyUI配置

端口：8188
模型：FLUX.1-dev
工作流：简化版（内置在代码中）

**注意**：ComfyUI工作流目前使用简化版本，如需自定义：
1. 在ComfyUI界面创建workflow
2. 导出workflow JSON
3. 更新 `server/_core/aiServices/comfyui.ts` 中的 `buildFluxWorkflow` 函数

---

## 🐛 故障排查

### Worker未启动

症状：触发生产后没有任何进度更新

解决：
1. 检查终端日志是否有 `[Worker] 生产任务Worker已启动`
2. 检查Redis是否运行：`docker ps | grep redis`
3. 重启指挥中心：`Ctrl+C` 然后 `pnpm dev`

### Ollama连接失败

症状：步骤2（AI脚本撰写）失败

解决：
```bash
# 检查Ollama服务
curl http://localhost:11434/v1/models

# 重启Ollama（如果需要）
# macOS: Ollama应用菜单 → Restart
```

### ComfyUI连接失败

症状：步骤5（场景图生成）或步骤8（缩略图）失败

解决：
```bash
# 检查ComfyUI
curl http://localhost:8188/system_stats

# 访问ComfyUI界面确认运行
open http://localhost:8188
```

### Redis连接失败

症状：触发生产时报错 `ECONNREFUSED`

解决：
```bash
# 检查Redis容器
docker ps | grep redis

# 如果未运行，启动容器
docker start aeonstory-redis

# 如果容器不存在，创建新的
docker run -d --name aeonstory-redis -p 6379:6379 redis:7-alpine
```

---

## 🎯 下一步优化

### Phase 1（当前）
- ✅ 完整11步流程
- ✅ 实时进度显示
- ✅ 简化版AI服务集成

### Phase 2（未来）
- [ ] 步骤4：接入真实TTS服务（CosyVoice/GPT-SoVITS）
- [ ] 步骤6：接入视频生成（LTX-Video/Stable Video Diffusion）
- [ ] 步骤10：真实平台API对接（YouTube/TikTok/B站）
- [ ] ComfyUI工作流优化（自定义模板）
- [ ] Worker并发控制（防止资源耗尽）
- [ ] 任务失败重试策略
- [ ] 生产性能监控

---

## 📝 与n8n方案对比

| 特性 | n8n方案 | BullMQ方案 |
|------|---------|-----------|
| 依赖服务 | 需要独立n8n服务 | 仅需Redis |
| 代码可控性 | 低（JSON配置） | 高（TypeScript代码）|
| 调试难度 | 高（黑盒） | 低（直接调试）|
| 性能 | HTTP往返开销 | 进程内调用，更快 |
| 可靠性 | Webhook可能失败 | 任务持久化，可重试 |
| 类型安全 | 无 | 完整TypeScript类型 |
| 维护成本 | 高（多个服务） | 低（单一代码库）|

**结论**：BullMQ方案更适合我们的场景 ✅

---

**准备好了吗？执行 `pnpm dev` 开始测试！**
