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

  const [aiTags, setAiTags] = useState<{id: string, label: string, icon: string}[]>([]);
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
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {business.logoUrl && (
            <img 
              src={business.logoUrl} 
              alt={business.businessName} 
              className="w-24 h-24 rounded-2xl mx-auto mb-6 object-cover border border-white/10 shadow-2xl"
            />
          )}
          <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {business.businessName}
          </h1>
          <p className="text-gray-400">Share your experience and support us!</p>
        </div>

        {/* Language Selection */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-4 backdrop-blur-xl">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
            <Globe className="w-4 h-4 text-blue-400" />
            {selectedLanguage === "Hindi" ? "समीक्षा भाषा चुनें" : 
             selectedLanguage === "Pahadi" ? "समीक्षा री भाषा चुणा" : 
             "Select Review Language"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  if (selectedLanguage === lang.name) return;
                  setSelectedLanguage(lang.name);
                  setInitialTagsLoaded(false); // Trigger skeleton for tags
                  setAiReview(""); // Clear old review
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 text-sm font-medium ${
                  selectedLanguage === lang.name
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                    : "bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                <span>{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Selection */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 mb-8 backdrop-blur-xl">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {selectedLanguage === "Hindi" ? "आपको क्या पसंद आया?" : 
             selectedLanguage === "Pahadi" ? "तुसां जो क्या पसंद आया?" : 
             "What did you love?"}
          </h2>

          {selectedTags.length < 4 && (
            <p className="text-xs font-medium text-gray-400 mb-6 flex items-center gap-2 animate-pulse">
              {selectedLanguage === "Hindi" ? `कृपया कम से कम 4 टैग चुनें (${selectedTags.length}/4)` : 
               selectedLanguage === "Pahadi" ? `कम से कम 4 टैग चुणा (${selectedTags.length}/4)` : 
               `Please select at least 4 tags (${selectedTags.length}/4)`}
            </p>
          )}

          {!initialTagsLoaded ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.label)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                    selectedTags.includes(tag.label)
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                      : "bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-xl">{tag.icon}</span>
                  <span className="font-medium text-sm">{tag.label}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={generateReview}
            disabled={selectedTags.length < 4 || isGenerating}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-gray-500 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
            {selectedLanguage === "Hindi" ? "AI समीक्षा तैयार करें" : 
             selectedLanguage === "Punjabi" ? "AI ਸਮੀਖਿਆ ਬਣਾਓ" : 
             selectedLanguage === "Pahadi" ? "AI समीक्षा बणावा" : 
             "Generate AI Review"}
          </button>
        </div>

        {/* AI Result */}
        {aiReview && (
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Your AI Assistant Wrote:
            </h2>

            <p className="text-lg leading-relaxed text-white/90 mb-8 italic">
              "{aiReview}"
            </p>
            
            <button
              onClick={handleCopyAndRedirect}
              className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied! Opening Google...
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy & Write Review on Google
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Step 1: Click button to copy. Step 2: Paste on Google.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-xs flex items-center justify-center gap-1">
            Powered by <span className="font-bold">Review Stack AI</span> <Heart className="w-3 h-3 fill-current text-red-500" />
          </p>
        </div>
      </div>
    </div>
  );
}
