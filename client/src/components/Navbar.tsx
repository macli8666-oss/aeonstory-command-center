import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket } from "lucide-react";
import { Link } from "wouter";

const NAV_ITEMS = [
  { id: "hero", label: "首页" },
  { id: "vision", label: "愿景" },
  { id: "sample", label: "Sample" },
  { id: "production-spec", label: "生产规范" },
  { id: "architecture", label: "架构" },
  { id: "website", label: "网站" },
  { id: "pipeline", label: "生产线" },
  { id: "m3-ultra", label: "M3 Ultra" },
  { id: "control-center", label: "指挥中心" },
  { id: "setup-guide", label: "部署教程" },
  { id: "api-list", label: "API清单" },
  { id: "distribution", label: "分发" },
  { id: "business", label: "商业" },
  { id: "content-format", label: "内容形式" },
  { id: "marketing", label: "引流" },
  { id: "roadmap", label: "路线图" },
  { id: "risk", label: "风险" },
];

interface NavbarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export default function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      onSectionChange(id);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center">
              <span className="text-deep-navy font-bold text-sm font-[var(--font-display)]">A</span>
            </div>
            <span className="text-gold font-semibold text-lg font-[var(--font-display)] hidden sm:block">
              AeonStory
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs transition-all duration-300 ${
                  activeSection === item.id
                    ? "text-gold bg-gold/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Console button */}
          <Link href="/console">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gold text-deep-navy hover:bg-gold/90 transition-colors">
              <Rocket size={14} />
              进入指挥中心
            </button>
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-6"
          >
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(item.id)}
                  className={`text-left px-4 py-3 rounded-lg text-lg transition-colors ${
                    activeSection === item.id
                      ? "text-gold bg-gold/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
