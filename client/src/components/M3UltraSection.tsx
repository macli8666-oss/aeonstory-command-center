/*
 * Design: Dark Cinematic Narrative
 * Section: M3 Ultra 96GB 硬件能力评估与全自动化运营方案
 * Color: Gold (#E8C547) for highlights, green for "capable", amber for "limited"
 */

import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import {
  Cpu, MemoryStick, Gauge, CheckCircle2, AlertTriangle,
  Clock, Zap, Server, Brain, Image, Film, AudioLines, Shield,
  ArrowDown, ArrowRight
} from "lucide-react";
import { useState } from "react";

interface Props { onVisible: () => void; }

const modelBenchmarks = [
  {
    task: "脚本生成",
    model: "Qwen3-30B-A3B (8-bit MLX)",
    memory: "~20GB",
    speed: "34.6 tok/s",
    quality: "优秀",
    qualityColor: "text-green-400",
    icon: Brain,
  },
  {
    task: "多语言翻译",
    model: "同上模型复用",
    memory: "0（复用）",
    speed: "34.6 tok/s",
    quality: "良好",
    qualityColor: "text-green-400",
    icon: Brain,
  },
  {
    task: "语音合成",
    model: "Qwen3-TTS 1.7B (MLX-Audio)",
    memory: "~4GB",
    speed: "接近实时",
    quality: "良好",
    qualityColor: "text-green-400",
    icon: AudioLines,
  },
  {
    task: "图像生成",
    model: "FLUX.1-dev (4-bit ComfyUI)",
    memory: "~15GB",
    speed: "30-45秒/张",
    quality: "优秀",
    qualityColor: "text-green-400",
    icon: Image,
  },
  {
    task: "视频生成",
    model: "LTX-Video 2B (MLX原生)",
    memory: "~8GB",
    speed: "3-5分钟/段",
    quality: "中等",
    qualityColor: "text-amber-400",
    icon: Film,
  },
  {
    task: "内容审核",
    model: "Llama Guard 3-1B",
    memory: "~2GB",
    speed: "<1秒/条",
    quality: "良好",
    qualityColor: "text-green-400",
    icon: Shield,
  },
];

const memoryAllocation = [
  { name: "macOS + 日常任务", resident: 15, onDemand: 0, color: "bg-slate-500" },
  { name: "n8n + Docker", resident: 2, onDemand: 0, color: "bg-blue-500" },
  { name: "Ollama 服务", resident: 1, onDemand: 0, color: "bg-purple-500" },
  { name: "LLM (Qwen3-30B)", resident: 0, onDemand: 20, color: "bg-gold" },
  { name: "图像 (FLUX.1-dev)", resident: 0, onDemand: 15, color: "bg-emerald-500" },
  { name: "视频 (LTX-Video)", resident: 0, onDemand: 8, color: "bg-cyan-500" },
  { name: "TTS (Qwen3-TTS)", resident: 0, onDemand: 4, color: "bg-pink-500" },
  { name: "审核 (Llama Guard)", resident: 0, onDemand: 2, color: "bg-orange-500" },
];

const dailySchedule = [
  { time: "02:00", task: "从选题队列取出当日3-5个选题", executor: "n8n Cron", duration: "即时", phase: "prepare" },
  { time: "02:01", task: "加载Qwen3-30B，生成中文脚本", executor: "Ollama", duration: "~15分/条", phase: "text" },
  { time: "03:00", task: "翻译为英/日/韩/西等语言", executor: "Ollama", duration: "~10分/条", phase: "text" },
  { time: "04:30", task: "卸载LLM → 加载FLUX.1，生成关键帧", executor: "ComfyUI", duration: "~2分/张", phase: "visual" },
  { time: "06:00", task: "卸载FLUX → 加载LTX-Video，图生视频", executor: "MLX-Video", duration: "~5分/段", phase: "visual" },
  { time: "08:00", task: "卸载视频模型 → 加载TTS，多语言配音", executor: "MLX-Audio", duration: "~3分/条", phase: "audio" },
  { time: "09:00", task: "FFmpeg合成：视频+配音+字幕", executor: "FFmpeg", duration: "~2分/条", phase: "post" },
  { time: "09:30", task: "FFmpeg裁剪：横屏→竖屏", executor: "FFmpeg", duration: "~1分/条", phase: "post" },
  { time: "09:45", task: "Llama Guard 内容安全审核", executor: "Ollama", duration: "<1分/条", phase: "review" },
  { time: "11:00", task: "YouTube长视频发布（北美早间）", executor: "YouTube API", duration: "即时", phase: "publish" },
  { time: "12:00", task: "TikTok/Reels 竖屏短视频发布", executor: "TikTok/IG API", duration: "即时", phase: "publish" },
  { time: "19:00", task: "YouTube Shorts 发布（北美晚间）", executor: "YouTube API", duration: "即时", phase: "publish" },
  { time: "20:00", task: "Facebook / X 发布", executor: "FB/X API", duration: "即时", phase: "publish" },
];

const phaseColors: Record<string, string> = {
  prepare: "border-l-slate-400",
  text: "border-l-gold",
  visual: "border-l-emerald-400",
  audio: "border-l-pink-400",
  post: "border-l-cyan-400",
  review: "border-l-orange-400",
  publish: "border-l-ice-blue",
};

const phaseBgColors: Record<string, string> = {
  prepare: "bg-slate-400",
  text: "bg-gold",
  visual: "bg-emerald-400",
  audio: "bg-pink-400",
  post: "bg-cyan-400",
  review: "bg-orange-400",
  publish: "bg-ice-blue",
};

const phaseLabels: Record<string, string> = {
  prepare: "准备",
  text: "文本",
  visual: "视觉",
  audio: "音频",
  post: "后处理",
  review: "审核",
  publish: "发布",
};

export default function M3UltraSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);
  const [showSchedule, setShowSchedule] = useState(false);

  const totalResident = memoryAllocation.reduce((s, m) => s + m.resident, 0);
  const maxOnDemand = Math.max(...memoryAllocation.map(m => m.onDemand));

  return (
    <section ref={ref} id="m3-ultra" className="py-24 sm:py-32 relative">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Hardware Feasibility
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            M3 Ultra 96GB <span className="text-gradient-gold">能力评估</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            基于 Apple M3 Ultra（28核CPU / 60核GPU / 96GB统一内存）的实测数据，
            评估完全自动化视频生产和发布的可行性。
          </p>
        </motion.div>

        {/* Verdict card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-[var(--font-display)] text-green-400 mb-2">
                  结论：具备完全自动化运营能力
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  M3 Ultra 96GB 可以实现每天自动生产 3-5 条完整视频并自动发布到 7 个平台，
                  在您不干预的情况下持续运营。关键策略是采用<strong className="text-gold">「串行流水线」</strong>架构——
                  同一时间只加载 1-2 个大模型，任务完成后释放内存再加载下一个。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Cpu, label: "日产量", value: "3-5 条/天", sub: "含横屏+竖屏两版" },
                { icon: Gauge, label: "生产耗时", value: "~8 小时", sub: "凌晨自动完成" },
                { icon: MemoryStick, label: "内存利用", value: "78/96 GB", sub: "预留18GB给日常任务" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="p-4 rounded-xl bg-card/30 border border-border/20 text-center"
                >
                  <stat.icon className="text-gold mx-auto mb-2" size={20} />
                  <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-lg font-bold font-mono text-gold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Model benchmarks table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gold" />
            各环节模型实测性能
            <span className="text-xs text-muted-foreground font-normal">数据来源：Reddit r/LocalLLaMA 社区实测</span>
          </h3>

          <div className="rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-6 gap-2 p-3 bg-card/40 border-b border-border/20">
              {["任务环节", "推荐模型", "内存占用", "实测速度", "质量评级"].map((h, i) => (
                <div key={h} className={`text-xs font-semibold text-muted-foreground ${i === 0 ? "col-span-1" : i === 1 ? "col-span-2" : ""}`}>
                  {h}
                </div>
              ))}
            </div>

            {modelBenchmarks.map((row, i) => (
              <motion.div
                key={row.task}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 sm:p-3 ${
                  i < modelBenchmarks.length - 1 ? "border-b border-border/10" : ""
                } hover:bg-card/20 transition-colors`}
              >
                <div className="flex items-center gap-2 col-span-1">
                  <row.icon className="text-gold shrink-0" size={14} />
                  <span className="text-sm font-medium text-foreground">{row.task}</span>
                </div>
                <div className="text-sm text-muted-foreground font-mono col-span-2 hidden sm:block">{row.model}</div>
                <div className="text-sm text-ice-blue font-mono">{row.memory}</div>
                <div className="text-sm text-foreground/80 font-mono">{row.speed}</div>
                <div className={`text-sm font-semibold ${row.qualityColor}`}>{row.quality}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Memory allocation visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-ice-blue" />
            96GB 内存分配策略
            <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">串行调度</span>
          </h3>

          <div className="rounded-xl border border-border/40 bg-card/20 p-6">
            {/* Memory bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>0 GB</span>
                <span className="text-gold font-semibold">常驻 {totalResident}GB + 按需最大 {maxOnDemand}GB = {totalResident + maxOnDemand}GB / 96GB</span>
                <span>96 GB</span>
              </div>
              <div className="h-8 rounded-lg bg-card/50 border border-border/30 overflow-hidden flex">
                {memoryAllocation.filter(m => m.resident > 0).map((m) => (
                  <div
                    key={m.name}
                    className={`${m.color} opacity-80 h-full relative group`}
                    style={{ width: `${(m.resident / 96) * 100}%` }}
                    title={`${m.name}: ${m.resident}GB (常驻)`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {m.resident}GB
                    </div>
                  </div>
                ))}
                <div
                  className="bg-gold/40 h-full border-l-2 border-dashed border-gold relative group"
                  style={{ width: `${(maxOnDemand / 96) * 100}%` }}
                  title={`按需加载区域: 最大${maxOnDemand}GB`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gold font-mono">
                    按需 ≤{maxOnDemand}GB
                  </div>
                </div>
                <div className="bg-transparent h-full flex-1 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-green-400/60 font-mono">
                    空闲
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {memoryAllocation.map((m) => (
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-sm ${m.color} ${m.onDemand > 0 ? "opacity-50" : "opacity-80"}`} />
                  <span className="text-muted-foreground">
                    {m.name}
                    <span className="text-foreground/60 ml-1">
                      {m.resident > 0 ? `${m.resident}GB 常驻` : `${m.onDemand}GB 按需`}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Daily schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-4 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gold" />
            每日全自动运营时间表
            <span className="text-xs text-muted-foreground font-normal">凌晨生产 → 白天发布，无需人工干预</span>
          </h3>

          {/* Phase legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(phaseLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <div className={`w-2.5 h-2.5 rounded-sm ${phaseBgColors[key]}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full mb-4 p-3 rounded-xl border border-border/30 bg-card/10 hover:bg-card/20 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            {showSchedule ? "收起时间表" : "展开完整时间表（13个步骤）"}
            <ArrowDown className={`transition-transform duration-300 ${showSchedule ? "rotate-180" : ""}`} size={14} />
          </button>

          {showSchedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1"
            >
              {dailySchedule.map((item, i) => (
                <motion.div
                  key={item.time + item.task}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex gap-3 items-center p-3 rounded-lg border-l-3 ${phaseColors[item.phase]} bg-card/10 hover:bg-card/20 transition-colors`}
                >
                  <div className="w-14 shrink-0">
                    <span className="text-sm font-mono text-gold font-semibold">{item.time}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-foreground">{item.task}</span>
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground font-mono w-24 text-right">
                    {item.executor}
                  </div>
                  <div className="text-xs text-ice-blue font-mono w-20 text-right">
                    {item.duration}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Summary */}
          <div className="mt-4 p-4 rounded-xl border border-gold/20 bg-gold/5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Clock className="text-gold shrink-0" size={20} />
            <p className="text-sm text-muted-foreground">
              整个流水线从凌晨 2:00 开始，到上午 10:00 完成所有生产，之后按各平台最佳时间分批发布。
              <strong className="text-gold"> 您醒来时，当天的内容已经全部准备好了。</strong>
            </p>
          </div>
        </motion.div>

        {/* Limitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-amber-400" />
            诚实的限制说明
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="text-green-400" size={18} />
                <h4 className="font-semibold text-green-400">能做到的</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><Zap className="text-green-400 shrink-0 mt-0.5" size={12} />每天自动生产3-5条完整视频（含脚本、配音、画面、字幕）</li>
                <li className="flex gap-2"><Zap className="text-green-400 shrink-0 mt-0.5" size={12} />自动裁剪为横屏和竖屏两个版本</li>
                <li className="flex gap-2"><Zap className="text-green-400 shrink-0 mt-0.5" size={12} />自动发布到YouTube、TikTok、Instagram等7个平台</li>
                <li className="flex gap-2"><Zap className="text-green-400 shrink-0 mt-0.5" size={12} />自动过滤敏感内容，三层安全审核</li>
                <li className="flex gap-2"><Zap className="text-green-400 shrink-0 mt-0.5" size={12} />Web后台远程查看和管理</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-amber-400/20 bg-amber-400/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-400" size={18} />
                <h4 className="font-semibold text-amber-400">有限制的</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><ArrowRight className="text-amber-400 shrink-0 mt-0.5" size={12} />视频画面质量不如云端顶级服务（够用但非顶级）</li>
                <li className="flex gap-2"><ArrowRight className="text-amber-400 shrink-0 mt-0.5" size={12} />英文TTS可能带中文口音（建议混用FishAudio/Kokoro）</li>
                <li className="flex gap-2"><ArrowRight className="text-amber-400 shrink-0 mt-0.5" size={12} />不能同时运行所有模型，需串行调度</li>
                <li className="flex gap-2"><ArrowRight className="text-amber-400 shrink-0 mt-0.5" size={12} />旗舰精品视频建议选择性调用云端API（~$100-200/月）</li>
                <li className="flex gap-2"><ArrowRight className="text-amber-400 shrink-0 mt-0.5" size={12} />日产量上限约5条（受视频生成速度限制）</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
