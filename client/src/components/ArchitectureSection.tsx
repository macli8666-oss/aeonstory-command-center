import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

const ARCH_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/system_architecture_b4b9abe9.png";

interface Props { onVisible: () => void; }

export default function ArchitectureSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="architecture" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-ice-blue text-sm font-semibold tracking-widest uppercase mb-4 block">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            系统总体架构
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            整个系统分为三大核心层：AI内容生产流水线（生产端）、自营网站平台（用户端）和多平台自动分发矩阵（分发端），
            由统一的技术基础设施提供支撑。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden border border-border/50 glow-blue">
            <div className="bg-card/50 backdrop-blur-sm p-2 sm:p-4">
              <img
                src={ARCH_IMG}
                alt="系统总体架构图"
                className="w-full rounded-lg bg-white"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {[
            {
              title: "AI 内容生产流水线",
              desc: "从选题到成片的全自动化生产，目标月产1000+条视频。",
              accent: "border-gold/30 bg-gold/5",
              dot: "bg-gold",
            },
            {
              title: "自营网站平台",
              desc: "多维度历史查询、多语言视频播放、订阅会员管理。",
              accent: "border-ice-blue/30 bg-ice-blue/5",
              dot: "bg-ice-blue",
            },
            {
              title: "多平台自动分发矩阵",
              desc: "自动发布到YouTube、TikTok、Instagram等公域平台。",
              accent: "border-gold/30 bg-gold/5",
              dot: "bg-gold",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className={`p-5 rounded-xl border ${item.accent}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                <h3 className="font-semibold font-[var(--font-display)] text-foreground">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
