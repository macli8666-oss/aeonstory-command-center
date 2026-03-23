/*
 * Design: Dark Cinematic Narrative — AeonStory
 * Section: Content Sample Showcase — 丝绸之路完整交付物展示
 * Color: Deep navy + Gold + Ice Blue
 * Purpose: 作为自动化工作流的"黄金标准"参考范例
 */

import { motion, AnimatePresence } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { useState, useRef } from "react";
import {
  Image,
  Film,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Smartphone,
  Monitor,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  X,
} from "lucide-react";

interface Props {
  onVisible: () => void;
}

// CDN URLs
const KEYFRAMES = [
  { id: "kf1", title: "张骞出使西域", titleEn: "Zhang Qian's Mission", time: "0:00-0:45", palette: "金红 · 赭石", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf1-zhangqian_83a91696.png" },
  { id: "kf2", title: "唐代长安西市", titleEn: "Tang Dynasty Chang'an", time: "0:45-1:30", palette: "朱红 · 帝王金", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf2-changan_9c677e8e.png" },
  { id: "kf3", title: "河西走廊商队", titleEn: "Hexi Corridor Caravan", time: "1:30-2:30", palette: "天蓝 · 雪白", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf3-hexi_0d326e59.png" },
  { id: "kf4", title: "敦煌莫高窟", titleEn: "Dunhuang Mogao Caves", time: "2:30-3:30", palette: "金色 · 矿物蓝", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf4-dunhuang_99ed018e.png" },
  { id: "kf5", title: "撒马尔罕", titleEn: "Samarkand", time: "3:30-4:30", palette: "钴蓝 · 绿松石", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf5-samarkand_23dd59e6.png" },
  { id: "kf6", title: "巴格达智慧之家", titleEn: "Baghdad House of Wisdom", time: "4:30-5:30", palette: "深紫 · 宝石绿", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf6-baghdad_adc2c89a.png" },
  { id: "kf7", title: "罗马丝绸贸易", titleEn: "Roman Silk Trade", time: "5:30-7:00", palette: "大理石白 · 深红", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf7-rome_458980b4.png" },
  { id: "kf8", title: "古今对比", titleEn: "Past Meets Present", time: "7:00-8:30", palette: "暖金→冷蓝", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-kf8-legacy_23207cff.png" },
];

const VERTICALS = [
  { id: "vt1", title: "张骞骑马特写", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-tiktok1-zhangqian_1c5f49bf.png" },
  { id: "vt2", title: "骆驼商队峡谷", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-tiktok2-caravan_ca343c28.png" },
  { id: "vt3", title: "撒马尔罕蓝顶", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-tiktok3-samarkand_575a4f70.png" },
];

const THUMBNAILS = [
  { id: "cn", title: "中文版缩略图", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-thumbnail-cn_fcc764be.png" },
  { id: "en", title: "英文版缩略图", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-thumbnail-en_c3cc1af6.png" },
];

const VIDEOS = [
  { id: "v1", title: "张骞出使西域", type: "横版 16:9", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-video1-zhangqian_a782ae99.mp4" },
  { id: "v2", title: "河西走廊商队", type: "横版 16:9", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-video2-caravan_e9455ccd.mp4" },
  { id: "v3", title: "撒马尔罕集市", type: "横版 16:9", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-video3-samarkand_b565ca0f.mp4" },
  { id: "v4", title: "TikTok竖屏版", type: "竖版 9:16", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663333379713/fC4zNHHkmG4ajsEPpwQwQS/silk-road-video4-tiktok_47557c7c.mp4" },
];

type TabKey = "keyframes" | "vertical" | "videos" | "copy";

const TABS: { key: TabKey; label: string; icon: typeof Image }[] = [
  { key: "keyframes", label: "关键帧 & 缩略图", icon: Image },
  { key: "vertical", label: "竖屏画面", icon: Smartphone },
  { key: "videos", label: "微动画视频", icon: Film },
  { key: "copy", label: "平台文案", icon: MessageSquare },
];

const PLATFORM_COPY: Record<string, { icon: typeof Youtube; name: string; color: string; sample: string }> = {
  youtube: {
    icon: Youtube,
    name: "YouTube",
    color: "text-red-400",
    sample: `标题：丝绸之路 | 连接东西方2000年的超级公路 | AeonStory\n\n📌 章节导航\n0:00 张骞出使西域\n0:45 唐代长安西市\n1:30 河西走廊商队\n2:30 敦煌莫高窟\n3:30 撒马尔罕\n4:30 巴格达智慧之家\n5:30 罗马丝绸贸易\n7:00 古今对比\n\n🔥 你知道吗？罗马人以为丝绸是从树上长出来的！\n\n#丝绸之路 #历史 #AeonStory #SilkRoad #History`,
  },
  tiktok: {
    icon: Film,
    name: "TikTok",
    color: "text-pink-400",
    sample: `罗马人以为丝绸长在树上？！🤯\n\n2000年前，一条7000公里的商路连接了长安和罗马。\n骆驼商队穿越沙漠，僧侣带着佛经翻越雪山...\n\n完整8分钟动画版 → 主页链接\n\n#丝绸之路 #历史冷知识 #LearnOnTikTok #SilkRoad`,
  },
  instagram: {
    icon: Instagram,
    name: "Instagram",
    color: "text-purple-400",
    sample: `📜 8张图看懂丝绸之路\n\n1️⃣ 张骞出使：一个人改变了世界贸易格局\n2️⃣ 长安西市：全球最大的国际贸易中心\n3️⃣ 河西走廊：骆驼商队的生命线\n4️⃣ 敦煌莫高窟：东西方艺术的交汇点\n5️⃣ 撒马尔罕：中亚的十字路口\n6️⃣ 巴格达：伊斯兰黄金时代的智慧之都\n7️⃣ 罗马：丝绸贵过黄金的帝国\n8️⃣ 古今对比：一带一路的前世今生\n\n完整动画视频 → 主页链接 🎬\n\n#AeonStory #丝绸之路 #SilkRoad #历史`,
  },
  facebook: {
    icon: Facebook,
    name: "Facebook",
    color: "text-blue-400",
    sample: `你知道吗？在古罗马，一磅丝绸的价格等于一磅黄金。\n\n但罗马人完全不知道丝绸是怎么来的——他们以为丝绸是从树上长出来的！\n\n这条连接长安和罗马的7000公里商路，不仅运输了丝绸和香料，还传播了宗教、科技和思想...\n\n🎬 我们用数字油画动画还原了这段史诗般的旅程 →`,
  },
  x: {
    icon: Twitter,
    name: "X (Twitter)",
    color: "text-foreground",
    sample: `🧵 Thread: 丝绸之路的3个反直觉真相\n\n1/ 罗马人以为丝绸长在树上。公元1世纪，老普林尼在《自然史》中写道："赛里斯人从树叶上梳下白色的绒毛。"\n\n2/ 没有一个商人走完全程。7000公里的商路被分成无数段，货物在每个中转站换手。\n\n3/ 丝绸之路上最赚钱的不是丝绸，而是佛经和造纸术。\n\n🎬 完整8分钟动画 →`,
  },
  linkedin: {
    icon: Linkedin,
    name: "LinkedIn",
    color: "text-blue-300",
    sample: `The Silk Road: A 2,000-Year Case Study in Global Supply Chain\n\nBefore container ships and air freight, the world's first global supply chain stretched 7,000 km from Chang'an to Rome.\n\nKey insight: No single merchant ever traveled the entire route. Instead, goods changed hands at dozens of relay points — an ancient version of modern logistics networks.\n\nWe visualized this epic journey using AI-generated digital oil paintings. Watch the full 8-minute animation →`,
  },
};

function VideoPlayer({ src, isVertical }: { src: string; isVertical?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div
      className={`relative group rounded-xl overflow-hidden border border-border/30 bg-black ${
        isVertical ? "aspect-[9/16] max-w-[240px]" : "aspect-video"
      }`}
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center backdrop-blur-sm shadow-lg transform group-hover:scale-110 transition-transform">
          {playing ? <Pause className="text-deep-navy" size={20} /> : <Play className="text-deep-navy ml-0.5" size={20} />}
        </div>
      </button>
    </div>
  );
}

export default function SampleShowcaseSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);
  const [activeTab, setActiveTab] = useState<TabKey>("keyframes");
  const [selectedKf, setSelectedKf] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [activePlatform, setActivePlatform] = useState("youtube");

  const openLightbox = (src: string) => {
    setLightboxSrc(src);
    setLightboxOpen(true);
  };

  return (
    <section ref={ref} id="sample" className="py-24 sm:py-32 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${KEYFRAMES[selectedKf]?.url})` }}
        />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase mb-4 block">
            Golden Sample Reference
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-4">
            内容Sample：<span className="text-gradient-gold">丝绸之路</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            这是AeonStory的第一集完整交付物，也是未来自动化工作流的<span className="text-gold font-medium">「黄金标准」</span>。
            每一集自动生成的内容都应达到这个Sample的质量和完整度。
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { label: "8张关键帧", color: "bg-gold/10 text-gold border-gold/20" },
              { label: "3张竖屏", color: "bg-ice-blue/10 text-ice-blue border-ice-blue/20" },
              { label: "2张缩略图", color: "bg-purple-400/10 text-purple-400 border-purple-400/20" },
              { label: "4段视频", color: "bg-red-400/10 text-red-400 border-red-400/20" },
              { label: "8平台文案", color: "bg-green-400/10 text-green-400 border-green-400/20" },
            ].map((b) => (
              <span key={b.label} className={`text-xs px-3 py-1.5 rounded-full border ${b.color}`}>
                {b.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-1 gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "keyframes" && (
            <motion.div
              key="keyframes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Main keyframe display */}
              <div className="max-w-5xl mx-auto mb-6">
                <div
                  className="relative rounded-2xl overflow-hidden border border-gold/20 glow-gold cursor-pointer group"
                  onClick={() => openLightbox(KEYFRAMES[selectedKf].url)}
                >
                  <img
                    src={KEYFRAMES[selectedKf].url}
                    alt={KEYFRAMES[selectedKf].title}
                    className="w-full aspect-video object-cover"
                    loading="lazy"
                  />
                  {/* Overlay info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-gold/80 font-mono mb-1">
                          KF{selectedKf + 1} · {KEYFRAMES[selectedKf].time}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white font-[var(--font-display)]">
                          {KEYFRAMES[selectedKf].title}
                        </h3>
                        <p className="text-sm text-white/60">{KEYFRAMES[selectedKf].titleEn}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                          {KEYFRAMES[selectedKf].palette}
                        </span>
                        <Maximize2 className="text-white/50 group-hover:text-white transition-colors" size={18} />
                      </div>
                    </div>
                  </div>
                  {/* Nav arrows */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedKf(Math.max(0, selectedKf - 1)); }}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors ${selectedKf === 0 ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedKf(Math.min(KEYFRAMES.length - 1, selectedKf + 1)); }}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors ${selectedKf === KEYFRAMES.length - 1 ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="max-w-5xl mx-auto mb-12">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {KEYFRAMES.map((kf, i) => (
                    <button
                      key={kf.id}
                      onClick={() => setSelectedKf(i)}
                      className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedKf === i
                          ? "border-gold shadow-lg shadow-gold/20 scale-105"
                          : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                    >
                      <img src={kf.url} alt={kf.title} className="w-24 sm:w-28 aspect-video object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold font-[var(--font-display)] mb-4 flex items-center gap-2">
                  <Monitor className="text-gold" size={18} />
                  YouTube 缩略图
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {THUMBNAILS.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl overflow-hidden border border-border/30 cursor-pointer hover:border-gold/40 transition-colors group"
                      onClick={() => openLightbox(t.url)}
                    >
                      <img src={t.url} alt={t.title} className="w-full aspect-video object-cover" loading="lazy" />
                      <div className="p-3 bg-card/30 flex items-center justify-between">
                        <span className="text-sm text-foreground/80">{t.title}</span>
                        <Maximize2 className="text-muted-foreground group-hover:text-gold transition-colors" size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "vertical" && (
            <motion.div
              key="vertical"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-6 justify-center">
                <Smartphone className="text-ice-blue" size={18} />
                <h3 className="text-lg font-semibold font-[var(--font-display)]">
                  TikTok / Shorts / Reels 竖屏画面
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {VERTICALS.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl overflow-hidden border border-ice-blue/20 cursor-pointer hover:border-ice-blue/50 transition-all group hover:shadow-lg hover:shadow-ice-blue/10"
                    onClick={() => openLightbox(v.url)}
                  >
                    <div className="aspect-[9/16] overflow-hidden">
                      <img
                        src={v.url}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2 sm:p-3 bg-card/30">
                      <p className="text-xs sm:text-sm text-foreground/80 text-center">{v.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                竖屏画面色彩饱和度比横版高10-15%，构图强调纵深感和视觉冲击力
              </p>
            </motion.div>
          )}

          {activeTab === "videos" && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-6 justify-center">
                <Film className="text-red-400" size={18} />
                <h3 className="text-lg font-semibold font-[var(--font-display)]">
                  微动画视频片段（8秒/段）
                </h3>
              </div>

              {/* Horizontal videos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {VIDEOS.filter((v) => v.id !== "v4").map((v) => (
                  <div key={v.id}>
                    <VideoPlayer src={v.url} />
                    <div className="mt-2 flex items-center justify-between px-1">
                      <span className="text-sm text-foreground/80">{v.title}</span>
                      <span className="text-xs text-muted-foreground bg-card/30 px-2 py-0.5 rounded">{v.type}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vertical video */}
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-medium text-ice-blue mb-3 flex items-center gap-2">
                  <Smartphone size={14} />
                  TikTok 竖屏版
                </h4>
                <VideoPlayer src={VIDEOS[3].url} isVertical />
                <span className="text-xs text-muted-foreground mt-2">{VIDEOS[3].type}</span>
              </div>
            </motion.div>
          )}

          {activeTab === "copy" && (
            <motion.div
              key="copy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-6 justify-center">
                <MessageSquare className="text-green-400" size={18} />
                <h3 className="text-lg font-semibold font-[var(--font-display)]">
                  全平台发布文案（中英双语）
                </h3>
              </div>

              {/* Platform tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {Object.entries(PLATFORM_COPY).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setActivePlatform(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                      activePlatform === key
                        ? `bg-card/50 border border-border/50 ${p.color}`
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p.icon size={14} />
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Copy preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlatform}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden"
                >
                  <div className="p-3 border-b border-border/20 bg-card/30 flex items-center gap-2">
                    {(() => {
                      const p = PLATFORM_COPY[activePlatform];
                      const Icon = p.icon;
                      return (
                        <>
                          <Icon size={16} className={p.color} />
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">示例文案</span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="p-4 sm:p-6">
                    <pre className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed font-[var(--font-body)]">
                      {PLATFORM_COPY[activePlatform].sample}
                    </pre>
                  </div>
                </motion.div>
              </AnimatePresence>

              <p className="text-center text-sm text-muted-foreground mt-6">
                每集自动生成8个平台的中英双语文案，包含标题、描述、标签和互动引导
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deliverables summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-6">
            <h4 className="text-center font-semibold font-[var(--font-display)] text-gold mb-4">
              每集标准交付物清单（19个文件）
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { count: "8", label: "关键帧", sub: "16:9 横版" },
                { count: "3", label: "竖屏画面", sub: "9:16 竖版" },
                { count: "2", label: "缩略图", sub: "中+英" },
                { count: "3", label: "横版视频", sub: "8秒/段" },
                { count: "1", label: "竖版视频", sub: "TikTok" },
                { count: "2", label: "文档", sub: "脚本+文案" },
              ].map((d) => (
                <div key={d.label} className="text-center p-3 rounded-lg bg-card/20 border border-border/10">
                  <div className="text-2xl font-bold font-mono text-gold">{d.count}</div>
                  <div className="text-xs text-foreground/80">{d.label}</div>
                  <div className="text-xs text-muted-foreground/60">{d.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxSrc}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
