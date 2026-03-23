# AeonStory 指挥中心

🎬 基于AI的历史短视频自动化生产平台

## 🌟 功能特性

- **AI脚本生成**: 使用Ollama (qwen2.5:14b) 自动生成历史纪录片脚本
- **智能场景图**: ComfyUI + FLUX Schnell 生成历史场景图
- **自动配音**: macOS TTS 语音合成
- **视频合成**: FFmpeg 自动合成场景图+配音
- **多平台文案**: AI生成适配抖音/B站/YouTube的文案
- **生产流程**: BullMQ + Redis 可靠的任务队列系统

## 🏗️ 技术栈

### 后端
- **框架**: Express + tRPC
- **数据库**: PostgreSQL (Drizzle ORM)
- **任务队列**: BullMQ + Redis
- **AI模型**: 
  - Ollama (qwen2.5:14b, llama-guard3:8b)
  - ComfyUI + FLUX.1-schnell

### 前端
- **框架**: React + Vite
- **UI**: TailwindCSS + shadcn/ui
- **状态管理**: TanStack Query (React Query)

## 📦 安装

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库等配置

# 启动开发服务器
pnpm dev
```

## 🚀 使用

1. 访问 http://localhost:3001
2. 创建历史选题
3. 点击"触发生产"
4. 等待2-4分钟，AI自动完成：
   - 脚本撰写
   - 场景图生成
   - 配音合成
   - 视频合成
   - 多平台文案

## 🎯 生产流程（11步）

| 步骤 | 功能 | AI模型 | 耗时 |
|------|------|--------|------|
| 1 | 文明色调匹配 | 配置映射 | <1s |
| 2 | AI脚本撰写 | Ollama qwen2.5:14b | 15-20s |
| 3 | 内容安全审核 | Ollama llama-guard3:8b | 1-2s |
| 4 | AI配音生成 | macOS say | 5-10s |
| 5 | AI场景图生成 | ComfyUI FLUX Schnell | 30-60s |
| 6 | 视频合成 | FFmpeg | 15-30s |
| 7 | 全平台文案生成 | Ollama qwen2.5:14b | 5-10s |
| 8 | 缩略图生成 | ComfyUI FLUX Schnell | 8-10s |
| 9 | 质量检查 | 规则检查 | <1s |
| 10 | 上报资源 | 数据库 | <1s |
| 11 | 完成生产 | 状态更新 | <1s |

**总耗时**: 约2-4分钟

## 🔧 开发

```bash
# 运行测试
pnpm test

# 类型检查
pnpm check

# 构建生产版本
pnpm build

# 生产环境运行
pnpm start
```

## 📚 文档

- [生产引擎设计](./PRODUCTION_ENGINE_DESIGN.md)
- [BullMQ配置指南](./BULLMQ_SETUP_GUIDE.md)
- [N8N配置](./N8N-CONFIG-GUIDE.md) (已废弃)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT

## 🎬 演示

生成的视频示例：[待添加]

---

**由 Claude Code 协助开发** 🤖
