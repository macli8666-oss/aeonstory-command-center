import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { Megaphone, Search, ArrowDown, Users, Mail, BarChart3 } from "lucide-react";

interface Props { onVisible: () => void; }

const strategies = [
  {
    icon: Megaphone,
    title: "社交媒体算法迎合",
    subtitle: "短视频病毒式传播",
    items: [
      { label: "前3秒黄金法则", desc: "悬念式开场提高完播率，如\"你绝对不知道的罗马帝国灭亡的真正原因\"。" },
      { label: "视觉冲击力", desc: "AI生成的宏大历史场景作为封面，提高点击率（CTR）。" },
      { label: "评论区互动引导", desc: "抛出争议性历史问题，引导讨论，触发算法推荐。" },
    ],
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    icon: Search,
    title: "搜索引擎优化（SEO）",
    subtitle: "长尾流量捕获",
    items: [
      { label: "海量长尾关键词", desc: "\"阿兹特克帝国农业技术\"等低竞争高转化关键词。" },
      { label: "多语言SEO", desc: "Next.js i18n为每种语言生成独立URL路径。" },
      { label: "指数级覆盖", desc: "同时捕获全球各语种搜索引擎的自然流量。" },
    ],
    color: "text-ice-blue",
    bg: "bg-ice-blue/10",
    border: "border-ice-blue/20",
  },
  {
    icon: Mail,
    title: "邮件营销与留存",
    subtitle: "私域流量运营",
    items: [
      { label: "注册即送内容", desc: "用户注册邮箱后获得5个免费长视频额度，建立联系。" },
      { label: "每周精选推送", desc: "推送本周最受欢迎的历史视频和新内容预告。" },
      { label: "订阅优惠券", desc: "首月$0.99试用，降低付费门槛，提高转化率。" },
    ],
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    icon: BarChart3,
    title: "数据驱动优化",
    subtitle: "持续迭代增长",
    items: [
      { label: "A/B测试", desc: "对封面、标题、发布时间进行多变量测试，找到最优组合。" },
      { label: "完播率分析", desc: "追踪每条视频的完播率曲线，优化内容节奏。" },
      { label: "转化漏斗监控", desc: "从曝光→点击→注册→订阅的全链路数据追踪。" },
    ],
    color: "text-ice-blue",
    bg: "bg-ice-blue/10",
    border: "border-ice-blue/20",
  },
];

const funnelSteps = [
  {
    level: "第一级",
    platform: "TikTok / Reels",
    role: "诱饵",
    desc: "30秒历史冷知识短视频，结尾提示\"想了解完整故事，请点击主页链接\"。",
    color: "bg-gold/15 border-gold/30",
    textColor: "text-gold",
  },
  {
    level: "第二级",
    platform: "YouTube",
    role: "信任建立",
    desc: "10-20分钟详细历史解说长视频，描述和置顶评论放置网站链接。",
    color: "bg-ice-blue/15 border-ice-blue/30",
    textColor: "text-ice-blue",
  },
  {
    level: "第三级",
    platform: "自营网站",
    role: "转化",
    desc: "注册邮箱观看更多免费内容，邮件营销推送订阅优惠券（首月$0.99）。",
    color: "bg-gold/15 border-gold/30",
    textColor: "text-gold",
  },
];

export default function MarketingSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="marketing" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Growth Strategy
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            宣传与引流策略
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            在项目初期，流量的获取至关重要。以下是一套系统化的增长策略。
          </p>
        </motion.div>

        {/* Strategy cards - 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
          {strategies.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`p-6 rounded-xl border ${s.border} ${s.bg} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={s.color} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold font-[var(--font-display)] text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                </div>
              </div>
              <div className="space-y-3">
                {s.items.map((item) => (
                  <div key={item.label} className="pl-3 border-l-2 border-border/30">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Funnel */}
        <div className="max-w-4xl mx-auto mb-12">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl font-semibold font-[var(--font-display)] mb-8 flex items-center gap-3 justify-center"
          >
            <div className="w-1 h-6 bg-gold rounded-full" />
            跨平台导流漏斗
          </motion.h3>
          <div className="flex flex-col items-center gap-2">
            {funnelSteps.map((step, i) => (
              <motion.div
                key={step.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="w-full"
              >
                <div
                  className={`p-5 rounded-xl border ${step.color}`}
                  style={{ maxWidth: `${100 - i * 10}%`, margin: "0 auto" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-mono ${step.textColor}`}>{step.level}</span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground">{step.role}</span>
                  </div>
                  <h4 className="font-semibold font-[var(--font-display)] text-foreground mb-1">{step.platform}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < funnelSteps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="text-gold/30" size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Community */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto p-5 rounded-xl border border-border/30 bg-card/20 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
            <Users className="text-gold" size={20} />
          </div>
          <div>
            <h4 className="font-semibold font-[var(--font-display)] text-foreground mb-1">社区与口碑传播</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              建立围绕历史爱好者的社区（Discord服务器或Reddit子版块），鼓励用户分享感兴趣的历史话题，
              并投票决定下一期视频选题。这种参与感能极大地提高用户粘性和口碑传播效果。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
