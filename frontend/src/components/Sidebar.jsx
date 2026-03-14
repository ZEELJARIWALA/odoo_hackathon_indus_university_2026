import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Settings, 
  History,
  LogOut,
  User,
  ChevronRight
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive(to) 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
          : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
      }`}
    >
      <span className={`${isActive(to) ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}`}>
        {icon}
      </span>
      <span className="text-sm font-bold">{label}</span>
      {isActive(to) && <ChevronRight size={14} className="ml-auto" />}
    </Link>
  );

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50 shadow-sm">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 font-black text-xl">
            C
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">CoreInv</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management</p>
          </div>
        </div>

        <nav className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Menu</p>
          <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavLink to="/products" icon={<Package size={18} />} label="Products" />
          <NavLink to="/receipts" icon={<ArrowDownCircle size={18} />} label="Receipts" />
          <NavLink to="/deliveries" icon={<ArrowUpCircle size={18} />} label="Deliveries" />
          <NavLink to="/move-history" icon={<History size={18} />} label="History" />
          <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" />
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-50">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
            <User size={16} />
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-bold text-slate-900 truncate">Admin User</p>
            <p className="text-[10px] text-slate-400 font-medium">Online</p>
          </div>
          <button className="text-slate-400 hover:text-rose-500 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
