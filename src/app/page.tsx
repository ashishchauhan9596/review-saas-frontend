"use client";

import { useState } from "react";
import { 
  Zap, 
  Target, 
  BarChart3, 
  MessageSquareQuote, 
  Languages, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Mail,
  Phone,
  ArrowUpRight,
  ChevronDown,
  Globe,
  Sparkles,
  ShieldCheck,
  X,
  Loader2
} from "lucide-react";
import Link from "next/link";

const translations = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How it Works",
      pricing: "Pricing",
      interested: "I'm Interested"
    },
    hero: {
      badge: "The Future of Reputation Management",
      title: "Scale Your Google Reviews with",
      subtitle: "Transform your physical business interactions into digital authority. Capturing authentic, high-quality reviews has never been this effortless.",
      cta: "Get Started Now",
      watchDemo: "Watch Demo"
    },
    features: {
      title: "Engineered for Growth",
      ai: {
        title: "AI Review Synthesis",
        desc: "Customers tap tags, AI drafts the perfect review. No more writer's block for your customers."
      },
      linking: {
        title: "Atomic Deep Linking",
        desc: "Bypass search results. Take customers directly to your 'Write Review' tab with one tap."
      },
      marketing: {
        title: "Marketing Assets",
        desc: "Professional print-ready flyers and dynamic QR stands generated automatically."
      }
    },
    lead: {
      title: "Ready to grow your empire?",
      subtitle: "Secure your spot in the future of reputation management. Leave your contact details and our team will reach out.",
      emailLabel: "Email Address",
      phoneLabel: "Phone Number (India)",
      emailPlaceholder: "Enter your email",
      phonePlaceholder: "10-digit number",
      button: "Submit Interest",
      success: "Thank you! Our team will contact you soon."
    },
    footer: {
      rights: "© 2026 ReviewStack AI. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    }
  },
  hi: {
    nav: {
      features: "विशेषताएं",
      howItWorks: "यह कैसे काम करता है",
      pricing: "कीमत",
      interested: "मैं इच्छुक हूँ"
    },
    hero: {
      badge: "प्रतिष्ठा प्रबंधन का भविष्य",
      title: "Google Reviews को बढ़ाएं",
      subtitle: "अपने भौतिक व्यावसायिक संपर्कों को डिजिटल अधिकार में बदलें। प्रामाणिक, उच्च-गुणवत्ता वाली समीक्षाएं प्राप्त करना अब और भी आसान हो गया है।",
      cta: "अभी शुरू करें",
      watchDemo: "डेमो देखें"
    },
    features: {
      title: "विकास के लिए डिज़ाइन किया गया",
      ai: {
        title: "AI समीक्षा संश्लेषण",
        desc: "ग्राहक टैग चुनते हैं, AI बेहतरीन समीक्षा तैयार करता है। आपके ग्राहकों को अब लिखने की ज़रूरत नहीं।"
      },
      linking: {
        title: "एटॉमिक डीप लिंकिंग",
        desc: "खोज परिणामों को छोड़ें। ग्राहकों को सीधे अपने 'समीक्षा लिखें' टैब पर ले जाएं।"
      },
      marketing: {
        title: "मार्केटिंग एसेट्स",
        desc: "पेशेवर प्रिंट-रेडी फ़्लायर्स और डायनेमिक QR स्टैंड्स स्वचालित रूप से जनरेट होते हैं।"
      }
    },
    lead: {
      title: "क्या आप तैयार हैं?",
      subtitle: "प्रतिष्ठा प्रबंधन के भविष्य में अपना स्थान सुरक्षित करें। अपना विवरण छोड़ें और हमारी टीम आपसे संपर्क करेगी।",
      emailLabel: "ईमेल एड्रेस",
      phoneLabel: "फोन नंबर (भारत)",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      phonePlaceholder: "10 अंकों का नंबर",
      button: "विवरण भेजें",
      success: "धन्यवाद! हमारी टीम जल्द ही आपसे संपर्क करेगी।"
    },
    footer: {
      rights: "© 2026 ReviewStack AI. सर्वाधिकार सुरक्षित।",
      privacy: "गोपनीयता नीति",
      terms: "सेवा की शर्तें"
    }
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const t = translations[lang];

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const hasEmail = email.trim().length > 0;
    const hasPhone = phone.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      setFormError("Please provide at least one contact method (Email or Phone).");
      return;
    }

    if (hasEmail && !validateEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    
    if (hasPhone && !validatePhone(phone)) {
      setFormError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setEmail("");
          setPhone("");
        }, 3000);
      } else {
        setFormError("Submission failed. Please try again.");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-3 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full shadow-2xl">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="ReviewStack AI Logo" className="w-7 h-7 sm:w-10 sm:h-10 object-contain rounded-lg sm:rounded-xl" />
            <span className="text-[12px] sm:text-lg font-black tracking-tighter uppercase whitespace-nowrap">
              ReviewStack<span className="hidden sm:inline ml-1 text-blue-500">AI</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-white/50">
            <a href="#features" className="text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#how-it-works" className="text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">{t.nav.howItWorks}</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-4 sm:py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
            >
              <Globe className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-2 text-xs font-black uppercase tracking-widest">{lang === "en" ? "Hindi" : "English"}</span>
            </button>
            
            <button 
              onClick={() => setShowModal(true)}
              className="bg-white text-black px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              {t.nav.interested}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-48 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 sm:mb-10 animate-in fade-in slide-in-from-bottom-4">
            <ShieldCheck className="w-4 h-4" />
            {t.hero.badge}
          </div>
          <h1 className="text-[2.5rem] sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] sm:leading-[0.9] mb-6 sm:mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-pretty">
            {t.hero.title} <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-600">ReviewStack AI</span>
          </h1>
          <p className="text-base sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 px-4">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 px-4">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 sm:px-14 py-5 sm:py-7 rounded-2xl sm:rounded-[2rem] font-black text-lg sm:text-2xl transition-all shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 active:scale-95 group"
            >
              {t.hero.cta}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section Removed */}

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight text-center sm:text-left">{t.features.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group bg-[#0A0A0A] border border-white/5 rounded-[2rem] sm:rounded-[40px] p-8 sm:p-10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-blue-600/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t.features.ai.title}</h3>
              <p className="text-white/40 text-sm sm:text-base leading-relaxed">{t.features.ai.desc}</p>
            </div>
            <div className="group bg-[#0A0A0A] border border-white/5 rounded-[2rem] sm:rounded-[40px] p-8 sm:p-10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-purple-600/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t.features.linking.title}</h3>
              <p className="text-white/40 text-sm sm:text-base leading-relaxed">{t.features.linking.desc}</p>
            </div>
            <div className="group bg-[#0A0A0A] border border-white/5 rounded-[2rem] sm:rounded-[40px] p-8 sm:p-10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-600/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{t.features.marketing.title}</h3>
              <p className="text-white/40 text-sm sm:text-base leading-relaxed">{t.features.marketing.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ReviewStack AI Logo" className="w-6 h-6 object-contain rounded-lg opacity-80" />
            <span className="text-xs font-black tracking-tighter uppercase">ReviewStack <span className="text-blue-500">AI</span></span>
          </div>
          <p className="text-[10px] sm:text-sm text-white/20">{t.footer.rights}</p>
          <div className="flex items-center gap-6 sm:gap-8">
            <a href="#" className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">{t.footer.privacy}</a>
            <a href="#" className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </footer>

      {/* Lead Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl sm:rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-auto">
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-500" />
            
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all group z-20"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="p-8 sm:p-16">
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-6xl font-black tracking-tighter leading-[1.1] mb-4 sm:mb-6">
                  {t.lead.title}
                </h2>
                <p className="text-white/40 text-sm sm:text-xl mb-8 sm:mb-12 max-w-md leading-relaxed">
                  {t.lead.subtitle}
                </p>

                {submitted ? (
                  <div className="py-10 text-center animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                    <p className="text-2xl font-black tracking-tight">{t.lead.success}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    {formError && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in slide-in-from-top-4">
                        {formError}
                      </div>
                    )}

                    <div className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                          {t.lead.emailLabel}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                          <input 
                            type="email" 
                            placeholder={t.lead.emailPlaceholder}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-[28px] pl-14 pr-6 py-4 sm:py-6 focus:outline-none focus:border-blue-500 transition-all text-sm sm:text-lg font-bold"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                          {t.lead.phoneLabel}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                          <input 
                            type="tel" 
                            placeholder={t.lead.phonePlaceholder}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-[28px] pl-14 pr-6 py-4 sm:py-6 focus:outline-none focus:border-emerald-500 transition-all text-sm sm:text-lg font-bold"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={loading}
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-500 py-4 sm:py-6 rounded-2xl sm:rounded-[28px] text-white font-black text-base sm:text-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t.lead.button}
                      <ArrowUpRight className="w-6 h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
