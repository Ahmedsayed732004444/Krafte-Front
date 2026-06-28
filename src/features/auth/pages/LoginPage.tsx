import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, User, Loader2 } from "lucide-react";
import { apiClient, extractErrorMessage } from "@/lib/api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<{ token: string; expiresAt: string }>("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      localStorage.setItem("token", res.data.token);
      toast.success("تم تسجيل الدخول بنجاح ✓ أهلاً بك في كرافت");
      navigate("/bookings", { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err) || "فشل تسجيل الدخول, يرجى التحقق من البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] flex flex-row-reverse text-right font-sans" dir="rtl">
      {/* Left side: Premium suit visual image */}
      <div className="hidden lg:block lg:w-[55%] relative h-screen overflow-hidden">
        <img
          src="/luxury_suit_halo.png"
          alt="Kraft Luxury Suit"
          className="w-full h-full object-cover object-center scale-102 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060709] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 md:p-16 relative">
        {/* Background Glow */}
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[#d9a336]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-[420px] bg-[#0d0e12]/90 border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
          {/* Brand Header */}
          <div className="text-center mb-8 space-y-1">
            <h1 className="text-4xl font-black text-foreground tracking-tight" style={{ fontFamily: "Cairo, sans-serif" }}>كرافت</h1>
            <p className="text-xs text-muted-foreground font-semibold">إدارة البدلات الفاخرة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground mr-1">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  disabled={loading}
                  className="w-full h-12 pr-11 pl-4 rounded-xl bg-[#14161d] border border-white/5 text-foreground placeholder-muted-foreground/40 outline-none focus:border-[#d9a336]/30 text-sm font-semibold transition-all text-right focus:ring-1 focus:ring-[#d9a336]/20"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground mr-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  disabled={loading}
                  className="w-full h-12 pr-11 pl-4 rounded-xl bg-[#14161d] border border-white/5 text-foreground placeholder-muted-foreground/40 outline-none focus:border-[#d9a336]/30 text-sm font-semibold transition-all text-right focus:ring-1 focus:ring-[#d9a336]/20 font-sans"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs font-bold pt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-[#14161d] text-[#d9a336] focus:ring-[#d9a336] focus:ring-offset-0"
                />
                <span>تذكرني</span>
              </label>
              
              <button
                type="button"
                onClick={() => toast.info("يرجى التواصل مع مدير النظام لإعادة تعيين كلمة المرور")}
                className="text-[#d9a336] hover:text-[#d9a336]/80 transition-colors cursor-pointer"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-transparent border border-[#d9a336] hover:bg-[#d9a336]/10 text-[#d9a336] font-black text-sm md:text-base flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-[#d9a336]/5 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>تسجيل الدخول</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
