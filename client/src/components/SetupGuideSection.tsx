/*
 * Design: Dark Cinematic Narrative — AeonStory
 * Section: 从注册到上线 — 交互式部署教程 + .env生成器
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import {
  CheckCircle2,
  Circle,
  Download,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Shield,
  Rocket,
  KeyRound,
  MonitorSmartphone,
} from "lucide-react";

interface SetupGuideSectionProps {
  onVisible: () => void;
}

/* ── 平台注册步骤数据 ── */
const PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    time: "15分钟",
    auto: true,
    steps: [
      "用Google账号登录 YouTube Studio (studio.youtube.com)",
      "点击「创建频道」→ 频道名称填 AeonStory",
      "进入 Google Cloud Console (console.cloud.google.com)",
      "创建新项目 → 启用 YouTube Data API v3",
      "创建 OAuth 2.0 凭据 → 获取 Client ID 和 Client Secret",
      "设置重定向URI为 http://localhost:3000/callback",
    ],
    envKeys: [
      { key: "YOUTUBE_CLIENT_ID", label: "YouTube Client ID", placeholder: "xxxx.apps.googleusercontent.com" },
      { key: "YOUTUBE_CLIENT_SECRET", label: "YouTube Client Secret", placeholder: "GOCSPX-xxxxxxxx" },
    ],
    link: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "♪",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    time: "20分钟",
    auto: true,
    steps: [
      "注册TikTok账号并切换为Business账号",
      "进入 TikTok开发者平台 (developers.tiktok.com)",
      "创建应用 → 选择 Content Posting API",
      "提交审核（通常1-3个工作日）",
      "审核通过后获取 App ID 和 App Secret",
    ],
    envKeys: [
      { key: "TIKTOK_APP_ID", label: "TikTok App ID", placeholder: "aw1xxxxx" },
      { key: "TIKTOK_APP_SECRET", label: "TikTok App Secret", placeholder: "xxxxxxxxxxxxx" },
    ],
    link: "https://developers.tiktok.com/",
  },
  {
    id: "facebook",
    name: "Facebook + Instagram",
    icon: "f",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    time: "15分钟",
    auto: true,
    steps: [
      "用Facebook账号创建一个公共主页（Page）",
      "Instagram账号切换为Professional/Creator账号",
      "在Instagram设置中绑定Facebook公共主页",
      "进入 Meta开发者平台 (developers.facebook.com)",
      "创建应用 → 类型选「Business」→ 添加 Pages API 和 Instagram API",
      "生成 Page Access Token（长期Token）",
    ],
    envKeys: [
      { key: "FACEBOOK_APP_ID", label: "Facebook App ID", placeholder: "123456789012345" },
      { key: "FACEBOOK_APP_SECRET", label: "Facebook App Secret", placeholder: "abcdef1234567890" },
      { key: "FACEBOOK_PAGE_TOKEN", label: "Facebook Page Token", placeholder: "EAAxxxxxxx..." },
      { key: "INSTAGRAM_ACCOUNT_ID", label: "Instagram Business Account ID", placeholder: "17841400000000" },
    ],
    link: "https://developers.facebook.com/",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    time: "10分钟",
    auto: true,
    steps: [
      "在Telegram中搜索 @BotFather 并发送 /newbot",
      "设置Bot名称为 AeonStory Bot",
      "获取 Bot Token",
      "创建一个频道（Channel）→ 将Bot添加为管理员",
      "获取频道ID（发送消息后通过API获取）",
    ],
    envKeys: [
      { key: "TELEGRAM_BOT_TOKEN", label: "Telegram Bot Token", placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" },
      { key: "TELEGRAM_CHANNEL_ID", label: "Telegram Channel ID", placeholder: "@aeonstory 或 -100xxxxxxxxxx" },
    ],
    link: "https://t.me/BotFather",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "P",
    color: "text-red-300",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
    time: "5分钟",
    auto: true,
    steps: [
      "注册Pinterest账号 → 切换为Business账号",
      "进入 Pinterest开发者平台 (developers.pinterest.com)",
      "创建应用 → 获取 App ID 和 App Secret",
    ],
    envKeys: [
      { key: "PINTEREST_APP_ID", label: "Pinterest App ID", placeholder: "1234567" },
      { key: "PINTEREST_APP_SECRET", label: "Pinterest App Secret", placeholder: "abcdef123456" },
    ],
    link: "https://developers.pinterest.com/",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "in",
    color: "text-blue-300",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    time: "5分钟",
    auto: true,
    steps: [
      "用LinkedIn账号创建一个公司页面（Company Page）",
      "进入 LinkedIn开发者平台 (developer.linkedin.com)",
      "创建应用 → 关联公司页面 → 获取 Client ID 和 Client Secret",
    ],
    envKeys: [
      { key: "LINKEDIN_CLIENT_ID", label: "LinkedIn Client ID", placeholder: "77xxxxxxxx" },
      { key: "LINKEDIN_CLIENT_SECRET", label: "LinkedIn Client Secret", placeholder: "xxxxxxxx" },
    ],
    link: "https://developer.linkedin.com/",
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: "𝕏",
    color: "text-gray-300",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    time: "10分钟",
    auto: true,
    steps: [
      "注册X账号（如已有则跳过）",
      "进入 X开发者平台 (developer.x.com)",
      "申请 Basic Plan（$100/月）或 Free Plan（仅发推文）",
      "创建项目和应用 → 获取 API Key 和 API Secret",
      "生成 Access Token 和 Access Token Secret",
    ],
    envKeys: [
      { key: "X_API_KEY", label: "X API Key", placeholder: "xxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "X_API_SECRET", label: "X API Secret", placeholder: "xxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "X_ACCESS_TOKEN", label: "X Access Token", placeholder: "xxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "X_ACCESS_TOKEN_SECRET", label: "X Access Token Secret", placeholder: "xxxxxxxxxxxxxxxxxxxxxxx" },
    ],
    link: "https://developer.x.com/",
  },
  {
    id: "bilibili",
    name: "Bilibili（手动发布）",
    icon: "B",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    time: "10分钟",
    auto: false,
    steps: [
      "注册B站账号 → 完成实名认证",
      "下载B站创作者App（手机发布更方便）",
      "无需API密钥，通过指挥台「手动发布」面板辅助",
    ],
    envKeys: [],
    link: "https://member.bilibili.com/",
  },
  {
    id: "xiaohongshu",
    name: "小红书（手动发布）",
    icon: "红",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    time: "10分钟",
    auto: false,
    steps: [
      "注册小红书账号 → 完成实名认证",
      "切换为专业号（创作者中心）",
      "无需API密钥，通过指挥台「手动发布」面板辅助",
    ],
    envKeys: [],
    link: "https://www.xiaohongshu.com/",
  },
];

/* ── 通用配置项 ── */
const GENERAL_ENV = [
  { key: "OLLAMA_HOST", label: "Ollama地址", placeholder: "http://localhost:11434", defaultValue: "http://localhost:11434" },
  { key: "COMFYUI_HOST", label: "ComfyUI地址", placeholder: "http://localhost:8188", defaultValue: "http://localhost:8188" },
  { key: "N8N_HOST", label: "n8n地址", placeholder: "http://localhost:5678", defaultValue: "http://localhost:5678" },
  { key: "POSTGRES_PASSWORD", label: "数据库密码", placeholder: "设置一个强密码", defaultValue: "" },
  { key: "ADMIN_PASSWORD", label: "指挥台管理密码", placeholder: "设置一个强密码", defaultValue: "" },
  { key: "TAILSCALE_AUTH_KEY", label: "Tailscale密钥（远程访问，可选）", placeholder: "tskey-auth-xxxxx", defaultValue: "" },
];

export default function SetupGuideSection({ onVisible }: SetupGuideSectionProps) {
  const ref = useScrollVisibility(onVisible);
  const [currentStep, setCurrentStep] = useState(0); // 0=注册, 1=密钥, 2=生成, 3=完成
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>("youtube");
  const [completedPlatforms, setCompletedPlatforms] = useState<Set<string>>(new Set());
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const togglePlatformComplete = (id: string) => {
    setCompletedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleShowPassword = (key: string) => {
    setShowPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updateEnvValue = (key: string, value: string) => {
    setEnvValues((prev) => ({ ...prev, [key]: value }));
  };

  /* 生成 .env 文件内容 */
  const generateEnvContent = () => {
    let content = `# ============================================\n`;
    content += `# AeonStory 自动化系统 — 环境配置文件\n`;
    content += `# 生成时间: ${new Date().toLocaleString("zh-CN")}\n`;
    content += `# ============================================\n\n`;

    content += `# ── 通用配置 ──\n`;
    GENERAL_ENV.forEach((item) => {
      const val = envValues[item.key] || item.defaultValue || "";
      content += `${item.key}=${val}\n`;
    });

    content += `\n# ── 平台API密钥 ──\n`;
    PLATFORMS.forEach((p) => {
      if (p.envKeys.length > 0) {
        content += `\n# ${p.name}\n`;
        p.envKeys.forEach((ek) => {
          const val = envValues[ek.key] || "";
          content += `${ek.key}=${val}\n`;
        });
      }
    });

    return content;
  };

  const downloadEnvFile = () => {
    const content = generateEnvContent();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyEnvContent = () => {
    navigator.clipboard.writeText(generateEnvContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filledCount = PLATFORMS.reduce((acc, p) => {
    const allFilled = p.envKeys.length === 0 || p.envKeys.every((ek) => envValues[ek.key]?.trim());
    return acc + (allFilled ? 1 : 0);
  }, 0);

  const STEPS = [
    { icon: MonitorSmartphone, label: "注册账号", desc: "在各平台注册并开通开发者权限" },
    { icon: KeyRound, label: "填写密钥", desc: "将获取的API密钥填入下方表单" },
    { icon: Download, label: "生成配置", desc: "一键生成.env文件并下载" },
    { icon: Rocket, label: "一键启动", desc: "将.env放入部署目录，运行install.sh" },
  ];

  return (
    <section id="setup-guide" ref={ref} className="relative py-24 md:py-32">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-navy via-[oklch(0.12_0.02_260)] to-deep-navy" />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, oklch(0.82 0.12 85) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      <div className="container relative z-10">
        {/* 标题 */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
            从注册到上线 · 交互式教程
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-display)] mb-4">
            <span className="text-gold">4步完成</span>
            <span className="text-foreground ml-3">全平台部署</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            跟随引导完成所有平台注册，在网页上直接填写API密钥，一键生成配置文件
          </p>
        </motion.div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-12">
          {STEPS.map((step, i) => (
            <button key={i} onClick={() => setCurrentStep(i)} className="flex items-center gap-2 group">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                currentStep === i ? "bg-gold text-deep-navy scale-110" : currentStep > i ? "bg-green-500/20 text-green-400" : "bg-white/5 text-muted-foreground"
              }`}>
                {currentStep > i ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
              </div>
              <div className="hidden md:block text-left">
                <div className={`text-sm font-medium ${currentStep === i ? "text-gold" : "text-muted-foreground"}`}>{step.label}</div>
                <div className="text-xs text-muted-foreground/60">{step.desc}</div>
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 md:w-16 h-px ${currentStep > i ? "bg-green-500/40" : "bg-white/10"}`} />}
            </button>
          ))}
        </div>

        {/* Step 0 & 1: 平台列表 */}
        {(currentStep === 0 || currentStep === 1) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 max-w-4xl mx-auto">
            {/* 进度条 */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm text-muted-foreground">
                {currentStep === 0 ? "注册进度" : "密钥填写进度"}：
                <span className="text-gold font-semibold ml-1">
                  {currentStep === 0 ? completedPlatforms.size : filledCount} / {PLATFORMS.length}
                </span>
              </div>
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-ice-blue rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep === 0 ? completedPlatforms.size : filledCount) / PLATFORMS.length) * 100}%` }}
                />
              </div>
            </div>

            {PLATFORMS.map((platform) => (
              <motion.div
                key={platform.id}
                layout
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  expandedPlatform === platform.id ? `${platform.borderColor} bg-white/[0.03]` : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {/* 平台头部 */}
                <button
                  onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center text-lg font-bold ${platform.color}`}>
                      {platform.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{platform.name}</span>
                        {platform.auto ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">自动发布</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">手动发布</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">预计 {platform.time} · {platform.envKeys.length} 个密钥</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentStep === 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlatformComplete(platform.id); }}
                        className={`p-1 rounded transition-colors ${completedPlatforms.has(platform.id) ? "text-green-400" : "text-muted-foreground/40 hover:text-muted-foreground"}`}
                      >
                        {completedPlatforms.has(platform.id) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                    )}
                    {expandedPlatform === platform.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* 展开内容 */}
                {expandedPlatform === platform.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-4">
                    {/* 注册步骤 */}
                    {currentStep === 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground/80 mb-2">注册步骤：</div>
                        {platform.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-gold/60 font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                            <span className="text-muted-foreground">{step}</span>
                          </div>
                        ))}
                        <a
                          href={platform.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-sm text-ice-blue hover:underline"
                        >
                          <ExternalLink size={14} /> 前往{platform.name}开发者平台
                        </a>
                      </div>
                    )}

                    {/* 密钥填写 */}
                    {currentStep === 1 && platform.envKeys.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                          <Shield size={14} className="text-green-400" />
                          密钥仅保存在您的浏览器中，不会上传到任何服务器
                        </div>
                        {platform.envKeys.map((ek) => (
                          <div key={ek.key} className="space-y-1">
                            <label className="text-xs text-muted-foreground font-mono">{ek.key}</label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 relative">
                                <input
                                  type={showPasswords.has(ek.key) ? "text" : "password"}
                                  value={envValues[ek.key] || ""}
                                  onChange={(e) => updateEnvValue(ek.key, e.target.value)}
                                  placeholder={ek.placeholder}
                                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 font-mono"
                                />
                                <button
                                  onClick={() => toggleShowPassword(ek.key)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                                >
                                  {showPasswords.has(ek.key) ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentStep === 1 && platform.envKeys.length === 0 && (
                      <div className="text-sm text-muted-foreground/60 italic py-2">
                        此平台为手动发布，无需API密钥配置
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* 下一步按钮 */}
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dim text-deep-navy font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {currentStep === 0 ? "注册完成，去填写密钥 →" : "密钥填写完成，生成配置文件 →"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1 补充：通用配置 */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-8">
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-6">
              <h3 className="text-lg font-semibold text-gold mb-4 font-[var(--font-display)]">通用系统配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GENERAL_ENV.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{item.label}</label>
                    <input
                      type={item.key.includes("PASSWORD") || item.key.includes("KEY") ? (showPasswords.has(item.key) ? "text" : "password") : "text"}
                      value={envValues[item.key] || item.defaultValue || ""}
                      onChange={(e) => updateEnvValue(item.key, e.target.value)}
                      placeholder={item.placeholder}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: 生成配置文件 */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="rounded-xl border border-gold/30 bg-white/[0.03] overflow-hidden">
              {/* 预览头部 */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="text-sm text-muted-foreground ml-2 font-mono">.env</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyEnvContent}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-muted-foreground transition-colors"
                  >
                    <Copy size={14} /> {copied ? "已复制!" : "复制"}
                  </button>
                  <button
                    onClick={downloadEnvFile}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gold text-deep-navy font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    <Download size={14} /> 下载 .env 文件
                  </button>
                </div>
              </div>

              {/* 文件预览 */}
              <div className="p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {generateEnvContent()}
                </pre>
              </div>
            </div>

            {/* 操作指引 */}
            <div className="mt-6 p-4 rounded-xl bg-ice-blue/5 border border-ice-blue/20">
              <h4 className="text-sm font-semibold text-ice-blue mb-2">下载后的操作：</h4>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>1. 将下载的 <code className="text-gold bg-gold/10 px-1.5 py-0.5 rounded text-xs">.env</code> 文件放入 <code className="text-gold bg-gold/10 px-1.5 py-0.5 rounded text-xs">~/aeonstory/</code> 目录</p>
                <p>2. 在终端执行：<code className="text-gold bg-gold/10 px-1.5 py-0.5 rounded text-xs">cd ~/aeonstory && chmod +x install.sh && ./install.sh</code></p>
                <p>3. 脚本会自动检测已安装的组件并跳过，仅安装缺失部分</p>
                <p>4. 安装完成后，打开浏览器访问 <code className="text-gold bg-gold/10 px-1.5 py-0.5 rounded text-xs">http://localhost:3000</code> 进入指挥台</p>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-dim text-deep-navy font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                我已下载配置文件 →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: 完成 */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
            <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8 md:p-12">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Rocket size={36} className="text-green-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] text-green-400 mb-4">
                准备就绪!
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                所有配置已完成。将 <code className="text-gold bg-gold/10 px-1.5 py-0.5 rounded text-xs">.env</code> 文件和部署包放入Mac Studio，
                执行一条命令即可启动整个AeonStory自动化系统。
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
                <div className="text-xs text-muted-foreground mb-2 font-mono">在Mac Studio终端执行：</div>
                <code className="text-gold text-sm font-mono">
                  cd ~/aeonstory && mv ~/Downloads/.env . && chmod +x install.sh && ./install.sh
                </code>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-gold">{PLATFORMS.filter((p) => p.auto).length}</div>
                  <div className="text-xs text-muted-foreground">自动发布平台</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-ice-blue">{PLATFORMS.filter((p) => !p.auto).length}</div>
                  <div className="text-xs text-muted-foreground">手动辅助平台</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-green-400">~30min</div>
                  <div className="text-xs text-muted-foreground">预计安装时间</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(0)}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 返回重新配置
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
