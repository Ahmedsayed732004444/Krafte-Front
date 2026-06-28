import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, Settings, Sun, Moon, Menu, X, Calendar, Shirt, LogOut, Bell, Users, BarChart3, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/features/notifications/context/NotificationContext";

const navItems = [
  { to: "/", label: "الرئيسية", icon: Home, end: true },
  { to: "/bookings", label: "الحجوزات", icon: Calendar, end: false },
  { to: "/customers", label: "العملاء", icon: Users, end: false },
  { to: "/notifications", label: "الإشعارات", icon: Bell, end: false },
  { to: "/analytics", label: "التحليلات", icon: BarChart3, end: false },
  { to: "/settings", label: "الإعدادات", icon: Settings, end: false },
];

export default function AppLayout() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="h-16 shrink-0 bg-card border-b border-border flex items-center justify-between px-6 md:hidden sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-primary-foreground">
            <Shirt className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-black text-foreground text-lg tracking-tight">كرافت</span>
            <span className="text-[10px] text-muted-foreground mr-1.5">نظام إدارة البدل</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <NavLink
            to="/notifications"
            className="w-10 h-10 rounded-xl bg-accent/50 border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors relative shrink-0 cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </NavLink>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl bg-accent/50 border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 shrink-0 bg-card border-l border-border flex flex-col fixed inset-y-0 right-0 z-40 transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:flex",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Logo (Desktop only) */}
        <div className="h-24 hidden md:flex items-center justify-between px-6 border-b border-border/80">
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex flex-col text-right">
              <span className="font-extrabold text-foreground text-xl tracking-tight leading-none" style={{ fontFamily: "Outfit, Cairo, sans-serif" }}>Krafte</span>
              <p className="text-[10px] text-muted-foreground leading-tight mt-1 font-bold">إدارة تأجير البدلات</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md text-primary-foreground font-black text-xl shrink-0 font-serif">
              K
            </div>
          </div>
        </div>

        {/* Create Booking Button (Desktop only) */}
        <div className="px-4 pt-4 hidden md:block">
          <NavLink
            to="/bookings/create"
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>حجز جديد</span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 mt-16 md:mt-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between h-11 transition-all duration-200 cursor-pointer font-bold text-sm",
                  isActive
                    ? "bg-primary/5 text-primary border-l-4 border-primary rounded-l-xl pr-4 pl-3"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl px-4"
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4.5 h-4.5" />
                <span>{label === "الإعصارات" ? "الإشعارات" : label}</span>
              </div>
              {to === "/notifications" && unreadCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer controls: theme toggler and connection status */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Theme Toggler */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between px-4 h-11 rounded-xl bg-accent/40 border border-border text-sm font-semibold text-foreground hover:bg-accent transition-all duration-200"
          >
            <span className="text-muted-foreground">المظهر</span>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500 dark:text-muted-foreground" />
              <div className="w-8 h-4 bg-primary/20 rounded-full p-0.5 relative flex items-center">
                <div className={cn(
                  "w-3 h-3 bg-primary rounded-full transition-all duration-300 absolute",
                  theme === "dark" ? "left-1" : "right-1"
                )} />
              </div>
              <Moon className="w-4 h-4 text-muted-foreground dark:text-primary" />
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full flex items-center justify-between px-4 h-11 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-semibold text-destructive hover:bg-destructive hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span>تسجيل الخروج</span>
            <LogOut className="w-4.5 h-4.5" />
          </button>

          {/* Connection status */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-muted-foreground">متصل بالخادم</p>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
