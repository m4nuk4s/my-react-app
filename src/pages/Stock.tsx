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
  RotateCcw
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
      // Yellow/Amber needs the most help in light mode
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
  
  // Filtering States
  const [modelSearch, setModelSearch] = useState("");
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

  const resetFilters = () => {
    setModelSearch("");
    setModelFilter("");
    setPartCodeSearch("");
    setVisibleCount(40);
    toast.info("Filters reset to default");
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

    // Headers matching your table columns
    const headers = [
      "Component Description", 
      "Model", 
      "Part Code", 
      "Location", 
      "Stock Count", 
      "Current Status"
    ];
    
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

    // FIX: Add 'sep=,' at the start. 
    // This forces Excel on any computer to recognize the comma as the column separator.
    const csvContent = "sep=,\n" + [headers.join(","), ...csvRows].join("\n");
    
    // Add UTF-8 BOM (\ufeff) to support international characters (accents, emojis)
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

  const filtered = data.filter(item => {
    const matchesModelDropdown = !modelFilter || item.model === modelFilter;
    const matchesModelSearch = !modelSearch || item.model.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesPartCode = !partCodeSearch || item.partcode.toLowerCase().includes(partCodeSearch.toLowerCase());
    return matchesModelDropdown && matchesModelSearch && matchesPartCode;
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
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-5xl">
              
              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-white">
                Notebook Parts <span className="font-bold uppercase text-red-600">Inventory</span>
              </h1>

              <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md mb-10">
                Access real-time stock tracking and component compatibility database.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-3 relative">
                  <Input
                    placeholder="🔍 Search Part Code..."
                    value={partCodeSearch}
                    onChange={(e) => {setPartCodeSearch(e.target.value); setVisibleCount(40);}}
                    className="h-14 pl-6 text-lg border-none rounded-xl bg-white/90 text-slate-950 dark:bg-white/5 dark:backdrop-blur-xl dark:text-white dark:ring-1 dark:ring-white/10 shadow-lg"
                  />
                </div>

                <div className="md:col-span-3 relative">
                  <Input
                    placeholder="🔍 Search Model..."
                    value={modelSearch}
                    onChange={(e) => {setModelSearch(e.target.value); setVisibleCount(40);}}
                    className="h-14 pl-6 text-lg border-none rounded-xl bg-white/90 text-slate-950 dark:bg-white/5 dark:backdrop-blur-xl dark:text-white dark:ring-1 dark:ring-white/10 shadow-lg"
                  />
                </div>
                
<div className="md:col-span-2 relative group">
  <select 
    className="w-full h-14 pl-4 pr-10 rounded-xl appearance-none cursor-pointer
      bg-white/90 text-slate-950 dark:bg-white/5 dark:backdrop-blur-xl dark:text-white 
      ring-1 ring-slate-200 dark:ring-white/10 shadow-lg
      font-bold uppercase text-[10px] border-none outline-none 
      focus:ring-2 focus:ring-red-600 transition-all"
    value={modelFilter}
    onChange={(e) => setModelFilter(e.target.value)}
  >
    <option value="" className="bg-white dark:bg-zinc-900">💻 All Notebooks</option>
    {Array.from(new Set(data.map(i => i.model))).sort().map(m => (
      <option key={m} value={m} className="bg-white dark:bg-zinc-900">
        💻 {m}
      </option>
    ))}
  </select>
  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-red-600 transition-colors pointer-events-none" size={16} />
</div>
               <div className="md:col-span-4 flex gap-2">
    {/* Reset Button (Glass Style) */}
    <Button 
      onClick={resetFilters}
      variant="outline"
      className="h-14 w-14 shrink-0 border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:dark:bg-white/5 dark:hover:bg-red-500/20 text-slate-600 dark:text-white rounded-xl shadow-sm backdrop-blur-md transition-all active:scale-95 group"
    >
      <RotateCcw className="h-5 w-5 group-hover:rotate-[-45deg] transition-transform" />
    </Button>

                  <Button 
      onClick={exportToDatasheet}
      variant="outline"
      className="flex-1 h-14 border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold uppercase tracking-wider shadow-sm backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2"
    >
      <Download className="h-5 w-5 text-red-600" />
      <span className="hidden lg:inline">Export</span>
    </Button>

                  {isAdmin && (
                <Button 
    onClick={() => {setCurrentItem({}); setIsModalOpen(true);}} 
    variant="outline"
    className="flex-1 h-14 border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold uppercase tracking-wider shadow-sm backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2"
  >
    <Plus className="h-6 w-6 text-red-600" />
    <span className="hidden lg:inline">Add Part</span>
  </Button>
                  )}
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
                <thead className="sticky top-0 z-20">
  <tr className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b-2 border-slate-300 dark:border-white/10 shadow-md">
    <th className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> 
        Component Description
      </div>
    </th>
    <th className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-center">
      Part Code
    </th>
    <th className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-center">
      Loc
    </th>
    <th className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-center">
      Stock
    </th>
    <th className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-zinc-200 text-right">
      Status
    </th>
    {isAdmin && (
      <th className="p-6 text-[13px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-500 text-center">
        Actions
      </th>
    )}
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
                          <MapPin size={16} className="text-red-600 " /> {item.loc || "N/A"}
                        </div>
                      </td>
                      <td className="p-6 text-center text-xl font-bold text-slate-950 dark:text-white">
  {item.stock ?? 0}
</td>
                      <td className="p-6 text-right">
                       <Badge variant="outline" className={`${statusStyle(item.status)} border-2 rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider`}>
    {/* If status is "out", show "Out of Stock", otherwise format the string normally */}
    {item.status === "out" ? "Out of Stock" : item.status.replace("_", " ")}
  </Badge>
                      </td>
                      {isAdmin && (
                       <td className="p-6 text-center">
  <div className="flex justify-center gap-3">
    {/* Edit Button */}
    <button 
      onClick={() => {setCurrentItem(item); setIsModalOpen(true);}} 
      className="p-3 rounded-xl transition-all
        bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white
        dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-red-600 dark:hover:text-white"
    >
      <Edit2 size={18} />
    </button>

    {/* Delete Button */}
    <button 
      onClick={() => { if(confirm("Delete?")) supabase.from("stock").delete().eq("id", item.id!).then(fetchStock); }} 
      className="p-3 rounded-xl transition-all
        bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white
        dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-red-600 dark:hover:text-white"
    >
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
      {/* Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl"
            >
              <Card className="relative overflow-hidden border-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                {/* Accent Header Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
                
                <div className="p-8">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="text-red-600" size={28} /> 
                        Modify Record
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Update inventory levels and component details.</p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)} 
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <X size={24} className="text-slate-400 hover:text-red-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Image Preview Section */}
                    <div className="md:col-span-2 flex items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                      <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {currentItem.part ? (
                          <img src={currentItem.part} alt="Preview" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Laptop className="text-slate-300 dark:text-zinc-700" size={32} />
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Image URL</label>
                        <Input 
                          value={currentItem.part || ""} 
                          onChange={e => setCurrentItem({...currentItem, part: e.target.value})} 
                          placeholder="https://..."
                          className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600" 
                        />
                      </div>
                    </div>
{/* Standard Fields */}
<div className="space-y-1.5">
  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Model Name</label>
  <Input 
    value={currentItem.model || ""} 
    onChange={e => setCurrentItem({...currentItem, model: e.target.value})} 
    placeholder="e.g., N17V3C8WH512" 
    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" 
  />
</div>

<div className="space-y-1.5">
  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Part Code</label>
  <Input 
    value={currentItem.partcode || ""} 
    onChange={e => setCurrentItem({...currentItem, partcode: e.target.value})} 
    placeholder="e.g., BT-SH13671973"
    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" 
  />
</div>

<div className="space-y-1.5">
  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Category</label>
  <Input 
    value={currentItem.category || ""} 
    onChange={e => setCurrentItem({...currentItem, category: e.target.value})} 
    placeholder="e.g., Battery"
    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" 
  />
</div>

<div className="space-y-1.5">
  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Storage Location</label>
  <Input 
    value={currentItem.loc || ""} 
    onChange={e => setCurrentItem({...currentItem, loc: e.target.value})} 
    placeholder="e.g., A5A61"
    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-11" 
  />
</div>

<div className="md:col-span-2 space-y-1.5">
  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500">Current Stock Count</label>
  <Input 
    type="number" 
    value={currentItem.stock ?? 0} 
    onChange={e => setCurrentItem({...currentItem, stock: parseInt(e.target.value) || 0})}
    placeholder="e.g., 6"
    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-red-600 h-12 text-lg font-bold" 
  />
</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-10">
                    <Button 
                      onClick={handleSave} 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider h-14 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsModalOpen(false)} 
                      variant="outline" 
                      className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-14 uppercase font-bold tracking-wider rounded-xl"
                    >
                      Cancel
                    </Button>
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