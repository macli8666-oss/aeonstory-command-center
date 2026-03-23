import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { ChevronDown } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/hero-bg-CprqRbNuRuGWkZG6J8FZqd.webp";

interface Props { onVisible: () => void; }

export default function HeroSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

      <div className="relative z-10 container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-8">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-sm font-medium">AeonStory · 项目规划方案 v4.0</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 font-[var(--font-display)]"
        >
          <span className="text-gradient-gold">AeonStory</span>
          <br />
          <span className="text-foreground">永恒的故事</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          用AI动画讲述地球上每一个国家、每一个部落、每一个文明的永恒故事。
          <br className="hidden sm:block" />
          故事叙事 × 时间轴 × 多语言 × 全自动发布
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {["200+ 国家覆盖", "30+ 语言支持", "M3 Ultra 全自动", "13渠道分发", "3层安全审核", "aeonstory.com"].map((tag, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm text-sm text-foreground/80"
            >
              {tag}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="text-gold/50" size={28} />
        </motion.div>
      </motion.div>
    </section>
  );
}
