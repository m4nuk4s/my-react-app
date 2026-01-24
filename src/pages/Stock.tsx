import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  ShieldCheck, 
  Laptop, 
  ChevronDown, 
  Download,
  RotateCcw,
  MinusCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import BackVideo from "@/assets/wtpth/backvi.mp4";

interface StockItem {
  id?: string;
  model: string;
  part: string; 
  partcode: string;
  category: string;
  compatible: boolean;
  stock: number;
  status: string;
  loc: string; 
}

const statusStyle = (status: string) => {
  switch (status) {
    case "in_stock": 
      return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30";
    case "low_stock": 
      return "bg-amber-100 text-amber-900 dark:bg-yellow-500/20 dark:text-yellow-400 border border-amber-200 dark:border-yellow-500/30";
    case "Out of Stock": 
      return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30";
    default: 
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-500/20 dark:text-zinc-400";
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Stock() {
  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modelSearch, setModelSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [partCodeSearch, setPartCodeSearch] = useState(""); 
  const [visibleCount, setVisibleCount] = useState(10);
  const [locSearch, setLocSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockItem; direction: 'asc' | 'desc' } | null>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<StockItem>>({});

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingItem, setMovingItem] = useState<StockItem | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [movements, setMovements] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [canEditStock, setCanEditStock] = useState(false);

  const [selectedTech, setSelectedTech] = useState<string>("");
  const [customTech, setCustomTech] = useState<string>("");
  const techs = ["ESI", "TRE", "TBR", "MAI", "MKR"];

  useEffect(() => {
    fetchStock();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "Unknown User");
      const { data: userData } = await supabase
        .from('users')
        .select('isadmin, editstock')
        .eq('id', user.id)
        .single();

      if (userData) {
        setIsAdmin(userData.isadmin === true);
        setCanEditStock(userData.editstock === true);
      }
    }
  };

  const fetchStock = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("stock").select("*").order("category", { ascending: true });
    if (!error) setData(data || []);
    setLoading(false);
  };

  const fetchMovements = async () => {
    setLogsLoading(true);
    const { data, error } = await supabase
      .from("movement")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setMovements(data || []);
    setLogsLoading(false);
  };

  const resetFilters = () => {
    setModelSearch("");
    setModelFilter("");
    setPartCodeSearch("");
    setLocSearch("");
    setSortConfig(null);
    setVisibleCount(10);
    toast.info("Filters and sorting reset");
  };

  const handleStockMovement = async () => {
    if (!movingItem || !movingItem.id) return;
    
    const finalTech = selectedTech === "other" ? customTech : selectedTech;
    if (!finalTech) {
      toast.error("Please select or enter a technician");
      return;
    }

    const oldQty = movingItem.stock;
    if (oldQty <= 0) {
      toast.error("Stock is already empty");
      return;
    }

    const newQty = oldQty - 1;
    const autoStatus = newQty === 0 ? "Out of Stock" : newQty <= 10 ? "low_stock" : "in_stock";

    const { error: updateError } = await supabase
      .from("stock")
      .update({ stock: newQty, status: autoStatus })
      .eq("id", movingItem.id);

    if (updateError) {
      toast.error("Update failed");
      return;
    }

    const { error: logError } = await supabase.from("movement").insert({
      user: userEmail,
      tech: finalTech,
      pkqt: 1,
      part: movingItem.partcode,
      location: movingItem.loc,
      oldqt: oldQty,
      newqt: newQty
    });

    if (!logError) {
      toast.success(`Part consumed by ${finalTech}`);
      setIsMoveModalOpen(false);
      setSelectedTech("");
      setCustomTech("");
      fetchStock();
    }
  };

  const handleSave = async () => {
    const stockCount = currentItem.stock || 0;
    const autoStatus = stockCount === 0 ? "Out of Stock" : stockCount <= 10 ? "low_stock" : "in_stock";
    const payload = { ...currentItem, status: autoStatus, compatible: true, sn: "N/A" };
    const { error } = await supabase.from("stock").upsert(payload);
    if (!error) {
      toast.success("Inventory updated");
      setIsModalOpen(false);
      fetchStock();
    }
  };

  const exportToDatasheet = () => {
    if (filtered.length === 0) return toast.error("No data to export");
    const headers = ["Component Description", "Model", "Part Code", "Location", "Stock Count", "Current Status"];
    const formatCSVCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      const stringVal = String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    };
    const csvRows = filtered.map(item => [
      formatCSVCell(item.category),
      formatCSVCell(item.model),
      formatCSVCell(item.partcode),
      formatCSVCell(item.loc || 'N/A'),
      formatCSVCell(item.stock),
      formatCSVCell(item.status.replace("_", " ").toUpperCase())
    ].join(","));
    const csvContent = "sep=,\n" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Compatible datasheet exported");
  };

  const requestSort = (key: keyof StockItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filtered = data.filter(item => {
    const matchesModelDropdown = !modelFilter || item.model === modelFilter;
    const matchesModelSearch = !modelSearch || item.model.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesPartCode = !partCodeSearch || item.partcode.toLowerCase().includes(partCodeSearch.toLowerCase());
    const matchesLoc = !locSearch || (item.loc && item.loc.toLowerCase().includes(locSearch.toLowerCase()));
    return matchesModelDropdown && matchesModelSearch && matchesPartCode && matchesLoc;
  }).sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = a[key];
    const bValue = b[key];

    if (key === 'stock') {
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    const aStr = String(aValue ?? "").toLowerCase();
    const bStr = String(bValue ?? "").toLowerCase();
    if (aStr < bStr) return direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const displayedItems = filtered.slice(0, visibleCount);

  const SortIcon = ({ column }: { column: keyof StockItem }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-red-600" /> : <ArrowDown size={14} className="text-red-600" />;
  };

  return (
    <div className="relative min-h-screen text-foreground bg-[#050505] selection:bg-red-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10">
        <section className="relative pt-12 pb-6 z-10">
  <div className="container mx-auto px-6">
    <div className="max-w-full">
      
      {/* 1. Header Area - Locked White for visibility over background */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white transition-colors">
            Notebook Parts <span className="font-bold uppercase text-red-600">Inventory</span>
          </h1>
          <p className="hidden md:block text-zinc-400 text-[10px] uppercase tracking-[0.3em] mt-2 italic font-medium">
            System: Connected / Database: Live
          </p>
        </div>
      </div>

      <p className="text-zinc-200 text-base max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md mb-8">
        Access real-time stock tracking and component compatibility database.
      </p>

      {/* 2. Main Search Section */}
      <div className="bg-white/90 dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-lg dark:shadow-2xl transition-all backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          
          {/* Part Code - Search Icon */}
          <div className="md:col-span-3 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              type="text"
              placeholder="Ex. LCD-OR1623"
              value={partCodeSearch || ''}
              onChange={(e) => {setPartCodeSearch(e.target.value); setVisibleCount(20);}}
              className="w-full h-12 pl-12 pr-4 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-sm"
            />
          </div>

          {/* Model Search - CPU/Chip Icon */}
          <div className="md:col-span-2 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line></svg>
            </div>
            <input
              type="text"
              placeholder="Ex N17C12"
              value={modelSearch || ''}
              onChange={(e) => {setModelSearch(e.target.value); setVisibleCount(20);}}
              className="w-full h-12 pl-11 pr-4 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-sm"
            />
          </div>

          {/* Location Search - Map Pin Icon */}
          <div className="md:col-span-2 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <input
              type="text"
              placeholder="Loc"
              value={locSearch || ''}
              onChange={(e) => {setLocSearch(e.target.value); setVisibleCount(20);}}
              className="w-full h-12 pl-11 pr-4 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-sm"
            />
          </div>

          {/* Category Dropdown - Layers Icon */}
          <div className="md:col-span-3 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-hover:text-red-600 transition-colors pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <select 
              value={modelFilter || ''}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full h-12 pl-11 pr-10 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-slate-950 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold uppercase text-[10px] tracking-widest"
            >
              <option value="" className="bg-white dark:bg-zinc-900">All Notebooks</option>
              {data && Array.from(new Set(data.map(i => i.model))).sort().map(m => (
                <option key={m} value={m} className="bg-white dark:bg-zinc-900">{m}</option>
              ))}
            </select>
          </div>

          {/* Reset & Export Buttons - Red Glow Hover Dark Mode */}
          <div className="md:col-span-2 flex gap-1">
            <button 
              onClick={resetFilters} 
              className="flex-1 h-12 flex items-center justify-center bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-700 dark:text-white hover:bg-red-500 dark:hover:bg-red-600/20 dark:hover:border-red-600/40 dark:hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 transition-transform group-hover:rotate-180 duration-500"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </button>
            <button 
              onClick={exportToDatasheet} 
              className="flex-1 h-12 flex items-center justify-center bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-700 dark:text-white hover:bg-red-500 dark:hover:bg-red-600/20 dark:hover:border-red-600/40 dark:hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Admin Row - Matching Hover Effects */}
      {isAdmin && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <button 
            onClick={() => { fetchMovements(); setIsLogsModalOpen(true); }}
            className="h-8 px-4 bg-slate-200/80 dark:bg-white/5 hover:bg-red-500 dark:hover:bg-red-600/20 border border-slate-300 dark:border-white/10 dark:hover:border-red-600/40 text-slate-700 dark:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 dark:hover:shadow-[0_0_10px_rgba(220,38,38,0.2)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Logs
          </button>
          <button 
            onClick={() => {setCurrentItem({}); setIsModalOpen(true);}}
            className="h-8 px-4 bg-slate-200/80 dark:bg-white/5 hover:bg-red-500 dark:hover:bg-red-600/20 border border-slate-300 dark:border-white/10 dark:hover:border-red-600/40 text-slate-700 dark:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 dark:hover:shadow-[0_0_10px_rgba(220,38,38,0.2)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Part
          </button>
        </div>
      )}

    </div>
  </div>
</section>

        <div className="container mx-auto px-6 pb-32">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl overflow-hidden bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b-2 border-slate-300 dark:border-white/10 shadow-md">
                    <th onClick={() => requestSort('category')} className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 cursor-pointer hover:bg-red-500/5 group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> 
                        Component <SortIcon column="category" />
                      </div>
                    </th>
                    <th onClick={() => requestSort('partcode')} className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-center cursor-pointer hover:bg-red-500/5 group transition-all">
                      <div className="flex items-center justify-center gap-2">Part Code <SortIcon column="partcode" /></div>
                    </th>
                    <th onClick={() => requestSort('loc')} className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-center cursor-pointer hover:bg-red-500/5 group transition-all">
                      <div className="flex items-center justify-center gap-2">Loc <SortIcon column="loc" /></div>
                    </th>
                    <th onClick={() => requestSort('stock')} className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-center cursor-pointer hover:bg-red-500/5 group transition-all">
                      <div className="flex items-center justify-center gap-2">Stock <SortIcon column="stock" /></div>
                    </th>
                    <th onClick={() => requestSort('status')} className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-right cursor-pointer hover:bg-red-500/5 group transition-all">
                      <div className="flex items-center justify-end gap-2">Status <SortIcon column="status" /></div>
                    </th>
                    <th className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {displayedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-red-500/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-14 bg-zinc-800 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.part && <img src={item.part} alt="" className="w-full h-full object-contain" />}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-slate-950 dark:text-white uppercase tracking-tight group-hover:text-red-600 transition-colors">
                              {item.category}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-zinc-300 flex items-center gap-2 font-bold mt-1">
                              <Laptop size={14} className="text-red-600" /> {item.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center font-mono text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase">{item.partcode}</td>
                      <td className="p-6 text-center text-sm font-bold text-slate-600 dark:text-zinc-400">
                        <div className="flex items-center justify-center gap-1.5">
                          <MapPin size={16} className="text-red-600 " /> {item.loc || "N/A"}
                        </div>
                      </td>
                      <td className="p-6 text-center text-xl font-bold text-slate-950 dark:text-white">{item.stock ?? 0}</td>
                      <td className="p-6 text-right">
                        <Badge variant="outline" className={`${statusStyle(item.status)} border-2 rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider`}>
                          {item.status === "out" ? "Out of Stock" : item.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex justify-center gap-3">
                          {canEditStock && (
                            <button 
                              onClick={() => { setMovingItem(item); setIsMoveModalOpen(true); }}
                              className="p-3 rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-white dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-amber-500 dark:hover:text-white"
                              title="Consume 1 Part"
                            >
                              <MinusCircle size={18} />
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button onClick={() => {setCurrentItem(item); setIsModalOpen(true);}} className="p-3 rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-red-600 dark:hover:text-white">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => { if(confirm("Delete?")) supabase.from("stock").delete().eq("id", item.id!).then(fetchStock); }} className="p-3 rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-red-600 dark:hover:text-white">
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > visibleCount && (
              <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex justify-center border-t border-slate-200 dark:border-white/10">
                <Button onClick={() => setVisibleCount(prev => prev + 20)} variant="ghost" className="text-slate-950 dark:text-white uppercase text-sm font-normal tracking-widest hover:bg-red-600 hover:text-white px-10 py-6 rounded-xl transition-all">
                  Load More ({filtered.length - visibleCount}) <ChevronDown size={20} className="ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isMoveModalOpen && movingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="relative overflow-hidden border-none bg-white dark:bg-zinc-950 shadow-2xl p-8">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">Confirm Movement</h2>
                    <p className="text-sm text-zinc-500">Inventory decrement log</p>
                  </div>
                  <button onClick={() => setIsMoveModalOpen(false)} className="text-zinc-400 hover:text-red-500"><X size={20}/></button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl mb-6">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-white/10">
                    {movingItem.part ? <img src={movingItem.part} className="w-full h-full object-contain" /> : <Laptop size={24}/>}
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-amber-500 tracking-widest">{movingItem.partcode}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{movingItem.category}</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-center text-slate-600 dark:text-zinc-400 leading-relaxed">
                    This action will <span className="text-red-500 font-bold uppercase">consume one spare part</span> from stock and log the transaction.
                  </p>
                  <div className="flex flex-col gap-4 p-3 border-y border-zinc-200 dark:border-white/10">
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-500">Current Stock</span>
                      <span className="font-bold dark:text-white">{movingItem.stock} → <span className="text-red-500">{movingItem.stock - 1}</span></span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase text-amber-500 tracking-widest">Assign Technician</label>
                      <select 
                        value={selectedTech}
                        onChange={(e) => setSelectedTech(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-zinc-900 border-none text-sm font-bold text-zinc-900 dark:text-white outline-none ring-1 ring-zinc-200 dark:ring-white/10 focus:ring-2 focus:ring-amber-500 transition-all"
                      >
                        <option value="">Select Tech...</option>
                        {techs.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="other">Type name...</option>
                      </select>
                      {selectedTech === "other" && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                          <Input 
                            placeholder="Enter Technician Name" 
                            value={customTech}
                            onChange={(e) => setCustomTech(e.target.value.toUpperCase())}
                            className="h-11 bg-zinc-100 dark:bg-white/5 border-none ring-1 ring-amber-500"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleStockMovement} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl transition-all active:scale-95">Yes, Consume Part</Button>
                  <Button onClick={() => setIsMoveModalOpen(false)} variant="outline" className="flex-1 h-12 rounded-xl">Cancel</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogsModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-5xl">
              <Card className="relative overflow-hidden border-none bg-white dark:bg-zinc-950 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                <div className="p-8 flex justify-between items-center border-b border-zinc-100 dark:border-white/5">
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white uppercase tracking-tighter">System <span className="text-red-600">Logs</span></h2>
                    <p className="text-sm text-zinc-500">Inventory movement history</p>
                  </div>
                  <button onClick={() => setIsLogsModalOpen(false)} className="text-zinc-400 hover:text-red-500 transition-colors">
                    <X size={28}/>
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 z-10">
                      <tr>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-500">Timestamp</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-500">User</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 text-center">Tech</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 text-center">Part Code</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 text-center">Old Qty</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 text-center">New Qty</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 text-right">Loc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {logsLoading ? (
                        <tr><td colSpan={7} className="p-10 text-center text-zinc-500">Loading records...</td></tr>
                      ) : movements.map((log) => (
                        <tr key={log.id} className="hover:bg-red-500/5 transition-colors">
                          <td className="p-4 text-[12px] font-bold text-white-500">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="p-4 text-sm font-bold dark:text-zinc-200">{log.user}</td>
                          <td className="p-4 text-center">
                            <Badge className="bg-amber-500/10 text-red-400 border-amber-500/20 text-[12px] font-black">{log.tech || "N/A"}</Badge>
                          </td>
                          <td className="p-4 text-sm font-bold dark:text-red-500 text-center">{log.part}</td>
                          <td className="p-4 text-center text-zinc-500 font-bold">{log.oldqt}</td>
                          <td className="p-4 text-center font-bold text-green-500 dark:text-green-400">{log.newqt}</td>
                          <td className="p-4 text-right text-xs font-bold uppercase dark:text-red-500">{log.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 text-center border-t border-zinc-100 dark:border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">End of Records</p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="w-full max-w-2xl">
              <Card className="relative overflow-hidden border-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="text-red-600" size={28} /> Modify Record
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Update inventory levels and component details.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <X size={24} className="text-slate-400 hover:text-red-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 flex items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                      <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {currentItem.part ? <img src={currentItem.part} alt="Preview" className="w-full h-full object-contain p-2" /> : <Laptop className="text-slate-300 dark:text-zinc-700" size={32} />}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Image URL</label>
                        <Input value={currentItem.part || ""} onChange={e => setCurrentItem({...currentItem, part: e.target.value})} placeholder="https://..." className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Model Name</label>
                      <Input value={currentItem.model || ""} onChange={e => setCurrentItem({...currentItem, model: e.target.value})} placeholder="e.g., N17V3C8WH512" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Part Code</label>
                      <Input value={currentItem.partcode || ""} onChange={e => setCurrentItem({...currentItem, partcode: e.target.value})} placeholder="e.g., BT-SH13671973" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Category</label>
                      <Input value={currentItem.category || ""} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} placeholder="e.g., Battery" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Storage Location</label>
                      <Input value={currentItem.loc || ""} onChange={e => setCurrentItem({...currentItem, loc: e.target.value})} placeholder="e.g., A5A61" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Current Stock Count</label>
                      <Input type="number" value={currentItem.stock ?? 0} onChange={e => setCurrentItem({...currentItem, stock: parseInt(e.target.value) || 0})} placeholder="e.g., 6" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-12 text-lg font-bold" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-10">
                    <Button onClick={handleSave} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider h-14 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]">Save Changes</Button>
                    <Button onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-14 uppercase font-bold tracking-wider rounded-xl">Cancel</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}