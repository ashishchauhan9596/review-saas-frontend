"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import {
  Star,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Zap,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { useRef } from "react";
import confetti from "canvas-confetti";

interface Business {
  businessName: string;
  logoUrl: string | null;
  googlePlaceId: string;
  googleMapsUrl: string | null;
  category: string;
}

interface Tag {
  id: string;
  label: string;
  icon: string;
}

export default function ReviewLandingPage() {
  const { shortCode } = useParams();
  const [copied, setCopied] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [aiReview, setAiReview] = useState("");
  const [statusMessage, setStatusMessage] = useState("Preparing your review...");
  const [visibleTags, setVisibleTags] = useState<Tag[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const languages = [
    { name: "English", label: "English", code: "en", flag: "🇺🇸" },
    { name: "Hindi", label: "हिन्दी", code: "hi", flag: "🇮🇳" },
    { name: "Pahadi", label: "पहाड़ी", code: "ph", flag: "⛰️" },
  ];

  // 1. DISCOVERY QUERY (Business & Tags)
  const { data: discoveryData, isLoading: isDiscoveryLoading, isFetching: isDiscoveryFetching } = useQuery({
    queryKey: ['discovery', shortCode, selectedLanguage],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/discovery/${shortCode}?lang=${selectedLanguage}`);
      if (!response.ok) throw new Error('Business not found');
      return response.json() as Promise<{ business: Business; tags: Tag[] }>;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData, // Keep UI visible while switching
  });

  const business = discoveryData?.business;
  const aiTags = discoveryData?.tags || [];

  // Update visible tags when data arrives
  useEffect(() => {
    if (aiTags.length > 0) {
      setVisibleTags(aiTags.slice(0, 6));
      // Auto-select first tag for initial generation if nothing is selected
      if (selectedTags.length === 0) {
        setSelectedTags([aiTags[0].label]);
      }
    }
  }, [aiTags]);

  // 2. GENERATION MUTATION
  const mutation = useMutation({
    mutationFn: async ({ tags, rating }: { tags: string[], rating: number }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode,
          tags,
          language: selectedLanguage,
          rating
        })
      });
      if (response.status === 429) throw new Error("Slow down! Too many requests.");
      if (!response.ok) throw new Error("Failed to generate magic");
      return response.json();
    },
    onSuccess: (data) => {
      setAiReview(data.review);
      playSound('success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  });

  // Trigger initial generation once discovery is ready
  useEffect(() => {
    if (discoveryData && selectedTags.length > 0 && !aiReview && !mutation.isPending) {
      mutation.mutate({ tags: selectedTags, rating: selectedRating });
    }
  }, [discoveryData, selectedTags, aiReview]);

  // Handle status messages during generation
  useEffect(() => {
    if (mutation.isPending) {
      const statusMsgs = selectedLanguage === "Hindi" ? ["जादू हो रहा है...", "तैयार हो रहा है..."] : ["Casting Magic...", "Perfecting Details..."];
      let msgIndex = 0;
      setStatusMessage(statusMsgs[0]);
      const interval = setInterval(() => {
        msgIndex = (msgIndex + 1) % statusMsgs.length;
        setStatusMessage(statusMsgs[msgIndex]);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [mutation.isPending, selectedLanguage]);

  const applyMood = (moodTags: string[]) => {
    const newTags = Array.from(new Set([...selectedTags, ...moodTags]));
    setSelectedTags(newTags.slice(0, 5));
    setSelectedMood(moodTags.join(','));
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const shuffleTags = () => {
    setSelectedTags([]);
    setSelectedMood(null);
    const shuffled = [...aiTags].sort(() => 0.5 - Math.random());
    setVisibleTags(shuffled.slice(0, 6));
  };

  const toggleTag = (label: string) => {
    setSelectedMood(null);
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter(t => t !== label));
    } else {
      setSelectedTags([...selectedTags, label].slice(0, 5));
    }
  };

  const playSound = (type: 'sparkle' | 'success') => {
    if (typeof window === 'undefined') return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'sparkle') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
  };

  const handleGenerate = () => {
    playSound('sparkle');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    mutation.mutate({ tags: selectedTags, rating: selectedRating });
  };

  const handlePostReview = () => {
    if (!aiReview || !business) return;
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(30);
    navigator.clipboard.writeText(aiReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    const mapsUrl = business?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query_place_id=${business?.googlePlaceId}`;
    window.location.href = mapsUrl;
  };

  const getMoodPresets = () => {
    const category = business?.category?.toLowerCase() || "";
    const isHindi = selectedLanguage === "Hindi";
    const isPahadi = selectedLanguage === "Pahadi";

    if (category.includes("food") || category.includes("rest") || category.includes("cafe")) {
      return [
        { name: isHindi ? "स्वादिष्ट खाना" : isPahadi ? "स्वाद खाना" : "Loved Food", tags: ["Delicious Food", "Great Taste"], icon: "🥘" },
        { name: isHindi ? "शानदार माहौल" : isPahadi ? "खरा माहौल" : "Great Vibes", tags: ["Atmosphere", "Friendly Staff"], icon: "✨" },
        { name: isHindi ? "तेज सर्विस" : isPahadi ? "खरी सर्विस" : "Fast Service", tags: ["Fast Service", "Cleanliness"], icon: "⚡" },
      ];
    }
    return [
      { name: isHindi ? "बहुत बढ़िया" : isPahadi ? "बड़ा खरा" : "Excellent", tags: ["Quality", "Professional"], icon: "💎" },
      { name: isHindi ? "शानदार" : isPahadi ? "खरा" : "Great", tags: ["Friendly", "Atmosphere"], icon: "🌟" },
      { name: isHindi ? "जरूर आएं" : isPahadi ? "जरूर आओ" : "Recommend", tags: ["Recommend", "Satisfied"], icon: "👍" },
    ];
  };

  // ONLY show full screen loader if we have NO business data at all (First load)
  if (isDiscoveryLoading && !business) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;
  if (!business && !isDiscoveryFetching) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Business Not Found</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-3 sm:p-6 lg:p-8 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-[-20%] left-[-10%] w-full h-full bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-full h-full bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1250px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">

          {/* LEFT: SELECTION AREA */}
          <div className="lg:col-span-7 space-y-6">

            {/* Business Header */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 flex items-center gap-6 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-2 rounded-2xl shadow-xl shrink-0 relative z-10">
                  <img src={business?.logoUrl || ""} alt="logo" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="relative z-10">
                  <h1 className="text-2xl sm:text-3xl font-black mb-1 tracking-tight">{business?.businessName}</h1>
                  <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Top Rated Establishment
                  </div>
                </div>
              </div>

              {/* PREMIUM LANGUAGE SWITCHER */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-2 backdrop-blur-xl shadow-xl">
                <div className="flex gap-1 p-1">
                  {languages.map((lang) => {
                    const isActive = selectedLanguage === lang.name;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.navigator.vibrate) {
                            window.navigator.vibrate(20);
                          }
                          setSelectedLanguage(lang.name);
                        }}
                        className={`flex-1 flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl transition-all duration-300 relative overflow-hidden group ${isActive
                            ? "bg-white text-black shadow-[0_10px_25px_rgba(255,255,255,0.1)] scale-100"
                            : "hover:bg-white/5 text-white/30"
                          }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                        )}
                        <span className={`text-2xl mb-1 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                          {lang.flag}
                        </span>
                        <span className={`font-black uppercase tracking-tight transition-all ${lang.name === "English" ? "text-[12px] sm:text-sm" : "text-[16px] sm:text-[18px] leading-none"
                          } ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`}>
                          {lang.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rating & Action Panel */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col items-center justify-center py-4 bg-white/[0.02] border border-white/5 rounded-[2rem] mb-4 group">
                <div className="flex items-center gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map((starIdx) => (
                    <div key={starIdx} className="relative flex">
                      <button onClick={() => setSelectedRating(starIdx - 0.5)} className="w-4 sm:w-6 h-8 sm:h-12 absolute left-0 z-10 cursor-pointer" />
                      <button onClick={() => setSelectedRating(starIdx)} className="w-4 sm:w-6 h-8 sm:h-12 absolute right-0 z-10 cursor-pointer" />
                      <div className="relative">
                        <Star className={`w-7 h-7 sm:w-10 sm:h-10 transition-all ${selectedRating >= starIdx ? "fill-yellow-400 text-yellow-400" : selectedRating >= starIdx - 0.5 ? "fill-yellow-400/50 text-yellow-400/50" : "text-white/5"}`} />
                        {selectedRating === starIdx - 0.5 && <div className="absolute inset-0 overflow-hidden w-1/2"><Star className="w-7 h-7 sm:w-10 sm:h-10 fill-yellow-400 text-yellow-400" /></div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-2xl sm:text-4xl font-black">{selectedRating % 1 === 0 ? `${selectedRating}.0` : selectedRating}<span className="text-sm text-white/20 ml-1.5">/ 5.0</span></div>
              </div>

              <div className="flex flex-col items-center mb-3">
                <button onClick={() => setShowPersonalize(!showPersonalize)} className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group">
                  <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform duration-500 ${showPersonalize ? "rotate-180" : ""}`} />
                  <span className={`font-black uppercase tracking-[0.2em] transition-all ${selectedLanguage === "English" ? "text-[10px]" : "text-[13px]"
                    } text-white/60 group-hover:text-white`}>
                    {selectedLanguage === "English" ? "Personalize (Optional)" : selectedLanguage === "Hindi" ? "विवरण जोड़ें" : "विवरण जोड़ो"}
                  </span>
                </button>
              </div>

              {/* Advanced Personalization */}
              <div className={`transition-all duration-700 overflow-hidden ${showPersonalize ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="space-y-8 mb-8">
                  <div>
                    <h2 className="text-[14px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Quick Mood</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {getMoodPresets().map((mood, i) => {
                        const isActive = selectedMood === mood.tags.join(',');
                        return (
                          <button key={i} onClick={() => applyMood(mood.tags)} className={`flex-none flex flex-col items-center justify-center w-36 h-28 rounded-[2.5rem] transition-all duration-500 ${isActive ? "bg-blue-600 scale-110 shadow-xl" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>
                            <span className="text-3xl mb-2">{mood.icon}</span>
                            <span className="font-black uppercase text-[13px] text-white text-center px-2">{mood.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-[14px] font-black text-gray-500 uppercase tracking-[0.3em]">Personalize</h2>
                      <div className="flex items-center gap-4">
                        <button onClick={shuffleTags} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"><RefreshCw className="w-4 h-4 text-blue-400" /></button>
                        <div className="bg-blue-600/20 px-4 py-1.5 rounded-full border border-blue-500/30">
                          <span className="text-[12px] font-black text-blue-400">{selectedTags.length}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {visibleTags.map((tag) => (
                        <button key={tag.id} onClick={() => toggleTag(tag.label)} className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-500 ${selectedTags.includes(tag.label) ? "bg-blue-600 border-blue-400 scale-[1.05] text-white shadow-xl" : "bg-white/5 border-white/5 text-white/90 hover:border-white/20"}`}>
                          <span className="text-3xl">{tag.icon}</span>
                          <span className={`font-black uppercase tracking-tighter leading-tight ${selectedLanguage === "English" ? "text-[12px]" : "text-[16px]"}`}>{tag.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Action Button */}
              <button
                onClick={handleGenerate}
                disabled={mutation.isPending || selectedTags.length === 0}
                className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 ${mutation.isPending ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white shadow-2xl animate-pulse"}`}
              >
                {mutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5 text-yellow-300" />}
                <span className={selectedLanguage === "English" ? "text-xs" : "text-lg"}>
                  {selectedLanguage === "English" ? "Regenerate Magic" : selectedLanguage === "Hindi" ? "जादू फिर से देखें" : "जादू फिर देखो"}
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT: RESULT AREA (Sticky) */}
          <div ref={resultRef} className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
            {(aiReview || mutation.isPending) ? (
              <div className={`bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group transition-all duration-1000 ${mutation.isPending ? "scale-[1.03] shadow-[0_0_50px_rgba(37,99,235,0.5)] animate-pulse" : "scale-100"}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-32 h-32 rotate-12" /></div>
                <div className="relative z-10 space-y-8 text-center sm:text-left">
                  <div>
                    <h2 className="text-[13px] font-black text-white/50 uppercase tracking-[0.4em] mb-4 flex items-center justify-center sm:justify-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {selectedLanguage === "Hindi" ? "तैयार समीक्षा" : "Ready to Post"}
                    </h2>
                    {mutation.isPending ? (
                      <div className="flex flex-col items-center sm:items-start gap-6 py-10">
                        <div className="w-16 h-16 border-4 border-white/10 border-t-white/80 rounded-full animate-spin" />
                        <p className="text-xl font-black italic">{statusMessage}</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="font-bold italic text-white text-xl sm:text-2xl leading-tight">"{aiReview}"</p>
                      </div>
                    )}
                  </div>
                  {!mutation.isPending && (
                    <button onClick={handlePostReview} className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                      {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      {copied ? "COPIED!" : "Copy & Post"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 text-center flex flex-col items-center justify-center h-64 opacity-40">
                <Sparkles className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-white/20">Select stars to begin</p>
              </div>
            )}

            {mutation.isError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs font-black uppercase text-center tracking-widest">
                {mutation.error.message}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain rounded-md" />
            <span className="font-black uppercase tracking-widest text-[10px]">ReviewStack AI</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest">
            {business?.businessName || "Business"} • Trusted
          </p>
        </footer>
      </div>
    </div>
  );
}
