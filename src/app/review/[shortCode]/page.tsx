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
  Languages
} from "lucide-react";

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

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Hindi", code: "hi", flag: "🇮🇳" },
    { name: "Pahadi", code: "ph", flag: "⛰️" },
  ];

  const [aiTags, setAiTags] = useState<{ id: string, label: string, icon: string }[]>([]);
  const [initialTagsLoaded, setInitialTagsLoaded] = useState(false);

  const fetchBusinessAndTags = useCallback(async () => {
    try {
      // 1. Fetch Business Details
      const bizRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/business/${shortCode}`);
      if (!bizRes.ok) throw new Error('Business not found');
      const bizData = await bizRes.json();
      setBusiness(bizData);

      // 2. Fetch AI tags in the SELECTED LANGUAGE
      setInitialTagsLoaded(false); // Show skeleton while fetching
      setSelectedTags([]); // Clear old selections on language change

      const tagsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/tags/${shortCode}?lang=${selectedLanguage}`);
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setAiTags(tagsData.tags);
        setInitialTagsLoaded(true);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("We couldn't find this business. Please check the QR code and try again.");
    } finally {
      setLoading(false);
    }
  }, [shortCode, selectedLanguage]);

  useEffect(() => {
    fetchBusinessAndTags();
  }, [fetchBusinessAndTags]);

  const tags = aiTags; // Use the AI-generated tags!

  const toggleTag = (label: string) => {
    setSelectedTags(prev =>
      prev.includes(label)
        ? prev.filter(t => t !== label)
        : [...prev, label]
    );
  };

  const generateReview = async () => {
    if (selectedTags.length < 4) return;

    setIsGenerating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode: shortCode,
          tags: selectedTags,
          language: selectedLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiReview(data.review);
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
      setAiReview(`I had an amazing experience at ${business?.businessName}! The ${selectedTags.join(', ')} were exceptional. Highly recommended!`);
    } finally {
      setIsGenerating(false);
    }
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
                onClick={generateReview}
                disabled={selectedTags.length < 4 || isGenerating}
                className="w-full mt-6 sm:mt-10 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-700 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-sm sm:text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                {selectedLanguage === "Hindi" ? "AI समीक्षा तैयार करें" :
                  selectedLanguage === "Pahadi" ? "AI समीक्षा बणावा" :
                    "GENERATE AI REVIEW"}
              </button>
            </div>
          </div>
        </div>

        {/* AI Result - Full Width Bottom */}
        {aiReview && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-[2rem] p-6 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group mt-4">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-4">
                  {selectedLanguage === "Hindi" ? "तैयार समीक्षा" :
                    selectedLanguage === "Pahadi" ? "बणी दी समीक्षा" :
                      "Magic Ready"}
                </h2>
                <p className="text-xl sm:text-2xl font-bold leading-tight tracking-tight italic">"{aiReview}"</p>
              </div>
              <button
                onClick={handleCopyAndRedirect}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-5 rounded-2xl font-black text-base sm:text-lg transition-all shadow-2xl flex items-center gap-3 whitespace-nowrap active:scale-[0.95]"
              >
                {copied ?
                  (selectedLanguage === "Hindi" ? "नकल हो गई!" : selectedLanguage === "Pahadi" ? "नकल हुई गी!" : "Copied!") :
                  <><Copy className="w-5 h-5" />
                    {selectedLanguage === "Hindi" ? "कॉपी और पोस्ट" :
                      selectedLanguage === "Pahadi" ? "कॉपी करी के पोस्ट करा" :
                        "Copy & Post"}
                  </>
                }
              </button>
            </div>
          </div>
        )}

        {/* Minimal Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
            <img src="/logo.png" alt="Logo" className="w-6 h-auto" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">AI Google Review</span>
          </div>
          <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">
            Handcrafted for {business.businessName}
          </p>
        </footer>
      </div>
    </div>
  );
}
