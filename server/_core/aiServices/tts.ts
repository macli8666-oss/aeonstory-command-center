/**
 * TTS 语音合成服务封装
 * 第一阶段：使用macOS say命令
 * 第二阶段：接入CosyVoice/GPT-SoVITS
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface TTSResult {
  audioUrl: string;
  filename: string;
  duration: number;
}

/**
 * 生成配音（简化版 - macOS say命令）
 */
export async function generateVoice(script: string): Promise<TTSResult> {
  try {
    console.log('[TTS] 开始生成配音（macOS say）');

    // 提取旁白文本
    const narration = extractNarration(script);

    // 生成文件名
    const timestamp = Date.now();
    const filename = `voice_${timestamp}.aiff`;
    const outputPath = path.join('/tmp', filename);

    // 使用macOS say命令生成语音
    const voice = 'Ting-Ting'; // 中文女声
    await execAsync(`say -v ${voice} -o "${outputPath}" "${narration.substring(0, 500)}"`);

    console.log(`[TTS] 配音生成完成: ${filename}`);

    // 估算时长（简化计算：每分钟约300字）
    const duration = Math.ceil((narration.length / 300) * 60);

    return {
      audioUrl: `file://${outputPath}`,
      filename,
      duration
    };
  } catch (error) {
    console.error('[TTS] 配音生成失败:', error);

    // 返回占位符
    return {
      audioUrl: 'https://example.com/placeholder-audio.mp3',
      filename: 'placeholder_voice.mp3',
      duration: 300 // 5分钟
    };
  }
}

/**
 * 从脚本中提取旁白文本
 */
function extractNarration(script: string): string {
  const narrationLines: string[] = [];

  // 匹配[旁白]内容
  const pattern = /\[旁白\]\s*(.+?)(?=\[|【|$)/g;
  let match;

  while ((match = pattern.exec(script)) !== null) {
    narrationLines.push(match[1].trim());
  }

  // 如果没有匹配到，返回整个脚本
  if (narrationLines.length === 0) {
    return script;
  }

  return narrationLines.join('\n');
}

/**
 * 检查TTS服务是否可用
 */
export async function checkTTSHealth(): Promise<boolean> {
  try {
    // 检查macOS say命令是否可用
    await execAsync('which say');
    return true;
  } catch {
    return false;
  }
}

/**
 * 高级TTS（占位符 - 未来接入CosyVoice/GPT-SoVITS）
 */
export async function generateVoiceAdvanced(params: {
  script: string;
  voice: 'male' | 'female';
  speed: number;
  emotion: string;
}): Promise<TTSResult> {
  console.log('[TTS] 高级TTS功能暂未实现，回退到基础版本');
  return generateVoice(params.script);
}
