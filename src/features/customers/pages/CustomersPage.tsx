import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCustomers } from "../hooks/useCustomers";
import { cn } from "@/lib/utils";
import { Search, Phone, User, Calendar, ArrowLeft } from "lucide-react";

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useGetCustomers({
    pageNumber: page,
    pageSize: 10,
    searchValue: debouncedSearch || undefined,
  });

  const customersList = data?.items ?? [];

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(p => p[0])
      .join("");
  };

  const getAvatarBg = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-blue-500/10 border-blue-500/30 text-blue-400",
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      "bg-amber-500/10 border-amber-500/30 text-amber-400",
      "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      "bg-rose-500/10 border-rose-500/30 text-rose-400",
      "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">العملاء</h1>
        <p className="text-muted-foreground text-sm mt-2 font-medium">إدارة ملفات العملاء وسجل الإيجار والتحليلات البيانية الخاصة بكل عميل</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pr-11 pl-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-bold text-right"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
        </div>

        <div className="text-xs text-muted-foreground font-bold shrink-0">
          إجمالي العملاء: {!isLoading && data ? data.totalCount : "..."}
        </div>
      </div>

      {/* Customers List Layout */}
      <div className="space-y-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/80 rounded-3xl p-6 h-28 animate-pulse" />
        ))}

        {!isLoading && customersList.length === 0 && (
          <div className="bg-card border border-border/80 rounded-3xl p-16 text-center text-muted-foreground text-sm max-w-lg mx-auto flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/40 flex items-center justify-center border border-border">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">لا يوجد عملاء</h3>
              <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                لم يتم العثور على أي عميل يطابق معايير البحث الحالية أو قاعدة البيانات فارغة.
              </p>
            </div>
          </div>
        )}

        {!isLoading && customersList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customersList.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="bg-card/75 backdrop-blur-sm border border-border/80 rounded-3xl p-6 flex items-center justify-between gap-6 hover:border-primary/50 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                {/* Content */}
                <div className="flex items-center gap-4">
                  {/* Initials Avatar */}
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border text-sm font-black tracking-wider", getAvatarBg(c.customerName))}>
                    {getInitials(c.customerName)}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-foreground text-base leading-snug">{c.customerName || "عميل غير مسجل"}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {c.phone}
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        عدد الحجوزات: <span className="text-primary font-black">{c.bookingsCount}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Details Action */}
                <button
                  className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!data.hasPreviousPage}
            className="px-4 h-10 rounded-xl bg-card border border-border font-bold text-xs text-foreground hover:bg-accent disabled:opacity-30 transition-all cursor-pointer"
          >
            السابق
          </button>
          <span className="text-xs text-muted-foreground font-bold">
            صفحة {page} من {data.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!data.hasNextPage}
            className="px-4 h-10 rounded-xl bg-card border border-border font-bold text-xs text-foreground hover:bg-accent disabled:opacity-30 transition-all cursor-pointer"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
