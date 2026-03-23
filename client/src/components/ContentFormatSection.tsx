import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { BookOpen, Clock, HelpCircle, Layers, FileText, QrCode } from "lucide-react";

interface Props { onVisible: () => void; }

const formats = [
  {
    icon: BookOpen,
    title: "故事叙事",
    platform: "YouTube 长视频（5-15分钟）",
    desc: "以人物或事件为中心，有起承转合的完整故事弧。开头用反直觉的事实制造悬念，中间按时间线推进但用故事化语言，结尾引导订阅和网站。",
    example: "「成吉思汗如何从一个被遗弃的孩子成为征服半个世界的帝王？」",
    reference: "参考 OverSimplified（2800万订阅）的幽默叙事风格",
    metrics: "观众留存率最高，平均观看时长 8-12 分钟",
    color: "border-gold/30 bg-gold/5",
    iconColor: "text-gold",
  },
  {
    icon: HelpCircle,
    title: "问答式短知识",
    platform: "TikTok / Shorts / Reels（30-60秒）",
    desc: "以「你知道吗？」开头，一个反直觉的历史冷知识，快速吸引注意力。信息密度高，节奏快，结尾留悬念引导关注。",
    example: "「你知道古罗马人用尿液刷牙吗？这背后的科学原理居然是...」",
    reference: "参考 History Matters 的短知识爆款模式",
    metrics: "引流效果最强，完播率 > 80%，分享率最高",
    color: "border-ice-blue/30 bg-ice-blue/5",
    iconColor: "text-ice-blue",
  },
  {
    icon: Clock,
    title: "时间轴编年体",
    platform: "网站浏览 + PDF导出",
    desc: "按时间线严格排列，信息密度高，教育价值强。适合用户在网站上拖动时间轴浏览，或导出为结构化的PDF文档用于学习和研究。",
    example: "「1840-1949 中国近代史时间轴：从鸦片战争到新中国成立」",
    reference: "参考 Epic History TV 的编年体结构",
    metrics: "SEO价值最高，长尾搜索流量的主要来源",
    color: "border-green-400/30 bg-green-400/5",
    iconColor: "text-green-400",
  },
];

const videoStructure = [
  { time: "0-15秒", name: "钩子", desc: "一个反直觉的事实或悬念", example: "「1453年，一座城市的陷落改变了整个世界的走向」", color: "bg-red-500/20 border-red-500/30" },
  { time: "15秒-结尾前30秒", name: "故事主体", desc: "以时间线推进，用故事化的语言讲述", example: "人物动机 → 关键转折 → 高潮冲突 → 结局影响", color: "bg-gold/20 border-gold/30" },
  { time: "最后30秒", name: "引导转化", desc: "引导订阅 + 引导到网站看完整时间轴", example: "「完整时间轴和更多故事，请访问 aeonstory.com」", color: "bg-ice-blue/20 border-ice-blue/30" },
];

export default function ContentFormatSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="content-format" className="py-24 sm:py-32 relative">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Content Format Strategy
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            混合内容形式策略
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            不同平台采用不同的内容形式，故事叙事用于YouTube深度内容，
            问答短知识用于短视频引流，时间轴编年体用于网站和PDF导出。三种形式互相导流，形成闭环。
          </p>
        </motion.div>

        {/* Three formats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {formats.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`p-6 rounded-xl border ${f.color} relative overflow-hidden`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${f.color}`}>
                  <f.icon className={f.iconColor} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold font-[var(--font-display)] text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.platform}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.desc}</p>
              <div className="p-3 rounded-lg bg-background/30 border border-border/20 mb-3">
                <p className="text-xs text-foreground/80 italic">示例：{f.example}</p>
              </div>
              <p className="text-xs text-muted-foreground/70 mb-2">{f.reference}</p>
              <div className="pt-2 border-t border-border/20">
                <p className="text-xs text-gold/80">{f.metrics}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Layers className="text-gold" size={20} />
            <h3 className="text-xl font-semibold font-[var(--font-display)] text-foreground">每条视频的「三段式」结构</h3>
          </div>
          <div className="space-y-4">
            {videoStructure.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`flex items-stretch rounded-xl border ${s.color} overflow-hidden`}
              >
                <div className={`w-36 sm:w-44 shrink-0 flex flex-col items-center justify-center p-4 ${s.color}`}>
                  <div className="text-lg font-bold font-mono text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.time}</div>
                </div>
                <div className="p-4 flex-1">
                  <p className="text-sm text-foreground/90 mb-1">{s.desc}</p>
                  <p className="text-xs text-muted-foreground italic">{s.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Website dual mode + PDF export */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-xl border border-gold/20 bg-card/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="text-gold" size={18} />
              <h4 className="font-semibold font-[var(--font-display)] text-foreground">网站双模式切换</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              用户在AeonStory网站上可以自由切换两种浏览模式：
            </p>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-gold/5 border border-gold/10">
                <span className="text-xs font-medium text-gold">故事模式</span>
                <span className="text-xs text-muted-foreground ml-2">点击国家 → 看按故事线组织的视频列表</span>
              </div>
              <div className="p-2 rounded-lg bg-ice-blue/5 border border-ice-blue/10">
                <span className="text-xs font-medium text-ice-blue">时间轴模式</span>
                <span className="text-xs text-muted-foreground ml-2">拖动时间轴 → 看该时段全球发生的事件</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-xl border border-green-400/20 bg-card/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-green-400" size={18} />
              <h4 className="font-semibold font-[var(--font-display)] text-foreground">一键导出功能</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              用户可自定义筛选条件后一键导出：
            </p>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-green-400/5 border border-green-400/10">
                <span className="text-xs font-medium text-green-400">PDF时间轴</span>
                <span className="text-xs text-muted-foreground ml-2">严谨编年体格式 + 关键事件 + 人物 + 地点</span>
              </div>
              <div className="p-2 rounded-lg bg-green-400/5 border border-green-400/10 flex items-center gap-2">
                <QrCode className="text-green-400 shrink-0" size={14} />
                <span className="text-xs text-muted-foreground">PDF内嵌二维码，扫码直接观看对应视频</span>
              </div>
              <div className="p-2 rounded-lg bg-gold/5 border border-gold/10">
                <span className="text-xs font-medium text-gold">视频合集</span>
                <span className="text-xs text-muted-foreground ml-2">付费用户可下载感兴趣主题的视频合集</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
