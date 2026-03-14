import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Repeat2,
  Settings, 
  History,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [userName, setUserName] = useState("Admin User");
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || "Admin User");
      } catch (e) {
        setUserName("Admin User");
      }
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowProfileMenu(false);
    navigate("/auth");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu, showMobileMenu]);

  const menuItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { 
      label: "Operations", 
      icon: Repeat2,
      submenu: [
        { label: "Receipt", path: "/operations/receipt", icon: ArrowDownCircle, desc: "Incoming Stock" },
        { label: "Delivery", path: "/operations/delivery", icon: ArrowUpCircle, desc: "Outgoing Stock" },
        { label: "Adjustment", path: "/operations/adjustment", icon: Package, desc: "Inventory Adjustment" }
      ]
    },
    { label: "Stock", path: "/stock", icon: Package, desc: "Available Stock" },
    { label: "Move History", path: "/move-history", icon: History, desc: "In/Out History" },
    { label: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-slate-50 to-white border-b border-slate-200/60 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-0 flex items-center justify-between h-20">
        
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200/60 font-black text-lg transform hover:scale-105 transition-transform">
            CI
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight tracking-tight">COREINVENTORY</h1>
            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Management System</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => (
            <div key={item.label} className="relative group">
              <Link
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all duration-200 font-semibold text-sm group/nav ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 shadow-sm"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-indigo-600"
                }`}
              >
                {item.icon && <item.icon size={16} className="flex-shrink-0" />}
                <span>{item.label}</span>
                {item.submenu && (
                  <ChevronDown size={14} className="transition-transform group-hover:rotate-180 duration-200" />
                )}
              </Link>

              {/* Submenu */}
              {item.submenu && (
                <div className="absolute left-0 mt-0 bg-white border border-slate-200/60 rounded-xl shadow-2xl shadow-slate-300/20 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[240px] backdrop-blur-sm">
                  {item.submenu.map((subitem, idx) => (
                    <Link
                      key={idx}
                      to={subitem.path}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 to-indigo-50/50 transition-all duration-200 ${
                        idx !== 0 ? "border-t border-slate-100" : ""
                      } ${isActive(subitem.path) ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
                    >
                      <subitem.icon size={16} className="flex-shrink-0 mt-1 text-indigo-600" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{subitem.label}</p>
                        <p className="text-xs text-slate-500 font-medium">{subitem.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Cloud Status - Desktop */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-lg border border-emerald-100">
            <span className="text-[11px] font-semibold text-slate-700">Cloud:</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow shadow-emerald-500/70"></div>
            <span className="text-[11px] font-semibold text-emerald-700">Online</span>
          </div>

          {/* Profile Menu */}
          <div className="relative hidden md:block" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 border border-transparent hover:border-slate-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <User size={16} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{userName}</p>
                <p className="text-[9px] text-emerald-600 font-semibold">Active</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-200/60 rounded-xl shadow-2xl shadow-slate-300/20 overflow-hidden min-w-[200px]">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm font-semibold text-slate-700 border-b border-slate-100 transition-colors duration-200"
                >
                  <User size={16} className="text-indigo-600" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-sm font-semibold text-rose-600 transition-colors duration-200"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden bg-white border-t border-slate-200/60 shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto"
        >
          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenSubmenu(openSubmenu === item.label ? null : item.label)
                      }
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon size={16} />}
                        {item.label}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          openSubmenu === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openSubmenu === item.label && (
                      <div className="ml-4 mt-2 space-y-2 border-l-2 border-indigo-200 pl-4">
                        {item.submenu.map((subitem, idx) => (
                          <Link
                            key={idx}
                            to={subitem.path}
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 text-slate-700 font-medium text-sm"
                          >
                            <subitem.icon size={14} className="text-indigo-600" />
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive(item.path)
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.icon && <item.icon size={16} />}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile Profile */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <Link
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold text-sm mb-2"
              >
                <User size={16} className="text-indigo-600" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
