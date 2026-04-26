import { useState, useEffect } from "react";
import { Menu, X, User, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../utils/cn";
import useUser from "../utils/useUser";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const activePath = location.pathname;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
          ? "bg-[#041017]/95 backdrop-blur-xl border-b border-cyan-400/10 shadow-[0_4px_40px_rgba(0,0,0,0.35)]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <BrandLogo
              markClassName="h-8 w-8"
              iconClassName="h-4 w-4"
              wordmarkClassName="text-xl"
              showTagline={scrolled}
            />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
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
                      style={{ background: "#2dd4bf" }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-[110px] h-9 bg-white/5 animate-pulse rounded-xl" />
            ) : user ? (
              <Link
                to="/account"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
              >
                <User className="w-4 h-4" />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                to="/account/signin"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
            <Link
              to="/admin"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
            </Link>
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
            className="md:hidden bg-[#041017]/98 backdrop-blur-xl border-b border-cyan-400/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    activePath === link.href
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {loading ? (
                <div className="w-full h-[44px] bg-white/5 animate-pulse rounded-xl" />
              ) : user ? (
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  My Account
                </Link>
              ) : (
                <Link
                  to="/account/signin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
              )}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Admin Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
