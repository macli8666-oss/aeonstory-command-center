/**
 * 视频生成服务封装
 * 使用FFmpeg将场景图和音频合成为视频
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface VideoResult {
  videoUrl: string;
  filename: string;
  duration: number;
  resolution: string;
}

const OUTPUT_DIR = '/tmp/aeonstory-videos';

// 确保输出目录存在
async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * 下载图片到本地（如果是HTTP URL）
 */
async function downloadImage(imageUrl: string, outputPath: string): Promise<void> {
  if (imageUrl.startsWith('http')) {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    await writeFile(outputPath, Buffer.from(buffer));
  } else if (imageUrl.startsWith('file://')) {
    // 本地文件，复制过去
    const localPath = imageUrl.replace('file://', '');
    await execAsync(`cp "${localPath}" "${outputPath}"`);
  } else {
    // 假设是本地路径
    await execAsync(`cp "${imageUrl}" "${outputPath}"`);
  }
}

/**
 * 合成视频（使用FFmpeg）
 */
export async function synthesizeVideo(params: {
  scenes: Array<{ imageUrl: string; duration: number }>;
  audioUrl: string;
  transitions: string;
}): Promise<VideoResult> {
  // 检查是否都是失败/占位符图片
  const failedCount = params.scenes.filter(s =>
    s.imageUrl.includes('placeholder') ||
    s.imageUrl.includes('via.placeholder') ||
    s.imageUrl.includes('Failed')
  ).length;

  if (failedCount === params.scenes.length) {
    console.log(`[VideoGen] ⚠️  所有场景图都生成失败，跳过视频合成`);
    const totalDuration = params.scenes.reduce((sum, scene) => sum + scene.duration, 0);
    return {
      videoUrl: 'https://via.placeholder.com/video-skipped.mp4',
      filename: `video_skipped_${Date.now()}.mp4`,
      duration: totalDuration,
      resolution: '1920x1080'
    };
  }

  if (failedCount > 0) {
    console.log(`[VideoGen] ⚠️  ${failedCount}/${params.scenes.length}个场景图失败，仍尝试合成视频`);
  }

  await ensureOutputDir();

  const timestamp = Date.now();
  const filename = `video_${timestamp}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  console.log(`[VideoGen] 开始合成视频，共${params.scenes.length}个场景`);

  try {
    // 1. 下载所有场景图到本地
    const sceneFiles: string[] = [];
    for (let i = 0; i < params.scenes.length; i++) {
      const scene = params.scenes[i];
      const sceneFilename = path.join(OUTPUT_DIR, `scene_${timestamp}_${i}.jpg`);

      console.log(`[VideoGen] 下载场景 ${i + 1}/${params.scenes.length}`);
      await downloadImage(scene.imageUrl, sceneFilename);
      sceneFiles.push(sceneFilename);
    }

    // 2. 准备音频文件
    let audioPath = params.audioUrl;
    if (params.audioUrl.startsWith('http')) {
      audioPath = path.join(OUTPUT_DIR, `audio_${timestamp}.aiff`);
      const response = await fetch(params.audioUrl);
      const buffer = await response.arrayBuffer();
      await writeFile(audioPath, Buffer.from(buffer));
    } else if (params.audioUrl.startsWith('file://')) {
      audioPath = params.audioUrl.replace('file://', '');
    }

    // 3. 创建FFmpeg输入文件列表
    const listFilePath = path.join(OUTPUT_DIR, `list_${timestamp}.txt`);
    const listContent = sceneFiles.map((file, i) => {
      const duration = params.scenes[i].duration;
      return `file '${file}'\nduration ${duration}`;
    }).join('\n');

    // FFmpeg要求最后一个文件再重复一次（不带duration）
    listContent += `\nfile '${sceneFiles[sceneFiles.length - 1]}'`;

    await writeFile(listFilePath, listContent);

    console.log('[VideoGen] 执行FFmpeg合成...');

    // 4. 使用FFmpeg合成视频
    // -f concat: 拼接多个输入
    // -i list.txt: 图片序列
    // -i audio: 音频文件
    // -c:v libx264: H.264视频编码
    // -pix_fmt yuv420p: 兼容性最好的像素格式
    // -vf scale=1920:1080: 统一分辨率
    // -c:a aac: AAC音频编码
    // -shortest: 以最短的流为准（防止视频过长）
    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${listFilePath}" -i "${audioPath}" \
      -c:v libx264 -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
      -c:a aac -b:a 192k -shortest -y "${outputPath}"`;

    const { stdout, stderr } = await execAsync(ffmpegCmd, {
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    console.log('[VideoGen] FFmpeg执行完成');

    // 5. 计算总时长
    const totalDuration = params.scenes.reduce((sum, scene) => sum + scene.duration, 0);

    // 6. 清理临时文件（可选）
    try {
      await execAsync(`rm "${listFilePath}"`);
      // 保留场景图和音频，可能后续需要
    } catch (e) {
      console.warn('[VideoGen] 清理临时文件失败:', e);
    }

    console.log(`[VideoGen] 视频合成成功: ${outputPath}`);

    return {
      videoUrl: `file://${outputPath}`,
      filename,
      duration: totalDuration,
      resolution: '1920x1080'
    };
  } catch (error) {
    console.error('[VideoGen] 视频合成失败:', error);

    // 失败时返回占位符
    return {
      videoUrl: 'https://example.com/failed-video.mp4',
      filename: `failed_${timestamp}.mp4`,
      duration: 0,
      resolution: '1920x1080'
    };
  }
}

/**
 * 生成视频片段（使用LTX-Video - 占位符）
 */
export async function generateVideoClip(params: {
  prompt: string;
  duration: number;
  fps: number;
}): Promise<VideoResult> {
  console.log('[VideoGen] LTX-Video视频生成暂未实现');

  return {
    videoUrl: 'https://example.com/clip.mp4',
    filename: `clip_${Date.now()}.mp4`,
    duration: params.duration,
    resolution: '1024x576'
  };
}

/**
 * 检查视频生成服务是否可用
 */
export async function checkVideoGenHealth(): Promise<boolean> {
  try {
    // 检查FFmpeg是否可用
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}
