import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { Globe, Film, Languages, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Props { onVisible: () => void; }

const features = [
  {
    icon: Globe,
    title: "全球覆盖",
    desc: "覆盖联合国193个成员国，加上主要历史文明和部落，共计300+条目的选题库。",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    icon: Film,
    title: "AI动画生成",
    desc: "利用GPT-4o、Midjourney、HeyGen等AI工具链，实现从脚本到成片的全自动化生产。",
    color: "text-ice-blue",
    bg: "bg-ice-blue/10",
    border: "border-ice-blue/20",
  },
  {
    icon: Languages,
    title: "多语言支持",
    desc: "初期支持10种核心语言，后续扩展至30+种，通过ElevenLabs实现自然的多语言配音。",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    icon: Zap,
    title: "自动化分发",
    desc: "通过n8n/Make.com编排，自动定时发布到YouTube、TikTok、Instagram等主流平台。",
    color: "text-ice-blue",
    bg: "bg-ice-blue/10",
    border: "border-ice-blue/20",
  },
];

const stats = [
  { value: "300+", label: "选题条目", suffix: "" },
  { value: "1000+", label: "月产视频", suffix: "条" },
  { value: "30+", label: "语言支持", suffix: "种" },
  { value: "7+", label: "分发平台", suffix: "个" },
];

export default function VisionSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="vision" className="py-24 sm:py-32 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, oklch(0.82 0.12 85 / 0.15) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, oklch(0.75 0.12 220 / 0.1) 0%, transparent 50%)`,
        }} />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Project Vision
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            项目概述与愿景
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            这不仅仅是一个内容网站，而是一个高度自动化的内容生产与分发引擎。
            参考CuriosityStream在2025年实现7170万美元收入（同比增长40%）的成功案例，
            历史教育内容在全球市场拥有巨大的商业潜力。
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-3xl mx-auto"
        >
          {stats.map((s, i) => (
            <div key={s.label} className="text-center p-4 rounded-lg border border-border/30 bg-card/20">
              <div className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-gradient-gold mb-1">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`group p-6 rounded-xl border ${f.border} ${f.bg} backdrop-blur-sm
                hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className={`w-12 h-12 rounded-lg ${f.bg} flex items-center justify-center mb-4
                group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={f.color} size={24} />
              </div>
              <h3 className="text-xl font-semibold font-[var(--font-display)] mb-2 text-foreground">
                {f.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
