import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { Clock, MapPin, Search, Monitor, Server, Database, Layers, CreditCard, Gauge } from "lucide-react";

interface Props { onVisible: () => void; }

const queryDimensions = [
  {
    icon: Clock,
    title: "时间轴 (Timeline)",
    desc: "用户拖动时间轴滑块，查看任意年份全球正在发生的历史事件。",
    detail: "可缩放的水平时间轴组件，支持从公元前3000年到现代。",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: MapPin,
    title: "地理位置 (Geography)",
    desc: "用户点击交互式地球仪或世界地图上的任意国家/地区，查看该地的历史视频。",
    detail: "基于WebGL的3D地球仪（Cesium.js）或SVG交互地图。",
    color: "text-ice-blue",
    bg: "bg-ice-blue/10",
  },
  {
    icon: Search,
    title: "关键词 (Keywords)",
    desc: "用户搜索特定历史事件、人物、种族或文明名称，获取相关视频列表。",
    detail: "基于Typesense的全文搜索引擎，支持模糊匹配和多语言搜索。",
    color: "text-gold",
    bg: "bg-gold/10",
  },
];

const techStack = [
  { icon: Monitor, name: "Next.js + TailwindCSS", role: "前端框架", reason: "SSR提升SEO，原生i18n多语言路由" },
  { icon: Server, name: "FastAPI / Node.js", role: "后端API", reason: "高并发视频元数据请求和AI流水线调度" },
  { icon: Database, name: "PostgreSQL + Prisma", role: "数据库", reason: "存储用户数据、视频元数据和历史事件" },
  { icon: Layers, name: "Typesense", role: "搜索引擎", reason: "毫秒级响应的关键词和时间轴过滤查询" },
  { icon: Gauge, name: "AWS S3 + Cloudflare CDN", role: "视频托管", reason: "低成本存储，全球流畅加载" },
  { icon: CreditCard, name: "Stripe", role: "支付网关", reason: "全球多币种订阅制支付" },
];

export default function WebsiteSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="website" className="py-24 sm:py-32 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Core Platform
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            自营网站核心功能
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            自营网站是沉淀用户和实现商业变现的大本营，提供三大核心体验：
            多维度历史查询、多语言视频观看和订阅会员管理。
          </p>
        </motion.div>

        {/* Query Dimensions */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3"
          >
            <div className="w-1 h-6 bg-gold rounded-full" />
            多维度历史查询系统
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {queryDimensions.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm
                  hover:border-gold/30 transition-colors duration-300"
              >
                <div className={`w-10 h-10 rounded-lg ${d.bg} flex items-center justify-center mb-4`}>
                  <d.icon className={d.color} size={20} />
                </div>
                <h4 className="font-semibold font-[var(--font-display)] text-foreground mb-2">{d.title}</h4>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.desc}</p>
                <p className="text-xs text-ice-blue/70 leading-relaxed">{d.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3"
          >
            <div className="w-1 h-6 bg-ice-blue rounded-full" />
            技术选型建议
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-lg border border-border/30 bg-card/20
                  hover:bg-card/40 transition-colors duration-300"
              >
                <div className="w-9 h-9 rounded-md bg-ice-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                  <t.icon className="text-ice-blue" size={18} />
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-gold mb-1">{t.role}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{t.reason}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
