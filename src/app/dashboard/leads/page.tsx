"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import {
  Mail,
  Phone,
  Calendar,
  Loader2,
  LayoutGrid,
  Building2,
  Tags,
  LogOut,
  Users,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database,
  Copy,
  Trash2,
  Check,
  MessageSquare,
  Clock
} from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  "New": "bg-blue-500/10 text-blue-400 border-blue-500/10",
  "Contacted": "bg-purple-500/10 text-purple-400 border-purple-500/10",
  "Closed": "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
};

export default function LeadsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchLeads();
    }
  }, [isLoaded, user, fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setLeads(leads.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  const filteredLeads = leads.filter(lead => 
    (lead.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.phone?.includes(searchTerm))
  );

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
        <div className="h-20 flex items-center gap-3 px-6 mb-2 border-b border-white/5">
          <img src="/logo.png" alt="Logo" className="w-12 h-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.1em] leading-tight">ReviewStack</span>
            <span className="text-[8px] font-medium text-white/30 uppercase tracking-[0.2em] leading-tight">AI Agent</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Management</p>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white border border-transparent text-sm font-semibold transition-all">
            <Building2 className="w-5 h-5" />
            My Businesses
          </Link>
          <Link href="/dashboard/tags" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white border border-transparent text-sm font-semibold transition-all">
            <Tags className="w-5 h-5" />
            Manage Tags
          </Link>
          <Link href="/dashboard/leads" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-600/10 text-blue-400 text-sm font-semibold border border-blue-500/10 transition-all">
            <Users className="w-5 h-5" />
            View Leads
          </Link>
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 space-y-4">
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
            <h1 className="text-xl font-bold tracking-tight">Interest Leads</h1>
          </div>
          
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium">Fetching potential clients...</p>
            </div>
          ) : (
          <div className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Lead Info</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contact Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Current Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-gray-500">
                          <Database className="w-10 h-10 opacity-20" />
                          <p className="text-sm font-medium">No leads found in the database yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{new Date(lead.createdAt).toLocaleDateString()}</p>
                              <p className="text-[10px] text-gray-500">{lead.source}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-sm group/contact">
                                <Mail className="w-3.5 h-3.5 text-blue-500/50" />
                                <a href={`mailto:${lead.email}`} className="font-medium text-white/90 hover:text-blue-400 hover:underline">{lead.email}</a>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(lead.email!)}
                                  className="opacity-0 group-hover/contact:opacity-100 p-1 hover:bg-white/5 rounded transition-all"
                                >
                                  <Copy className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-sm group/contact">
                                <Phone className="w-3.5 h-3.5 text-emerald-500/50" />
                                <a href={`tel:${lead.phone}`} className="font-mono text-white/70 hover:text-emerald-400 hover:underline">{lead.phone}</a>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(lead.phone!)}
                                  className="opacity-0 group-hover/contact:opacity-100 p-1 hover:bg-white/5 rounded transition-all"
                                >
                                  <Copy className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-2">
                            {["New", "Contacted", "Closed"].map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(lead.id, s)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                  lead.status === s 
                                  ? statusColors[s] 
                                  : "bg-white/5 text-gray-500 border-white/5 hover:bg-white/10"
                                }`}
                              >
                                {lead.status === s && <Check className="w-2.5 h-2.5 inline mr-1" />}
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a 
                              href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`} 
                              target="_blank"
                              className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 transition-all"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                            <button 
                              onClick={() => deleteLead(lead.id)}
                              className="p-2.5 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600/20 transition-all"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}
