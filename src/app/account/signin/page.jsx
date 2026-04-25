import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import { motion } from "motion/react";
import { Zap, AlertCircle } from "lucide-react";
import useAuth from "../../../utils/useAuth";
import useUser from "../../../utils/useUser";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const { signInWithGoogle } = useAuth();
  const { user, loading: authLoading } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!authLoading && user) {
      navigate("/account");
    }
  }, [user, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle({ callbackUrl: "/account" });
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0f0f15] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
            >
              <Zap className="text-white w-8 h-8" fill="white" />
            </div>

            <h2 className="text-3xl font-black mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Welcome to Ease Events
            </h2>
            <p className="text-gray-400 text-center mb-8">
              Sign in to book tickets, manage your wishlist, and access your exclusive dashboard.
            </p>

            {error && (
              <div className="mb-6 p-4 w-full bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full relative group flex items-center justify-center space-x-3 px-6 py-4 bg-white hover:bg-gray-100 text-black rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {!loading && (
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              <span>{loading ? "Connecting..." : "Continue with Google"}</span>
            </button>
            
            <p className="mt-8 text-xs text-gray-500 text-center max-w-xs">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
