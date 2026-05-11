import { AuthenticateWithRedirectCallback } from "@clerk/react-router";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
