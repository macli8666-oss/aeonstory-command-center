import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { Check, Star } from "lucide-react";

const BIZ_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/business-bg-idEDa7onDGnqKFujmmM7sz.webp";
const FUNNEL_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/business_funnel_77bda776.png";

interface Props { onVisible: () => void; }

const plans = [
  {
    name: "基础版",
    nameEn: "Basic",
    price: "免费",
    period: "",
    features: [
      "公域平台所有短视频",
      "网站基础时间轴浏览",
      "每月5个免费长视频额度",
    ],
    accent: "border-border/50",
    badge: null,
  },
  {
    name: "标准版",
    nameEn: "Standard",
    price: "$4.99",
    period: "/月",
    yearPrice: "$39.99/年",
    features: [
      "解锁所有长视频",
      "无广告高清观看",
      "高级时间轴交叉查询",
      "多语言字幕切换",
    ],
    accent: "border-gold/50",
    badge: "推荐",
  },
  {
    name: "高级版",
    nameEn: "Premium",
    price: "$9.99",
    period: "/月",
    yearPrice: "$79.99/年",
    features: [
      "标准版全部权益",
      "4K视频下载",
      "教育资料包（PDF讲义/测验）",
      "优先获取新内容",
    ],
    accent: "border-ice-blue/50",
    badge: null,
  },
];

const revenueStreams = [
  { title: "YouTube AdSense", desc: "历史教育类CPM $3-$8，随频道规模增长成为可观被动收入。" },
  { title: "内容授权 (B2B)", desc: "授权给学校、教育机构、博物馆。参考CuriosityStream 2025年授权收入3320万美元。" },
  { title: "品牌赞助", desc: "旅游公司、书籍出版商、教育科技公司赞助特定国家或主题的历史视频系列。" },
];

export default function BusinessSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="business" className="py-24 sm:py-32 relative section-bg-overlay">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${BIZ_BG})` }}
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
            Business Model
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            商业模式与变现路径
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            采用"免费增值（Freemium）"商业模式，通过免费内容在公域平台获取流量，引导至私域进行转化。
          </p>
        </motion.div>

        {/* Funnel diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="rounded-2xl overflow-hidden border border-gold/20 glow-gold">
            <div className="bg-card/50 backdrop-blur-sm p-2 sm:p-4">
              <img
                src={FUNNEL_IMG}
                alt="商业变现漏斗图"
                className="w-full rounded-lg bg-white"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-8 flex items-center gap-3 justify-center">
            <div className="w-1 h-6 bg-gold rounded-full" />
            分层定价策略
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative p-6 rounded-xl border ${plan.accent} bg-card/30 backdrop-blur-sm
                  ${plan.badge ? "ring-1 ring-gold/30" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold text-deep-navy text-xs font-semibold flex items-center gap-1">
                    <Star size={12} />
                    {plan.badge}
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="text-sm text-muted-foreground mb-1">{plan.nameEn}</div>
                  <div className="text-lg font-semibold font-[var(--font-display)] text-foreground">{plan.name}</div>
                </div>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-gradient-gold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                  {plan.yearPrice && (
                    <div className="text-xs text-ice-blue/70 mt-1">{plan.yearPrice}</div>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="text-gold shrink-0 mt-0.5" size={14} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Other revenue */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3">
            <div className="w-1 h-6 bg-ice-blue rounded-full" />
            其他变现渠道
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueStreams.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-4 rounded-lg border border-border/30 bg-card/20"
              >
                <h4 className="font-medium text-foreground text-sm mb-2">{r.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
