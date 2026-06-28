import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell, Trash2, Check, CheckCheck,
  Calendar, Clock, AlertCircle, ShieldAlert, Info
} from "lucide-react";
import { notificationService } from "../services/notificationService";
import { useNotifications } from "../context/NotificationContext";
import type { NotificationResponse } from "../types/notifications";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { fetchUnreadCount, decrementUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = async (targetPage = 1) => {
    setLoading(true);
    try {
      const data = await notificationService.getAll(targetPage, 10);
      setNotifications(data.items);
      setPage(data.page);
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("فشل تحميل قائمة الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      decrementUnreadCount();
      toast.success("تم التحديد كمقروء");
    } catch {
      toast.error("فشل تنفيذ الإجراء");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      fetchUnreadCount();
      toast.success("تم تحديد جميع الإشعارات كمقروءة ✓");
    } catch {
      toast.error("فشل تنفيذ الإجراء");
    }
  };

  const handleDelete = async (id: string, wasUnread: boolean) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        decrementUnreadCount();
      }
      toast.success("تم حذف الإشعار");
    } catch {
      toast.error("فشل حذف الإشعار");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return {
          label: "هام جداً",
          classes: "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
          icon: ShieldAlert,
        };
      case "Medium":
        return {
          label: "تنبيه",
          classes: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
          icon: AlertCircle,
        };
      default:
        return {
          label: "عادي",
          classes: "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.15)]",
          icon: Info,
        };
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 6000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${Math.floor(diffMins / 60)} ساعة`;

    return date.toLocaleDateString("ar-EG-u-nu-latn", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">الإشعارات</h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">متابعة تنبيهات الحجز التلقائية ومواعيد الاستلام والتأخير</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-accent border border-border text-foreground hover:bg-accent/80 font-bold text-xs transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> تحديد الكل كمقروء
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/80 rounded-3xl p-6 h-28 animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-3xl p-16 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/40 flex items-center justify-center border border-border">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">صندوق الإشعارات فارغ</h3>
              <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                لا توجد تنبيهات جديدة في الوقت الحالي. عندما يقوم الخادم بإرسال تحديثات للحجز أو المقاسات ستظهر هنا.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const badge = getPriorityBadge(n.priority);
              const BadgeIcon = badge.icon;
              
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.entityId) {
                      navigate(`/bookings/${n.entityId}`);
                    }
                  }}
                  className={cn(
                    "bg-card/75 backdrop-blur-sm border rounded-3xl p-5 md:p-6 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
                    n.entityId ? "cursor-pointer hover:border-primary/60 hover:bg-card" : "",
                    n.isRead ? "border-border/80 opacity-75" : "border-primary/45 shadow-[0_0_12px_rgba(var(--primary-rgb),0.05)]"
                  )}
                >
                  {/* Status Indicator Bar */}
                  <div className={cn("absolute right-0 top-0 bottom-0 w-1", n.isRead ? "bg-muted" : "bg-primary")} />

                  {/* Left Side: Info */}
                  <div className="flex gap-4 items-start pr-1">
                    {/* Icon Status */}
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border", 
                      n.isRead ? "bg-accent/40 border-border" : "bg-primary/10 border-primary/20"
                    )}>
                      <Bell className={cn("w-5 h-5", n.isRead ? "text-muted-foreground" : "text-primary")} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-foreground text-sm md:text-base leading-snug">{n.title}</h4>
                        
                        <span className={cn("px-2 py-0.5 rounded-full border text-[9px] font-black flex items-center gap-1 shrink-0", badge.classes)}>
                          <BadgeIcon className="w-2.5 h-2.5" />
                          <span>{badge.label}</span>
                        </span>

                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        )}
                      </div>

                      <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed">{n.message}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1.5">
                        <span className="flex items-center gap-1 font-bold">
                          <Clock className="w-3 h-3" />
                          {formatNotificationTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div 
                    className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {n.entityId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bookings/${n.entityId}`);
                        }}
                        className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-md"
                      >
                        <Calendar className="w-3.5 h-3.5" /> عرض الحجز
                      </button>
                    )}

                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.id);
                        }}
                        className="w-9 h-9 rounded-xl bg-accent border border-border flex items-center justify-center text-foreground hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer"
                        title="تحديد كمقروء"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n.id, !n.isRead);
                      }}
                      className="w-9 h-9 rounded-xl bg-accent border border-border flex items-center justify-center text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all cursor-pointer"
                      title="حذف الإشعار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > 10 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => {
              const prev = Math.max(1, page - 1);
              setPage(prev);
              fetchNotifications(prev);
            }}
            disabled={page === 1 || loading}
            className="px-4 h-10 rounded-xl bg-card border border-border font-bold text-xs text-foreground hover:bg-accent disabled:opacity-30 transition-all cursor-pointer"
          >
            السابق
          </button>
          
          <span className="text-xs text-muted-foreground font-bold">
            صفحة {page} من {Math.ceil(totalCount / 10)} (إجمالي {totalCount})
          </span>

          <button
            onClick={() => {
              if (hasMore) {
                const next = page + 1;
                setPage(next);
                fetchNotifications(next);
              }
            }}
            disabled={!hasMore || loading}
            className="px-4 h-10 rounded-xl bg-card border border-border font-bold text-xs text-foreground hover:bg-accent disabled:opacity-30 transition-all cursor-pointer"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
