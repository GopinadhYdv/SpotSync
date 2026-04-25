import { useState, useEffect } from "react";
import { Menu, X, Zap, User, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../utils/cn";
import useUser from "../utils/useUser";

export default function Navbar() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState("/");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);
      const onScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "News", href: "/news" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#07070f]/95 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_40px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2.5 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                <Zap className="text-white w-4 h-4" fill="white" />
              </div>
              <span
                className="text-xl font-black tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #67e8f9, #fff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ease Events
              </span>
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    activePath === link.href
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {link.name}
                  {activePath === link.href && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "#a78bfa" }}
                    />
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-[110px] h-9 bg-white/5 animate-pulse rounded-xl" />
            ) : user ? (
              <a
                href="/account"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
              >
                <User className="w-4 h-4" />
                <span>My Account</span>
              </a>
            ) : (
              <a
                href="/account/signin"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </a>
            )}
            <a
              href="/admin"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#07070f]/98 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    activePath === link.href
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {link.name}
                </a>
              ))}
              {loading ? (
                <div className="w-full h-[44px] bg-white/5 animate-pulse rounded-xl" />
              ) : user ? (
                <a
                  href="/account"
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  My Account
                </a>
              ) : (
                <a
                  href="/account/signin"
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </a>
              )}
              <a
                href="/admin"
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Admin Dashboard
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
