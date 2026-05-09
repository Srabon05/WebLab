import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Recycle, LogOut, User, ChevronDown, ChevronLeft, ChevronRight,
  UserCircle, Settings, HelpCircle, Menu, X as CloseIcon
} from "lucide-react";
import { logout } from "../lib/auth";
import { toast } from "sonner";

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  gradientFrom: string;
  gradientTo: string;
  title: string;
}

export function Sidebar({ user, menuItems, activeTab, onTabChange, gradientFrom, gradientTo, title }: SidebarProps) {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = () => {
    console.log('🔴 Logging out user...');
    logout();
    console.log('✅ User logged out, navigating to login page...');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setShowProfileDropdown(false);
    navigate('/settings');
  };

  const handleHelp = () => {
    setShowProfileDropdown(false);
    navigate('/help');
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'from-blue-500 to-indigo-600';
      case 'user': return 'from-green-500 to-emerald-600';
      case 'collector': return 'from-cyan-500 to-blue-600';
      case 'recycling_center': return 'from-purple-500 to-pink-600';
      case 'center': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo & Title */}
      <div className={`p-6 border-b border-white/10 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}>
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-white blur-xl opacity-50 animate-pulse" />
                <Recycle className="size-10 text-white relative" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white truncate">{title || 'Dashboard'}</h1>
                <p className="text-xs text-white/80 truncate">{user?.role?.toUpperCase() || 'USER'}</p>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="relative mx-auto">
              <div className="absolute inset-0 bg-white blur-xl opacity-50 animate-pulse" />
              <Recycle className="size-8 text-white relative" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onTabChange(item.key);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                isActive
                  ? `bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white shadow-lg`
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`size-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:scale-110 transition-transform'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${getRoleColor(user?.role)} text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all group cursor-pointer`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="size-5 text-white" />
            </div>
            {!isCollapsed && (
              <>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-white/80 truncate">{user?.email || ''}</p>
                </div>
                <ChevronDown className={`size-4 transition-transform flex-shrink-0 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setShowProfileDropdown(false)}
              />

              {/* Menu */}
              <div
                className={`absolute ${isCollapsed ? 'left-full ml-2' : 'bottom-full mb-2'} ${isCollapsed ? 'bottom-0 min-w-[280px]' : 'left-0 right-0'} bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[70] animate-scale-in`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Profile Header */}
                <div className={`bg-gradient-to-r ${getRoleColor(user?.role)} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="size-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{user?.name || 'User'}</p>
                      <p className="text-white/80 text-sm truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleViewProfile();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 active:bg-blue-100 rounded-xl transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
                      <UserCircle className="size-5 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">View Profile</p>
                      <p className="text-xs text-gray-500">Your account details</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleSettings();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 active:bg-purple-100 rounded-xl transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
                      <Settings className="size-5 text-purple-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">Settings</p>
                      <p className="text-xs text-gray-500">Preferences & config</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleHelp();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 active:bg-green-100 rounded-xl transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
                      <HelpCircle className="size-5 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">Help & Support</p>
                      <p className="text-xs text-gray-500">Get assistance</p>
                    </div>
                  </button>

                  <div className="border-t border-gray-100 my-2" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
                      <LogOut className="size-5 text-red-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">Logout</p>
                      <p className="text-xs text-red-400">Sign out of account</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex items-center justify-center p-2 m-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        {isCollapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isMobileOpen ? <CloseIcon className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 shadow-xl transition-all duration-300 sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>
    </>
  );
}
