# AeonStory Command Center - 开发日志

## 2026-03-23

### ✅ 完成内容
- **完成11步自动化生产流程**
  - 从 n8n 方案迁移到 BullMQ 任务队列
  - 实现完整的任务编排和进度追踪
  - 支持失败重试和任务持久化

- **集成所有 AI 服务**
  - Ollama: Qwen2.5:14b (脚本生成) + LlamaGuard3:8b (内容审核)
  - ComfyUI: FLUX Schnell 图像生成（4步快速生成）
  - macOS TTS: say 命令语音合成
  - FFmpeg: 视频合成

- **修复关键 Bug**
  - ✅ 内容审核大小写敏感问题（safe vs SAFE）
  - ✅ 场景提取正则表达式（支持中英文冒号）
  - ✅ ComfyUI 工作流（从硬编码改为真实 FLUX Schnell）
  - ✅ PostgreSQL 连接冲突（停用本地实例，使用 Docker）

- **创建项目文档**
  - README.md: 完整的项目说明
  - PRODUCTION_ENGINE_DESIGN.md: 架构设计文档
  - BULLMQ_SETUP_GUIDE.md: BullMQ 部署指南
  - test-services.js: 服务诊断工具

- **推送到 GitHub**
  - 仓库: https://github.com/macli8666-oss/aeonstory-command-center
  - 159 个文件，33,183 行代码

### 📋 待做事项
- **测试完整流程**
  - 运行一次完整的生产流程
  - 验证视频生成是否正常
  - 检查所有 11 步是否都能成功

- **性能优化**
  - ComfyUI 可能需要自定义 workflow 以提升图片质量
  - 评估并发生产的可行性（目前 concurrency: 1）
  - 考虑添加图片缓存机制

- **功能增强**
  - 实现 LTX-Video 视频片段生成（目前是占位符）
  - 添加自定义 TTS 语音模型支持
  - 支持自定义视频转场效果

- **运维完善**
  - 添加 Docker Compose 一键部署
  - 配置生产环境部署脚本
  - 添加监控和日志收集

### ⚠️ 已知问题
- ComfyUI 图片生成速度较慢（FLUX Schnell 约 10-15 秒/张）
- macOS say 命令生成的语音质量一般，可能需要替换为专业 TTS
- 视频合成后的文件较大，可能需要压缩

### 📁 关键文件
- `server/_core/productionEngine.ts` - 生产引擎入口
- `server/_core/productionWorker.ts` - 11 步工作流实现
- `server/_core/aiServices/ollama.ts` - Ollama LLM 服务
- `server/_core/aiServices/comfyui.ts` - ComfyUI 图像生成
- `server/_core/aiServices/videoGen.ts` - FFmpeg 视频合成
- `server/_core/aiServices/tts.ts` - TTS 语音合成
- `server/routers.ts` - tRPC API 路由
- `drizzle/schema.ts` - PostgreSQL 数据库 schema
- `test-services.js` - 服务诊断工具
