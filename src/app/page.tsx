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
      subtitle: "Join 500+ businesses scaling their reputation. Leave your contact details and our team will reach out.",
      emailLabel: "Email Address",
      phoneLabel: "Phone Number (India)",
      emailPlaceholder: "example@company.com",
      phonePlaceholder: "9876543210",
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
      subtitle: "500+ व्यवसायों के साथ जुड़ें। अपना विवरण छोड़ें और हम आपसे संपर्क करेंगे।",
      emailLabel: "ईमेल एड्रेस",
      phoneLabel: "फोन नंबर (भारत)",
      emailPlaceholder: "नाम@कंपनी.कॉम",
      phonePlaceholder: "9876543210",
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

    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(phone)) {
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
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/[0.03] backdrop-blur-xl border border-white/5 px-6 py-3 rounded-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ReviewStack AI Logo" className="w-10 h-10 object-contain rounded-xl" />
            <span className="text-lg font-black tracking-tighter uppercase">ReviewStack <span className="text-blue-500">AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors">{t.nav.howItWorks}</a>
            <button 
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20"
            >
              <Globe className="w-3 h-3" />
              {lang === "en" ? "Hindi" : "English"}
            </button>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
          >
            {t.nav.interested}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4">
            <ShieldCheck className="w-4 h-4" />
            {t.hero.badge}
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {t.hero.title} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-600">ReviewStack AI</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-3xl font-black text-xl transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-95 group"
            >
              {t.hero.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section Removed */}

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">{t.features.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.features.ai.title}</h3>
              <p className="text-white/50 leading-relaxed">{t.features.ai.desc}</p>
            </div>
            <div className="group bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-16 h-16 rounded-3xl bg-purple-600/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.features.linking.title}</h3>
              <p className="text-white/50 leading-relaxed">{t.features.linking.desc}</p>
            </div>
            <div className="group bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-16 h-16 rounded-3xl bg-emerald-600/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.features.marketing.title}</h3>
              <p className="text-white/50 leading-relaxed">{t.features.marketing.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ReviewStack AI Logo" className="w-8 h-8 object-contain rounded-lg opacity-80" />
            <span className="text-sm font-black tracking-tighter uppercase">ReviewStack <span className="text-blue-500">AI</span></span>
          </div>
          <p className="text-sm text-white/30">{t.footer.rights}</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">{t.footer.privacy}</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </footer>

      {/* Lead Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-[#0F0F0F] border border-white/10 rounded-[40px] shadow-2xl p-10 md:p-14 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                {t.lead.title}
              </h2>
              <p className="text-white/50 text-base md:text-lg mb-10">
                {t.lead.subtitle}
              </p>

              {submitted ? (
                <div className="flex flex-col items-center gap-6 py-10 animate-in zoom-in">
                  <div className="w-20 h-20 rounded-[28px] bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-center">{t.lead.success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formError && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                      <X className="w-4 h-4" />
                      {formError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">{t.lead.emailLabel}</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        type="email" 
                        required
                        placeholder={t.lead.emailPlaceholder}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">{t.lead.phoneLabel}</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        type="tel" 
                        required
                        placeholder={t.lead.phonePlaceholder}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t.lead.button}
                    <ArrowUpRight className="w-6 h-6" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
