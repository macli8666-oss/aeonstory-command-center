/**
 * Ollama AI 服务封装
 * 提供脚本生成、内容审核、文案生成等功能
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OLLAMA_BASE_URL = 'http://localhost:11434/v1';

/**
 * 生成历史短视频脚本
 */
export async function generateScript(params: {
  title: string;
  civilization: string;
  period: string;
  description: string;
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是一个专业的历史纪录片脚本编剧，擅长创作5-10分钟的历史动画短视频脚本。'
    },
    {
      role: 'user',
      content: `请为以下历史选题撰写一个吸引人的短视频脚本：
标题：${params.title}
文明：${params.civilization}
时期：${params.period}
简介：${params.description}

要求：
1. 开场要有悬念或冲突
2. 时长控制在8-10分钟
3. 包含3-5个关键场景
4. 每个场景要有视觉描述（用于后续AI绘图）
5. 语言要通俗易懂，适合短视频传播

请按以下格式输出：
【开场】（30秒）
[场景描述] ...
[旁白] ...

【场景一】（2分钟）
[场景描述] ...
[旁白] ...

...（后续场景）

【结尾】（30秒）
[场景描述] ...
[旁白] ...`
    }
  ];

  const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:14b',
      messages,
      max_tokens: 4000,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API错误: ${response.statusText}`);
  }

  const data: OllamaResponse = await response.json();
  return data.choices[0].message.content;
}

/**
 * 内容安全审核
 */
export async function moderateContent(script: string): Promise<{
  safe: boolean;
  issues: string[];
  message: string;
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是一个内容安全审核专家。请审核以下历史纪录片脚本，检查是否包含不适合公开传播的内容。重点检查：暴力血腥描述、政治敏感内容、虚假历史、歧视性内容。'
    },
    {
      role: 'user',
      content: `请审核以下脚本：\n\n${script}\n\n如果内容安全，请回复"SAFE"；如果有问题，请列出具体问题。`
    }
  ];

  const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-guard3:8b',
      messages,
      max_tokens: 500,
      temperature: 0.1,
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API错误: ${response.statusText}`);
  }

  const data: OllamaResponse = await response.json();
  const result = data.choices[0].message.content.toLowerCase(); // 转小写比较

  // 不区分大小写检查
  const safe = result.includes('safe') || result.includes('安全') || result.includes('通过');
  const issues: string[] = [];

  if (!safe) {
    // 提取问题列表
    const lines = data.choices[0].message.content.split('\n').filter(line => line.trim());
    issues.push(...lines);
  }

  console.log(`[Ollama] 内容审核结果: ${safe ? '通过' : '未通过'}, 原始返回: ${data.choices[0].message.content.substring(0, 100)}`);

  return {
    safe,
    issues,
    message: safe ? '内容安全审核通过' : `发现以下问题：${issues.join('; ')}`
  };
}

/**
 * 生成全平台文案
 */
export async function generateSocialCaptions(params: {
  script: string;
  title: string;
  platforms: string[];
}): Promise<Record<string, string>> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: '你是一个社交媒体文案专家，擅长为不同平台撰写吸引人的视频文案。'
    },
    {
      role: 'user',
      content: `视频标题：${params.title}
脚本内容：${params.script.substring(0, 500)}...

请为以下平台生成文案（包含标题、描述、标签）：
${params.platforms.join(', ')}

要求：
- 每个平台风格不同
- 包含相关话题标签
- 控制字数（抖音<100字，B站<200字，YouTube<300字）

请按JSON格式输出：
{
  "douyin": "文案内容 #标签1 #标签2",
  "bilibili": "...",
  "youtube": "..."
}`
    }
  ];

  const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:14b',
      messages,
      max_tokens: 1500,
      temperature: 0.8,
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API错误: ${response.statusText}`);
  }

  const data: OllamaResponse = await response.json();
  const content = data.choices[0].message.content;

  // 尝试解析JSON，如果失败则返回原文
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('文案解析失败，返回原始内容', e);
  }

  return { raw: content };
}

/**
 * 从脚本中提取场景描述（用于后续绘图）
 */
export function extractSceneDescriptions(script: string): Array<{
  index: number;
  title: string;
  description: string;
}> {
  const scenes: Array<{ index: number; title: string; description: string }> = [];

  // 匹配【xxx】和[场景描述]（支持冒号）
  const scenePattern = /【(.+?)】[\s\S]*?\[场景描述\][:：]?\s*(.+?)(?=\n\[|【|$)/g;
  let match;
  let index = 0;

  while ((match = scenePattern.exec(script)) !== null) {
    const description = match[2].trim();
    if (description) {
      scenes.push({
        index: index++,
        title: match[1],
        description
      });
    }
  }

  console.log(`[Ollama] 从脚本中提取了${scenes.length}个场景`);

  return scenes;
}
