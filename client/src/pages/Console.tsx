import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Play, Square, RefreshCw, Plus, Trash2,
  Film, CheckCircle2, XCircle, Clock,
  Zap, BarChart3, ListChecks, ArrowLeft,
  Settings, Eye, Sparkles, Server, Wifi, WifiOff,
  ThumbsUp, ThumbsDown, Image as ImageIcon, FileText,
  ChevronDown, ChevronUp, ExternalLink, Globe, Share2,
  TrendingUp, Heart, MessageCircle, Users, Link2,
  AlertCircle, Loader2, Activity, Radio,
} from "lucide-react";
import { Link } from "wouter";

// ========== Constants ==========
const CIVILIZATION_OPTIONS = [
  { id: "china", name: "华夏", emoji: "🏯" },
  { id: "egypt", name: "古埃及", emoji: "🏛️" },
  { id: "rome", name: "罗马", emoji: "⚔️" },
  { id: "greece", name: "古希腊", emoji: "🏛️" },
  { id: "india", name: "古印度", emoji: "🕉️" },
  { id: "persia", name: "波斯", emoji: "🏰" },
  { id: "maya", name: "玛雅", emoji: "🌿" },
  { id: "viking", name: "维京", emoji: "🛡️" },
  { id: "mongol", name: "蒙古", emoji: "🏇" },
  { id: "japan", name: "日本", emoji: "⛩️" },
  { id: "ottoman", name: "奥斯曼", emoji: "🌙" },
  { id: "silkroad", name: "丝绸之路", emoji: "🐪" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color?: string }> = {
  pending: { label: "待处理", variant: "secondary" },
  in_progress: { label: "生产中", variant: "default", color: "text-amber-400" },
  completed: { label: "已完成", variant: "outline", color: "text-emerald-400" },
  failed: { label: "失败", variant: "destructive" },
  paused: { label: "已暂停", variant: "secondary" },
  queued: { label: "排队中", variant: "secondary" },
  running: { label: "运行中", variant: "default", color: "text-amber-400" },
  cancelled: { label: "已取消", variant: "secondary" },
  approved: { label: "已通过", variant: "outline", color: "text-emerald-400" },
  rejected: { label: "已打回", variant: "destructive" },
  draft: { label: "草稿", variant: "secondary" },
  scheduled: { label: "已排期", variant: "secondary" },
  publishing: { label: "发布中", variant: "default" },
  published: { label: "已发布", variant: "outline", color: "text-emerald-400" },
  connected: { label: "已连接", variant: "outline", color: "text-emerald-400" },
  disconnected: { label: "未连接", variant: "secondary" },
  error: { label: "异常", variant: "destructive" },
};

const PLATFORM_META: Record<string, { icon: string; color: string; name: string }> = {
  youtube: { icon: "📺", color: "#FF0000", name: "YouTube" },
  tiktok: { icon: "🎵", color: "#000000", name: "TikTok" },
  instagram: { icon: "📸", color: "#E4405F", name: "Instagram" },
  twitter: { icon: "🐦", color: "#1DA1F2", name: "X / Twitter" },
  bilibili: { icon: "📺", color: "#00A1D6", name: "哔哩哔哩" },
  xiaohongshu: { icon: "📕", color: "#FE2C55", name: "小红书" },
  douyin: { icon: "🎶", color: "#000000", name: "抖音" },
  wechat: { icon: "💬", color: "#07C160", name: "微信视频号" },
  facebook: { icon: "📘", color: "#1877F2", name: "Facebook" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// ========== Stats Overview (clickable) ==========
function StatsOverview({ onCardClick }: { onCardClick: (tab: string) => void }) {
  const { data: stats } = trpc.production.stats.useQuery();
  const { data: n8nConfig } = trpc.n8nConfig.get.useQuery();
  const { data: pubStats } = trpc.publication.stats.useQuery();

  const isN8nConfigured = !!(n8nConfig?.baseUrl && n8nConfig?.workflowId);

  const cards = [
    { label: "选题总数", value: stats?.totalTopics ?? 0, icon: ListChecks, color: "text-gold", tab: "topics" },
    { label: "待生产", value: stats?.pendingTopics ?? 0, icon: Clock, color: "text-ice-blue", tab: "topics" },
    { label: "已完成", value: stats?.completed ?? 0, icon: CheckCircle2, color: "text-emerald-400", tab: "preview" },
    { label: "生产中", value: stats?.running ?? 0, icon: Zap, color: "text-amber-400", tab: "history" },
    { label: "已发布", value: pubStats?.published ?? 0, icon: Globe, color: "text-purple-400", tab: "social" },
    { label: "总浏览", value: pubStats?.totalViews ?? 0, icon: TrendingUp, color: "text-rose-400", tab: "social" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <Card
            key={c.label}
            className="bg-card/50 border-border/50 cursor-pointer hover:border-gold/30 hover:bg-card/80 transition-all"
            onClick={() => onCardClick(c.tab)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className={`w-7 h-7 ${c.color}`} />
              <div>
                <p className="text-xl font-bold font-display">{formatNumber(c.value)}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        {isN8nConfigured ? (
          <span className="flex items-center gap-1.5 text-emerald-400"><Wifi className="w-3.5 h-3.5" /> n8n 已连接</span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-400"><WifiOff className="w-3.5 h-3.5" /> n8n 未配置</span>
        )}
      </div>
    </div>
  );
}

// ========== Production Control with REAL-TIME progress ==========
function ProductionControl() {
  const utils = trpc.useUtils();
  const { data: running, isLoading: runningLoading } = trpc.production.getRunning.useQuery(undefined, {
    refetchInterval: 2000,
  });
  const { data: steps } = trpc.production.steps.useQuery();
  const { data: logs } = trpc.production.getLogs.useQuery(
    { productionId: running?.id ?? 0 },
    { enabled: !!running, refetchInterval: 1500 }
  );
  const { data: allTopics } = trpc.topic.list.useQuery({});
  const { data: recentProds } = trpc.production.list.useQuery({ limit: 5 });

  const triggerMutation = trpc.production.trigger.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        const msg = result.n8nTriggered
          ? `已启动「${result.topicTitle}」- n8n工作流已触发`
          : `已创建「${result.topicTitle}」任务（n8n未连接，需手动执行）`;
        toast.success(msg);
        utils.production.getRunning.invalidate();
        utils.production.stats.invalidate();
        utils.topic.list.invalidate();
        utils.production.list.invalidate();
      } else {
        toast.error(result.error ?? "启动失败");
      }
    },
    onError: () => toast.error("启动失败"),
  });

  const finishMutation = trpc.production.finish.useMutation({
    onSuccess: () => {
      toast.success("已停止");
      utils.production.getRunning.invalidate();
      utils.production.stats.invalidate();
      utils.production.list.invalidate();
    },
  });

  const progress = running ? (running.completedSteps / running.totalSteps) * 100 : 0;
  const topicTitle = running ? allTopics?.find(t => t.id === running.topicId)?.title ?? `选题 #${running.topicId}` : "";

  // Elapsed time
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    if (!running?.startedAt) { setElapsed(""); return; }
    const timer = setInterval(() => {
      const diff = Date.now() - new Date(running.startedAt!).getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(`${mins}:${String(secs).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [running?.startedAt]);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Film className="w-5 h-5 text-gold" />
            生产控制台
            {running && (
              <span className="flex items-center gap-1 text-xs font-normal text-amber-400">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {running ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => finishMutation.mutate({ productionId: running.id, status: "cancelled" })}
              >
                <Square className="w-4 h-4 mr-1" /> 停止生产
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-gold text-deep-navy hover:bg-gold/90"
                onClick={() => triggerMutation.mutate({})}
                disabled={triggerMutation.isPending}
              >
                {triggerMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> 启动中...</>
                ) : (
                  <><Play className="w-4 h-4 mr-1" /> 开始生产</>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => {
              utils.production.getRunning.invalidate();
              utils.production.list.invalidate();
            }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {running ? (
          <div className="space-y-4">
            {/* Current task info */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">正在生产：</span>
                <span className="font-medium text-gold ml-1">{topicTitle}</span>
              </div>
              {elapsed && (
                <span className="text-xs text-muted-foreground font-mono">
                  <Clock className="w-3 h-3 inline mr-1" />{elapsed}
                </span>
              )}
            </div>

            {/* Main progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  步骤 {running.completedSteps + 1}/{running.totalSteps}：
                  <span className="text-foreground ml-1">{running.currentStepName}</span>
                </span>
                <span className="text-gold font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3" />
                <div
                  className="absolute top-0 left-0 h-3 rounded-full bg-gold/20 animate-pulse"
                  style={{ width: `${Math.min(progress + 8, 100)}%` }}
                />
              </div>
            </div>

            {/* Step grid with status */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-1.5">
              {steps?.map((step) => {
                const log = logs?.find(l => l.stepNumber === step.number);
                const isActive = running.completedSteps + 1 === step.number;
                const isDone = log?.status === "completed";
                const isFailed = log?.status === "failed";
                const isRunning = log?.status === "running";
                return (
                  <div
                    key={step.number}
                    className={`relative text-center p-2 rounded-lg text-xs transition-all ${
                      isActive || isRunning
                        ? "bg-gold/20 border-2 border-gold/60 ring-2 ring-gold/20 shadow-lg shadow-gold/10"
                        : isDone
                        ? "bg-emerald-500/15 border border-emerald-500/40"
                        : isFailed
                        ? "bg-red-500/15 border border-red-500/40"
                        : "bg-muted/20 border border-border/30 opacity-50"
                    }`}
                  >
                    {(isActive || isRunning) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-ping" />
                    )}
                    <div className="text-lg">{step.icon}</div>
                    <div className={`mt-1 truncate leading-tight ${
                      isActive || isRunning ? "text-gold font-semibold" :
                      isDone ? "text-emerald-400" :
                      "text-muted-foreground"
                    }`}>
                      {step.name.slice(0, 4)}
                    </div>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 mx-auto mt-0.5" />}
                    {isFailed && <XCircle className="w-3 h-3 text-red-400 mx-auto mt-0.5" />}
                    {(isActive || isRunning) && <Loader2 className="w-3 h-3 text-gold mx-auto mt-0.5 animate-spin" />}
                  </div>
                );
              })}
            </div>

            {/* Step log details */}
            {logs && logs.length > 0 && (
              <div className="mt-3 max-h-32 overflow-y-auto rounded-lg bg-muted/10 border border-border/30 p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-1">执行日志：</p>
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      log.status === "completed" ? "bg-emerald-400" :
                      log.status === "failed" ? "bg-red-400" :
                      log.status === "running" ? "bg-gold animate-pulse" :
                      "bg-muted-foreground"
                    }`} />
                    <span className="text-muted-foreground w-6">{String(log.stepNumber).padStart(2, "0")}</span>
                    <span className="flex-1 truncate">{log.stepName}</span>
                    {log.durationMs && <span className="text-muted-foreground">{(log.durationMs / 1000).toFixed(1)}s</span>}
                    <StatusBadge status={log.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6 text-muted-foreground">
              <Film className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">当前没有运行中的生产任务</p>
              <p className="text-xs mt-1">点击"开始生产"自动取下一个待处理选题</p>
            </div>

            {/* Recent productions mini-list */}
            {recentProds && recentProds.length > 0 && (
              <div className="border-t border-border/30 pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">最近生产：</p>
                <div className="space-y-1.5">
                  {recentProds.slice(0, 3).map((prod) => {
                    const title = allTopics?.find(t => t.id === prod.topicId)?.title ?? `#${prod.topicId}`;
                    return (
                      <div key={prod.id} className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/10">
                        <span className="flex-1 truncate">{title}</span>
                        <Progress value={(prod.completedSteps / prod.totalSteps) * 100} className="w-16 h-1.5" />
                        <StatusBadge status={prod.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== Topic Manager ==========
function TopicManager() {
  const utils = trpc.useUtils();
  const { data: allTopics, isLoading } = trpc.topic.list.useQuery({});
  const createMutation = trpc.topic.create.useMutation({
    onSuccess: () => {
      toast.success("选题已添加");
      utils.topic.list.invalidate();
      utils.production.stats.invalidate();
      setShowForm(false);
      resetForm();
    },
  });
  const deleteMutation = trpc.topic.delete.useMutation({
    onSuccess: () => {
      toast.success("选题已删除");
      utils.topic.list.invalidate();
      utils.production.stats.invalidate();
    },
  });
  const triggerMutation = trpc.production.trigger.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`已开始生产「${result.topicTitle}」`);
        utils.production.getRunning.invalidate();
        utils.production.stats.invalidate();
        utils.topic.list.invalidate();
      } else {
        toast.error(result.error ?? "启动失败");
      }
    },
  });
  const aiGenerateMutation = trpc.topic.aiGenerate.useMutation({
    onSuccess: (result) => {
      toast.success(`AI已生成 ${result.count} 个选题`);
      utils.topic.list.invalidate();
      utils.production.stats.invalidate();
      setShowAiPanel(false);
    },
    onError: (err) => toast.error(`AI生成失败: ${err.message}`),
  });

  const [showForm, setShowForm] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [form, setForm] = useState({ title: "", civilizationId: "china", civilization: "华夏", period: "", description: "" });
  const [aiForm, setAiForm] = useState({ count: 10, civilizationId: "", civilization: "", theme: "" });
  const [filter, setFilter] = useState<string>("all");

  const resetForm = () => setForm({ title: "", civilizationId: "china", civilization: "华夏", period: "", description: "" });

  const filteredTopics = useMemo(() => {
    if (!allTopics) return [];
    if (filter === "all") return allTopics;
    return allTopics.filter(t => t.status === filter);
  }, [allTopics, filter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("请输入选题标题");
    createMutation.mutate(form);
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-gold" />
            选题管理
            <Badge variant="secondary" className="text-xs">{allTopics?.length ?? 0}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAiPanel(!showAiPanel)}>
              <Sparkles className="w-4 h-4 mr-1" /> AI批量生成
            </Button>
            <Button size="sm" className="bg-gold text-deep-navy hover:bg-gold/90" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-1" /> 添加选题
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Generate Panel */}
        {showAiPanel && (
          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-3">
            <p className="text-sm font-medium text-purple-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> AI智能选题生成
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">数量</label>
                <input type="number" min={1} max={50} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={aiForm.count} onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">文明（可选）</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={aiForm.civilizationId} onChange={(e) => {
                  const civ = CIVILIZATION_OPTIONS.find(c => c.id === e.target.value);
                  setAiForm({ ...aiForm, civilizationId: e.target.value, civilization: civ?.name ?? "" });
                }}>
                  <option value="">全部文明</option>
                  {CIVILIZATION_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">主题方向（可选）</label>
                <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="如：战争、科技、神秘事件" value={aiForm.theme} onChange={(e) => setAiForm({ ...aiForm, theme: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAiPanel(false)}>取消</Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => aiGenerateMutation.mutate(aiForm)} disabled={aiGenerateMutation.isPending}>
                {aiGenerateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> 生成中...</> : <><Sparkles className="w-4 h-4 mr-1" /> 生成 {aiForm.count} 个选题</>}
              </Button>
            </div>
          </div>
        )}

        {/* Manual add form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 rounded-lg border border-gold/30 bg-gold/5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">标题</label>
                <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="如：庞贝古城的最后一天" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">文明</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={form.civilizationId} onChange={(e) => {
                  const civ = CIVILIZATION_OPTIONS.find(c => c.id === e.target.value);
                  setForm({ ...form, civilizationId: e.target.value, civilization: civ?.name ?? "" });
                }}>
                  {CIVILIZATION_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">时间段</label>
                <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="如：公元79年" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">简介</label>
                <textarea className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-16 resize-none" placeholder="选题简介..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>取消</Button>
              <Button type="submit" size="sm" className="bg-gold text-deep-navy hover:bg-gold/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "添加中..." : "添加选题"}
              </Button>
            </div>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {[
            { key: "all", label: "全部" },
            { key: "pending", label: "待生产" },
            { key: "in_progress", label: "生产中" },
            { key: "completed", label: "已完成" },
            { key: "failed", label: "失败" },
          ].map(f => (
            <Button key={f.key} variant={filter === f.key ? "default" : "outline"} size="sm" className="text-xs h-7" onClick={() => setFilter(f.key)}>
              {f.label}
            </Button>
          ))}
        </div>

        {/* Topic list */}
        {isLoading ? (
          <div className="text-center py-6"><Loader2 className="w-6 h-6 mx-auto animate-spin text-gold" /></div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">暂无选题</div>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {filteredTopics.map((topic) => {
              const civ = CIVILIZATION_OPTIONS.find(c => c.id === topic.civilizationId);
              return (
                <div key={topic.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30 hover:border-border/60 transition-colors group">
                  <span className="text-lg">{civ?.emoji ?? "🌍"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{topic.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {topic.civilization} · {topic.period || "未指定时期"}
                    </p>
                  </div>
                  <StatusBadge status={topic.status} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {topic.status === "pending" && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => triggerMutation.mutate({ topicId: topic.id })}>
                        <Play className="w-3 h-3 mr-1" /> 生产
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => {
                      if (confirm(`确定删除「${topic.title}」？`)) deleteMutation.mutate({ id: topic.id });
                    }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== Production Preview & Review ==========
function ProductionPreview() {
  const utils = trpc.useUtils();
  const { data: completedProds } = trpc.production.completed.useQuery({ limit: 20 });
  const { data: allTopics } = trpc.topic.list.useQuery({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const reviewMutation = trpc.production.review.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.action === "approve" ? "已通过，准备发布" : "已打回，选题将重新排队");
      utils.production.completed.invalidate();
      utils.production.stats.invalidate();
      utils.topic.list.invalidate();
    },
  });

  const publishAllMutation = trpc.publication.publishToAll.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`已创建 ${result.count} 个发布任务`);
        utils.publication.list.invalidate();
        utils.publication.stats.invalidate();
      } else {
        toast.error(result.error ?? "发布失败");
      }
    },
  });

  const getTopicInfo = (topicId: number) => {
    const topic = allTopics?.find(t => t.id === topicId);
    return { title: topic?.title ?? `选题 #${topicId}`, emoji: CIVILIZATION_OPTIONS.find(c => c.id === topic?.civilizationId)?.emoji ?? "🌍" };
  };

  if (!completedProds || completedProds.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>暂无已完成的成品</p>
          <p className="text-sm mt-1">生产完成后，成品将在这里等待审核</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Eye className="w-5 h-5 text-gold" />
          成品预览与审核
          <Badge variant="secondary">{completedProds.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {completedProds.map((prod) => {
          const isExpanded = expandedId === prod.id;
          const { title, emoji } = getTopicInfo(prod.topicId);
          const images = (prod.imagesJson as string[] | null) ?? [];
          const copy = prod.copyJson as Record<string, any> | null;
          const reviewStatus = prod.reviewStatus ?? "pending";

          return (
            <div key={prod.id} className="rounded-lg border border-border/50 overflow-hidden">
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/10 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : prod.id)}
              >
                <span className="text-lg">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {prod.completedAt ? new Date(prod.completedAt).toLocaleString("zh-CN") : ""}
                  </p>
                </div>
                {reviewStatus !== "pending" && <StatusBadge status={reviewStatus} />}
                <StatusBadge status={prod.status} />
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {isExpanded && (
                <div className="border-t border-border/30 p-4 space-y-4 bg-muted/5">
                  {prod.videoUrl && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><Film className="w-4 h-4 text-gold" /> 视频预览</h5>
                      <div className="rounded-lg overflow-hidden bg-black aspect-video">
                        <video src={prod.videoUrl} controls className="w-full h-full" poster={prod.thumbnailUrl ?? undefined} />
                      </div>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><ImageIcon className="w-4 h-4 text-purple-400" /> 场景图 ({images.length}张)</h5>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {images.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`场景 ${i + 1}`} className="rounded-md aspect-video object-cover hover:ring-2 ring-gold/50 transition-all" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {copy && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><FileText className="w-4 h-4 text-emerald-400" /> 平台文案</h5>
                      <div className="space-y-2 text-sm">
                        {Object.entries(copy).map(([platform, text]) => (
                          <div key={platform} className="p-2 rounded-md bg-muted/20 border border-border/30">
                            <span className="text-xs font-medium text-gold uppercase">{platform}</span>
                            <p className="text-muted-foreground mt-1 whitespace-pre-wrap text-xs">{String(text).slice(0, 200)}{String(text).length > 200 ? "..." : ""}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!prod.videoUrl && !prod.thumbnailUrl && images.length === 0 && !copy && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <p>成品资源尚未上报</p>
                      <p className="text-xs mt-1">n8n流水线完成后会自动上报视频、图片和文案</p>
                    </div>
                  )}

                  {/* Review + Publish actions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border/30 flex-wrap">
                    {reviewStatus === "pending" && (
                      <>
                        <span className="text-sm text-muted-foreground">审核：</span>
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => {
                          const note = prompt("打回原因（可选）：");
                          reviewMutation.mutate({ productionId: prod.id, action: "reject", note: note ?? undefined });
                        }}>
                          <ThumbsDown className="w-4 h-4 mr-1" /> 打回
                        </Button>
                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => reviewMutation.mutate({ productionId: prod.id, action: "approve" })}>
                          <ThumbsUp className="w-4 h-4 mr-1" /> 通过
                        </Button>
                      </>
                    )}
                    {reviewStatus === "approved" && (
                      <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => publishAllMutation.mutate({ productionId: prod.id })} disabled={publishAllMutation.isPending}>
                        <Share2 className="w-4 h-4 mr-1" /> 一键发布到所有平台
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ========== Social Media Manager ==========
function SocialMediaManager() {
  const utils = trpc.useUtils();
  const { data: accounts, isLoading } = trpc.social.list.useQuery();
  const { data: platforms } = trpc.social.platforms.useQuery();
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ platform: "youtube", accountName: "", apiConfig: {} as Record<string, string> });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editConfig, setEditConfig] = useState<Record<string, string>>({});

  const createMutation = trpc.social.create.useMutation({
    onSuccess: () => {
      toast.success("账号已添加");
      utils.social.list.invalidate();
      setShowAdd(false);
      setAddForm({ platform: "youtube", accountName: "", apiConfig: {} });
    },
  });

  const updateMutation = trpc.social.update.useMutation({
    onSuccess: () => {
      toast.success("配置已更新");
      utils.social.list.invalidate();
      setEditingId(null);
    },
  });

  const deleteMutation = trpc.social.delete.useMutation({
    onSuccess: () => {
      toast.success("账号已删除");
      utils.social.list.invalidate();
    },
  });

  const testMutation = trpc.social.testConnection.useMutation({
    onSuccess: (result) => {
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      utils.social.list.invalidate();
    },
  });

  const currentPlatformFields = platforms?.find(p => p.id === addForm.platform)?.apiFields ?? [];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            社交媒体账号
            <Badge variant="secondary">{accounts?.length ?? 0}</Badge>
          </CardTitle>
          <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4 mr-1" /> 添加账号
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add account form */}
        {showAdd && (
          <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">平台</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={addForm.platform} onChange={(e) => setAddForm({ ...addForm, platform: e.target.value, apiConfig: {} })}>
                  {platforms?.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">账号名称</label>
                <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="如：AeonStory历史频道" value={addForm.accountName} onChange={(e) => setAddForm({ ...addForm, accountName: e.target.value })} />
              </div>
            </div>
            {currentPlatformFields.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">API 配置（可稍后填写）：</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentPlatformFields.map(field => (
                    <div key={field}>
                      <label className="text-xs text-muted-foreground mb-0.5 block">{field}</label>
                      <input className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs font-mono" type="password" placeholder={`输入 ${field}`} value={addForm.apiConfig[field] ?? ""} onChange={(e) => setAddForm({ ...addForm, apiConfig: { ...addForm.apiConfig, [field]: e.target.value } })} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>取消</Button>
              <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => createMutation.mutate(addForm)} disabled={!addForm.accountName || createMutation.isPending}>
                {createMutation.isPending ? "添加中..." : "添加账号"}
              </Button>
            </div>
          </div>
        )}

        {/* Account list */}
        {isLoading ? (
          <div className="text-center py-6"><Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-400" /></div>
        ) : !accounts || accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">还没有添加社交媒体账号</p>
            <p className="text-xs mt-1">点击"添加账号"配置你的YouTube、TikTok等平台</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => {
              const meta = PLATFORM_META[account.platform] ?? { icon: "🌐", color: "#666", name: account.platform };
              const isEditing = editingId === account.id;
              const config = (account.apiConfig as Record<string, string> | null) ?? {};
              const platformDef = platforms?.find(p => p.id === account.platform);
              const fields = platformDef?.apiFields ?? [];

              return (
                <div key={account.id} className="rounded-lg border border-border/50 overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{account.accountName}</p>
                      <p className="text-xs text-muted-foreground">{meta.name} {account.accountId ? `· ${account.accountId}` : ""}</p>
                    </div>
                    {account.followerCount ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {formatNumber(account.followerCount)}
                      </span>
                    ) : null}
                    <StatusBadge status={account.status} />
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => testMutation.mutate({ id: account.id })} disabled={testMutation.isPending}>
                        <Activity className="w-3 h-3 mr-1" /> 测试
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                        if (isEditing) { setEditingId(null); } else { setEditingId(account.id); setEditConfig(config); }
                      }}>
                        <Settings className="w-3 h-3 mr-1" /> 配置
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400" onClick={() => {
                        if (confirm(`确定删除「${account.accountName}」？`)) deleteMutation.mutate({ id: account.id });
                      }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="border-t border-border/30 p-3 bg-muted/5 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">API 配置：</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {fields.map(field => (
                          <div key={field}>
                            <label className="text-xs text-muted-foreground mb-0.5 block">{field}</label>
                            <input className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs font-mono" type="password" placeholder={field} value={editConfig[field] ?? ""} onChange={(e) => setEditConfig({ ...editConfig, [field]: e.target.value })} />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>取消</Button>
                        <Button size="sm" className="bg-gold text-deep-navy hover:bg-gold/90" onClick={() => updateMutation.mutate({ id: account.id, apiConfig: editConfig })}>
                          保存配置
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== Publication Monitor ==========
function PublicationMonitor() {
  const { data: pubs } = trpc.publication.list.useQuery({ limit: 50 });
  const { data: pubStats } = trpc.publication.stats.useQuery();
  const { data: accounts } = trpc.social.list.useQuery();

  const getAccountName = (id: number) => accounts?.find(a => a.id === id)?.accountName ?? "";

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-rose-400" />
          发布监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        {pubStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
              <p className="text-xl font-bold text-gold">{pubStats.published ?? 0}</p>
              <p className="text-xs text-muted-foreground">已发布</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
              <p className="text-xl font-bold text-ice-blue">{formatNumber(pubStats.totalViews ?? 0)}</p>
              <p className="text-xs text-muted-foreground">总浏览</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
              <p className="text-xl font-bold text-rose-400">{formatNumber(pubStats.totalLikes ?? 0)}</p>
              <p className="text-xs text-muted-foreground">总点赞</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
              <p className="text-xl font-bold text-emerald-400">{formatNumber(pubStats.totalComments ?? 0)}</p>
              <p className="text-xs text-muted-foreground">总评论</p>
            </div>
          </div>
        )}

        {/* Publication list */}
        {!pubs || pubs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Share2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>暂无发布记录</p>
            <p className="text-xs mt-1">在成品预览中通过审核后，点击"一键发布"</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {pubs.map((pub) => {
              const meta = PLATFORM_META[pub.platform] ?? { icon: "🌐", name: pub.platform };
              return (
                <div key={pub.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30">
                  <span className="text-lg">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pub.title || `发布 #${pub.id}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.name} · {getAccountName(pub.socialAccountId)}
                      {pub.publishedAt ? ` · ${new Date(pub.publishedAt).toLocaleDateString("zh-CN")}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {formatNumber(pub.views ?? 0)}</span>
                    <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {formatNumber(pub.likes ?? 0)}</span>
                    <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {formatNumber(pub.comments ?? 0)}</span>
                  </div>
                  <StatusBadge status={pub.status} />
                  {pub.externalUrl && (
                    <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-gold" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== Production History ==========
function ProductionHistory() {
  const { data: prods } = trpc.production.list.useQuery({ limit: 20 });
  const { data: allTopics } = trpc.topic.list.useQuery({});

  const getTopicTitle = (topicId: number) => allTopics?.find(t => t.id === topicId)?.title ?? `选题 #${topicId}`;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gold" />
          生产历史
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(prods?.length ?? 0) === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">暂无生产记录</div>
        ) : (
          <div className="space-y-2">
            {prods?.map((prod) => (
              <div key={prod.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{getTopicTitle(prod.topicId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {prod.completedSteps}/{prod.totalSteps} 步 · {prod.createdAt ? new Date(prod.createdAt).toLocaleString("zh-CN") : ""}
                  </p>
                </div>
                <StatusBadge status={prod.status} />
                <div className="w-20">
                  <Progress value={(prod.completedSteps / prod.totalSteps) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== N8N Settings ==========
function N8nSettings() {
  const utils = trpc.useUtils();
  const { data: config } = trpc.n8nConfig.get.useQuery();
  const [form, setForm] = useState({ baseUrl: "", apiKey: "", workflowId: "" });
  const [initialized, setInitialized] = useState(false);

  if (config && !initialized) {
    setForm({ baseUrl: config.baseUrl, apiKey: config.apiKey, workflowId: config.workflowId });
    setInitialized(true);
  }

  const saveMutation = trpc.n8nConfig.save.useMutation({
    onSuccess: () => { toast.success("n8n配置已保存"); utils.n8nConfig.get.invalidate(); },
  });

  const testMutation = trpc.n8nConfig.test.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        if (result.workflows.length > 0 && !form.workflowId) {
          setForm({ ...form, workflowId: result.workflows[0].id });
        }
      } else {
        toast.error(result.message);
      }
    },
  });

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Server className="w-5 h-5 text-ice-blue" />
          n8n 连接配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-muted-foreground">
          <p>配置Mac Studio上运行的n8n地址，让指挥中心远程触发生产流水线。</p>
          <p className="mt-1 text-xs">推荐 Tailscale 内网地址（如 <code className="text-ice-blue">http://100.x.x.x:5678</code>）</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">n8n 地址</label>
            <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="http://100.x.x.x:5678" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">API Key（可选）</label>
            <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" type="password" placeholder="n8n API Key" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">工作流 ID</label>
            <input className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" placeholder="如 JMZr7Wb4Wgv1TUuE" value={form.workflowId} onChange={(e) => setForm({ ...form, workflowId: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => testMutation.mutate({ baseUrl: form.baseUrl, apiKey: form.apiKey || undefined })} disabled={!form.baseUrl || testMutation.isPending}>
            {testMutation.isPending ? "测试中..." : "测试连接"}
          </Button>
          <Button size="sm" className="bg-gold text-deep-navy hover:bg-gold/90" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "保存中..." : "保存配置"}
          </Button>
        </div>
        {testMutation.data?.workflows && testMutation.data.workflows.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm font-medium text-emerald-400 mb-2">发现的工作流：</p>
            <div className="space-y-1">
              {testMutation.data.workflows.map((w: any) => (
                <div key={w.id} className={`flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer transition-colors ${form.workflowId === w.id ? "bg-gold/10 border border-gold/30" : "hover:bg-muted/20"}`} onClick={() => setForm({ ...form, workflowId: w.id })}>
                  <div className={`w-2 h-2 rounded-full ${w.active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                  <span className="flex-1">{w.name}</span>
                  <span className="text-xs text-muted-foreground">{w.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== Main Console Page ==========
export default function Console() {
  const [activeTab, setActiveTab] = useState("topics");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" /> 首页
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-display font-bold">
              <span className="text-gradient-gold">AeonStory</span>{" "}
              <span className="text-muted-foreground font-normal">指挥中心</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            系统在线
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 space-y-6">
        <StatsOverview onCardClick={setActiveTab} />
        <ProductionControl />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/30 border border-border/50 flex-wrap h-auto gap-0.5 p-1">
            <TabsTrigger value="topics" className="gap-1.5 text-xs sm:text-sm">
              <ListChecks className="w-4 h-4" /> 选题管理
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-xs sm:text-sm">
              <Eye className="w-4 h-4" /> 成品预览
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5 text-xs sm:text-sm">
              <Globe className="w-4 h-4" /> 社交媒体
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" /> 生产历史
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
              <Settings className="w-4 h-4" /> 设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="mt-4">
            <TopicManager />
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <ProductionPreview />
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="space-y-6">
              <SocialMediaManager />
              <PublicationMonitor />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ProductionHistory />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <N8nSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
