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
  ArrowRight,
  Activity // Added from Windows.tsx
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

// Tile class from Windows.tsx
const tileClassName = (isActive: boolean) => 
  `group relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md transition-all duration-500
  ${isActive 
    ? 'shadow-2xl bg-white dark:bg-zinc-900 border-red-600' 
    : 'bg-white/40 border-slate-200/50 dark:bg-white/5 dark:border-white/10'
  }`;

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
const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(new Date());
const [timeAgo, setTimeAgo] = useState<string>("just now");

  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // New state for status filtering
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null); // Added from Windows.tsx

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
  if (!error) {
    setData(data || []);
    setLastUpdatedTime(new Date()); // Update the timestamp
  }
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

const [isConsuming, setIsConsuming] = useState(false);
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
  if (!movingItem || !movingItem.id || isConsuming) return; // Prevent entry if already consuming
  
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

  setIsConsuming(true); // Start loading state

  try {
    const newQty = oldQty - 1;
    const autoStatus = newQty <= 0 ? "Out of Stock" : newQty <= 10 ? "low_stock" : "in_stock";

    const { error: updateError } = await supabase
      .from("stock")
      .update({ stock: newQty, status: autoStatus })
      .eq("id", movingItem.id);

    if (updateError) throw updateError;

    const { error: logError } = await supabase.from("movement").insert({
      user: userEmail,
      tech: finalTech,
      pkqt: 1,
      part: movingItem.partcode,
      location: movingItem.loc,
      oldqt: oldQty,
      newqt: newQty
    });

    if (logError) throw logError;

    toast.success(`Part consumed by ${finalTech}`);
    setIsMoveModalOpen(false);
    setSelectedTech("");
    setCustomTech("");
    fetchStock();
  } catch (error) {
    console.error(error);
    toast.error("Update failed. Please try again.");
  } finally {
    setIsConsuming(false); // Reset loading state regardless of outcome
  }
};
  const handleSave = async () => {
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
useEffect(() => {
  const updateTimer = () => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdatedTime.getTime()) / 1000);

    if (diffInSeconds < 20) {
      setTimeAgo("just now");
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      setTimeAgo(`${mins}m ago`);
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      setTimeAgo(`${hours}h ago`);
    }
  };

  const interval = setInterval(updateTimer, 60000); // Update every minute
  updateTimer(); // Initial call

  return () => clearInterval(interval);
}, [lastUpdatedTime]);

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

  // Card variants from Windows.tsx
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" } 
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
      {/* BACKGROUND - Matched with Windows.tsx */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover transition-opacity duration-1000 grayscale opacity-40 contrast-125 dark:opacity-40" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-r from-[#f8f9fa]/60 via-[#f8f9fa]/20 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Dashboard Header - Updated to match Windows.tsx style */}
        <section className="h-[40vh] flex items-center">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="mb-6 flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
                <Activity size={14} className="text-red-600 animate-pulse" /> INVENTORY_MANAGEMENT // LIVE_STOCK_TRACKING
              </div>
              
              <h1 className="text-4xl md:text-[5rem] font-black tracking-[-0.05em] uppercase leading-[0.8] text-slate-950 dark:text-white mb-6">
                Notebook Parts <br />
                <span className="outline-text">Inventory</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 font-medium">
                Live stock tracking & component compatibility database for Thomson devices.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="container mx-auto px-6 pb-20">
          {/* Stats Section - Updated to match Windows.tsx tile style */}
          <motion.div 
           
            className="mb-10"
          >
           {/* Stats Section */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {[
    { 
      label: "Total Items", 
      value: stats.totalItems, 
      active: statusFilter === null,
      bg: "bg-slate-50 dark:bg-zinc-900/50",
      border: "border-slate-200 dark:border-zinc-800",
      accent: "bg-slate-500",
      text: "text-slate-600 dark:text-zinc-400",
      glow: "shadow-slate-500/20",
      onClick: () => setStatusFilter(null) 
    },
    { 
      label: "In Stock", 
      value: stats.inStock, 
      active: statusFilter === "in_stock",
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-500/30",
      accent: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      glow: "shadow-emerald-500/20",
      onClick: () => handleStatusFilter("in_stock") 
    },
    { 
      label: "Low Stock", 
      value: stats.lowStock, 
      active: statusFilter === "low_stock",
      bg: "bg-amber-50/50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-500/30",
      accent: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400", 
      glow: "shadow-amber-500/20",
      onClick: () => handleStatusFilter("low_stock") 
    },
    { 
      label: "Out of Stock", 
      value: stats.outOfStock, 
      active: statusFilter === "Out of Stock",
      bg: "bg-rose-50/50 dark:bg-rose-950/20",
      border: "border-rose-200 dark:border-rose-500/30",
      accent: "bg-rose-600",
      text: "text-rose-700 dark:text-rose-400",
      glow: "shadow-rose-500/20",
      onClick: () => handleStatusFilter("Out of Stock") 
    }
  ].map((stat, index) => (
    <motion.button
      key={stat.label}
      onClick={stat.onClick}
      variants={cardVariants}
     
     
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 backdrop-blur-md
        ${stat.bg} ${stat.border}
        ${(hoveredCard === index || stat.active) 
          ? `ring-2 ring-red-600/50 dark:ring-red-500/50 ring-offset-2 dark:ring-offset-black scale-[1.02] shadow-xl ${stat.glow}` 
          : 'shadow-sm'
        }
      `}
    >
      {/* Dynamic Hover Aura */}
      <AnimatePresence>
        {(hoveredCard === index || stat.active) && (
          <motion.div 
            layoutId="hoverAura"
            
            className={`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.accent.replace('bg-', 'from-')}/40 to-transparent`}
          />
        )}
      </AnimatePresence>
      
      <div className="relative z-10">
        <p className={`text-[10px] uppercase font-black tracking-[0.15em] ${stat.text} mb-2 opacity-80`}>
          {stat.label}
        </p>
        
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black tracking-tighter text-slate-950 dark:text-white">
            {stat.value}
          </p>
          <span className={`text-[10px] font-black ${stat.text} opacity-60`}>UNITS</span>
        </div>
        
        {/* Progress-style Indicator */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${stat.accent} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
          />
        </div>
      </div>
    </motion.button>
  ))}
</div>

            {/* Search and Filters - Updated to match Windows.tsx style */}
            <motion.div 
              variants={cardVariants}
              className="bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 rounded-2xl p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { icon: Search, placeholder: "Part Code...", value: partCodeSearch, setter: setPartCodeSearch },
                  { icon: Laptop, placeholder: "Model...", value: modelSearch, setter: setModelSearch },
                  { icon: MapPin, placeholder: "Location...", value: locSearch, setter: setLocSearch }
                ].map((field, idx) => (
                  <div key={idx} className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={field.value || ''}
                      onChange={(e) => {field.setter(e.target.value); setVisibleCount(20);}}
                      className="w-full pl-10 pr-4 h-10 bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <select 
                  value={modelFilter || ''}
                  onChange={(e) => setModelFilter(e.target.value)}
                  className="flex-1 h-10 px-4 bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-zinc-900">All Models</option>
                  {data && Array.from(new Set(data.map(i => i.model))).sort().map(m => (
                    <option key={m} value={m} className="bg-white dark:bg-zinc-900">{m}</option>
                  ))}
                </select>
                
                <button 
                  onClick={resetFilters} 
                  className="h-10 px-4 bg-white/40 dark:bg-white/5 hover:bg-red-600/10 rounded-xl font-bold text-xs transition-colors border border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-zinc-300"
                >
                  <RefreshCw size={14} className="inline mr-2" /> Reset
                </button>
                
                <button 
                  onClick={exportToDatasheet} 
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Download size={14} className="inline mr-2" /> Export
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => { fetchMovements(); setIsLogsModalOpen(true); }} 
                    className="h-10 px-4 bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 border border-yellow-500/30 rounded-xl text-xs font-bold"
                  >
                    <BarChart3 size={14} className="inline mr-2" /> Logs
                  </button>
                )}

                {isAdmin && (
                  <button 
                    onClick={() => {setCurrentItem({}); setIsModalOpen(true);}}
                    className="h-10 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white text-xs font-bold transition-all shadow-lg"
                  >
                    <Plus size={14} className="inline mr-2" /> Add Part
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Table Section - Updated to match Windows.tsx style */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="p-6 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => fetchStock()}
                    className="p-2 rounded-lg bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 transition-all text-red-600 dark:text-red-500 hover:bg-red-600/10"
                  >
                    <RefreshCw size={18} strokeWidth={3} />
                  </button>
                  <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full" />
                  <h3 className="text-xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">Inventory Items</h3>
                  <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/30 px-3 py-1 text-xs font-bold">
                    {filtered.length} items
                  </Badge>
                </div>
                
               <div className="text-sm text-slate-600 dark:text-zinc-400 flex items-center gap-2">
  <Calendar size={14} />
  Updated {timeAgo}
</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/10">
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('category')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                      >
                        Component
                        <SortIcon column="category" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('partcode')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                      >
                        Part Code
                        <SortIcon column="partcode" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('loc')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                      >
                        Location
                        <SortIcon column="loc" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('stock')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                      >
                        Stock
                        <SortIcon column="stock" />
                      </button>
                    </th>
                    <th className="p-6 text-left">
                      <button 
                        onClick={() => requestSort('status')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                      >
                        Status
                        <SortIcon column="status" />
                      </button>
                    </th>
                    <th className="p-6 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-2 border-red-500/40 border-t-red-600 dark:border-t-red-500 rounded-full animate-spin" />
                          <p className="text-slate-600 dark:text-zinc-400">Loading inventory data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : displayedItems.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-white/20 dark:hover:bg-white/10 transition-colors duration-300 group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {item.category}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Laptop size={14} className="text-slate-600 dark:text-zinc-500" />
                              <span className="text-sm text-slate-700 dark:text-zinc-400 font-medium">{item.model}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div>
                          <code className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-white/40 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-white/20">
                            {item.partcode}
                          </code>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-red-600 dark:text-red-500" />
                          <span className="font-medium text-slate-900 dark:text-white">{item.loc || "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="relative">
                          <span className={`text-2xl font-bold ${
                            item.status === "Out of Stock" ? 'text-red-600 dark:text-red-400' :
                            item.status === "low_stock" ? 'text-yellow-600 dark:text-yellow-400' :
                            item.status === "in_stock" ? 'text-green-600 dark:text-green-400' :
                            'text-slate-600 dark:text-slate-400'
                          }`}>
                            {item.stock ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge 
                          className={`${statusStyle(item.status)} px-4 py-2 text-xs font-bold uppercase tracking-wider`}
                        >
                          {item.status === "Out of Stock" ? "Out of Stock" : item.status.replace("_", " ")}
                        </Badge>
                      </td>
                     <td className="p-6">
  <div className="flex items-center gap-2.5">
    {canEditStock && (
      <button
        onClick={() => { setMovingItem(item); setIsMoveModalOpen(true); }}
        className="group/btn relative p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-400 text-amber-600 dark:text-amber-400 hover:text-white transition-all duration-300 shadow-sm hover:shadow-amber-500/40 "
        title="Consume 1 Part"
      >
        <MinusCircle size={18} strokeWidth={2.5} />
        <span className="sr-only">Consume</span>
      </button>
    )}
    
    {isAdmin && (
      <>
        <button
          onClick={() => {setCurrentItem(item); setIsModalOpen(true);}}
          className="group/btn relative p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:text-white transition-all duration-300 shadow-sm hover:shadow-indigo-500/40 "
          title="Edit Record"
        >
          <Edit2 size={18} strokeWidth={2.5} />
        </button>
        
        <button
          onClick={() => { 
            if(confirm("Are you sure you want to delete this item?")) 
              supabase.from("stock").delete().eq("id", item.id!).then(fetchStock); 
          }}
          className="group/btn relative p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-400 text-rose-600 dark:text-rose-400 hover:text-white transition-all duration-300 shadow-sm hover:shadow-rose-500/40 "
          title="Delete Permanent"
        >
          <Trash2 size={18} strokeWidth={2.5} />
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
              <div className="p-6 border-t border-slate-200/50 dark:border-white/10">
                <div className="text-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 15)}
                    className="px-8 py-3 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 rounded-xl text-slate-800 dark:text-white font-medium transition-all duration-300 hover:-translate-y-0.5"
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
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/40 dark:bg-white/5 mb-4"
                >
                  <Package className="text-slate-500 dark:text-zinc-500" size={32} />
                </motion.div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No items found</h4>
                <p className="text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
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
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-bold transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Add First Item
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </div>
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
              <Card className="relative overflow-hidden border-none bg-white dark:bg-zinc-900 shadow-2xl p-8 border border-slate-200/50 dark:border-white/10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Movement</h2>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">Inventory decrement log</p>
                  </div>
                  <button onClick={() => setIsMoveModalOpen(false)} className="text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    <X size={20}/>
                  </button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 rounded-2xl mb-6 border border-slate-200/50 dark:border-white/10">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/20">
                    {movingItem.part ? <img src={movingItem.part} className="w-full h-full object-contain" /> : <Laptop size={24} className="text-slate-500 dark:text-zinc-500"/>}
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-yellow-600 dark:text-yellow-500 tracking-widest">{movingItem.partcode}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{movingItem.category}</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <p className="text-sm text-center text-slate-600 dark:text-zinc-400 leading-relaxed">
                    This action will <span className="text-red-600 dark:text-red-500 font-bold uppercase">consume one spare part</span> from stock and log the transaction.
                  </p>
                  <div className="flex flex-col gap-4 p-3 border-y border-slate-200/50 dark:border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-zinc-400">Current Stock</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">{movingItem.stock}</span>
                        <ArrowRight className="text-slate-500 dark:text-zinc-500" size={16} />
                        <span className="text-red-600 dark:text-red-500 text-2xl">{movingItem.stock - 1}</span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase text-yellow-600 dark:text-yellow-500 tracking-widest">Assign Technician</label>
                      <select 
    value={selectedTech}
    onChange={(e) => setSelectedTech(e.target.value)}
    className="
      /* Layout & Shape */
      w-full h-12 px-4 rounded-xl appearance-none cursor-pointer
      
      /* Colors & Glassmorphism */
      bg-white dark:bg-zinc-800 
      border-2 border-slate-200 dark:border-zinc-700
      text-sm font-bold text-slate-900 dark:text-white
      
      /* Interaction & Transitions */
      outline-none transition-all duration-300
      focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10
      hover:border-slate-300 dark:hover:border-zinc-600
    "
  >
    <option value="" className="bg-white dark:bg-zinc-900">Select Technician...</option>
    {techs.map(t => (
      <option key={t} value={t} className="bg-white dark:bg-zinc-900 py-2">
        {t}
      </option>
    ))}
    <option value="other" className="bg-white dark:bg-zinc-900 font-black text-amber-600">
      + Other (Manual Entry)
    </option>
  </select>
                      {selectedTech === "other" && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                          <Input 
                            placeholder="Enter Technician Name" 
                            value={customTech}
                            onChange={(e) => setCustomTech(e.target.value.toUpperCase())}
                            className="h-11 bg-white/40 dark:bg-white/5 border border-yellow-500 focus:ring-2 focus:ring-yellow-500"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
     <Button 
  onClick={handleStockMovement} 
  disabled={isConsuming}
  className={`
    flex-1 h-12 rounded-xl font-bold transition-all duration-300
    bg-gradient-to-r from-yellow-500 to-yellow-600 
    hover:from-yellow-600 hover:to-yellow-700 
    text-white shadow-lg
    ${isConsuming ? "opacity-70 cursor-wait" : "hover:-translate-y-0.5 active:scale-95"}
  `}
>
  <div className="flex items-center justify-center gap-2">
    {isConsuming && (
      <RefreshCw size={16} className="animate-spin text-white" />
    )}
    <span>{isConsuming ? "Processing..." : "Yes, Consume Part"}</span>
  </div>
</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

<AnimatePresence>
  {isLogsModalOpen && isAdmin && (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 10 }}
        className="w-full max-w-7xl h-[85vh] flex flex-col"
      >
        <Card className="flex-1 flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-2xl rounded-xl">
          
          {/* Top Integrated Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-1 bg-red-600 dark:bg-red-500 rounded-full" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-tight">
                  Inventory Audit Trail
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded border border-slate-300 dark:border-zinc-700">READ_ONLY</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium mt-0.5">Comprehensive record of every stock reconciliation and movement.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-1">
                <button 
                  onClick={exportLogsToCSV}
                  className="flex items-center gap-2 px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300 rounded-md text-xs font-bold transition-all"
                >
                  <Download size={14} className="text-red-600" />
                  Generate Report (.csv)
                </button>
              </div>
              <button 
                onClick={() => setIsLogsModalOpen(false)} 
                className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-600 transition-all rounded-lg"
              >
                <X size={20}/>
              </button>
            </div>
          </div>

          {/* Data Grid Header */}
          <div className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-white/5">
            <div className="grid grid-cols-12 gap-0">
              {[
                { label: "Execution Date", span: "col-span-2" },
                { label: "Authorized User", span: "col-span-3" },
                { label: "Part ID", span: "col-span-2" },
                { label: "Variance", span: "col-span-3" },
                { label: "Assigned Loc", span: "col-span-2" }
              ].map((h, i) => (
                <div key={i} className={`${h.span} px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-r border-slate-100 dark:border-white/5 last:border-r-0`}>
                  {h.label}
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-transparent">
            {logsLoading ? (
              <div className="h-full flex items-center justify-center flex-col gap-4 text-slate-400">
                <RefreshCw size={32} className="animate-spin text-red-600" />
                <span className="text-xs font-bold uppercase tracking-widest">Initialising Audit Scan...</span>
              </div>
            ) : movements.map((log, idx) => (
              <div 
                key={log.id} 
                className="grid grid-cols-12 gap-0 border-b border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.02] transition-colors group"
              >
                <div className="col-span-2 px-6 py-4 flex flex-col justify-center border-r border-slate-100 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-300">{new Date(log.created_at).toLocaleDateString()}</span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-500">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="col-span-3 px-6 py-4 flex items-center gap-3 border-r border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-zinc-400">
                    {log.user.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-200 leading-tight">{log.user}</p>
                    <p className="text-[13px] text-white-500 dark:text-white font-semibold">{log.tech || "System Admin"}</p>
                  </div>
                </div>

                <div className="col-span-2 px-6 py-4 flex items-center border-r border-slate-100 dark:border-white/5">
                  <code className="px-2 py-1 bg-red-50 dark:bg-red-500/5 text-white-600 dark:text-red-500 rounded text-[13px] font-bold border border-red-100 dark:border-red-500/20">
                    {log.part}
                  </code>
                </div>

                <div className="col-span-3 px-6 py-4 flex items-center border-r border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4 w-full">
                    <div className="text-center">
                      <p className="text-[12px] font-bold text-slate-400 uppercase">Old</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">{log.oldqt}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 dark:text-white-700" />
                    <div className="text-center">
                      <p className="text-[12px] font-bold text-slate-400 uppercase">New</p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-500">{log.newqt}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-[14px] font-black px-1.5 py-0.5 rounded ${Number(log.newqt) > Number(log.oldqt) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {Number(log.newqt) - Number(log.oldqt) > 0 ? '+' : ''}{Number(log.newqt) - Number(log.oldqt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 px-6 py-4 flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-tighter">{log.location}</p>
                    <p className="text-[12px] font-medium text-slate-500 uppercase">Warehouse Zone</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Footer Status */}
          <div className="px-6 py-3 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase">DB Connection: Stable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase">Last Sync: 1 minute ago</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Page 1 of 1 <span className="mx-2 text-slate-300">|</span> {movements.length} Logged Entries
            </p>
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
              <Card className="relative overflow-hidden border-none bg-white dark:bg-zinc-900 shadow-2xl p-8 border border-slate-200/50 dark:border-white/10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-700" />
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="text-red-600" size={28} /> Modify Record
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">Update inventory levels and component details.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <X size={24} className="text-slate-500 hover:text-red-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 flex items-center gap-5 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
                      <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/50 dark:border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                        {currentItem.part ? <img src={currentItem.part} alt="Preview" className="w-full h-full object-contain p-2" /> : <Laptop className="text-slate-400 dark:text-zinc-600" size={32} />}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-zinc-500">Image URL</label>
                        <Input value={currentItem.part || ""} onChange={e => setCurrentItem({...currentItem, part: e.target.value})} placeholder="https://..." className="bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 focus:ring-2 focus:ring-red-600" />
                      </div>
                    </div>
                    {[
                      { label: "Model Name", value: "model", placeholder: "e.g., N17V3C8WH512" },
                      { label: "Part Code", value: "partcode", placeholder: "e.g., BT-SH13671973" },
                      { label: "Category", value: "category", placeholder: "e.g., Battery" },
                      { label: "Storage Location", value: "loc", placeholder: "e.g., A5A61" }
                    ].map((field) => (
                      <div key={field.value} className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-zinc-500">{field.label}</label>
                        <Input 
                          value={currentItem[field.value as keyof StockItem] || ""} 
                          onChange={e => setCurrentItem({...currentItem, [field.value]: e.target.value})} 
                          placeholder={field.placeholder}
                          className="bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 focus:ring-2 focus:ring-red-600 h-11"
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-600 dark:text-zinc-500">Current Stock Count</label>
                      <Input 
                        type="number" 
                        value={currentItem.stock ?? 0} 
                        onChange={e => setCurrentItem({...currentItem, stock: parseInt(e.target.value) || 0})} 
                        placeholder="e.g., 6" 
                        className="bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 focus:ring-2 focus:ring-red-600 h-12 text-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-10">
                    <Button 
                      onClick={handleSave} 
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold uppercase tracking-wider h-14 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsModalOpen(false)} 
                      variant="outline" 
                      className="flex-1 border border-slate-200/50 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 h-14 uppercase font-bold tracking-wider rounded-xl text-slate-900 dark:text-white"
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

      <style>{`
        .outline-text {
          -webkit-text-stroke: 2px #dc2626;
          color: transparent;
        }
        @media (max-width: 1024px) {
          .outline-text { -webkit-text-stroke: 1.5px #dc2626; }
        }
        @media (max-width: 640px) {
          .outline-text { -webkit-text-stroke: 1px #dc2626; }
        }
      `}</style>
    </div>
  );
}