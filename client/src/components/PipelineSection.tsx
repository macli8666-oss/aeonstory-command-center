import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { BookOpen, PenTool, Mic, Palette, Video, Scissors, Tag, DollarSign, Cloud, HardDrive, ArrowRight } from "lucide-react";
import { useState } from "react";

const PIPELINE_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/pipeline-bg-8s4vmcBaWPiEanrCiXUxqM.webp";
const PIPELINE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/content_pipeline_936a2017.png";

interface Props { onVisible: () => void; }

const steps = [
  {
    icon: BookOpen,
    title: "选题与资料收集",
    desc: "从维基百科、大英百科全书API中抓取历史事件数据，建立300+条目选题库。",
    cloudTool: "Wikipedia / Wikidata API",
    localTool: "Wikipedia / Wikidata API（相同）",
    cloudCost: "$0",
    localCost: "$0",
  },
  {
    icon: PenTool,
    title: "AI脚本生成",
    desc: "将史料转化为具有故事性、适合视频表现的脚本，1000-3000字。",
    cloudTool: "GPT-4o API",
    localTool: "Ollama + Qwen2.5-72B",
    cloudCost: "$500-1,000/月",
    localCost: "$0",
  },
  {
    icon: Mic,
    title: "多语言翻译与配音",
    desc: "翻译成10+种语言，生成自然、带有情感的人声配音。",
    cloudTool: "ElevenLabs / Rask.ai",
    localTool: "Qwen3-TTS (MLX) + FishAudio S1-mini",
    cloudCost: "$300-800/月",
    localCost: "$0",
  },
  {
    icon: Palette,
    title: "视觉素材生成",
    desc: "根据脚本场景描述自动生成Prompt，生成高质量历史原画。",
    cloudTool: "Midjourney API",
    localTool: "ComfyUI + FLUX.1-dev",
    cloudCost: "$120-600/月",
    localCost: "$0",
  },
  {
    icon: Video,
    title: "图像转动画",
    desc: "将静态图像转化为5-15秒的动态视频片段。",
    cloudTool: "HeyGen / Kling API",
    localTool: "LTX-Video (MLX) + Wan2.2",
    cloudCost: "$500-2,000/月",
    localCost: "$0",
  },
  {
    icon: Scissors,
    title: "自动化剪辑合成",
    desc: "配音、视频、字幕和背景音乐自动对齐合成，输出横屏/竖屏两版。",
    cloudTool: "M Studio + FFmpeg",
    localTool: "M Studio + FFmpeg + Whisper.cpp",
    cloudCost: "$0",
    localCost: "$0",
  },
  {
    icon: Tag,
    title: "元数据生成",
    desc: "自动生成各平台所需的多语言标题、描述和标签。",
    cloudTool: "GPT-4o API",
    localTool: "Ollama + Qwen2.5-72B",
    cloudCost: "含脚本费用",
    localCost: "$0",
  },
];

const costComparison = [
  { category: "文本生成", cloud: "$500-1,000", local: "$0" },
  { category: "语音合成", cloud: "$300-800", local: "$0" },
  { category: "图像生成", cloud: "$120-600", local: "$0" },
  { category: "视频生成", cloud: "$500-2,000", local: "$0" },
  { category: "编排与剪辑", cloud: "$0-200", local: "$0" },
  { category: "多平台分发", cloud: "$0-300", local: "$0-300" },
  { category: "网站基础设施", cloud: "$200-1,000", local: "$200-800" },
];

export default function PipelineSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);
  const [mode, setMode] = useState<"cloud" | "local">("local");

  return (
    <section ref={ref} id="pipeline" className="py-24 sm:py-32 relative section-bg-overlay">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${PIPELINE_BG})` }}
      />
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            AI Production Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            AI 内容生产流水线
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            构建一条高度自动化的AI视频生产流水线，目标实现每月1000+条视频的产出能力。
            支持云端API和Mac Studio本地模型两种部署方案。
          </p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-1">
            <button
              onClick={() => setMode("cloud")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === "cloud"
                  ? "bg-ice-blue/20 text-ice-blue border border-ice-blue/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cloud size={16} />
              云端API方案
            </button>
            <button
              onClick={() => setMode("local")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === "local"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HardDrive size={16} />
              Mac Studio 本地方案
            </button>
          </div>
        </motion.div>

        {/* Pipeline diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="rounded-2xl overflow-hidden border border-gold/20 glow-gold">
            <div className="bg-card/50 backdrop-blur-sm p-2 sm:p-4">
              <img
                src={PIPELINE_IMG}
                alt="内容生产流程图"
                className="w-full rounded-lg bg-white"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>

        {/* Steps with dual mode */}
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-8 flex items-center gap-3">
            <div className={`w-1 h-6 rounded-full ${mode === "local" ? "bg-gold" : "bg-ice-blue"}`} />
            七步全自动化流程
            <span className={`text-xs px-2 py-1 rounded-full ${
              mode === "local" ? "bg-gold/10 text-gold" : "bg-ice-blue/10 text-ice-blue"
            }`}>
              {mode === "local" ? "本地模型" : "云端API"}
            </span>
          </h3>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="flex gap-4 items-start group p-4 rounded-xl border border-border/20 bg-card/10 hover:bg-card/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center shrink-0
                  group-hover:border-gold/50 transition-colors duration-300">
                  <step.icon className={mode === "local" ? "text-gold" : "text-ice-blue"} size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <span className="text-xs text-gold/60 font-mono">Step {i + 1}</span>
                    <h4 className="font-semibold font-[var(--font-display)] text-foreground">{step.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      mode === "local"
                        ? (step.localCost === "$0" ? "bg-green-500/10 text-green-400" : "bg-gold/10 text-gold")
                        : (step.cloudCost === "$0" ? "bg-green-500/10 text-green-400" : "bg-ice-blue/10 text-ice-blue")
                    }`}>
                      {mode === "local" ? step.localCost : step.cloudCost}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-1">{step.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${mode === "local" ? "text-gold/70" : "text-ice-blue/70"}`}>
                      {mode === "local" ? `🖥️ ${step.localTool}` : `☁️ ${step.cloudTool}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cost comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3 justify-center">
            <DollarSign className="text-gold" size={20} />
            月度成本对比（1000条视频/月）
          </h3>

          <div className="rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 p-3 bg-card/30 border-b border-border/20">
              <div className="text-xs font-semibold text-muted-foreground">环节</div>
              <div className="text-xs font-semibold text-ice-blue text-center flex items-center justify-center gap-1">
                <Cloud size={12} /> 云端API
              </div>
              <div className="text-xs font-semibold text-gold text-center flex items-center justify-center gap-1">
                <HardDrive size={12} /> Mac Studio
              </div>
            </div>
            {/* Rows */}
            {costComparison.map((row, i) => (
              <div key={row.category} className={`grid grid-cols-3 p-3 ${i < costComparison.length - 1 ? "border-b border-border/10" : ""}`}>
                <div className="text-sm text-foreground/80">{row.category}</div>
                <div className="text-sm text-ice-blue font-mono text-center">{row.cloud}</div>
                <div className={`text-sm font-mono text-center ${row.local === "$0" ? "text-green-400" : "text-gold"}`}>{row.local}</div>
              </div>
            ))}
            {/* Total */}
            <div className="grid grid-cols-3 p-4 bg-card/30 border-t border-border/30">
              <div className="text-sm font-bold text-foreground">月度总计</div>
              <div className="text-sm font-bold text-ice-blue font-mono text-center">$1,620-5,950</div>
              <div className="text-sm font-bold text-gold font-mono text-center">$200-1,100</div>
            </div>
          </div>

          {/* Savings highlight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-4 rounded-xl border border-gold/30 bg-gold/5 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-sm text-ice-blue font-mono">$1,620-5,950</span>
              <ArrowRight className="text-gold" size={16} />
              <span className="text-sm text-gold font-mono font-bold">$200-1,100</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mac Studio 本地方案可节省 <span className="text-gold font-semibold">70-85%</span> 月度成本。
              硬件一次性投入约 $8,000-11,000，可在 <span className="text-gold font-semibold">2-3个月</span> 内通过节省的API费用收回。
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
