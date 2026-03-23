/**
 * ComfyUI 图像生成服务封装
 * 使用FLUX.1-dev模型生成场景图和缩略图
 */

const COMFYUI_BASE_URL = 'http://localhost:8188';

interface ComfyUIWorkflow {
  [key: string]: any;
}

interface GenerateImageResult {
  imageUrl: string;
  filename: string;
}

/**
 * 生成场景图
 */
export async function generateSceneImages(scenes: Array<{
  index: number;
  title: string;
  description: string;
}>): Promise<GenerateImageResult[]> {
  const results: GenerateImageResult[] = [];

  console.log(`[ComfyUI] 开始生成${scenes.length}个场景图（使用FLUX Schnell）`);

  for (const scene of scenes) {
    try {
      console.log(`[ComfyUI] 生成场景 ${scene.index + 1}/${scenes.length}: ${scene.title}`);

      const prompt = `historical documentary scene, ${scene.description}, cinematic lighting, detailed, high quality, professional photography`;

      const workflow = buildFluxSchnellWorkflow(prompt, scene.index);

      const result = await queuePrompt(workflow);
      results.push(result);

      console.log(`[ComfyUI] ✅ 场景 ${scene.index} 生成完成: ${result.filename}`);
    } catch (error: any) {
      console.error(`[ComfyUI] ❌ 场景 ${scene.index} 生成失败:`, error.message);
      // 失败时使用占位符，但不阻塞流程
      results.push({
        imageUrl: `https://via.placeholder.com/1920x1080?text=Scene+${scene.index}+Failed`,
        filename: `scene_${scene.index}_failed.png`
      });
    }
  }

  console.log(`[ComfyUI] 完成，成功${results.filter(r => !r.imageUrl.includes('placeholder')).length}/${scenes.length}个`);
  return results;
}

/**
 * 生成缩略图
 */
export async function generateThumbnail(params: {
  title: string;
  civilization: string;
  mainScene?: string;
}): Promise<GenerateImageResult> {
  try {
    console.log(`[ComfyUI] 生成缩略图: ${params.title}`);

    const prompt = `youtube thumbnail, ${params.civilization} civilization, ${params.mainScene || params.title}, dramatic, eye-catching, bold colors, cinematic, professional, 16:9 aspect ratio`;

    // 缩略图用特殊的workflow（16:9比例）
    const workflow = buildFluxSchnellWorkflow(prompt, 'thumbnail');
    // 修改尺寸为16:9
    workflow["3"].inputs.width = 1344;
    workflow["3"].inputs.height = 768;

    const result = await queuePrompt(workflow);

    console.log(`[ComfyUI] ✅ 缩略图生成完成: ${result.filename}`);
    return result;
  } catch (error: any) {
    console.error('[ComfyUI] ❌ 缩略图生成失败:', error.message);
    return {
      imageUrl: `https://via.placeholder.com/1344x768?text=${encodeURIComponent(params.title.substring(0, 30))}`,
      filename: 'thumbnail_failed.jpg'
    };
  }
}

/**
 * 构建FLUX Schnell工作流（真实可用版本）
 * 使用实际可用的flux1-schnell-fp8.safetensors模型
 */
function buildFluxSchnellWorkflow(prompt: string, identifier: string | number): ComfyUIWorkflow {
  const seed = Math.floor(Math.random() * 1000000000);

  return {
    // 1. 加载FLUX Schnell checkpoint
    "1": {
      "inputs": {
        "ckpt_name": "flux1-schnell-fp8.safetensors"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    // 2. 编码正面提示词（使用FLUX专用编码器）
    "2": {
      "inputs": {
        "text": prompt,
        "guidance": 3.5,
        "clip": ["1", 1]
      },
      "class_type": "CLIPTextEncodeFlux"
    },
    // 3. 创建空白latent（1024x1024标准尺寸）
    "3": {
      "inputs": {
        "width": 1024,
        "height": 1024,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    // 4. KSampler采样
    "4": {
      "inputs": {
        "seed": seed,
        "steps": 4,  // FLUX Schnell只需4步
        "cfg": 1.0,  // FLUX Schnell用低CFG
        "sampler_name": "euler",
        "scheduler": "simple",
        "denoise": 1.0,
        "model": ["1", 0],
        "positive": ["2", 0],
        "negative": ["2", 0],  // FLUX不需要负面提示词，用相同的
        "latent_image": ["3", 0]
      },
      "class_type": "KSampler"
    },
    // 5. VAE解码
    "5": {
      "inputs": {
        "samples": ["4", 0],
        "vae": ["1", 2]
      },
      "class_type": "VAEDecode"
    },
    // 6. 保存图片
    "6": {
      "inputs": {
        "filename_prefix": `aeonstory_scene_${identifier}`,
        "images": ["5", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

/**
 * 向ComfyUI提交任务
 */
async function queuePrompt(workflow: ComfyUIWorkflow): Promise<GenerateImageResult> {
  const response = await fetch(`${COMFYUI_BASE_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow })
  });

  if (!response.ok) {
    throw new Error(`ComfyUI API错误: ${response.statusText}`);
  }

  const data = await response.json();
  const promptId = data.prompt_id;

  // 等待任务完成（简化版，实际应该轮询状态）
  await waitForCompletion(promptId);

  // 获取生成的图片
  const historyResponse = await fetch(`${COMFYUI_BASE_URL}/history/${promptId}`);
  const history = await historyResponse.json();

  const outputs = history[promptId].outputs;
  const imageNode = Object.keys(outputs).find(key => outputs[key].images);

  if (!imageNode || !outputs[imageNode].images?.[0]) {
    throw new Error('未找到生成的图片');
  }

  const image = outputs[imageNode].images[0];
  const filename = image.filename;
  const imageUrl = `${COMFYUI_BASE_URL}/view?filename=${filename}&subfolder=${image.subfolder || ''}&type=${image.type || 'output'}`;

  return { imageUrl, filename };
}

/**
 * 等待ComfyUI任务完成
 */
async function waitForCompletion(promptId: string, maxWait = 60000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    try {
      const response = await fetch(`${COMFYUI_BASE_URL}/history/${promptId}`);
      const history = await response.json();

      if (history[promptId] && history[promptId].status?.completed) {
        return;
      }

      // 每2秒检查一次
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('[ComfyUI] 状态检查失败:', error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error('ComfyUI任务超时');
}

/**
 * 检查ComfyUI是否可用
 */
export async function checkComfyUIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${COMFYUI_BASE_URL}/system_stats`, {
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}
