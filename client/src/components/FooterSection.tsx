import { motion } from "framer-motion";

export default function FooterSection() {
  return (
    <footer className="py-16 border-t border-border/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] mb-4">
              <span className="text-gradient-gold">AeonStory — 永恒的故事</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              基于 M3 Ultra 96GB 构建完全自动化的历史动画生产与发布系统，
              每天无需人工干预即可生产3-5条视频并发布到13个渠道。
            </p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 max-w-5xl mx-auto mb-8">
            {[
              { value: "3-5", label: "日产视频", sub: "全自动生产" },
              { value: "25", label: "涉及API/服务", sub: "13个可本地化" },
              { value: "~$200", label: "月运营成本", sub: "vs 云端$5,950" },
              { value: "8", label: "自动发布平台", sub: "全自动化" },
              { value: "3+2", label: "手动+被动渠道", sub: "每天10分钟" },
              { value: "3层", label: "安全审核", sub: "敏感内容过滤" },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-lg border border-border/20 bg-card/10">
                <div className="text-xl font-bold font-mono text-gold">{m.value}</div>
                <div className="text-xs text-foreground/70">{m.label}</div>
                <div className="text-xs text-muted-foreground/50">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>故事叙事 × 时间轴 × 问答短知识</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-ice-blue" />
              <span>aeonstory.com · aeonstory.ai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>Mac Studio 一键部署</span>
            </div>
          </div>

          <div className="border-t border-border/20 pt-6">
            <p className="text-xs text-muted-foreground/60">
              AeonStory — 全球历史动画百科平台 · 项目规划方案 v4.0 &middot; {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
