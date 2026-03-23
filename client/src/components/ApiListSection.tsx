import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { Cloud, HardDrive, Check, X as XIcon, Database, FileText, Mic, Palette, Video, Scissors, Globe, CreditCard, Search, Server } from "lucide-react";

interface Props { onVisible: () => void; }

interface ApiItem {
  id: number;
  name: string;
  purpose: string;
  category: string;
  cloudCost: string;
  localAlternative: string | null;
  localCost: string;
  canReplace: boolean;
}

const apis: ApiItem[] = [
  // 数据采集
  { id: 1, name: "Wikipedia / MediaWiki API", purpose: "抓取各国历史词条、时间线", category: "数据采集", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 2, name: "Wikidata SPARQL API", purpose: "结构化查询历史人物、事件", category: "数据采集", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 3, name: "大英百科全书 API", purpose: "权威历史资料事实核查", category: "数据采集", cloudCost: "~$50/月", localAlternative: "可用Wikipedia替代", localCost: "$0", canReplace: true },
  // 文本生成
  { id: 4, name: "OpenAI GPT-4o API", purpose: "脚本生成、翻译、Prompt生成", category: "文本生成", cloudCost: "$500-1,000/月", localAlternative: "Ollama + Qwen2.5-72B", localCost: "$0", canReplace: true },
  { id: 5, name: "DeepL API", purpose: "高质量多语言翻译", category: "文本生成", cloudCost: "$200-500/月", localAlternative: "Qwen2.5-72B（29种语言）", localCost: "$0", canReplace: true },
  // 语音合成
  { id: 6, name: "ElevenLabs API", purpose: "高质量多语言AI配音", category: "语音合成", cloudCost: "$300-800/月", localAlternative: "Qwen3-TTS (MLX)", localCost: "$0", canReplace: true },
  { id: 7, name: "Rask.ai API", purpose: "视频本地化、130+语言配音", category: "语音合成", cloudCost: "$300-600/月", localAlternative: "FishAudio S1-mini", localCost: "$0", canReplace: true },
  // 图像生成
  { id: 8, name: "Midjourney API", purpose: "生成高质量历史场景原画", category: "图像生成", cloudCost: "$120-600/月", localAlternative: "ComfyUI + FLUX.1-dev", localCost: "$0", canReplace: true },
  { id: 9, name: "Aitubo API", purpose: "批量生成历史风格图像", category: "图像生成", cloudCost: "$200-400/月", localAlternative: "ComfyUI + SDXL", localCost: "$0", canReplace: true },
  // 视频生成
  { id: 10, name: "HeyGen API", purpose: "图生视频、教育解说视频", category: "视频生成", cloudCost: "$500-2,000/月", localAlternative: "LTX-Video (MLX原生)", localCost: "$0", canReplace: true },
  { id: 11, name: "Kling API", purpose: "宏大历史场景动态视频", category: "视频生成", cloudCost: "$500-1,500/月", localAlternative: "Wan2.2-14B (i2v)", localCost: "$0", canReplace: true },
  { id: 12, name: "Runway Gen-4 API", purpose: "高质量图生视频", category: "视频生成", cloudCost: "$500-1,500/月", localAlternative: "HunyuanVideo", localCost: "$0", canReplace: true },
  // 编排与剪辑
  { id: 13, name: "n8n（自托管）", purpose: "工作流编排，串联所有API", category: "编排剪辑", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 14, name: "Make.com", purpose: "可视化工作流编排", category: "编排剪辑", cloudCost: "$50-200/月", localAlternative: "n8n（Docker自托管）", localCost: "$0", canReplace: true },
  { id: 15, name: "FFmpeg", purpose: "视频裁剪、字幕叠加", category: "编排剪辑", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  // 分发
  { id: 16, name: "YouTube Data API v3", purpose: "上传视频、管理频道", category: "平台分发", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 17, name: "TikTok Content Posting API", purpose: "自动发布TikTok视频", category: "平台分发", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 18, name: "Instagram Graph API", purpose: "发布Reels和图文", category: "平台分发", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 19, name: "Facebook Graph API", purpose: "发布视频和图文", category: "平台分发", cloudCost: "$0", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 20, name: "X (Twitter) API v2", purpose: "发布短视频和推文", category: "平台分发", cloudCost: "$0-100/月", localAlternative: null, localCost: "$0-100/月", canReplace: false },
  { id: 21, name: "Upload-Post.com API", purpose: "一次上传同步多平台", category: "平台分发", cloudCost: "$50-200/月", localAlternative: "官方API直连", localCost: "$0", canReplace: true },
  { id: 22, name: "Ayrshare API", purpose: "统一社交媒体发布", category: "平台分发", cloudCost: "$50-200/月", localAlternative: "官方API直连", localCost: "$0", canReplace: true },
  // 基础设施
  { id: 23, name: "Stripe API", purpose: "订阅支付处理", category: "基础设施", cloudCost: "按交易量", localAlternative: null, localCost: "按交易量", canReplace: false },
  { id: 24, name: "Typesense API", purpose: "全文搜索引擎", category: "基础设施", cloudCost: "$0（自托管）", localAlternative: null, localCost: "$0", canReplace: false },
  { id: 25, name: "AWS S3 + CloudFront", purpose: "视频存储与CDN分发", category: "基础设施", cloudCost: "$200-1,000/月", localAlternative: null, localCost: "$200-800/月", canReplace: false },
];

const categoryIcons: Record<string, React.ElementType> = {
  "数据采集": Database,
  "文本生成": FileText,
  "语音合成": Mic,
  "图像生成": Palette,
  "视频生成": Video,
  "编排剪辑": Scissors,
  "平台分发": Globe,
  "基础设施": Server,
};

const categoryColors: Record<string, string> = {
  "数据采集": "text-green-400",
  "文本生成": "text-blue-400",
  "语音合成": "text-purple-400",
  "图像生成": "text-pink-400",
  "视频生成": "text-red-400",
  "编排剪辑": "text-orange-400",
  "平台分发": "text-cyan-400",
  "基础设施": "text-yellow-400",
};

export default function ApiListSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  const replaceable = apis.filter(a => a.canReplace).length;
  const mustKeep = apis.filter(a => !a.canReplace).length;

  return (
    <section ref={ref} id="api-list" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Complete API Inventory
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            完整 API 清单 <span className="text-ice-blue">({apis.length}个)</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            整个项目从内容生产到多平台分发，共涉及 <span className="text-gold font-semibold">8大类、25个独立API/服务</span>。
            其中 <span className="text-green-400 font-semibold">{replaceable}个</span> 可被本地模型替代，
            仅 <span className="text-ice-blue font-semibold">{mustKeep}个</span> 必须保留。
          </p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
          {[
            { label: "API总数", value: "25", color: "text-foreground", border: "border-border/40" },
            { label: "可本地替代", value: String(replaceable), color: "text-green-400", border: "border-green-500/30" },
            { label: "必须保留", value: String(mustKeep), color: "text-ice-blue", border: "border-ice-blue/30" },
            { label: "免费API", value: String(apis.filter(a => a.cloudCost === "$0").length), color: "text-gold", border: "border-gold/30" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`p-4 rounded-xl border ${s.border} bg-card/20 text-center`}
            >
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Full API table - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block max-w-6xl mx-auto mb-10"
        >
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card/60 border-b border-border/50">
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gold w-8">#</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gold">类别</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gold">API / 服务</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gold">用途</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-ice-blue">
                    <span className="flex items-center gap-1"><Cloud size={12} /> 云端成本</span>
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gold">
                    <span className="flex items-center gap-1"><HardDrive size={12} /> 本地替代</span>
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gold">
                    本地成本
                  </th>
                </tr>
              </thead>
              <tbody>
                {apis.map((api, i) => {
                  const Icon = categoryIcons[api.category] || Database;
                  const color = categoryColors[api.category] || "text-muted-foreground";
                  return (
                    <tr key={api.id} className={`border-b border-border/20 hover:bg-card/30 transition-colors ${api.canReplace ? "" : "bg-card/10"}`}>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground font-mono">{api.id}</td>
                      <td className="px-3 py-2.5">
                        <span className={`flex items-center gap-1.5 text-xs ${color}`}>
                          <Icon size={12} />
                          {api.category}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground text-xs">{api.name}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{api.purpose}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-mono ${api.cloudCost === "$0" ? "text-green-400" : "text-ice-blue"}`}>
                          {api.cloudCost}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {api.canReplace ? (
                          <span className="flex items-center gap-1 text-xs text-gold">
                            <Check size={12} className="text-green-400" />
                            {api.localAlternative}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                            <XIcon size={12} />
                            不可替代
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-mono ${api.localCost === "$0" ? "text-green-400" : "text-gold"}`}>
                          {api.localCost}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3 max-w-xl mx-auto mb-10">
          {apis.map((api, i) => {
            const Icon = categoryIcons[api.category] || Database;
            const color = categoryColors[api.category] || "text-muted-foreground";
            return (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className={`p-3 rounded-lg border ${api.canReplace ? "border-green-500/20 bg-green-500/5" : "border-border/30 bg-card/10"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{api.id}</span>
                    <span className={`flex items-center gap-1 text-xs ${color}`}>
                      <Icon size={11} />
                      {api.category}
                    </span>
                  </div>
                  <span className={`text-xs font-mono ${api.cloudCost === "$0" ? "text-green-400" : "text-ice-blue"}`}>
                    {api.cloudCost}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground">{api.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{api.purpose}</div>
                {api.canReplace && (
                  <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-1 text-xs text-gold">
                    <Check size={12} className="text-green-400" />
                    本地替代: {api.localAlternative}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mac Studio hardware recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-6 rounded-xl border border-gold/30 bg-gold/5">
            <h3 className="text-lg font-semibold font-[var(--font-display)] text-gold mb-4 flex items-center gap-2">
              <HardDrive size={20} />
              Mac Studio 推荐配置
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "芯片", value: "M3 Ultra", detail: "60核GPU + 28核CPU" },
                { label: "统一内存", value: "96GB", detail: "可运行30B+参数LLM" },
                { label: "存储", value: "4TB SSD", detail: "模型文件+视频素材" },
                { label: "参考价格", value: "$5,000-7,000", detail: "一次性投入" },
              ].map((spec) => (
                <div key={spec.label} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{spec.label}</div>
                  <div className="text-lg font-bold font-mono text-gold">{spec.value}</div>
                  <div className="text-xs text-muted-foreground/60">{spec.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gold/20">
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                本地部署软件栈：<span className="text-gold/80">Ollama</span> + <span className="text-gold/80">ComfyUI</span> + <span className="text-gold/80">Qwen3-TTS (MLX)</span> + <span className="text-gold/80">FishAudio S1-mini</span> + <span className="text-gold/80">Whisper.cpp</span> + <span className="text-gold/80">FFmpeg</span> + <span className="text-gold/80">n8n (Docker)</span> + <span className="text-gold/80">M Studio</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
