"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  Loader2,
  Sparkles,
  Coffee,
  Heart,
  Zap,
  Globe,
  Languages,
  Wand2
} from "lucide-react";
import confetti from "canvas-confetti";

interface Business {
  businessName: string;
  logoUrl: string | null;
  googlePlaceId: string;
  googleMapsUrl: string | null;
  category: string;
}

export default function ReviewLandingPage() {
  const { shortCode } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [aiReview, setAiReview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Hindi", code: "hi", flag: "🇮🇳" },
    { name: "Pahadi", code: "ph", flag: "⛰️" },
  ];

  const [aiTags, setAiTags] = useState<{ id: string, label: string, icon: string }[]>([]);
  const [initialTagsLoaded, setInitialTagsLoaded] = useState(false);

  const [statusMessage, setStatusMessage] = useState("Preparing your review...");

  const statusMessages = [
    "Analyzing your unique experience...",
    "Selecting the perfect tone...",
    "Translating for maximum impact...",
    "Crafting a heartfelt story...",
    "Adding that 5-star magic...",
    "Polishing the final sentences..."
  ];

  // Clear selected tags when language changes to prevent "hidden" selections
  useEffect(() => {
    setSelectedTags([]);
  }, [selectedLanguage]);

  const fetchBusinessAndTags = useCallback(async () => {
    try {
      setInitialTagsLoaded(false); // Show skeleton while fetching
      if (selectedTags.length === 0) setLoading(true);

      // Single High-Performance Trip to the server
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/discovery/${shortCode}?lang=${selectedLanguage}`);

      if (!response.ok) {
        if (response.status === 404) throw new Error('Business not found');
        throw new Error('Server error');
      }

      const data = await response.json();

      // Update everything in one React render cycle
      setBusiness(data.business);
      setAiTags(data.tags);
      setInitialTagsLoaded(true);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch discovery data:", err);
      setError("We couldn't find this business. Please check the QR code and try again.");
    } finally {
      setLoading(false);
    }
  }, [shortCode, selectedLanguage]);

  useEffect(() => {
    fetchBusinessAndTags();
  }, [fetchBusinessAndTags]);

  const [hasGeneratedInitial, setHasGeneratedInitial] = useState(false);

  // Auto-select tags and generate the first review automatically
  useEffect(() => {
    if (initialTagsLoaded && aiTags.length > 0 && selectedTags.length === 0 && !hasGeneratedInitial) {
      const topTags = aiTags.slice(0, 4).map(t => t.label);
      setSelectedTags(topTags);

      // Auto-generate only the VERY first time
      setHasGeneratedInitial(true);
      generateReview(topTags);
    }
  }, [initialTagsLoaded, aiTags, selectedTags.length, hasGeneratedInitial]);

  const tags = aiTags; // Use the AI-generated tags!

  const toggleTag = (label: string) => {
    setSelectedTags(prev =>
      prev.includes(label)
        ? prev.filter(t => t !== label)
        : [...prev, label]
    );
  };

  const generateReview = async (overrideTags?: string[]) => {
    const tagsToUse = overrideTags || selectedTags;

    // Primary guard: Do NOT hit the API if we know we are rate limited
    if (tagsToUse.length < 2 || isRateLimited || isGenerating) return;

    setIsGenerating(true);
    // Start status rotation
    let msgIndex = 0;
    const statusInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % statusMessages.length;
      setStatusMessage(statusMessages[msgIndex]);
    }, 1200);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode: shortCode,
          tags: tagsToUse,
          language: selectedLanguage
        })
      });

      // Explicitly check for Rate Limit Status (429)
      if (response.status === 429) {
        setIsRateLimited(true);
        const data = await response.json();
        throw new Error(data.error || "Too many reviews. Please try again later.");
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate review");
      }

      const data = await response.json();
      setAiReview(data.review);
      setError(null); // Clear any previous errors if successful

      // TRIGGER THE WOW EFFECT!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#3B82F6']
      });

    } catch (err: any) {
      console.error("AI Generation failed:", err);
      // Double-check error message for rate limit keywords just in case
      if (err.message?.toLowerCase().includes("too many reviews") || err.message?.toLowerCase().includes("rate limit")) {
        setIsRateLimited(true);
      }
      setError(err.message || "Failed to generate review");
    } finally {
      setIsGenerating(false);
      clearInterval(statusInterval);
    }
  };

  const handlePostReview = () => {
    if (!aiReview || !business) return;

    // Copy to clipboard
    navigator.clipboard.writeText(aiReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    // Open Google Maps
    const mapsUrl = business.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query_place_id=${business.googlePlaceId}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCopyAndRedirect = () => {
    navigator.clipboard.writeText(aiReview);
    setCopied(true);
    setTimeout(() => {
      // Priority 1: Direct Google Maps URL (Review Tab link)
      let googleUrl = business?.googleMapsUrl;

      // Priority 2: If no direct link, check if googlePlaceId is actually a URL
      if (!googleUrl) {
        if (business?.googlePlaceId.startsWith('http')) {
          googleUrl = business.googlePlaceId;
        } else {
          // Priority 3: Standard ChIJ Place ID link
          googleUrl = `https://search.google.com/local/writereview?placeid=${business?.googlePlaceId}`;
        }
      }

      window.location.href = googleUrl;
    }, 1500);
  };

  const Skeleton = () => (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 animate-pulse">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-white/5 rounded-2xl mb-6" />
          <div className="h-8 w-48 bg-white/5 rounded-lg mb-3" />
          <div className="h-4 w-64 bg-white/5 rounded-lg" />
        </div>
        <div className="bg-white/5 rounded-3xl h-32 mb-4" />
        <div className="bg-white/5 rounded-3xl p-8 mb-8">
          <div className="h-6 w-40 bg-white/10 rounded-lg mb-6" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-2xl border border-white/5" />
            ))}
          </div>
          <div className="h-14 w-full bg-white/10 rounded-2xl mt-8" />
        </div>
      </div>
    </div>
  );

  if (loading) return <Skeleton />;

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-gray-400">We couldn't find this business.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-3 sm:p-6 md:p-10 selection:bg-blue-500/30 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Magic - Wide Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 50 Animated Floating Particles (Love & Magic) */}
      {[...Array(50)].map((_, i) => {
        const Icon = [Heart, Star, Sparkles, Zap][i % 4];
        const colors = ["text-blue-500", "text-purple-500", "text-pink-500", "text-yellow-500"];
        return (
          <div
            key={i}
            className={`absolute opacity-[0.05] animate-pulse pointer-events-none ${colors[i % 4]}`}
            style={{
              top: `${(i * 13.7) % 100}%`,
              left: `${(i * 19.3) % 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + (i % 6)}s`,
              transform: `rotate(${(i * 33) % 360}deg) scale(${0.3 + (i % 4) * 0.15})`
            }}
          >
            <Icon className="w-3 h-3 sm:w-5 sm:h-5" />
          </div>
        );
      })}

      <div className="w-full max-w-4xl relative z-10 flex flex-col gap-4">
        {/* Error / Rate Limit Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 text-red-400">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-[10px]">Attention Required</h3>
                <p className="text-sm font-bold text-white/90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Bento Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Left Column: Profile & Language (30%) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 flex flex-col items-center text-center backdrop-blur-xl h-full justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {business.logoUrl && (
                <div className="relative group/logo mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700" />
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 sm:p-3 rounded-[2.5rem] shadow-2xl border border-white/20 relative z-10 transform group-hover/logo:rotate-3 transition-transform duration-500">
                    <img
                      src={business.logoUrl}
                      alt={business.businessName}
                      className="w-full h-full object-contain rounded-[1.5rem]"
                    />
                  </div>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tighter leading-tight relative z-10">{business.businessName}</h1>
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px] uppercase tracking-widest relative z-10">
                <Heart className="w-3 h-3 fill-current" />
                <span>Top Rated</span>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
              <h2 className="text-[15px] font-black mb-3 text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                {selectedLanguage === "Hindi" ? "भाषा चुनें" : selectedLanguage === "Pahadi" ? "बोली चुणा" : "Select Language"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (selectedLanguage !== lang.name) {
                        setSelectedLanguage(lang.name);
                        setInitialTagsLoaded(false);
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-xs font-bold ${selectedLanguage === lang.name ? "bg-white text-black border-white shadow-md" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Tags & Generation (70%) */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  {selectedLanguage === "Hindi" ? "आपको क्या पसंद आया?" :
                    selectedLanguage === "Pahadi" ? "तुसां जो क्या पसंद आया?" :
                      "What did you love?"}
                </h2>
                <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
                  <span className="text-xs font-black text-blue-400">{selectedTags.length}/4</span>
                </div>
              </div>

              {!initialTagsLoaded ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.label)}
                      className={`flex items-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl sm:rounded-[1.5rem] border transition-all duration-300 relative group overflow-hidden ${selectedTags.includes(tag.label) ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-white/5 border-white/5 text-gray-400 hover:border-white/20"
                        }`}
                    >
                      <span className="text-xl sm:text-2xl transition-transform group-hover:scale-110">{tag.icon}</span>
                      <span className={`font-black uppercase tracking-tight text-left leading-tight ${selectedLanguage === "English"
                        ? "text-[10px] sm:text-xs"
                        : "text-[14px] sm:text-[16px]"
                        }`}>
                        {tag.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => generateReview()}
                disabled={selectedTags.length < 2 || isGenerating || isRateLimited}
                className="w-full mt-4 sm:mt-8 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 py-3 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-[0.98] text-white/40"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> : <Sparkles className="w-3 h-3 text-yellow-400" />}
                {selectedLanguage === "Hindi" ? "फिर से तैयार करें" :
                  selectedLanguage === "Pahadi" ? "दोबारा बणावा" :
                    "REGENERATE MAGIC"}
              </button>
            </div>
          </div>
        </div>

        {/* AI Result - Full Width Bottom */}
        {(aiReview || isGenerating) && (
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group mt-2">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-10">
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em] mb-4 flex items-center justify-center sm:justify-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  {selectedLanguage === "Hindi" ? "तैयार समीक्षा" :
                    selectedLanguage === "Pahadi" ? "बणी दी समीक्षा" :
                      "Ready to Post"}
                </h2>
                {isGenerating ? (
                  <div className="flex flex-col items-center sm:items-start gap-4 py-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white/5 border-t-white/40 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Wand2 className="w-6 h-6 text-white/60 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black italic text-white/80 animate-pulse">
                        {statusMessage}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                        Crafting your premium review
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold leading-[1.3] tracking-tight italic text-white text-pretty">
                    "{aiReview}"
                  </p>
                )}
              </div>
              <button
                onClick={handlePostReview}
                disabled={!aiReview || isGenerating}
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-xl transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 whitespace-nowrap active:scale-[0.95]"
              >
                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                {copied ? "COPIED!" : (
                  selectedLanguage === "Hindi" ? "कॉपी करें और पोस्ट करें" :
                    selectedLanguage === "Pahadi" ? "कॉपी करा कने पोस्ट करा" :
                      "Copy & Post to Google"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Minimal Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
            <img src="/logo.png" alt="Logo" className="w-6 h-auto" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">ReviewStack AI</span>
          </div>
          <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">
            Handcrafted for {business.businessName}
          </p>
        </footer>
      </div>
    </div>
  );
}
