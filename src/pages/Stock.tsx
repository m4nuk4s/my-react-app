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
  ArrowDown,
  Filter,
  Database,
  Package,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Calendar,
  HardDrive,
  Cpu,
  MemoryStick,
  Battery,
  Disc,
  ArrowRight
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

// Enhanced status styles with consistent colors in dark mode
const statusStyle = (status: string) => {
  const styles: Record<string, string> = {
    // GREEN
    in_stock: `
      from-green-100 to-green-200 text-green-900 border-green-300 
      dark:from-green-900 dark:to-green-800 dark:text-green-100 dark:border-green-600
    `,
    // YELLOW
    low_stock: `
      from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-300 
      dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-100 dark:border-yellow-600
    `,
    // RED
    "Out of Stock": `
      from-red-100 to-red-200 text-red-900 border-red-300 
      dark:from-red-900 dark:to-red-800 dark:text-red-100 dark:border-red-600
    `,
  };

  const baseClasses = "bg-gradient-to-r border shadow-sm px-2.5 py-0.5 rounded-md text-xs font-bold transition-all";
  const defaultStyle = "from-gray-100 to-gray-200 text-gray-900 border-gray-300 dark:from-gray-800 dark:to-gray-700 dark:text-gray-100 dark:border-gray-600";

  return `${baseClasses} ${styles[status] || defaultStyle}`.replace(/\s+/g, ' ').trim();
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const categoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('cpu') || cat.includes('processor')) return <Cpu size={16} className="text-blue-600 dark:text-blue-400" />;
  if (cat.includes('ram') || cat.includes('memory')) return <MemoryStick size={16} className="text-purple-600 dark:text-purple-400" />;
  if (cat.includes('battery')) return <Battery size={16} className="text-green-600 dark:text-green-400" />;
  if (cat.includes('hard') || cat.includes('drive') || cat.includes('ssd')) return <HardDrive size={16} className="text-amber-600 dark:text-amber-400" />;
  if (cat.includes('screen') || cat.includes('lcd') || cat.includes('display')) return <Disc size={16} className="text-red-600 dark:text-red-400" />;
  return <Package size={16} className="text-gray-600 dark:text-gray-400" />;
};

export default function Stock() {
  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modelSearch, setModelSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [partCodeSearch, setPartCodeSearch] = useState(""); 
  const [visibleCount, setVisibleCount] = useState(15);
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

  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // New state for status filtering
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchStock();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const total = data.length;
      const inStock = data.filter(item => item.status === "in_stock").length;
      const lowStock = data.filter(item => item.status === "low_stock").length;
      const outOfStock = data.filter(item => item.status === "Out of Stock").length;
      
      setStats({
        totalItems: total,
        inStock,
        lowStock,
        outOfStock
      });
    }
  }, [data]);

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
    setStatusFilter(null);
    setVisibleCount(15);
    toast.success("All filters cleared");
  };

const exportLogsToCSV = () => {
  if (movements.length === 0) return toast.error("No logs to export");

  const headers = ["Timestamp", "User", "Technician", "Part Code", "Old Qty", "New Qty", "Location"];
  
  const formatCSVCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val);
    return `"${stringVal.replace(/"/g, '""')}"`;
  };

  const csvRows = movements.map(log => [
    formatCSVCell(new Date(log.created_at).toLocaleString()),
    formatCSVCell(log.user),
    formatCSVCell(log.tech || 'N/A'),
    formatCSVCell(log.part),
    formatCSVCell(log.oldqt),
    formatCSVCell(log.newqt),
    formatCSVCell(log.location)
  ].join(","));

  const csvContent = "sep=,\n" + [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.setAttribute("download", `Movement_Logs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success("Logs exported successfully");
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
    const autoStatus = newQty <= 0 ? "Out of Stock" : newQty <= 10 ? "low_stock" : "in_stock";

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
    // Around line 203
const stockCount = currentItem.stock || 0;
const autoStatus = stockCount <= 0 ? "Out of Stock" : stockCount <= 10 ? "low_stock" : "in_stock";
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
    toast.success("Datasheet exported successfully");
  };

  const requestSort = (key: keyof StockItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusFilter = (status: string | null) => {
    if (statusFilter === status) {
      setStatusFilter(null);
      toast.info("Status filter cleared");
    } else {
      setStatusFilter(status);
      toast.success(`Showing ${status === "in_stock" ? "In Stock" : status === "low_stock" ? "Low Stock" : "Out of Stock"} items`);
    }
  };

  const filtered = data.filter(item => {
    const matchesModelDropdown = !modelFilter || item.model === modelFilter;
    const matchesModelSearch = !modelSearch || item.model.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesPartCode = !partCodeSearch || item.partcode.toLowerCase().includes(partCodeSearch.toLowerCase());
    const matchesLoc = !locSearch || (item.loc && item.loc.toLowerCase().includes(locSearch.toLowerCase()));
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesModelDropdown && matchesModelSearch && matchesPartCode && matchesLoc && matchesStatus;
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
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-red-600 dark:text-red-400" /> : <ArrowDown size={14} className="text-red-600 dark:text-red-400" />;
  };

  return (
    <div className="relative min-h-screen text-foreground bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900 selection:bg-red-500/30">
      {/* Enhanced Video Background - Optimized for Light Mode */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover opacity-40 dark:opacity-25 contrast-125 saturate-150 brightness-125 dark:brightness-110" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/70 dark:from-black/50 dark:via-transparent dark:to-black/70" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent dark:via-red-500/30" />
        {/* Enhanced subtle overlay for better video visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent dark:from-black/40 dark:via-transparent dark:to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Dashboard Header */}
        <section className="relative pt-8 pb-6 z-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col space-y-8">
              {/* Row 1: Title and Description (Original Styles) */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-red-600 pl-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="text-red-600 dark:text-red-400" size={48} />
                    <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white transition-colors">
                      Notebook Parts <span className="font-bold uppercase text-red-600">Inventory</span>
                    </h1>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-400 text-sm">Live stock tracking & component compatibility database</p>
                </motion.div>

                {/* Admin Actions (Moved here to save space) */}
                {isAdmin && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    <button 
                      onClick={() => {setCurrentItem({}); setIsModalOpen(true);}}
                      className="px-4 h-10 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white text-sm font-bold transition-all shadow-lg"
                    >
                      <Plus size={16} /> Add Part
                    </button>
                    
                  </motion.div>
                )}
              </div>

              {/* Row 2: Stats (Left) and Search (Right) */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Status Cards (Left Side - 40% Width) */}
                <div className="w-full lg:w-2/5">
				
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Storages", value: stats.totalItems, bg: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/30", border: "border-gray-300/80 dark:border-white/15", text: "text-gray-700 dark:text-zinc-400", onClick: () => setStatusFilter(null) },
                      { label: "Storages With Stock", value: stats.inStock, bg: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800/50 dark:to-green-600", border: "border-green-300/80 dark:border-green-500/40", text: "text-green-900 dark:text-green-100", active: statusFilter === "in_stock", onClick: () => handleStatusFilter("in_stock") },
                      { label: "Storages With Low Stock", value: stats.lowStock, bg: "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800/50 dark:to-yellow-700/40", border: "border-yellow-300/80 dark:border-yellow-500/40", text: "text-yellow-900 dark:text-yellow-100", active: statusFilter === "low_stock", onClick: () => handleStatusFilter("low_stock") },
                      { label: "Storages Out of Stock", value: stats.outOfStock, bg: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800/50 dark:to-red-700/40", border: "border-red-300/80 dark:border-red-500/40", text: "text-red-900 dark:text-red-100", active: statusFilter === "Out of Stock", onClick: () => handleStatusFilter("Out of Stock") }
                    ].map((stat, index) => (
                      <motion.button
                        key={stat.label}
                       
                        onClick={stat.onClick}
                        className={`${stat.bg} backdrop-blur-sm border ${stat.border} rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${stat.active ? 'ring-2 ring-red-500' : ''} text-left`}
                      >
                        <p className={`text-[10px] uppercase tracking-wider ${stat.text} font-bold`}>{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
                      </motion.button>
                    ))}
                  </div>
                  {statusFilter && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold text-red-600 uppercase">Filtered: {statusFilter.replace("_", " ")}</span>
                      <X size={14} className="cursor-pointer text-red-600" onClick={() => setStatusFilter(null)} />
                    </motion.div>
                  )}
                </div>

                {/* Search and Filters (Right Side - 60% Width) */}
                <div className="w-full lg:w-3/5">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
					
                    className="bg-white/95 dark:bg-white/10 backdrop-blur-xl border border-gray-400/50 dark:border-white/20 rounded-2xl p-5 shadow-xl h-full"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      {[
                        { icon: Search, placeholder: "Part Code...", value: partCodeSearch, setter: setPartCodeSearch },
                        { icon: Laptop, placeholder: "Model...", value: modelSearch, setter: setModelSearch },
                        { icon: MapPin, placeholder: "Location...", value: locSearch, setter: setLocSearch }
                      ].map((field, idx) => (
                        <div key={idx} className="relative">
                          <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            value={field.value || ''}
                            onChange={(e) => {field.setter(e.target.value); setVisibleCount(20);}}
                            className="w-full pl-10 pr-4 h-10 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <select 
                        value={modelFilter || ''}
                        onChange={(e) => setModelFilter(e.target.value)}
                        className="flex-1 h-10 px-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-xs font-medium"
                      >
                        <option value="">All Models</option>
                        {data && Array.from(new Set(data.map(i => i.model))).sort().map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      
                      <button onClick={resetFilters} className="h-10 px-3 bg-gray-100 dark:bg-white/5 hover:bg-red-50 rounded-xl font-bold  text-xs transition-colors border border-gray-300 dark:border-white/10">
                        <RefreshCw size={14} className="inline mr-1" /> Reset
                      </button>
                      
                      <button onClick={exportToDatasheet} className="h-10 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md">
                        <Download size={14} className="inline mr-1" /> Export
                      </button>

                      {isAdmin && (
                        <button onClick={() => { fetchMovements(); setIsLogsModalOpen(true); }} className="h-10 px-3 bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 border border-yellow-500/30 rounded-xl text-xs font-bold">
                          <BarChart3 size={14} className="inline mr-1" /> Logs
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="container mx-auto px-6 pb-32">
		
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeUp}
            className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-white/15 dark:to-white/10 backdrop-blur-xl border border-gray-400/50 dark:border-white/20 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Table Header */}
            <div className="p-4 border-b border-gray-400/50 dark:border-white/20 bg-gradient-to-r from-white to-gray-50 dark:from-white/15 dark:to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
				<button 
  onClick={() => fetchStock()}
  className="px-4 h-10 flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-white/10 rounded-xl transition-all text-red-500 dark:!text-white hover:bg-white/20"
>
  <RefreshCw 
    size={16} 
    strokeWidth={3} 
    className="text-red-500 dark:!text-white" 
  />
</button>
                  <div className="w-2 h-6 bg-gradient-to-b from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 rounded-full shadow-sm" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inventory Items</h3>
                  <Badge variant="outline" className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-white/20 dark:to-white/10 text-gray-800 dark:text-zinc-300 border border-gray-400/50 dark:border-white/20">
                    {filtered.length} items
                    {statusFilter && (
                      <span className="ml-1 text-red-600 dark:text-red-400">
                        • {statusFilter === "in_stock" ? "In Stock" : statusFilter === "low_stock" ? "Low Stock" : "Out of Stock"}
                      </span>
                    )}
                  </Badge>
                </div>
				
                <div className="text-sm text-gray-700 dark:text-zinc-400 flex items-center gap-2">
                  <Calendar size={14} />
                  Updated just now
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-400/50 dark:border-white/20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5">
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('category')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                      >
                        Component
                        <SortIcon column="category" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('partcode')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                      >
                        Part Code
                        <SortIcon column="partcode" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('loc')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                      >
                        Location
                        <SortIcon column="loc" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('stock')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                      >
                        Stock
                        <SortIcon column="stock" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('status')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                      >
                        Status
                        <SortIcon column="status" />
                      </button>
                    </th>
                    <th className="p-6 text-left text-xs font-bold uppercase tracking-wider  items-center tracking-wider  text-gray-700 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300/50 dark:divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-2 border-red-500/40 border-t-red-600 dark:border-t-red-500 rounded-full animate-spin shadow-sm" />
                          <p className="text-gray-700 dark:text-zinc-400">Loading inventory data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : displayedItems.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gradient-to-r hover:from-gray-100/50 hover:to-gray-200/50 dark:hover:from-white/10 dark:hover:to-white/15 transition-colors duration-300 group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-gray-100 dark:from-white/15 dark:to-white/5 border border-gray-400/50 dark:border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                            {item.part ? (
                              <img src={item.part} alt={item.category} className="w-full h-full object-contain p-2" />
                            ) : (
                              <div className="p-2">
                                {categoryIcon(item.category)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {categoryIcon(item.category)}
                              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {item.category}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Laptop size={14} className="text-gray-600 dark:text-zinc-500" />
                              <span className="text-sm text-gray-700 dark:text-zinc-400 font-medium">{item.model}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div>
                          <code className="font-mono text-sm font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-200 to-gray-300 dark:from-white/15 dark:to-white/5 px-3 py-1.5 rounded-lg border border-gray-400/50 dark:border-white/20 shadow-sm">
                            {item.partcode}
                          </code>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-red-600 dark:text-red-500" />
                          <span className="font-medium text-gray-900 dark:text-white">{item.loc || "N/A"}</span>
                        </div>
                      </td>
                     <td className="p-6">
  <div className="relative">
    <span className={`text-2xl font-bold ${
      item.status === "Out of Stock" ? 'text-red-600 dark:text-red-400' :
      item.status === "low_stock" ? 'text-yellow-600 dark:text-yellow-400' :
      item.status === "in_stock" ? 'text-green-600 dark:text-green-400' :
      'text-gray-600 dark:text-gray-400'
    }`}>
      {item.stock ?? 0}
    </span>
  </div>
</td>
                      <td className="p-6">
                        <Badge 
                          className={`${statusStyle(item.status)} px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-shadow cursor-default`}
                        >
                          {item.status === "Out of Stock" ? "Out of Stock" : item.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          {canEditStock && (
                            <button
                              onClick={() => { setMovingItem(item); setIsMoveModalOpen(true); }}
                              className="p-2.5 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-500/40 dark:to-yellow-500/20 hover:from-yellow-200 hover:to-yellow-300 dark:hover:from-yellow-500/50 dark:hover:to-yellow-500/30 border border-yellow-400/50 dark:border-yellow-500/40 hover:border-yellow-500 dark:hover:border-yellow-500/60 text-yellow-800 dark:text-yellow-400 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md"
                              title="Consume 1 Part"
                            >
                              <MinusCircle size={18} />
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {setCurrentItem(item); setIsModalOpen(true);}}
                                className="p-2.5 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/40 dark:to-blue-500/20 hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-500/50 dark:hover:to-blue-500/30 border border-blue-400/50 dark:border-blue-500/40 hover:border-blue-500 dark:hover:border-blue-500/60 text-blue-800 dark:text-blue-400 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => { 
                                  if(confirm("Are you sure you want to delete this item?")) 
                                    supabase.from("stock").delete().eq("id", item.id!).then(fetchStock); 
                                }}
                                className="p-2.5 rounded-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-500/40 dark:to-red-500/20 hover:from-red-200 hover:to-red-300 dark:hover:from-red-500/50 dark:hover:to-red-500/30 border border-red-400/50 dark:border-red-500/40 hover:border-red-500 dark:hover:border-red-500/60 text-red-800 dark:text-red-400 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {filtered.length > visibleCount && (
              <div className="p-6 border-t border-gray-400/50 dark:border-white/20 bg-gradient-to-r from-transparent via-gray-100/50 dark:via-white/10 to-transparent">
                <div className="text-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 15)}
                    className="px-8 py-3 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 dark:from-white/15 dark:to-white/5 dark:hover:from-white/25 dark:hover:to-white/15 border border-gray-400/50 dark:border-white/20 rounded-xl text-gray-800 dark:text-white font-medium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-lg hover:shadow-red-500/20"
                  >
                    Load More ({filtered.length - visibleCount} remaining)
                    <ChevronDown className="ml-2 inline" size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
              <div className="p-16 text-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/20 dark:to-white/10 mb-4 shadow-md"
                >
                  <Package className="text-gray-500 dark:text-zinc-500" size={32} />
                </motion.div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No items found</h4>
                <p className="text-gray-700 dark:text-zinc-400 max-w-md mx-auto">
                  {statusFilter ? 
                    `No items found with status: ${statusFilter === "in_stock" ? "In Stock" : statusFilter === "low_stock" ? "Low Stock" : "Out of Stock"}. Try adjusting your filters.` :
                    "Try adjusting your search filters or add new inventory items to get started."
                  }
                </p>
                {isAdmin && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => {setCurrentItem({}); setIsModalOpen(true);}}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-xl text-white font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50"
                  >
                    Add First Item
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </section>
      </div>

      {/* Move Modal */}
      <AnimatePresence>
        {isMoveModalOpen && movingItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md"
            >
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800 shadow-2xl p-8">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Movement</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">Inventory decrement log</p>
                  </div>
                  <button onClick={() => setIsMoveModalOpen(false)} className="text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    <X size={20}/>
                  </button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/20 rounded-2xl mb-6 shadow-md">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-400/50 dark:border-white/20 shadow-sm">
                    {movingItem.part ? <img src={movingItem.part} className="w-full h-full object-contain" /> : <Laptop size={24} className="text-gray-500 dark:text-zinc-500"/>}
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-yellow-600 dark:text-yellow-500 tracking-widest">{movingItem.partcode}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{movingItem.category}</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-center text-gray-600 dark:text-zinc-400 leading-relaxed">
                    This action will <span className="text-red-600 dark:text-red-500 font-bold uppercase">consume one spare part</span> from stock and log the transaction.
                  </p>
                  <div className="flex flex-col gap-4 p-3 border-y border-gray-400/50 dark:border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">Current Stock</span>
                      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">{movingItem.stock}</span>
                        <ArrowRight className="text-gray-500 dark:text-zinc-500" size={16} />
                        <span className="text-red-600 dark:text-red-500 text-2xl">{movingItem.stock - 1}</span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase text-yellow-600 dark:text-yellow-500 tracking-widest">Assign Technician</label>
                      <select 
                        value={selectedTech}
                        onChange={(e) => setSelectedTech(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-zinc-800 border border-gray-400/50 dark:border-white/20 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm"
                      >
                        <option value="">Select Tech...</option>
                        {techs.map(t => <option key={t} value={t} className="bg-white dark:bg-zinc-900">{t}</option>)}
                        <option value="other">Type name...</option>
                      </select>
                      {selectedTech === "other" && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                          <Input 
                            placeholder="Enter Technician Name" 
                            value={customTech}
                            onChange={(e) => setCustomTech(e.target.value.toUpperCase())}
                            className="h-11 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/20 border border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleStockMovement} 
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold h-12 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-yellow-500/40"
                  >
                    Yes, Consume Part
                  </Button>
                  <Button 
                    onClick={() => setIsMoveModalOpen(false)} 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl border border-gray-400/50 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logs Modal */}
      <AnimatePresence>
        {isLogsModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[70] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-5xl"
            >
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-700" />
                <div className="p-8 flex justify-between items-center border-b border-gray-400/50 dark:border-white/20">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                      System <span className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 bg-clip-text text-transparent">Logs</span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">Inventory movement history</p>
					{/* ADD THIS FLEX CONTAINER */}
            <div className="flex items-center gap-4">
              <button 
                onClick={exportLogsToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-md"
              >
                <Download size={16} />
                Export Logs
              </button>
              
              
            </div>
          
                  </div>
                  <button onClick={() => setIsLogsModalOpen(false)} className="text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    <X size={28}/>
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-white/20 dark:to-white/10 sticky top-0 z-10">
                      <tr>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 text-left">Timestamp</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 text-left">User</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 text-center">Tech</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 text-center">Part Code</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 text-center">Old Qty</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 text-center">New Qty</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-zinc-500 text-right">Loc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300/50 dark:divide-white/10">
                      {logsLoading ? (
                        <tr><td colSpan={7} className="p-10 text-center text-gray-600 dark:text-zinc-500">Loading records...</td></tr>
                      ) : movements.map((log) => (
                        <tr key={log.id} className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-500/20 dark:hover:to-red-500/10 transition-colors">
                          <td className="p-4 text-[12px] font-bold text-gray-600 dark:text-zinc-400">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="p-4 text-sm font-bold text-gray-900 dark:text-zinc-300">{log.user}</td>
                          <td className="p-4 text-center">
                            <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-500/40 dark:to-yellow-500/20 text-yellow-800 dark:text-yellow-400 border border-yellow-400/50 dark:border-yellow-500/40 text-[12px] font-black">
                              {log.tech || "N/A"}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm font-bold text-red-600 dark:text-red-500 text-center">{log.part}</td>
                          <td className="p-4 text-center text-gray-600 dark:text-zinc-500 font-bold">{log.oldqt}</td>
                          <td className="p-4 text-center font-bold text-green-600 dark:text-green-400">{log.newqt}</td>
                          <td className="p-4 text-right text-xs font-bold uppercase text-red-600 dark:text-red-500">{log.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
				
                <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-white/20 dark:to-white/10 text-center border-t border-gray-400/50 dark:border-white/20">
                  <p className="text-[10px] text-gray-600 dark:text-zinc-500 uppercase tracking-[0.2em]">End of Records</p>
                </div>
				
              </Card>
            </motion.div>
          </div>
		  
        )}
      </AnimatePresence>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl"
            >
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900/95 dark:to-zinc-800/95 backdrop-blur-2xl shadow-2xl ring-1 ring-black/20 dark:ring-white/10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-700" />
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="text-red-600" size={28} /> Modify Record
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">Update inventory levels and component details.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                      <X size={24} className="text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/20 border border-gray-400/50 dark:border-white/20 shadow-sm">
                      <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-xl border border-gray-400/50 dark:border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {currentItem.part ? <img src={currentItem.part} alt="Preview" className="w-full h-full object-contain p-2" /> : <Laptop className="text-gray-400 dark:text-zinc-600" size={32} />}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-600 dark:text-zinc-500">Image URL</label>
                        <Input value={currentItem.part || ""} onChange={e => setCurrentItem({...currentItem, part: e.target.value})} placeholder="https://..." className="bg-white dark:bg-zinc-800 border border-gray-400/50 dark:border-zinc-700 focus:ring-2 focus:ring-red-600 focus:border-transparent" />
                      </div>
                    </div>
                    {[
                      { label: "Model Name", value: "model", placeholder: "e.g., N17V3C8WH512" },
                      { label: "Part Code", value: "partcode", placeholder: "e.g., BT-SH13671973" },
                      { label: "Category", value: "category", placeholder: "e.g., Battery" },
                      { label: "Storage Location", value: "loc", placeholder: "e.g., A5A61" }
                    ].map((field) => (
                      <div key={field.value} className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-600 dark:text-zinc-500">{field.label}</label>
                        <Input 
                          value={currentItem[field.value as keyof StockItem] || ""} 
                          onChange={e => setCurrentItem({...currentItem, [field.value]: e.target.value})} 
                          placeholder={field.placeholder}
                          className="bg-white dark:bg-zinc-800 border border-gray-400/50 dark:border-zinc-700 focus:ring-2 focus:ring-red-600 focus:border-transparent h-11"
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-600 dark:text-zinc-500">Current Stock Count</label>
                      <Input 
                        type="number" 
                        value={currentItem.stock ?? 0} 
                        onChange={e => setCurrentItem({...currentItem, stock: parseInt(e.target.value) || 0})} 
                        placeholder="e.g., 6" 
                        className="bg-white dark:bg-zinc-800 border border-gray-400/50 dark:border-zinc-700 focus:ring-2 focus:ring-red-600 focus:border-transparent h-12 text-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-10">
                    <Button 
                      onClick={handleSave} 
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold uppercase tracking-wider h-14 rounded-xl shadow-lg shadow-red-600/40 hover:shadow-xl hover:shadow-red-600/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsModalOpen(false)} 
                      variant="outline" 
                      className="flex-1 border border-gray-400/50 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 h-14 uppercase font-bold tracking-wider rounded-xl"
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