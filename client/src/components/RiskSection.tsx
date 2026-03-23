import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { AlertTriangle, Shield } from "lucide-react";

interface Props { onVisible: () => void; }

const risks = [
  {
    type: "内容准确性",
    risk: "AI生成的历史内容可能存在事实错误，引发争议。",
    solution: "建立人工审核机制，每条视频发布前由历史顾问或AI辅助的事实核查系统进行校验。",
  },
  {
    type: "版权风险",
    risk: "AI生成的图像和视频可能涉及版权争议。",
    solution: "使用商业授权的AI工具（如Midjourney付费版）或开源模型（FLUX.1-dev），避免复制已知的受版权保护的艺术作品。",
  },
  {
    type: "平台政策",
    risk: "YouTube等平台对AI生成内容的政策可能收紧。",
    solution: "所有AI生成视频标注\"AI生成\"标签，遵守各平台最新政策。自营网站作为核心阵地不受影响。",
  },
  {
    type: "文化敏感性",
    risk: "涉及特定部落或种族的历史内容可能引发文化争议。",
    solution: "涉及敏感话题时，邀请相关文化背景的顾问参与审核，确保内容尊重多元文化。",
  },
  {
    type: "技术成本",
    risk: "纯云端API方案月度成本$1,620-5,950，初期资金压力大。",
    solution: "采用Mac Studio + 本地模型方案（Ollama、ComfyUI、Qwen3-TTS等），将内容生产边际成本降至接近$0，月度总成本降至$200-1,100，降幅70-85%。硬件投入2-3个月即可收回。",
  },
  {
    type: "本地模型质量",
    risk: "开源本地模型在部分场景下质量不及商用云端API。",
    solution: "采用\"本地为主、云端补充\"的混合架构。日常批量生产使用本地模型，旗舰级精品视频（每月10-20条）选择性调用HeyGen等云端API提升质量。",
  },
  {
    type: "自动化运营风险",
    risk: "完全自动发布可能导致不当内容上线，引发平台限流或账号封禁。",
    solution: "三层安全审核机制（选题过滤+Prompt约束+Llama Guard成品审核）。未通过审核的内容自动进入人工队列，不会自动发布。",
  },
  {
    type: "硬件故障风险",
    risk: "Mac Studio单点故障将导致整个生产线停摆。",
    solution: "建立健康监控和报警系统（n8n + UptimeRobot）。预制一周的视频缓冲库，硬件故障时从缓冲库发布。未来可考虑第二台Mac Mini作为备份。",
  },
];

export default function RiskSection({ onVisible }: Props) {
  const ref = useScrollVisibility(onVisible);

  return (
    <section ref={ref} id="risk" className="py-24 sm:py-32 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-ice-blue text-sm font-semibold tracking-widest uppercase mb-4 block">
            Risk Assessment
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
            风险评估与应对
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {risks.map((r, i) => (
            <motion.div
              key={r.type}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-xl border border-border/40 bg-card/20 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="text-destructive" size={16} />
                    </div>
                    <div className="w-px h-4 bg-border/50" />
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Shield className="text-green-500" size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-mono text-gold/60 mb-1">{r.type}</div>
                    <p className="text-sm text-foreground/80 mb-3">{r.risk}</p>
                    <div className="pl-3 border-l-2 border-green-500/30">
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
