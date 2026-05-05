"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { 
  Building2, 
  Tags, 
  LogOut, 
  Zap, 
  Loader2, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight,
  Save,
  X
} from "lucide-react";

interface IndustryTag {
  id: string;
  category: string;
  tag: string;
  icon: string | null;
  language: string;
}

export default function TagsManagerPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  
  const [tags, setTags] = useState<IndustryTag[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Bulk Create State
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkLanguage, setBulkLanguage] = useState("English");
  const [bulkTags, setBulkTags] = useState([{ tag: "", icon: "" }]);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Edit State
  const [editingTag, setEditingTag] = useState<Partial<IndustryTag> | null>(null);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, page, debouncedSearch]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchTags();
    }
  }, [isLoaded, user, fetchTags]);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBulk(true);
    setBulkError(null);
    try {
      const token = await getToken();
      
      if (!bulkCategory.trim()) {
        throw new Error("Industry Category is required.");
      }

      // Check for duplicates in the form
      const tagNames = bulkTags.map(t => t.tag.trim().toLowerCase()).filter(Boolean);
      const uniqueTagNames = new Set(tagNames);
      if (tagNames.length !== uniqueTagNames.size) {
        throw new Error("You have entered duplicate tags in this list.");
      }

      const validTags = bulkTags
        .filter(t => t.tag.trim())
        .map(t => ({ category: bulkCategory.trim(), tag: t.tag.trim(), icon: t.icon.trim(), language: bulkLanguage }));
      
      if (validTags.length === 0) {
        throw new Error("Please fill in at least one tag completely.");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tags: validTags })
      });
      
      if (!res.ok) throw new Error("Failed to create tags");
      
      setShowBulkForm(false);
      setBulkCategory("");
      setBulkLanguage("English");
      setBulkTags([{ tag: "", icon: "" }]);
      fetchTags();
    } catch (err: any) {
      setBulkError(err.message);
    } finally {
      setSubmittingBulk(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTags();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingTag)
      });
      setEditingTag(null);
      fetchTags();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#050505] flex justify-center items-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar (Reused) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-72 flex-col bg-[#0A0A0A] border-r border-white/5 transition-transform duration-300">
        <div className="h-20 flex items-center gap-3 px-6 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block">Review Stack</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] leading-none">Intelligence</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Management</p>
          <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-gray-400 hover:bg-white/5 hover:text-white border border-transparent">
            <Building2 className="w-5 h-5" /> My Businesses
          </Link>
          <Link href="/dashboard/tags" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all bg-blue-600/10 text-blue-400 border border-blue-500/10">
            <Tags className="w-5 h-5" /> Manage Tags
          </Link>
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 space-y-4">
          <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-semibold transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative lg:ml-72">
        <header className="h-20 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 z-40 sticky top-0">
          <h1 className="text-xl font-bold tracking-tight">Tag Library</h1>
          <button onClick={() => setShowBulkForm(!showBulkForm)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Multiple Tags
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {/* Search & List */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-500 absolute left-5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by category or tag name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/[0.02] text-gray-400 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-bold">Icon</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold">Tag</th>
                    <th className="px-6 py-4 font-bold">Language</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading...</td></tr>
                  ) : tags.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No tags found for your search.</td></tr>
                  ) : tags.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3.5 text-xl">{t.icon}</td>
                      <td className="px-6 py-3.5 font-bold text-gray-300">{t.category}</td>
                      <td className="px-6 py-3.5">{t.tag}</td>
                      <td className="px-6 py-3.5 text-xs text-gray-400">{t.language}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => setEditingTag(t)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors bg-white/0 hover:bg-white/5 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-white/0 hover:bg-white/5 rounded-xl ml-1"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-t border-white/5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bulk Add Modal */}
      {showBulkForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBulkForm(false)} />
          <div className="relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-[32px] shadow-2xl p-8 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowBulkForm(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Plus className="w-6 h-6 text-blue-500" /> Bulk Add Tags</h2>
            <p className="text-gray-500 text-sm mb-6">Add multiple tags across different categories at once.</p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <form id="bulkForm" onSubmit={handleBulkSubmit}>
                {bulkError && <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-xl">{bulkError}</div>}
                
                <div className="mb-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Industry Category</label>
                     <input type="text" placeholder="e.g. Hotel, Restaurant, Retail" required value={bulkCategory} onChange={e => setBulkCategory(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all shadow-inner" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Language</label>
                     <select value={bulkLanguage} onChange={e => setBulkLanguage(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all shadow-inner appearance-none">
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Pahadi">Pahadi</option>
                     </select>
                   </div>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tags for {bulkCategory || "Category"} ({bulkLanguage})</label>
                </div>

                <div className="space-y-3">
                  {bulkTags.map((t, idx) => (
                    <div key={idx} className="flex gap-3 items-center group">
                      <input type="text" placeholder="Tag Name (e.g. Great Service)" required value={t.tag} onChange={e => { const newT = [...bulkTags]; newT[idx].tag = e.target.value; setBulkTags(newT); }} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all" />
                      <input type="text" placeholder="Emoji (e.g. 🏨)" value={t.icon} onChange={e => { const newT = [...bulkTags]; newT[idx].icon = e.target.value; setBulkTags(newT); }} className="w-28 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-center text-sm focus:border-blue-500 outline-none transition-all" />
                      {bulkTags.length > 1 ? (
                        <button type="button" onClick={() => setBulkTags(bulkTags.filter((_, i) => i !== idx))} className="p-3 text-gray-500 hover:text-red-400 transition-colors bg-white/0 hover:bg-white/5 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                      ) : (
                        <div className="w-10"></div>
                      )}
                    </div>
                  ))}
                </div>
              </form>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
              <button type="button" onClick={() => setBulkTags([...bulkTags, {tag:'', icon:''}])} className="text-blue-400 text-sm font-bold flex items-center gap-2 hover:text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-500/10 transition-colors">
                <Plus className="w-4 h-4" /> Add Row
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBulkForm(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm">Cancel</button>
                <button type="submit" form="bulkForm" disabled={submittingBulk} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                  {submittingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingTag(null)} />
          <div className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6">Edit Tag</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Category</label>
                <input type="text" required value={editingTag.category} onChange={e => setEditingTag({...editingTag, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Tag Name</label>
                <input type="text" required value={editingTag.tag} onChange={e => setEditingTag({...editingTag, tag: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 text-sm mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Language</label>
                <select value={editingTag.language} onChange={e => setEditingTag({...editingTag, language: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 text-sm mt-1 appearance-none">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Pahadi">Pahadi</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Icon</label>
                <input type="text" value={editingTag.icon || ''} onChange={e => setEditingTag({...editingTag, icon: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 text-sm mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingTag(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
