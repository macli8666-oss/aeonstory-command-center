import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { Zap, Globe, Hand, Radio, FolderOpen, Copy, Smartphone } from "lucide-react";

const DIST_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/distribution-bg-kuLbeoYWtzeZvnx9niKPYF.webp";

interface Props { onVisible: () => void; }

const autoPlatforms = [
  { name: "YouTube", type: "长视频（5-15分钟深度解析）", spec: "横屏 16:9", freq: "每天1条", api: "YouTube Data API v3", apiCost: "免费", risk: "低", color: "border-red-500/30 bg-red-500/5" },
  { name: "YouTube Shorts", type: "短视频（60秒历史冷知识）", spec: "竖屏 9:16", freq: "每天1-2条", api: "YouTube Data API v3", apiCost: "免费", risk: "低", color: "border-red-400/30 bg-red-400/5" },
  { name: "TikTok", type: "短视频（悬念式历史片段）", spec: "竖屏 9:16", freq: "每天1条", api: "Content Posting API", apiCost: "免费", risk: "中", color: "border-pink-500/30 bg-pink-500/5" },
  { name: "Instagram Reels", type: "短视频（视觉冲击力优先）", spec: "竖屏 9:16", freq: "每天1条", api: "Instagram Graph API", apiCost: "免费", risk: "中", color: "border-purple-500/30 bg-purple-500/5" },
  { name: "Facebook", type: "长视频 + 短视频混合", spec: "横屏/竖屏", freq: "每天1条", api: "Facebook Pages API", apiCost: "免费", risk: "低", color: "border-blue-500/30 bg-blue-500/5" },
  { name: "Pinterest", type: "视频Pin + 信息图", spec: "竖屏 2:3", freq: "每天1-2条", api: "Pinterest API v5", apiCost: "免费", risk: "极低", color: "border-red-300/30 bg-red-300/5" },
  { name: "LinkedIn", type: "专业历史分析视频", spec: "横屏 16:9", freq: "每周3条", api: "LinkedIn API", apiCost: "免费", risk: "低", color: "border-blue-400/30 bg-blue-400/5" },
  { name: "Telegram", type: "频道推送视频+文案", spec: "任意", freq: "每天1条", api: "Telegram Bot API", apiCost: "免费", risk: "极低", color: "border-sky-400/30 bg-sky-400/5" },
];

const manualPlatforms = [
  { name: "Bilibili", type: "5-15分钟中文历史视频", reason: "无官方API，自动化有封号风险", audience: "中文世界最大视频社区", time: "3分钟/条", color: "border-cyan-400/30 bg-cyan-400/5" },
  { name: "小红书", type: "1-3分钟竖屏视频", reason: "无官方API，需手机App上传", audience: "中国年轻用户群体", time: "2分钟/条", color: "border-pink-400/30 bg-pink-400/5" },
  { name: "Reddit", type: "链接分享+社区讨论", reason: "社区极度反感营销号，会被秒封", audience: "r/history 1900万+用户", time: "5分钟/次", color: "border-orange-400/30 bg-orange-400/5" },
];

const passiveChannels = [
  { name: "Podcast", type: "将配音音频发布为播客", platforms: "Spotify / Apple Podcasts / 小宇宙", cost: "零成本", color: "border-green-400/30 bg-green-400/5" },
  { name: "图文博客", type: "脚本改写为SEO文章", platforms: "Medium / Substack / 微信公众号", cost: "零成本", color: "border-emerald-400/30 bg-emerald-400/5" },
];

export default function DistributionSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="distribution" className="py-24 sm:py-32 relative section-bg-overlay">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${DIST_BG})` }}
      />
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-ice-blue text-sm font-semibold tracking-widest uppercase mb-4 block">
            13-Channel Distribution Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            13渠道全域分发矩阵
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            8个平台全自动发布 + 3个平台手动辅助（每天仅需10分钟）+ 2个被动引流渠道。
            通过n8n编排按各地区最佳时段定时发布，API费用几乎为零。
          </p>
        </motion.div>

        {/* Section 1: Auto platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-6xl mx-auto mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-gold" size={18} />
            <h3 className="text-lg font-semibold font-[var(--font-display)] text-gold">第一梯队：全自动发布（8个平台）</h3>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-card/60 border-b border-border/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gold">平台</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gold">内容形态</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gold">规格</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gold">频率</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gold">API</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gold">费用</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gold">封号风险</th>
                </tr>
              </thead>
              <tbody>
                {autoPlatforms.map((p) => (
                  <tr key={p.name} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{p.spec}</td>
                    <td className="px-4 py-2.5 text-sm text-ice-blue">{p.freq}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gold/70">{p.api}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{p.apiCost}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.risk === "极低" ? "bg-green-500/10 text-green-400" :
                        p.risk === "低" ? "bg-green-500/10 text-green-300" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>{p.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards for auto platforms */}
          <div className="lg:hidden space-y-3">
            {autoPlatforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`p-4 rounded-lg border ${p.color}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{p.apiCost}</span>
                </div>
                <div className="text-sm text-muted-foreground">{p.type}</div>
                <div className="text-xs font-mono text-gold/60 mt-1">{p.api}</div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">{p.spec}</span>
                  <span className="text-ice-blue">{p.freq}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section 2: Manual platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Hand className="text-ice-blue" size={18} />
            <h3 className="text-lg font-semibold font-[var(--font-display)] text-ice-blue">第二梯队：手动辅助发布（3个平台）</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {manualPlatforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`p-5 rounded-xl border ${p.color}`}
              >
                <div className="font-semibold text-foreground mb-2">{p.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{p.type}</div>
                <div className="text-xs text-yellow-400/80 mb-2">为什么不自动化：{p.reason}</div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{p.audience}</span>
                  <span className="text-ice-blue">~{p.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section 3: Passive channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Radio className="text-green-400" size={18} />
            <h3 className="text-lg font-semibold font-[var(--font-display)] text-green-400">第三梯队：被动引流渠道（2个）</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passiveChannels.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`p-5 rounded-xl border ${p.color}`}
              >
                <div className="font-semibold text-foreground mb-1">{p.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{p.type}</div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{p.platforms}</span>
                  <span className="text-green-400">{p.cost}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Manual publishing assistant system */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="p-6 rounded-xl border border-gold/20 bg-card/20">
            <h4 className="text-lg font-semibold font-[var(--font-display)] text-gold mb-4">
              手动发布辅助系统 — 每天仅需10分钟
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border/30 bg-card/10">
                <div className="flex items-center gap-2 mb-2">
                  <Copy className="text-gold" size={16} />
                  <span className="text-sm font-medium text-foreground">Web后台一键复制</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  后台面板显示每日待发布视频，点击平台按钮自动复制标题/描述/标签到剪贴板，打开对应平台上传页面，粘贴即可。
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/30 bg-card/10">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="text-ice-blue" size={16} />
                  <span className="text-sm font-medium text-foreground">本地分平台文件夹</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  系统自动按日期和平台分好文件夹，每个文件夹包含：适配好的视频文件、封面图、标题描述标签文本文件，直接拖拽上传。
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/30 bg-card/10">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="text-green-400" size={16} />
                  <span className="text-sm font-medium text-foreground">手机App快捷发布</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  B站和小红书均有创作者App，视频同步到iCloud后可直接在手机上完成上传发布，通勤路上即可搞定。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
