# n8n 工作流配置指南

## 快速配置步骤

### 1. 登录n8n
- 访问：http://localhost:5678
- 用户名：`admin`
- 密码：`aeonstory2026`

### 2. 创建简化版生产工作流

点击右上角 **+** → **Import from File** → 选择：
```
/Users/supermac/aeonstory/command-center/n8n-workflows/aeonstory-simple-production.json
```

### 3. 激活工作流
- 导入后，点击右上角的**开关按钮**激活工作流
- 确保显示为"Active"（绿色）

### 4. 测试webhook
激活后，在终端测试：
```bash
curl -X POST http://localhost:5678/webhook/aeonstory-production \
  -H "Content-Type: application/json" \
  -d '{
    "productionId": 999,
    "topicId": 1,
    "topicTitle": "测试",
    "civilization": "华夏",
    "period": "测试",
    "description": "测试描述"
  }'
```

应该返回：`{"success": true, "message": "生产已启动", ...}`

### 5. 更新指挥中心配置

编辑 `.env` 文件，更新webhook URL（如果需要）：
```
N8N_BASE_URL=http://localhost:5678
N8N_WORKFLOW_ID=aeonstory-simple-prod
```

重启指挥中心：
```bash
# 停止当前进程
# 然后重新启动
pnpm dev
```

## 工作流说明

这个简化版工作流包含：
1. **Webhook触发器** - 接收来自指挥中心的生产请求
2. **步骤1: 文明色调匹配** - 根据文明自动匹配配色方案
3. **步骤2: AI脚本撰写** - 调用本地Ollama (qwen2.5:14b) 生成脚本
4. **步骤3: 内容安全审核** - 简单的关键词过滤
5. **上报资源** - 将生成的内容回传给指挥中心
6. **完成生产** - 标记任务为completed

每个步骤都会通过HTTP调用指挥中心的API更新进度。

## 完整测试流程

1. 在指挥中心创建选题
2. 点击"触发生产"
3. 观察Console页面的进度更新
4. 等待所有步骤完成（约15-30秒）

## 故障排查

### Webhook 404错误
- 确保工作流已激活（绿色Active状态）
- 重启n8n容器：`docker restart aeonstory-n8n`
- 检查webhook路径是否正确

### Ollama连接失败
- 确认Ollama正在运行：`ollama list`
- 检查模型已下载：`ollama pull qwen2.5:14b`
- 测试连接：`curl http://localhost:11434/v1/models`

### 指挥中心API调用失败
- 检查指挥中心是否运行在3001端口
- 查看n8n执行日志中的错误信息
- 确认Docker网络可以访问host.docker.internal

##注意事项

- 这是简化版工作流，仅包含前3个核心步骤
- 步骤4-11（配音、场景图、视频合成等）需要额外的AI服务
- 可以根据需要逐步扩展工作流功能
