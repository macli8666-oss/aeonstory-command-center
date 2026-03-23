/*
 * Design: Dark Cinematic Narrative — AeonStory
 * Section: Production Specification System — 五层配置规范系统
 * Color: Deep navy + Gold + Ice Blue
 * Purpose: 展示如何确保自动化输出的一致性
 */

import { motion, AnimatePresence } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { useState } from "react";
import {
  Shield,
  Layers,
  Palette,
  FileCode,
  CheckCircle2,
  Lock,
  Eye,
  Link2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
  Fingerprint,
  Ruler,
  ClipboardCheck,
} from "lucide-react";

interface Props {
  onVisible: () => void;
}

const LAYERS = [
  {
    id: "L1",
    title: "品牌常量",
    titleEn: "Brand Constants",
    icon: Fingerprint,
    color: "text-gold",
    borderColor: "border-gold/30",
    bgColor: "bg-gold/5",
    desc: "永远不变的品牌元素：名称、标语、Logo位置、社交账号、CTA模板",
    detail: "品牌常量只能由人工修改，n8n工作流只读不写。任何自动生成的内容如果缺少品牌元素，自动标记为「不合格」。",
    example: `"name": "AeonStory"\n"tagline_cn": "用动画讲述每一个文明的故事"\n"logo_position": "bottom-right"\n"cta_youtube_end": "这是AeonStory...订阅我们"`,
  },
  {
    id: "L2",
    title: "视觉风格锁",
    titleEn: "Visual Style Lock",
    icon: Lock,
    color: "text-purple-400",
    borderColor: "border-purple-400/30",
    bgColor: "bg-purple-400/5",
    desc: "统一所有画面的艺术风格：全局风格前缀、色调系统、构图规则",
    detail: "全局风格前缀会被强制注入到每一个图像生成Prompt的开头，确保所有画面看起来像同一个艺术家画的。",
    example: `"global_style_prefix":\n"Digital oil painting style, visible\nbrushstrokes, rich impasto texture,\ncinematic dramatic lighting..."`,
  },
  {
    id: "L3",
    title: "Prompt模板库",
    titleEn: "Prompt Templates",
    icon: FileCode,
    color: "text-ice-blue",
    borderColor: "border-ice-blue/30",
    bgColor: "bg-ice-blue/5",
    desc: "每个生产环节的标准化提示词：脚本、关键帧、竖屏、缩略图、视频、文案",
    detail: "n8n工作流只需填入变量（选题、场景描述、色调）即可，Prompt结构不变。这是保持输出一致性的核心机制。",
    example: `模板: {style_prefix} + {scene_desc}\n       + {color_palette} + {lighting}\n\n变量填充后自动拼接为完整Prompt`,
  },
  {
    id: "L4",
    title: "输出格式规范",
    titleEn: "Output Format Spec",
    icon: Ruler,
    color: "text-green-400",
    borderColor: "border-green-400/30",
    bgColor: "bg-green-400/5",
    desc: "每种交付物的精确尺寸、分辨率、命名规则和文件数量",
    detail: "每集固定产出19个文件：8关键帧 + 3竖屏 + 2缩略图 + 3横版视频 + 1竖版视频 + 1脚本 + 1文案。",
    example: `关键帧: 2752×1536 PNG 16:9\n竖  屏: 1536×2752 PNG 9:16\n缩略图: 2752×1536 PNG + 文字叠加\n视  频: 1920×1080 MP4 H.264 8秒`,
  },
  {
    id: "L5",
    title: "质量检查清单",
    titleEn: "Quality Checklist",
    icon: ClipboardCheck,
    color: "text-red-400",
    borderColor: "border-red-400/30",
    bgColor: "bg-red-400/5",
    desc: "自动检查（8项）+ 人工检查（6项），双层质量把关",
    detail: "自动检查由n8n工作流执行（内容安全、品牌一致性、格式完整性等），人工检查在Web后台审核队列中确认（历史准确性、文化敏感性等）。",
    example: `自动: Llama Guard安全审核\n自动: 品牌元素完整性检查\n自动: 文件数量和分辨率检查\n人工: 历史准确性 + 文化敏感性`,
  },
];

const ANTI_DRIFT = [
  {
    icon: Link2,
    title: "风格参考链",
    titleEn: "Style Reference Chain",
    desc: "每一集的KF1生成时，引用上一集的KF1作为style reference，形成一条「风格参考链」，确保相邻两集风格差异最小化。",
    color: "text-gold",
    bgColor: "bg-gold/5 border-gold/20",
  },
  {
    icon: Eye,
    title: "黄金样本对比",
    titleEn: "Golden Sample Comparison",
    desc: "每生成10集，自动将最新KF1与丝绸之路Sample的KF1进行CLIP相似度计算。低于阈值（0.75）触发告警。",
    color: "text-ice-blue",
    bgColor: "bg-ice-blue/5 border-ice-blue/20",
  },
  {
    icon: AlertTriangle,
    title: "Prompt漂移检测",
    titleEn: "Prompt Drift Detection",
    desc: "自动计算每个Prompt与模板的编辑距离。变量部分超过模板总长度60%时，进入人工审核。",
    color: "text-red-400",
    bgColor: "bg-red-400/5 border-red-400/20",
  },
];

const WORKFLOW_NODES = [
  { step: "1", name: "加载配置", desc: "读取5层配置文件 + 选题队列", color: "bg-gold/20" },
  { step: "2", name: "资料收集", desc: "Wikipedia API + Wikidata SPARQL", color: "bg-card/30" },
  { step: "3", name: "脚本生成", desc: "Qwen3-30B + 脚本Prompt模板", color: "bg-card/30" },
  { step: "4", name: "安全审核", desc: "Llama Guard + 结构检查", color: "bg-red-400/10" },
  { step: "5", name: "Prompt拼接", desc: "风格前缀 + 场景描述 + 色调", color: "bg-purple-400/10" },
  { step: "6", name: "关键帧生成", desc: "FLUX.1-dev · KF1→参考→KF2-8", color: "bg-gold/20" },
  { step: "7", name: "竖屏+缩略图", desc: "3竖屏 + 2缩略图 + 文字叠加", color: "bg-ice-blue/10" },
  { step: "8", name: "视频生成", desc: "Wan2.2 image-to-video × 4段", color: "bg-gold/20" },
  { step: "9", name: "文案生成", desc: "Qwen3-30B · 8平台中英双语", color: "bg-card/30" },
  { step: "10", name: "打包检查", desc: "19文件完整性 + 命名格式", color: "bg-green-400/10" },
  { step: "11", name: "审核队列", desc: "推送到Web后台 · 等待人工确认", color: "bg-red-400/10" },
  { step: "12", name: "定时发布", desc: "按最佳时间排入发布日历", color: "bg-ice-blue/10" },
];

const COLOR_PALETTES = [
  { region: "东亚", colors: ["#C41E3A", "#DAA520", "#2E8B57", "#1A1A2E"], labels: ["朱红", "帝王金", "翠绿", "墨黑"] },
  { region: "中亚", colors: ["#0047AB", "#40E0D0", "#C2B280", "#FFFFF0"], labels: ["钴蓝", "绿松石", "沙金", "象牙白"] },
  { region: "中东", colors: ["#4B0082", "#50C878", "#B87333", "#FFFFF0"], labels: ["深紫", "宝石绿", "铜金", "象牙白"] },
  { region: "地中海", colors: ["#F5F5F5", "#8B0000", "#6B8E23", "#FFD700"], labels: ["大理石白", "深红", "橄榄绿", "金色"] },
  { region: "南亚", colors: ["#FF4500", "#FFD700", "#4B0082", "#FFFFF0"], labels: ["藏红", "姜黄", "靛蓝", "象牙白"] },
  { region: "美洲", colors: ["#00A86B", "#8B0000", "#FFD700", "#40E0D0"], labels: ["翡翠绿", "血红", "金色", "绿松石"] },
];

export default function ProductionSpecSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);
  const [expandedLayer, setExpandedLayer] = useState<string | null>("L2");

  return (
    <section ref={ref} id="production-spec" className="py-24 sm:py-32 relative">
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Production Specification System
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-4">
            生产规范系统
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            五层配置架构确保每一集自动生成的内容保持<span className="text-gold font-medium">统一的品牌调性、视觉风格和输出质量</span>。
            配置文件由n8n工作流自动加载，无论选题如何变化，输出标准不变。
          </p>
        </motion.div>

        {/* Five layers */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="space-y-3">
            {LAYERS.map((layer, i) => {
              const isExpanded = expandedLayer === layer.id;
              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <button
                    onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                    className={`w-full text-left rounded-xl border ${layer.borderColor} ${layer.bgColor} p-4 transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-card/50 border border-border/30 flex items-center justify-center shrink-0`}>
                        <layer.icon className={layer.color} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-mono ${layer.color}`}>{layer.id}</span>
                          <h4 className="font-semibold font-[var(--font-display)] text-foreground">{layer.title}</h4>
                          <span className="text-xs text-muted-foreground hidden sm:inline">({layer.titleEn})</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{layer.desc}</p>
                      </div>
                      <div className={`shrink-0 ${layer.color}`}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`mx-4 mt-0 p-4 rounded-b-xl border-x border-b ${layer.borderColor} bg-card/10`}>
                          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{layer.detail}</p>
                          <div className="rounded-lg bg-black/30 p-3 font-mono text-xs text-foreground/70 whitespace-pre-wrap">
                            {layer.example}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Color palette system */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Palette className="text-purple-400" size={18} />
            <h3 className="text-lg font-semibold font-[var(--font-display)]">文明色调系统</h3>
            <span className="text-xs text-muted-foreground">— 每个文明/地区有预定义的色调方案</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {COLOR_PALETTES.map((p) => (
              <div key={p.region} className="rounded-xl border border-border/20 bg-card/10 p-3 text-center">
                <div className="text-sm font-medium text-foreground mb-2">{p.region}</div>
                <div className="flex justify-center gap-1.5 mb-2">
                  {p.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-md border border-white/10"
                      style={{ backgroundColor: c }}
                      title={p.labels[i]}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {p.labels.join(" · ")}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* n8n workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Cpu className="text-gold" size={18} />
            <h3 className="text-lg font-semibold font-[var(--font-display)]">n8n 自动化工作流节点</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {WORKFLOW_NODES.map((node, i) => (
              <motion.div
                key={node.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-lg border border-border/20 ${node.color} p-3`}
              >
                <div className="text-xs font-mono text-gold/60 mb-1">Node {node.step}</div>
                <div className="text-sm font-medium text-foreground mb-1">{node.name}</div>
                <div className="text-xs text-muted-foreground leading-tight">{node.desc}</div>
                {i < WORKFLOW_NODES.length - 1 && (
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hidden lg:block">
                    <ArrowRight size={10} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Anti-drift mechanisms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Shield className="text-red-400" size={18} />
            <h3 className="text-lg font-semibold font-[var(--font-display)]">防漂移机制</h3>
            <span className="text-xs text-muted-foreground">— 确保长期运行后风格不偏移</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ANTI_DRIFT.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border ${item.bgColor} p-5`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <item.icon className={item.color} size={18} />
                  <div>
                    <h4 className="font-semibold font-[var(--font-display)] text-foreground text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.titleEn}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Config directory */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 rounded-xl border border-border/30 bg-card/10 p-5"
          >
            <h4 className="text-sm font-semibold font-[var(--font-display)] text-foreground mb-3 flex items-center gap-2">
              <FileCode className="text-ice-blue" size={16} />
              配置文件目录结构
            </h4>
            <pre className="text-xs text-foreground/60 font-mono leading-relaxed whitespace-pre-wrap">
{`/aeonstory-config/
├── brand.json                 # L1 品牌常量
├── style_lock.json            # L2 视觉风格锁
├── color_palettes.json        # L2 色调系统
├── format_spec.json           # L4 输出格式规范
├── quality_checklist.json     # L5 质量检查清单
├── prompts/                   # L3 Prompt模板库
│   ├── script_generation.txt
│   ├── keyframe_generation.txt
│   ├── vertical_generation.txt
│   ├── thumbnail_generation.txt
│   ├── video_generation.txt
│   └── platform_copy.txt
├── reference_samples/         # 黄金参考范例
│   └── silk-road/             # 丝绸之路 (19个文件)
└── topics/                    # 选题队列
    ├── queue.json
    └── completed.json`}
            </pre>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
