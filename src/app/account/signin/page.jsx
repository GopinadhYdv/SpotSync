import React from "react";
import Navbar from "../../../components/Navbar";
import { motion } from "motion/react";
import useUser from "../../../utils/useUser";
import { useNavigate } from "react-router-dom";
import BrandLogo, { BRAND_NAME } from "../../../components/BrandLogo";
import { SignIn } from "@clerk/react-router";

export default function SignInPage() {
  const { user, loading: authLoading } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && user) {
      navigate("/account");
    }
  }, [user, authLoading, navigate]);

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
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col items-center">
            <BrandLogo
              to={null}
              className="mb-6 flex-col gap-4"
              markClassName="h-16 w-16"
              iconClassName="h-8 w-8"
              wordmarkClassName="text-3xl"
              showTagline={true}
            />
            <p className="text-gray-400 text-center mb-8">
              Sign in to book tickets, sync your plans, and manage everything in one {BRAND_NAME} account.
            </p>

            <SignIn
              routing="hash"
              afterSignInUrl="/account"
              afterSignUpUrl="/account"
              appearance={{
                variables: {
                  colorPrimary: "#22d3ee",
                  colorBackground: "#0f0f15",
                  colorText: "#ffffff",
                  colorTextSecondary: "#9ca3af",
                  colorInputBackground: "#161622",
                  colorInputText: "#ffffff",
                  borderRadius: "0.75rem",
                },
                elements: {
                  card: "bg-transparent shadow-none border-0 p-0 w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-black rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]",
                  dividerLine: "bg-white/10",
                  dividerText: "text-gray-500",
                  formFieldInput:
                    "w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none transition-colors",
                  formFieldLabel: "text-gray-400 text-sm font-medium",
                  formButtonPrimary:
                    "w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold rounded-xl transition-all hover:opacity-90 active:scale-[0.98]",
                  footerActionLink: "text-cyan-400 hover:text-cyan-300",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-cyan-400",
                },
              }}
            />

            <p className="mt-8 text-xs text-gray-500 text-center max-w-xs">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
