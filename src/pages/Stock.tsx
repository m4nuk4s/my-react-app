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
  Download 
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
    case "in_stock": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case "low_stock": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    case "out": return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
    default: return "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400";
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Stock() {
  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState("");
  const [partCodeSearch, setPartCodeSearch] = useState(""); 
  const [visibleCount, setVisibleCount] = useState(40);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<StockItem>>({});

  useEffect(() => {
    fetchStock();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase.from('users').select('isadmin').eq('id', user.id).single();
      if (userData) setIsAdmin(userData.isadmin === true);
    }
  };

  const fetchStock = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("stock").select("*").order("category", { ascending: true });
    if (!error) setData(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    const stockCount = currentItem.stock || 0;
    const autoStatus = stockCount === 0 ? "out" : stockCount <= 10 ? "low_stock" : "in_stock";
    const payload = { ...currentItem, status: autoStatus, compatible: true, sn: "N/A" };
    const { error } = await supabase.from("stock").upsert(payload);
    if (!error) {
      toast.success("Inventory updated");
      setIsModalOpen(false);
      fetchStock();
    }
  };

  /**
   * REFINED EXPORT LOGIC
   * Adds titles and ensures data alignment by escaping special characters.
   */
  const exportToDatasheet = () => {
    if (filtered.length === 0) return toast.error("No data to export");

    // 1. Define your column titles
    const headers = ["Description", "Model", "Part Code", "Location", "Stock", "Status"];
    
    // Helper to safely format values for CSV
    const formatCSVCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      const stringVal = String(val);
      // Escape double quotes by doubling them and wrap the whole thing in quotes
      return `"${stringVal.replace(/"/g, '""')}"`;
    };

    // 2. Map data to rows using the formatter for every field
    const csvRows = filtered.map(item => [
      formatCSVCell(item.category),
      formatCSVCell(item.model),
      formatCSVCell(item.partcode),
      formatCSVCell(item.loc || 'N/A'),
      formatCSVCell(item.stock),
      formatCSVCell(item.status.toUpperCase())
    ].join(","));

    // 3. Combine headers and rows with newlines
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    // 4. Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    // Filename includes the current date
    link.setAttribute("download", `Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Datasheet exported successfully");
  };

  const filtered = data.filter(item => {
    const matchesModel = !modelFilter || item.model === modelFilter;
    const matchesPartCode = !partCodeSearch || item.partcode.toLowerCase().includes(partCodeSearch.toLowerCase());
    return matchesModel && matchesPartCode;
  });

  const displayedItems = filtered.slice(0, visibleCount);

  return (
    <div className="relative min-h-screen text-foreground bg-[#050505] selection:bg-red-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10">
        <section className="pt-20 pb-12">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl">
              
              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-white">
                Notebook Parts <span className="font-bold uppercase text-red-600">Inventory</span>
              </h1>

              <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md">
                Access real-time stock tracking and component compatibility database.
              </p>

              <div className="mt-10 max-w-4xl">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="🔎 Search by Part Code Match.."
                      value={partCodeSearch}
                      onChange={(e) => {setPartCodeSearch(e.target.value); setVisibleCount(40);}}
                      className="h-14 pl-6 pr-12 text-lg border-none rounded-xl bg-white/90 text-slate-950 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:text-white dark:ring-1 dark:ring-white/10 dark:placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-red-600 transition-all font-normal"
                    />
                  </div>
                  
                  <div className="relative group min-w-[240px]">
                    <Laptop className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 z-20" size={20} />
                    <select 
                      className="w-full h-14 pl-12 pr-10 rounded-xl appearance-none cursor-pointer
                        bg-white/90 text-slate-950 
                        dark:bg-white/5 dark:backdrop-blur-xl dark:text-white dark:ring-1 dark:ring-white/10
                        font-normal border-none shadow-lg outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      value={modelFilter}
                      onChange={(e) => setModelFilter(e.target.value)}
                    >
                      <option value="" className="bg-white dark:bg-zinc-900">All Notebooks</option>
                      {Array.from(new Set(data.map(i => i.model))).sort().map(m => (
                        <option key={m} value={m} className="bg-white dark:bg-zinc-900">{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-red-600 transition-colors pointer-events-none" size={18} />
                  </div>

                  <div className="flex gap-2">
                    {/* EXPORT BUTTON */}
                    <Button 
                      onClick={exportToDatasheet}
                      variant="outline"
                      className="h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white px-6 rounded-xl font-bold uppercase shadow-lg transition-transform active:scale-95"
                    >
                      <Download className="h-5 w-5 mr-0 md:mr-2" />
                      <span className="hidden md:inline">Export</span>
                    </Button>

                    {isAdmin && (
                      <Button 
                        onClick={() => {setCurrentItem({}); setIsModalOpen(true);}} 
                        className="h-14 bg-red-600 hover:bg-red-700 px-8 rounded-xl font-bold uppercase shadow-lg transition-transform active:scale-95"
                      >
                        <Plus className="h-6 w-6 mr-2" /> Add Part
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 pb-32">
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp}
            className="rounded-2xl overflow-hidden bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-white/5 text-[12px] uppercase tracking-widest text-slate-950 dark:text-zinc-400 border-b border-slate-200 dark:border-white/10">
                    <th className="p-6 font-bold">Component Description</th>
                    <th className="p-6 font-bold text-center">Part Code</th>
                    <th className="p-6 font-bold text-center">Loc</th>
                    <th className="p-6 font-bold text-center">Stock</th>
                    <th className="p-6 font-bold text-right">Status</th>
                    {isAdmin && <th className="p-6 font-bold text-center">Actions</th>}
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
                      <td className="p-6 text-center font-mono text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase">
                        {item.partcode}
                      </td>
                      <td className="p-6 text-center text-sm font-bold text-slate-600 dark:text-zinc-400">
                        <div className="flex items-center justify-center gap-1.5">
                          <MapPin size={16} className="text-red-600" /> {item.loc || "N/A"}
                        </div>
                      </td>
                      <td className="p-6 text-center text-xl font-bold text-slate-950 dark:text-white">
                        {item.stock}
                      </td>
                      <td className="p-6 text-right">
                        <Badge variant="outline" className={`${statusStyle(item.status)} border-2 rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider`}>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="p-6 text-center">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => {setCurrentItem(item); setIsModalOpen(true);}} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-600 hover:text-white rounded-xl text-slate-600 dark:text-white transition-all">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => { if(confirm("Delete?")) supabase.from("stock").delete().eq("id", item.id!).then(fetchStock); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-600 hover:text-white rounded-xl text-slate-600 dark:text-white transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > visibleCount && (
              <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex justify-center border-t border-slate-200 dark:border-white/10">
                <Button 
                  onClick={() => setVisibleCount(prev => prev + 40)}
                  variant="ghost" 
                  className="text-slate-950 dark:text-white uppercase text-sm font-normal tracking-widest hover:bg-red-600 hover:text-white px-10 py-6 rounded-xl transition-all"
                >
                  Load More ({filtered.length - visibleCount}) <ChevronDown size={20} className="ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Admin Modal Update */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card className="w-full max-w-2xl bg-zinc-950 border-white/10 text-white p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-light uppercase tracking-tighter flex items-center gap-3">
                    <ShieldCheck className="text-red-600" size={32} /> Modify Record
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={28} className="text-zinc-500 hover:text-white" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-24 h-20 bg-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                      {currentItem.part && <img src={currentItem.part} className="w-full h-full object-contain" />}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Image Link</label>
                      <Input value={currentItem.part || ""} onChange={e => setCurrentItem({...currentItem, part: e.target.value})} className="bg-zinc-900 border-zinc-800 h-12 font-normal" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Model Name</label>
                    <Input value={currentItem.model || ""} onChange={e => setCurrentItem({...currentItem, model: e.target.value})} className="bg-zinc-900 border-zinc-800 h-12 font-normal" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Part Code</label>
                    <Input value={currentItem.partcode || ""} onChange={e => setCurrentItem({...currentItem, partcode: e.target.value})} className="bg-zinc-900 border-zinc-800 h-12 font-normal" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Category</label>
                    <Input value={currentItem.category || ""} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} className="bg-zinc-900 border-zinc-800 h-12 font-normal" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Location</label>
                    <Input value={currentItem.loc || ""} onChange={e => setCurrentItem({...currentItem, loc: e.target.value})} className="bg-zinc-900 border-zinc-800 h-12 font-normal" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Stock Count</label>
                    <Input type="number" value={currentItem.stock || 0} onChange={e => setCurrentItem({...currentItem, stock: parseInt(e.target.value)})} className="bg-zinc-900 border-zinc-800 h-12 font-normal text-lg" />
                  </div>
                </div>

                <div className="flex gap-4 mt-12">
                  <Button onClick={handleSave} className="flex-1 bg-red-600 hover:bg-red-700 font-normal uppercase text-lg py-8 rounded-xl shadow-xl transition-all active:scale-95">Save Update</Button>
                  <Button onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 border-white/10 py-8 uppercase font-normal text-lg rounded-xl">Discard</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}