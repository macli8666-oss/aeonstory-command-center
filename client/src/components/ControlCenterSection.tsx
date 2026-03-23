/*
 * Design: Dark Cinematic Narrative
 * Section: Web后台指挥中心 — 完整功能展示
 * 包含：七大模块、指挥台模拟界面（含发布监控Tab）、三层安全审核、手动发布辅助、用户导出、远程访问
 */

import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import {
  LayoutDashboard, ListChecks, Activity, ShieldCheck, CalendarDays,
  BarChart3, Settings, Globe, Wifi, Lock, FileDown, FileText,
  Video, Package, Filter, Shield, AlertOctagon, CheckCircle2,
  Smartphone, Monitor, ArrowRight, Play, Pause, Eye, Clock,
  Upload, Copy, FolderOpen, ExternalLink, RefreshCw, Zap,
  TrendingUp, Users, ThumbsUp, MessageCircle, Search,
  AlertTriangle, RotateCcw, Timer, Radio, CircleDot, Ban
} from "lucide-react";
import { useState } from "react";

interface Props { onVisible: () => void; }

/* ─── 七大功能模块 ─── */
const dashboardModules = [
  {
    icon: LayoutDashboard, title: "总览仪表盘",
    desc: "今日生产/发布状态、各平台数据概览、系统健康度、内存/磁盘实时监控",
    tech: "Next.js + Recharts", color: "text-gold",
  },
  {
    icon: ListChecks, title: "选题管理",
    desc: "选题队列CRUD、优先级排序、敏感话题标记、AI自动推荐选题",
    tech: "PostgreSQL + Prisma", color: "text-ice-blue",
  },
  {
    icon: Activity, title: "生产监控",
    desc: "实时查看流水线进度（脚本→配音→画面→合成）、模型加载状态、预计完成时间",
    tech: "WebSocket 实时推送", color: "text-emerald-400",
  },
  {
    icon: ShieldCheck, title: "审核队列",
    desc: "待审核内容列表、视频预览、一键通过/拒绝/编辑后重新生成",
    tech: "视频预览 + 文本编辑器", color: "text-orange-400",
  },
  {
    icon: CalendarDays, title: "发布日历",
    desc: "各平台发布计划、已发布内容回溯、时区管理、发布状态追踪",
    tech: "日历视图 + Cron配置", color: "text-purple-400",
  },
  {
    icon: BarChart3, title: "数据分析",
    desc: "各平台播放量/点赞/评论趋势、最佳发布时间分析、自动优化选题方向",
    tech: "YouTube/TikTok Analytics API", color: "text-pink-400",
  },
  {
    icon: Settings, title: "系统设置",
    desc: "模型配置、API密钥管理、发布时间、品牌模板、语言偏好",
    tech: "表单配置 + 环境变量", color: "text-slate-400",
  },
];

/* ─── 模拟指挥台数据 ─── */
const mockTodayStats = {
  produced: 3, published: 2, pending: 1, views: "12.4K",
  likes: "890", comments: "156", subscribers: "+23",
};

const mockPipeline = [
  { id: "EP-0320-01", title: "古埃及金字塔建造之谜", status: "published", platforms: ["YouTube", "TikTok", "Instagram"], progress: 100 },
  { id: "EP-0320-02", title: "维京人发现美洲大陆", status: "published", platforms: ["YouTube", "Facebook"], progress: 100 },
  { id: "EP-0320-03", title: "日本战国时代：织田信长", status: "processing", platforms: [], progress: 72, stage: "视频生成中..." },
  { id: "EP-0321-01", title: "玛雅文明的天文历法", status: "queued", platforms: [], progress: 0, stage: "等待生产" },
  { id: "EP-0321-02", title: "蒙古帝国的驿站系统", status: "queued", platforms: [], progress: 0, stage: "等待生产" },
];

const mockManualQueue = [
  { platform: "Bilibili", icon: "📺", title: "古埃及金字塔建造之谜", status: "待上传", action: "一键复制文案" },
  { platform: "小红书", icon: "📕", title: "古埃及金字塔建造之谜（竖屏版）", status: "待上传", action: "一键复制文案" },
  { platform: "Reddit", icon: "🤖", title: "How the Pyramids Were Built", status: "待发帖", action: "复制英文文案" },
];

/* ─── 发布监控数据 ─── */
type PlatformStatus = "success" | "rate-limited" | "retrying" | "failed" | "pending" | "skipped";

interface PlatformPublishItem {
  platform: string;
  icon: string;
  videoTitle: string;
  status: PlatformStatus;
  publishTime: string;
  retryCount: number;
  nextRetry?: string;
  errorMsg?: string;
  rateLimit?: { remaining: number; resetIn: string };
  apiQuota?: { used: number; total: number };
}

const mockPublishMonitor: PlatformPublishItem[] = [
  {
    platform: "YouTube", icon: "▶️", videoTitle: "古埃及金字塔建造之谜",
    status: "success", publishTime: "10:00", retryCount: 0,
    apiQuota: { used: 4200, total: 10000 },
  },
  {
    platform: "TikTok", icon: "🎵", videoTitle: "古埃及金字塔建造之谜",
    status: "success", publishTime: "10:15", retryCount: 0,
    apiQuota: { used: 18, total: 25 },
  },
  {
    platform: "Instagram", icon: "📸", videoTitle: "古埃及金字塔建造之谜",
    status: "rate-limited", publishTime: "—", retryCount: 1,
    nextRetry: "14:30", errorMsg: "Rate limit: 25 posts/24h exceeded",
    rateLimit: { remaining: 0, resetIn: "3h 22m" },
    apiQuota: { used: 25, total: 25 },
  },
  {
    platform: "Facebook", icon: "📘", videoTitle: "古埃及金字塔建造之谜",
    status: "retrying", publishTime: "—", retryCount: 2,
    nextRetry: "11:45", errorMsg: "Temporary server error (500)",
    apiQuota: { used: 180, total: 200 },
  },
  {
    platform: "Pinterest", icon: "📌", videoTitle: "古埃及金字塔建造之谜",
    status: "success", publishTime: "10:30", retryCount: 0,
    apiQuota: { used: 42, total: 1000 },
  },
  {
    platform: "LinkedIn", icon: "💼", videoTitle: "古埃及金字塔建造之谜",
    status: "pending", publishTime: "12:00（定时）", retryCount: 0,
    apiQuota: { used: 8, total: 100 },
  },
  {
    platform: "Telegram", icon: "✈️", videoTitle: "古埃及金字塔建造之谜",
    status: "success", publishTime: "10:05", retryCount: 0,
  },
  {
    platform: "X (Twitter)", icon: "𝕏", videoTitle: "古埃及金字塔建造之谜",
    status: "skipped", publishTime: "—", retryCount: 0,
    errorMsg: "API配额不足，已跳过本轮",
    apiQuota: { used: 50, total: 50 },
  },
];

/* ─── 限流应对策略 ─── */
const rateLimitStrategies = [
  {
    icon: Timer, title: "指数退避重试",
    desc: "首次失败等30秒，第二次等2分钟，第三次等10分钟，最多重试5次。避免短时间内反复触发限流。",
    color: "text-gold",
  },
  {
    icon: CalendarDays, title: "错峰发布调度",
    desc: "各平台发布时间间隔15-30分钟，避免同一时刻向所有平台发送请求。按目标受众时区优化发布时间。",
    color: "text-ice-blue",
  },
  {
    icon: RotateCcw, title: "自动降级队列",
    desc: "当某平台连续失败3次，自动将该视频移入「手动发布队列」，并通过Telegram/邮件通知您。不阻塞其他平台。",
    color: "text-emerald-400",
  },
  {
    icon: BarChart3, title: "API配额实时监控",
    desc: "实时追踪每个平台的API调用量/剩余配额/重置时间。配额低于20%时自动降低发布频率，低于5%时暂停该平台。",
    color: "text-orange-400",
  },
  {
    icon: Radio, title: "平台健康度评分",
    desc: "基于过去7天的成功率、平均延迟、限流次数，为每个平台计算健康度评分（0-100）。低于60分的平台自动降频。",
    color: "text-purple-400",
  },
  {
    icon: AlertTriangle, title: "异常告警通知",
    desc: "当出现Token过期、连续限流、API变更等异常时，通过Telegram Bot即时推送告警，附带建议操作。",
    color: "text-red-400",
  },
];

/* ─── 三层安全审核 ─── */
const safetyLayers = [
  {
    layer: "第一层", title: "选题阶段过滤", icon: Filter,
    desc: "在选题库中预先标记敏感话题（殖民史、种族冲突、宗教争议、领土争端等），这些话题不进入自动发布队列，而是进入「人工审核队列」。",
    color: "border-l-amber-400", bgColor: "bg-amber-400/5",
  },
  {
    layer: "第二层", title: "脚本Prompt约束", icon: Shield,
    desc: "在LLM的System Prompt中内置安全规则：以中立学术口吻叙述历史事件，避免价值判断和争议性表述，不使用煽动性语言。",
    color: "border-l-ice-blue", bgColor: "bg-ice-blue/5",
  },
  {
    layer: "第三层", title: "成品安全审核", icon: ShieldCheck,
    desc: "使用 Llama Guard 3-8B 对生成内容进行安全分类，检测暴力、仇恨言论、性内容等13个安全类别。未通过则自动标记为待人工审核。",
    color: "border-l-green-400", bgColor: "bg-green-400/5",
  },
];

/* ─── 用户导出功能 ─── */
const exportFeatures = [
  { icon: FileText, title: "时间线PDF", free: "支持（带水印）", paid: "支持（无水印）", desc: "将筛选后的历史时间线渲染为精美PDF文档" },
  { icon: Video, title: "单条视频下载", free: "不支持", paid: "支持（720p）", desc: "下载感兴趣的视频到本地离线观看" },
  { icon: Package, title: "批量视频打包", free: "不支持", paid: "支持（高级版）", desc: "按主题/国家/时间段批量打包下载" },
  { icon: Globe, title: "交互式网页导出", free: "不支持", paid: "支持", desc: "生成独立HTML文件，含可缩放时间轴和嵌入播放器" },
];

/* ─── 状态标签渲染 ─── */
function StatusBadge({ status }: { status: PlatformStatus }) {
  const config: Record<PlatformStatus, { label: string; cls: string }> = {
    "success": { label: "已发布", cls: "bg-emerald-400/10 text-emerald-400" },
    "rate-limited": { label: "限流中", cls: "bg-amber-400/10 text-amber-400" },
    "retrying": { label: "重试中", cls: "bg-gold/10 text-gold" },
    "failed": { label: "失败", cls: "bg-red-400/10 text-red-400" },
    "pending": { label: "待发布", cls: "bg-ice-blue/10 text-ice-blue" },
    "skipped": { label: "已跳过", cls: "bg-slate-400/10 text-slate-400" },
  };
  const c = config[status];
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}

/* ─── 指挥台Tab ─── */
type TabKey = "overview" | "pipeline" | "publish-monitor" | "manual" | "published";

export default function ControlCenterSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "总览", icon: LayoutDashboard },
    { key: "pipeline", label: "生产线", icon: Activity },
    { key: "publish-monitor", label: "发布监控", icon: Radio },
    { key: "manual", label: "手动发布", icon: Upload },
    { key: "published", label: "已发布", icon: CheckCircle2 },
  ];

  /* 发布监控统计 */
  const publishStats = {
    success: mockPublishMonitor.filter(p => p.status === "success").length,
    rateLimited: mockPublishMonitor.filter(p => p.status === "rate-limited").length,
    retrying: mockPublishMonitor.filter(p => p.status === "retrying").length,
    pending: mockPublishMonitor.filter(p => p.status === "pending").length,
    failed: mockPublishMonitor.filter(p => p.status === "failed").length,
    skipped: mockPublishMonitor.filter(p => p.status === "skipped").length,
  };

  return (
    <section ref={ref} id="control-center" className="py-24 sm:py-32 relative">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-ice-blue text-sm font-semibold tracking-widest uppercase mb-4 block">
            Command Center
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            Web后台 <span className="text-gradient-blue">指挥中心</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            通过浏览器访问本地Web界面，实时查看选题、制作进度、各平台发布状态和限流情况。
            系统按预设规则自动运行，您只需在需要时查看状态或处理审核队列。
          </p>
        </motion.div>

        {/* ═══ 模拟指挥台界面 ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-6 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gold" />
            指挥台预览
            <span className="text-xs text-muted-foreground font-normal ml-2">（模拟界面）</span>
          </h3>

          {/* 模拟浏览器窗口 */}
          <div className="rounded-xl border border-border/40 bg-[#0a0c14] overflow-hidden shadow-2xl">
            {/* 浏览器标题栏 */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12141f] border-b border-border/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[#1a1d2e] rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                  <Lock size={10} className="text-green-400" />
                  <span>localhost:3000/dashboard</span>
                </div>
              </div>
              <RefreshCw size={12} className="text-muted-foreground" />
            </div>

            {/* Tab导航 */}
            <div className="flex border-b border-border/20 bg-[#0d0f18] overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "text-gold border-b-2 border-gold bg-gold/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                  {tab.key === "publish-monitor" && (publishStats.rateLimited + publishStats.retrying) > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[9px] flex items-center justify-center font-bold">
                      {publishStats.rateLimited + publishStats.retrying}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab内容 */}
            <div className="p-4 sm:p-6 min-h-[420px]">

              {/* ─── 总览Tab ─── */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "今日生产", value: mockTodayStats.produced, unit: "条", icon: Zap, color: "text-emerald-400" },
                      { label: "已发布", value: mockTodayStats.published, unit: "条", icon: CheckCircle2, color: "text-gold" },
                      { label: "待审核", value: mockTodayStats.pending, unit: "条", icon: Clock, color: "text-orange-400" },
                      { label: "今日播放", value: mockTodayStats.views, unit: "", icon: Eye, color: "text-ice-blue" },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-lg bg-[#12141f] border border-border/20">
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon size={12} className={stat.color} />
                          <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {stat.value}<span className="text-xs text-muted-foreground ml-1">{stat.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "总点赞", value: mockTodayStats.likes, icon: ThumbsUp },
                      { label: "总评论", value: mockTodayStats.comments, icon: MessageCircle },
                      { label: "新订阅", value: mockTodayStats.subscribers, icon: Users },
                      { label: "增长率", value: "+8.3%", icon: TrendingUp },
                    ].map((stat) => (
                      <div key={stat.label} className="p-2.5 rounded-lg bg-[#12141f] border border-border/10 flex items-center gap-3">
                        <stat.icon size={14} className="text-muted-foreground" />
                        <div>
                          <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                          <div className="text-sm font-semibold text-foreground">{stat.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Ollama", status: "online" },
                      { name: "ComfyUI", status: "online" },
                      { name: "n8n", status: "online" },
                      { name: "PostgreSQL", status: "online" },
                      { name: "内存", status: "62/96GB" },
                      { name: "磁盘", status: "420GB可用" },
                    ].map((svc) => (
                      <div key={svc.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#12141f] border border-border/10 text-[10px]">
                        <div className={`w-1.5 h-1.5 rounded-full ${svc.status === "online" ? "bg-emerald-400" : "bg-gold"}`} />
                        <span className="text-muted-foreground">{svc.name}</span>
                        <span className="text-foreground font-medium">{svc.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── 生产线Tab ─── */}
              {activeTab === "pipeline" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">生产队列 · 共 {mockPipeline.length} 条</span>
                    <div className="flex gap-2">
                      <button className="px-2.5 py-1 rounded-md bg-gold/10 text-gold text-[10px] font-medium hover:bg-gold/20 transition-colors flex items-center gap-1">
                        <Play size={10} /> 开始生产
                      </button>
                      <button className="px-2.5 py-1 rounded-md bg-[#12141f] text-muted-foreground text-[10px] hover:bg-white/10 transition-colors flex items-center gap-1">
                        <Pause size={10} /> 暂停
                      </button>
                    </div>
                  </div>
                  {mockPipeline.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-[#12141f] border border-border/15 hover:border-border/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gold/60">{item.id}</span>
                          <span className="text-sm font-medium text-foreground">{item.title}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.status === "published" ? "bg-emerald-400/10 text-emerald-400" :
                          item.status === "processing" ? "bg-gold/10 text-gold" :
                          "bg-[#1a1d2e] text-muted-foreground"
                        }`}>
                          {item.status === "published" ? "已发布" : item.status === "processing" ? "生产中" : "排队中"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-[#1a1d2e] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.progress === 100 ? "bg-emerald-400" :
                              item.progress > 0 ? "bg-gold" : "bg-transparent"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{item.progress}%</span>
                      </div>
                      {item.stage && <div className="mt-1.5 text-[10px] text-muted-foreground">{item.stage}</div>}
                      {item.platforms.length > 0 && (
                        <div className="mt-2 flex gap-1.5">
                          {item.platforms.map((p) => (
                            <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-ice-blue/10 text-ice-blue">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ─── 发布监控Tab（新增） ─── */}
              {activeTab === "publish-monitor" && (
                <div className="space-y-4">
                  {/* 发布状态概览 */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "成功", value: publishStats.success, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { label: "限流", value: publishStats.rateLimited, color: "text-amber-400", bg: "bg-amber-400/10" },
                      { label: "重试中", value: publishStats.retrying, color: "text-gold", bg: "bg-gold/10" },
                      { label: "待发布", value: publishStats.pending, color: "text-ice-blue", bg: "bg-ice-blue/10" },
                      { label: "已跳过", value: publishStats.skipped, color: "text-slate-400", bg: "bg-slate-400/10" },
                      { label: "失败", value: publishStats.failed, color: "text-red-400", bg: "bg-red-400/10" },
                    ].map((s) => (
                      <div key={s.label} className={`p-2 rounded-lg ${s.bg} text-center`}>
                        <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-[10px] text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* 各平台发布状态列表 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">EP-0320-01 · 古埃及金字塔建造之谜 · 各平台发布状态</span>
                      <button className="px-2 py-1 rounded-md bg-gold/10 text-gold text-[10px] font-medium hover:bg-gold/20 transition-colors flex items-center gap-1">
                        <RefreshCw size={10} /> 刷新状态
                      </button>
                    </div>

                    {mockPublishMonitor.map((item) => (
                      <div
                        key={item.platform}
                        className={`p-3 rounded-lg bg-[#12141f] border transition-colors ${
                          item.status === "rate-limited" ? "border-amber-400/30" :
                          item.status === "retrying" ? "border-gold/30" :
                          item.status === "failed" ? "border-red-400/30" :
                          "border-border/15 hover:border-border/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{item.icon}</span>
                            <span className="text-sm font-medium text-foreground">{item.platform}</span>
                            <StatusBadge status={item.status} />
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === "rate-limited" && (
                              <button className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[10px] flex items-center gap-1 hover:bg-amber-400/20 transition-colors">
                                <Timer size={9} /> {item.nextRetry} 重试
                              </button>
                            )}
                            {item.status === "retrying" && (
                              <span className="text-[10px] text-gold flex items-center gap-1">
                                <RotateCcw size={9} className="animate-spin" /> 第{item.retryCount}次重试 · {item.nextRetry}
                              </span>
                            )}
                            {item.status === "success" && (
                              <span className="text-[10px] text-muted-foreground">{item.publishTime} 发布</span>
                            )}
                            {item.status === "pending" && (
                              <span className="text-[10px] text-ice-blue flex items-center gap-1">
                                <Clock size={9} /> {item.publishTime}
                              </span>
                            )}
                            {item.status === "skipped" && (
                              <button className="px-2 py-0.5 rounded bg-[#1a1d2e] text-muted-foreground text-[10px] flex items-center gap-1 hover:text-foreground transition-colors">
                                <RotateCcw size={9} /> 手动重试
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 错误信息 */}
                        {item.errorMsg && (
                          <div className="text-[10px] text-amber-400/80 bg-amber-400/5 px-2 py-1 rounded mt-1.5 flex items-center gap-1.5">
                            <AlertTriangle size={10} className="shrink-0" />
                            {item.errorMsg}
                          </div>
                        )}

                        {/* API配额进度条 */}
                        {item.apiQuota && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground w-16 shrink-0">API配额</span>
                            <div className="flex-1 h-1.5 rounded-full bg-[#1a1d2e] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.apiQuota.used / item.apiQuota.total > 0.9 ? "bg-red-400" :
                                  item.apiQuota.used / item.apiQuota.total > 0.7 ? "bg-amber-400" :
                                  "bg-emerald-400"
                                }`}
                                style={{ width: `${Math.min(100, (item.apiQuota.used / item.apiQuota.total) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground w-20 text-right">
                              {item.apiQuota.used}/{item.apiQuota.total}
                              {item.rateLimit && (
                                <span className="text-amber-400 ml-1">· {item.rateLimit.resetIn}</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 底部操作 */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-[10px] font-medium hover:bg-gold/20 transition-colors flex items-center gap-1.5">
                      <RotateCcw size={10} /> 重试所有失败项
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-[#12141f] text-muted-foreground text-[10px] hover:text-foreground transition-colors flex items-center gap-1.5">
                      <Ban size={10} /> 跳过限流平台
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-[#12141f] text-muted-foreground text-[10px] hover:text-foreground transition-colors flex items-center gap-1.5">
                      <Upload size={10} /> 转入手动队列
                    </button>
                  </div>
                </div>
              )}

              {/* ─── 手动发布Tab ─── */}
              {activeTab === "manual" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-gold/5 border border-gold/20 mb-4">
                    <p className="text-xs text-gold leading-relaxed">
                      以下平台不支持API自动发布（或因限流转入手动队列）。系统已自动准备好视频文件和文案，
                      您只需点击"一键复制"，然后到对应平台粘贴即可，每个平台约2-3分钟。
                    </p>
                  </div>
                  {mockManualQueue.map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#12141f] border border-border/15 hover:border-border/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-foreground">{item.platform}</div>
                            <div className="text-[10px] text-muted-foreground">{item.title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400">{item.status}</span>
                          <button className="px-2.5 py-1 rounded-md bg-ice-blue/10 text-ice-blue text-[10px] font-medium hover:bg-ice-blue/20 transition-colors flex items-center gap-1">
                            <Copy size={10} /> {item.action}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2.5 flex gap-2">
                        <button className="px-2 py-1 rounded bg-[#1a1d2e] text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                          <Eye size={10} /> 预览视频
                        </button>
                        <button className="px-2 py-1 rounded bg-[#1a1d2e] text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                          <FolderOpen size={10} /> 打开文件夹
                        </button>
                        <button className="px-2 py-1 rounded bg-[#1a1d2e] text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                          <ExternalLink size={10} /> 打开平台
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-[#12141f] border border-border/10">
                    <div className="text-xs text-muted-foreground mb-2">本地文件结构：</div>
                    <pre className="text-[10px] text-ice-blue/80 font-mono leading-relaxed">{`~/aeonstory/output/20260320/
├── bilibili/
│   ├── 古埃及金字塔_横屏_1080p.mp4
│   ├── 标题描述标签.txt
│   └── 封面.jpg
├── xiaohongshu/
│   ├── 古埃及金字塔_竖屏_1080p.mp4
│   └── 标题描述标签.txt
└── reddit/
    ├── pyramids_highlight_60s.mp4
    └── post_copy_en.txt`}</pre>
                  </div>
                </div>
              )}

              {/* ─── 已发布Tab ─── */}
              {activeTab === "published" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12141f] border border-border/20">
                      <Search size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">搜索已发布内容...</span>
                    </div>
                    <select className="px-2 py-1.5 rounded-lg bg-[#12141f] border border-border/20 text-xs text-muted-foreground">
                      <option>全部平台</option>
                      <option>YouTube</option>
                      <option>TikTok</option>
                      <option>Instagram</option>
                    </select>
                  </div>
                  {[
                    { title: "古埃及金字塔建造之谜", date: "2026-03-20 10:00", platforms: ["YouTube", "TikTok", "Instagram"], views: "8.2K", likes: "523", comments: "89" },
                    { title: "维京人发现美洲大陆", date: "2026-03-20 12:00", platforms: ["YouTube", "Facebook"], views: "4.1K", likes: "367", comments: "67" },
                    { title: "丝绸之路的兴衰", date: "2026-03-19 10:00", platforms: ["YouTube", "TikTok", "Instagram", "Facebook"], views: "15.7K", likes: "1.2K", comments: "234" },
                    { title: "罗马帝国的衰亡", date: "2026-03-18 10:00", platforms: ["YouTube", "TikTok"], views: "22.3K", likes: "1.8K", comments: "412" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#12141f] border border-border/15 hover:border-border/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{item.date}</div>
                        </div>
                        <button className="px-2 py-1 rounded bg-ice-blue/10 text-ice-blue text-[10px] flex items-center gap-1">
                          <Eye size={10} /> 查看详情
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          {item.platforms.map((p) => (
                            <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-ice-blue/10 text-ice-blue">{p}</span>
                          ))}
                        </div>
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye size={10} /> {item.views}</span>
                          <span className="flex items-center gap-1"><ThumbsUp size={10} /> {item.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle size={10} /> {item.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══ 限流应对策略（新增） ═══ */}
        <div className="max-w-5xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] mb-4">
              六大 <span className="text-gradient-gold">限流应对</span> 策略
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              各平台发布速度不一致是常态，系统内置智能应对机制，确保内容最终全部成功发布
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rateLimitStrategies.map((strategy, i) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group p-5 rounded-xl border border-border/20 bg-card/10 hover:bg-card/20 hover:border-border/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-card/50 border border-border/30 flex items-center justify-center group-hover:border-gold/30 transition-colors">
                    <strategy.icon className={strategy.color} size={18} />
                  </div>
                  <h4 className="font-semibold font-[var(--font-display)] text-foreground">{strategy.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{strategy.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 进度不一致处理流程 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-5 rounded-xl border border-amber-400/20 bg-amber-400/5"
          >
            <h4 className="font-semibold font-[var(--font-display)] text-amber-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} />
              当各平台进度不一致时，系统如何处理？
            </h4>
            <div className="space-y-3">
              {[
                { step: "1", title: "独立队列", desc: "每个平台有独立的发布队列，互不阻塞。YouTube发布成功不会等待TikTok。" },
                { step: "2", title: "状态追踪", desc: "每条视频在每个平台的发布状态独立追踪：成功/限流/重试中/待发布/已跳过。" },
                { step: "3", title: "自动重试", desc: "限流的平台自动进入指数退避重试（30s→2min→10min→30min→1h），不影响其他平台。" },
                { step: "4", title: "降级转手动", desc: "连续失败3次的平台，该视频自动转入「手动发布队列」，同时Telegram通知您。" },
                { step: "5", title: "日报汇总", desc: "每晚22:00自动生成发布日报：哪些成功、哪些限流、哪些需要手动处理，推送到Telegram。" },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══ 七大功能模块 ═══ */}
        <div className="max-w-5xl mx-auto mb-20">
          <h3 className="text-xl font-semibold font-[var(--font-display)] mb-8 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-ice-blue" />
            七大功能模块
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardModules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group p-5 rounded-xl border border-border/20 bg-card/10 hover:bg-card/20 hover:border-border/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-card/50 border border-border/30 flex items-center justify-center group-hover:border-gold/30 transition-colors">
                    <mod.icon className={mod.color} size={18} />
                  </div>
                  <h4 className="font-semibold font-[var(--font-display)] text-foreground">{mod.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{mod.desc}</p>
                <div className="text-xs text-gold/60 font-mono">{mod.tech}</div>
              </motion.div>
            ))}
          </div>

          {/* 远程访问 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-5 rounded-xl border border-ice-blue/20 bg-ice-blue/5"
          >
            <h4 className="font-semibold font-[var(--font-display)] text-ice-blue mb-3 flex items-center gap-2">
              <Wifi size={16} />
              远程访问方案 — 不在家也能指挥
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <Lock className="text-green-400 shrink-0 mt-1" size={14} />
                <div>
                  <div className="text-sm font-medium text-foreground">Tailscale（推荐）</div>
                  <div className="text-xs text-muted-foreground">私有网络安全访问，无需公网暴露，手机/笔记本均可连接Mac Studio指挥台</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="text-ice-blue shrink-0 mt-1" size={14} />
                <div>
                  <div className="text-sm font-medium text-foreground">Cloudflare Tunnel</div>
                  <div className="text-xs text-muted-foreground">HTTPS域名访问（如 dashboard.aeonstory.com），配合密码保护</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ 三层内容安全审核 ═══ */}
        <div className="max-w-5xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] mb-4">
              三层内容 <span className="text-gradient-gold">安全审核</span> 机制
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              确保自动发布的内容不触及平台限流红线，敏感内容自动拦截进入人工审核队列
            </p>
          </motion.div>
          <div className="space-y-4">
            {safetyLayers.map((layer, i) => (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-xl border-l-4 ${layer.color} ${layer.bgColor} border border-border/10`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-card/50 border border-border/30 flex items-center justify-center shrink-0">
                    <layer.icon className="text-gold" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-gold/60">{layer.layer}</span>
                      <h4 className="font-semibold font-[var(--font-display)] text-foreground">{layer.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{layer.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs"
          >
            {[
              { label: "生成内容", icon: "📝" },
              { label: "Llama Guard审核", icon: "🛡" },
              { label: "安全？", icon: "❓" },
            ].map((step, i) => (
              <span key={step.label} className="flex items-center gap-1">
                {i > 0 && <ArrowRight className="text-muted-foreground mx-1" size={12} />}
                <span className="px-3 py-1.5 rounded-lg bg-card/30 border border-border/20 text-muted-foreground">
                  {step.icon} {step.label}
                </span>
              </span>
            ))}
            <ArrowRight className="text-muted-foreground mx-1" size={12} />
            <span className="flex flex-col gap-1">
              <span className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1">
                <CheckCircle2 size={10} /> 通过 → 自动发布
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-orange-400/10 border border-orange-400/20 text-orange-400 flex items-center gap-1">
                <AlertOctagon size={10} /> 未通过 → 人工审核
              </span>
            </span>
          </motion.div>
        </div>

        {/* ═══ 用户导出功能 ═══ */}
        <div className="max-w-5xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] mb-4">
              用户一键 <span className="text-gradient-blue">导出</span> 功能
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              支持PDF时间线、视频下载、批量打包和交互式网页导出，差异化驱动付费转化
            </p>
          </motion.div>
          <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 p-3 bg-card/40 border-b border-border/20">
              <div className="text-xs font-semibold text-muted-foreground col-span-1">导出类型</div>
              <div className="text-xs font-semibold text-muted-foreground">免费用户</div>
              <div className="text-xs font-semibold text-muted-foreground">付费用户</div>
              <div className="text-xs font-semibold text-muted-foreground hidden sm:block">说明</div>
            </div>
            {exportFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-4 gap-2 p-3 ${
                  i < exportFeatures.length - 1 ? "border-b border-border/10" : ""
                } hover:bg-card/20 transition-colors`}
              >
                <div className="flex items-center gap-2 col-span-1">
                  <feat.icon className="text-gold shrink-0" size={14} />
                  <span className="text-sm font-medium text-foreground">{feat.title}</span>
                </div>
                <div className={`text-sm ${feat.free === "不支持" ? "text-muted-foreground/50" : "text-foreground/80"}`}>
                  {feat.free}
                </div>
                <div className="text-sm text-gold font-medium">{feat.paid}</div>
                <div className="text-xs text-muted-foreground hidden sm:block">{feat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 移动端策略 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto p-5 rounded-xl border border-border/20 bg-card/10"
        >
          <h4 className="font-semibold font-[var(--font-display)] text-foreground mb-3 flex items-center gap-2">
            <Smartphone size={16} className="text-ice-blue" />
            移动端策略
          </h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-3">
              <Monitor className="text-muted-foreground shrink-0 mt-1" size={14} />
              <div>
                <div className="text-sm font-medium text-foreground">当前阶段：响应式Web</div>
                <div className="text-xs text-muted-foreground">视频消费已被YouTube/TikTok覆盖，网站做好响应式即可</div>
              </div>
            </div>
            <ArrowRight className="text-muted-foreground hidden sm:block self-center" size={16} />
            <div className="flex-1 flex gap-3">
              <Smartphone className="text-ice-blue shrink-0 mt-1" size={14} />
              <div>
                <div className="text-sm font-medium text-foreground">未来阶段：PWA → React Native</div>
                <div className="text-xs text-muted-foreground">5000+付费用户后，先PWA再原生App，代码复用率60-70%</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
