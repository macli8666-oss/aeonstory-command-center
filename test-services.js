#!/usr/bin/env node
/**
 * 测试所有AI服务是否可用
 */

console.log('🔍 开始诊断所有服务...\n');

// 1. 测试Ollama
async function testOllama() {
  console.log('1️⃣ 测试Ollama (脚本生成)...');
  try {
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:14b',
        messages: [
          { role: 'system', content: '你是历史专家' },
          { role: 'user', content: '用20字概括秦始皇' }
        ],
        max_tokens: 50
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Ollama正常，返回:', data.choices[0].message.content.substring(0, 50));
    } else {
      console.log('   ❌ Ollama响应错误:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Ollama连接失败:', error.message);
  }
}

// 2. 测试ComfyUI
async function testComfyUI() {
  console.log('\n2️⃣ 测试ComfyUI...');
  try {
    const response = await fetch('http://localhost:8188/system_stats');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ ComfyUI正常，版本:', data.system.comfyui_version);

      // 检查可用节点
      const nodesRes = await fetch('http://localhost:8188/object_info');
      const nodes = await nodesRes.json();
      const hasCheckpoint = 'CheckpointLoaderSimple' in nodes;
      const hasKSampler = 'KSampler' in nodes;
      const hasFlux = Object.keys(nodes).some(k => k.toLowerCase().includes('flux'));

      console.log('   节点检查:');
      console.log('     - CheckpointLoaderSimple:', hasCheckpoint ? '✅' : '❌');
      console.log('     - KSampler:', hasKSampler ? '✅' : '❌');
      console.log('     - FLUX相关:', hasFlux ? '✅' : '❌');
    } else {
      console.log('   ❌ ComfyUI响应错误:', response.status);
    }
  } catch (error) {
    console.log('   ❌ ComfyUI连接失败:', error.message);
  }
}

// 3. 测试TTS (macOS say)
async function testTTS() {
  console.log('\n3️⃣ 测试TTS (macOS say)...');
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    await execAsync('which say');
    console.log('   ✅ macOS say命令可用');
  } catch (error) {
    console.log('   ❌ macOS say不可用');
  }
}

// 4. 测试FFmpeg
async function testFFmpeg() {
  console.log('\n4️⃣ 测试FFmpeg...');
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync('ffmpeg -version');
    const version = stdout.split('\n')[0];
    console.log('   ✅ FFmpeg可用:', version);
  } catch (error) {
    console.log('   ❌ FFmpeg不可用');
  }
}

// 5. 测试Redis
async function testRedis() {
  console.log('\n5️⃣ 测试Redis (BullMQ依赖)...');
  const { default: Redis } = await import('ioredis');

  try {
    const redis = new Redis({ host: 'localhost', port: 6379 });
    await redis.ping();
    console.log('   ✅ Redis正常连接');
    await redis.quit();
  } catch (error) {
    console.log('   ❌ Redis连接失败:', error.message);
  }
}

// 6. 测试PostgreSQL
async function testPostgreSQL() {
  console.log('\n6️⃣ 测试PostgreSQL...');
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    await execAsync('docker exec aeonstory-postgres pg_isready -U aeonstory');
    console.log('   ✅ PostgreSQL正常运行');
  } catch (error) {
    console.log('   ❌ PostgreSQL连接失败');
  }
}

// 执行所有测试
async function runAll() {
  await testOllama();
  await testComfyUI();
  await testTTS();
  await testFFmpeg();
  await testRedis();
  await testPostgreSQL();

  console.log('\n' + '='.repeat(50));
  console.log('✅ 诊断完成！');
  console.log('='.repeat(50));
}

runAll().catch(console.error);
