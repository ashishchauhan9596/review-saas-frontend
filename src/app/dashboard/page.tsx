"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserButton, useUser, useAuth, useClerk } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  Building2,
  QrCode,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  LayoutGrid,
  Activity,
  X,
  Zap,
  Hotel,
  Utensils,
  Stethoscope,
  ShoppingBag,
  LogOut,
  Download,
  Globe,
  Lock,
  Tags,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  businessName: string;
  googlePlaceId: string;
  googleMapsUrl: string | null;
  shortCode: string;
  qrCodeUrl: string | null;
  logoUrl: string | null;
  category: string;
  reviewTone: string;
  _count: {
    scanEvents: number;
  };
}

interface IndustryTag {
  id: string;
  category: string;
  tag: string;
  icon: string | null;
}

const CATEGORIES = [
  { name: "Restaurant", icon: <Utensils className="w-4 h-4" /> },
  { name: "Hotel", icon: <Hotel className="w-4 h-4" /> },
  { name: "Medical", icon: <Stethoscope className="w-4 h-4" /> },
  { name: "Retail", icon: <ShoppingBag className="w-4 h-4" /> },
];

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPreviewCode, setSelectedPreviewCode] = useState<string | null>(null);
  const [expanding, setExpanding] = useState(false);

  // Tag Manager State
  const [showTagManager, setShowTagManager] = useState(false);
  const [tags, setTags] = useState<IndustryTag[]>([]);
  const [tagsPage, setTagsPage] = useState(1);
  const [tagsTotalPages, setTagsTotalPages] = useState(1);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagForm, setTagForm] = useState<Partial<IndustryTag> | null>(null);
  const [submittingTag, setSubmittingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    googlePlaceId: "",
    googleMapsUrl: "",
    logoUrl: "",
    reviewTone: "Professional",
  });

  const fetchBusinesses = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data);
      }
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchTags = useCallback(async (page = 1) => {
    setLoadingTags(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags);
        setTagsTotalPages(data.totalPages);
        setTagsPage(data.currentPage);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setLoadingTags(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (showTagManager) fetchTags(tagsPage);
  }, [showTagManager, fetchTags, tagsPage]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchBusinesses();
    }
  }, [isLoaded, user, fetchBusinesses]);

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, googlePlaceId: url, googleMapsUrl: "" }));
    setError(null);
    setSuccess(null);
  };

  const handleVerifyUrl = async () => {
    const url = formData.googlePlaceId;
    if (!url) return;

    if (url.includes('google.com/maps') || url.includes('maps.app.goo.gl')) {
      setExpanding(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/expand/metadata?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.placeId) {
            setFormData(prev => ({
              ...prev,
              businessName: data.name || prev.businessName,
              category: data.category || prev.category,
              googlePlaceId: data.placeId,
              googleMapsUrl: data.reviewLink || url,
              logoUrl: data.logoUrl || prev.logoUrl
            }));
            setSuccess("Google Maps link verified!");
            setTimeout(() => setSuccess(null), 3000);
          } else {
            setError("URL is not verified. Please use a valid Google Maps link.");
            setFormData(prev => ({ ...prev, googlePlaceId: "" }));
          }
        } else {
          setError("URL is not verified. Server responded with an error.");
          setFormData(prev => ({ ...prev, googlePlaceId: "" }));
        }
      } catch (err) {
        console.error('Failed to expand URL:', err);
        setError("URL is not verified. Network error.");
        setFormData(prev => ({ ...prev, googlePlaceId: "" }));
      } finally {
        setExpanding(false);
      }
    } else {
      setError("URL is not verified. Must be a Google Maps link.");
      setFormData(prev => ({ ...prev, googlePlaceId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create business");
      }

      setSuccess("Business created successfully!");
      setFormData({ businessName: "", category: "", googlePlaceId: "", googleMapsUrl: "", logoUrl: "", reviewTone: "Professional" });
      fetchBusinesses();
      setTimeout(() => {
        setSuccess(null);
        setShowForm(false);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagForm) return;
    setSubmittingTag(true);
    setTagError(null);
    try {
      const token = await getToken();
      const url = tagForm.id ? `${process.env.NEXT_PUBLIC_API_URL}/api/tags/${tagForm.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/tags`;
      const method = tagForm.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(tagForm)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save tag");
      }
      setTagForm(null);
      fetchTags(tagsPage);
    } catch (err: any) {
      setTagError(err.message);
    } finally {
      setSubmittingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTags(tagsPage);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = async (url: string, businessName: string) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, '_blank');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Hotel": return <Hotel className="w-4 h-4" />;
      case "Medical": return <Stethoscope className="w-4 h-4" />;
      case "Retail": return <ShoppingBag className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[#0A0A0A] border-r border-white/5 transition-transform duration-300 lg:static lg:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 mb-2 border-b border-white/5">
          <img src="/logo.png" alt="Logo" className="w-12 h-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.1em] leading-tight">AI Google</span>
            <span className="text-[8px] font-medium text-white/30 uppercase tracking-[0.2em] leading-tight">Review Agent</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Management</p>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-600/10 text-blue-400 text-sm font-semibold border border-blue-500/10 transition-all">
            <Building2 className="w-5 h-5" />
            My Businesses
          </Link>
          <Link href="/dashboard/tags" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white border border-transparent text-sm font-semibold transition-all">
            <Tags className="w-5 h-5" />
            Manage Tags
          </Link>
        </nav>

        {/* User profile */}
        <div className="p-6 mt-auto border-t border-white/5 space-y-4 bg-gradient-to-t from-white/[0.02] to-transparent">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.firstName || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-semibold transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-gray-400"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Business</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium animate-pulse">Loading your empire...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center">
              <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                <Building2 className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No businesses yet</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">Ready to transform your reviews? Add your first Google Maps business to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-black px-8 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {businesses.map((biz) => (
                <div key={biz.id} className="group relative bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 hover:border-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-blue-500/5">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-500/10">
                          {getCategoryIcon(biz.category)}
                          {biz.category}
                        </span>
                        <button
                          onClick={() => setSelectedPreviewCode(biz.shortCode)}
                          className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border border-white/5 hover:bg-white/10 transition-all flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Live Preview
                        </button>
                      </div>
                      <h3 className="text-xl font-bold mb-2 truncate group-hover:text-blue-400 transition-colors">{biz.businessName}</h3>
                      <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5" />
                          <span className="font-mono">{biz.shortCode}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          <span>{biz._count?.scanEvents || 0} scans</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      {biz.logoUrl ? (
                        <img
                          src={biz.logoUrl}
                          alt={biz.businessName}
                          className="w-20 h-20 rounded-2xl object-cover bg-white p-1 border border-white/10 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                          <Building2 className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 mb-6">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-[11px] text-gray-400 truncate flex-1 font-mono uppercase">
                      {biz.googlePlaceId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(biz.googlePlaceId, biz.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                    >
                      {copiedId === biz.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadQR(biz.qrCodeUrl || "", biz.businessName)}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all group"
                    >
                      <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      Download QR
                    </button>
                    <Link
                      href={`/review/${biz.shortCode}`}
                      target="_blank"
                      className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20"
                    >
                      <ExternalLink className="w-6 h-6 text-white" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Side Preview Drawer */}
      {selectedPreviewCode && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPreviewCode(null)} />
          <div className="relative w-full max-w-lg bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-bold text-sm tracking-tight">Live Customer View</span>
              </div>
              <button onClick={() => setSelectedPreviewCode(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-black relative">
              <iframe
                src={`/review/${selectedPreviewCode}`}
                className="w-full h-full border-none"
                title="Live Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Business Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 rounded-[32px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6">
              <Plus className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Add New Business</h2>
            <p className="text-gray-500 mb-8 text-sm">Fill in the details below to start generating AI reviews.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {success}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Google Maps URL</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Paste Google Maps URL here"
                      className={`w-full bg-white/5 border rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm ${expanding ? 'border-blue-500/50' : 'border-white/10'}`}
                      value={formData.googlePlaceId}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      disabled={expanding}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      {expanding ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : formData.googleMapsUrl ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {!formData.googleMapsUrl && (
                    <button
                      type="button"
                      onClick={handleVerifyUrl}
                      disabled={!formData.googlePlaceId || expanding}
                      className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-2xl font-bold text-sm transition-all whitespace-nowrap disabled:opacity-50"
                    >
                      Verify URL
                    </button>
                  )}
                </div>
                {!formData.googleMapsUrl && (
                  <p className="text-[10px] text-gray-500 px-1 italic animate-in fade-in">Paste the link from Google Maps to begin...</p>
                )}
              </div>

              {formData.googleMapsUrl && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Business Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Industry</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                          <Building2 className="w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Logo URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-1">Review Deep Link (Verified)</label>
                    <div className="relative">
                      <textarea
                        readOnly
                        rows={5}
                        className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-5 py-4 text-[11px] font-mono text-emerald-400 focus:outline-none cursor-default resize-none"
                        value={formData.googleMapsUrl}
                      />
                      <div className="absolute right-5 bottom-5">
                        <Lock className="w-4 h-4 text-emerald-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-all text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      {submitting ? "Creating..." : "Create Business"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
