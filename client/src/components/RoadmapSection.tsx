import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { Rocket, TrendingUp, Globe } from "lucide-react";

const ROADMAP_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/roadmap-bg-QnaQbXNFkNe8Qh2PvRdTRK.webp";
const ROADMAP_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/roadmap_f8e4953b.png";

interface Props { onVisible: () => void; }

const phases = [
  {
    icon: Rocket,
    phase: "阶段一",
    title: "MVP",
    period: "2026年4月 - 6月",
    duration: "约3个月",
    goal: "验证核心假设——AI生产的历史动画视频是否能吸引用户。",
    tasks: [
      "Mac Studio部署本地模型（Ollama+ComfyUI+Qwen3-TTS+LTX-Video）",
      "部署n8n串行流水线编排（Docker）",
      "开发Web后台指挥中心（仪表盘+选题管理+审核队列）",
      "开发自营网站MVP（时间轴+视频播放+PDF导出）",
      "完成首批50个国家的历史视频制作",
      "部署Llama Guard三层安全审核机制",
    ],
    color: "border-gold/40",
    dotColor: "bg-gold",
    iconColor: "text-gold",
  },
  {
    icon: TrendingUp,
    phase: "阶段二",
    title: "增长",
    period: "2026年7月 - 8月",
    duration: "约2个月",
    goal: "建立分发矩阵并启动变现。",
    tasks: [
      "上线多平台自动分发（7平台定时发布）",
      "实现全自动日常运营（凌晨生产+白天发布）",
      "扩展多语言支持至10种核心语言",
      "上线Stripe订阅支付系统",
      "启动SEO优化和内容营销",
    ],
    color: "border-ice-blue/40",
    dotColor: "bg-ice-blue",
    iconColor: "text-ice-blue",
  },
  {
    icon: Globe,
    phase: "阶段三",
    title: "规模化",
    period: "2026年9月 - 2027年1月",
    duration: "约5个月",
    goal: "实现内容全覆盖和收入规模化。",
    tasks: [
      "内容覆盖范围扩展至200+国家和地区",
      "语言支持扩展至30+种",
      "启动教育机构B2B授权业务",
      "开发移动端App（iOS/Android）",
    ],
    color: "border-gold/40",
    dotColor: "bg-gold",
    iconColor: "text-gold",
  },
];

export default function RoadmapSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="roadmap" className="py-24 sm:py-32 relative section-bg-overlay">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${ROADMAP_BG})` }}
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
            Implementation Roadmap
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            项目实施路线图
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            整个项目分为三个阶段，预计从启动到规模化运营需要约10个月。
          </p>
        </motion.div>

        {/* Gantt chart */}
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
                src={ROADMAP_IMG}
                alt="项目实施路线图"
                className="w-full rounded-lg bg-white"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>

        {/* Phase cards */}
        <div className="max-w-4xl mx-auto space-y-6">
          {phases.map((p, i) => (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`p-6 rounded-xl border ${p.color} bg-card/20 backdrop-blur-sm`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center shrink-0`}>
                  <p.icon className={p.iconColor} size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gold/60">{p.phase}</span>
                    <h3 className="text-lg font-semibold font-[var(--font-display)] text-foreground">{p.title}</h3>
                    <span className="text-xs text-muted-foreground">{p.period} ({p.duration})</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{p.goal}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.tasks.map((task) => (
                      <div key={task} className="flex items-start gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.dotColor} mt-1.5 shrink-0`} />
                        <span className="text-foreground/80">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
