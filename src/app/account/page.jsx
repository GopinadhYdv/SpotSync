import { useNavigate } from "react-router";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Shield, LogOut, Ticket, Settings, Bell,
  ChevronRight, Calendar, MapPin, Camera, Download,
  Smartphone, Save, Lock, Zap, Heart, AlertCircle, CheckCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import {
  getProfile, saveProfile, saveNotifications,
  getTickets, getWishlist, toggleWishlist,
} from "../../utils/accountStore";
import { toast } from "sonner";
import useUser from "../../utils/useUser";
import useAuth from "../../utils/useAuth";
import { BRAND_NAME } from "../../components/BrandLogo";

// ── Validation helpers ────────────────────────────────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => !v || /^(\+91)?[\s-]?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""));
const isValidUpi   = (v) => !v || /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(v);

// ── Avatar Upload ─────────────────────────────────────────────────────────────
function AvatarUpload({ profile, onSave }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSave({ avatarUrl: ev.target.result });
      toast.success("Avatar updated!");
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="relative w-24 h-24 mx-auto mb-6 group cursor-pointer" onClick={() => fileRef.current?.click()}>
      <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-lg"
        style={{ background: "linear-gradient(135deg, #1f1f2e, #13131f)" }}>
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-black text-purple-400/50">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
        <Camera size={24} className="text-white" />
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

// ── Field Row ─────────────────────────────────────────────────────────────────
function FieldRow({ icon: Icon, label, value, edit, name, type = "text", onChange, placeholder, error, hint }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
        <Icon size={12} /> {label}
      </p>
      {edit ? (
        <div>
          <input
            type={type} name={name} value={value} onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[#161622] border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
            style={{ borderColor: error ? "#ef4444" : value ? "#22d3ee" : "rgba(255,255,255,0.1)" }}
          />
          {error && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
          {!error && value && hint && <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle size={10}/>{hint}</p>}
        </div>
      ) : (
        <p className="text-lg font-medium">{value || <span className="text-gray-600 italic text-sm">Not set</span>}</p>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { user, loading } = useUser();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});
  const [savedBadge, setSavedBadge] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate("/account/signin");
      return;
    }
    if (user) {
      let p = getProfile();
      if (!p || p.email !== user.email || (!p.avatarUrl && user.image)) {
        p = saveProfile({
          ...p,
          name: user.name || p?.name || "",
          email: user.email || p?.email || "",
          avatarUrl: user.image || p?.avatarUrl || ""
        });
      }
      setProfile(p);
    } else {
      setProfile(getProfile());
    }
    setTickets(getTickets());
    setWishlist(getWishlist());
  }, [user, loading]);

  // Listen for storage changes from other tabs / modal
  useEffect(() => {
    const handler = () => {
      setProfile(getProfile());
      setTickets(getTickets());
      setWishlist(getWishlist());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (loading || !profile) return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
    </div>
  );

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    // inline validation
    const errs = { ...errors };
    if (name === "email") errs.email = isValidEmail(value) ? "" : "Invalid email format";
    if (name === "phone") errs.phone = isValidPhone(value) ? "" : "Enter a valid 10-digit Indian number";
    if (name === "upiId") errs.upiId = isValidUpi(value) ? "" : "Format: name@bank (e.g. rahul@okaxis)";
    setErrors(errs);
  };

  const startEdit = () => {
    setEditForm({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      upiId: profile.upiId || "",
      dob: profile.dob || "",
      city: profile.city || "",
      gender: profile.gender || "",
    });
    setErrors({});
    setIsEditing(true);
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const saveEdit = () => {
    if (hasErrors) return;
    const updated = saveProfile(editForm);
    setProfile(updated);
    setIsEditing(false);
    setSavedBadge(true);
    toast.success("Profile updated successfully!");
    setTimeout(() => setSavedBadge(false), 3000);
  };

  const handleNotificationToggle = (key) => {
    const newVal = !profile.notifications[key];
    const updated = saveNotifications({ [key]: newVal });
    setProfile(updated);
    toast.success(`${key} notifications ${newVal ? "enabled" : "disabled"}`);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    e.target.reset();
    toast.success("Password updated successfully!");
  };

  const handleRemoveWishlist = (eventId) => {
    const { list } = toggleWishlist({ id: eventId });
    setWishlist(list);
    toast.success("Removed from wishlist");
  };

  const tabs = [
    { name: "Dashboard",     id: "Dashboard",     icon: User },
    { name: "My Tickets",    id: "My Tickets",    icon: Ticket },
    { name: "Wishlist",      id: "Wishlist",      icon: Heart },
    { name: "Notifications", id: "Notifications", icon: Bell },
    { name: "Security",      id: "Security",      icon: Shield },
    { name: "Logout",        id: "Logout",        icon: LogOut, danger: true },
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-white pt-24 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              My Account
            </h1>
            {savedBadge && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30"
              >
                <CheckCircle size={11} /> Saved just now
              </motion.span>
            )}
          </div>
          <p className="text-gray-400">Manage your {BRAND_NAME} profile, tickets, and preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0f0f15] p-8 rounded-3xl border border-white/5 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
              <AvatarUpload profile={profile} onSave={(updates) => setProfile(saveProfile(updates))} />
              <h2 className="text-xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {profile.name || `${BRAND_NAME} User`}
              </h2>
              <p className="text-gray-500 text-sm mb-2 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                {profile.tier} Tier
              </p>
              {profile.upiId && (
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <Zap size={10} className="text-purple-400" /> {profile.upiId}
                </p>
              )}
            </div>

            <nav className="bg-[#0f0f15] p-2 rounded-3xl border border-white/5 space-y-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={async () => {
                    if (item.id === "Logout") {
                      try {
                        toast.loading("Logging out...", { id: "logout" });
                        await signOut({ callbackUrl: "/", redirect: true });
                      } catch (err) {
                        toast.error("Logout failed", { id: "logout" });
                      }
                    } else if (!item.danger) {
                      setActiveTab(item.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all text-sm font-bold",
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-600/20 to-transparent text-purple-400 border border-purple-500/20"
                      : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent",
                    item.danger ? "hover:text-red-400 hover:bg-red-500/10" : ""
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon size={18} className={activeTab === item.id ? "text-purple-400" : ""} />
                    <span>{item.name}</span>
                    {item.id === "Wishlist" && wishlist.length > 0 && (
                      <span className="ml-1 text-xs bg-pink-500/20 text-pink-400 border border-pink-400/30 rounded-full px-2 py-0.5">{wishlist.length}</span>
                    )}
                  </div>
                  {!item.danger && activeTab !== item.id && <ChevronRight size={14} className="opacity-40" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">

              {/* ── DASHBOARD ── */}
              {activeTab === "Dashboard" && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <section className="bg-[#0f0f15] p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <h3 className="text-2xl font-black flex items-center gap-3">
                        <User className="text-cyan-400" /> Profile Information
                      </h3>
                      {!isEditing ? (
                        <button onClick={startEdit} className="text-sm font-bold text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-xl transition-colors border border-white/10 flex items-center gap-2">
                          <Settings size={14} /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-xl transition-colors border border-white/10">
                            Cancel
                          </button>
                          <button onClick={saveEdit} disabled={hasErrors} className="text-sm font-black text-black bg-gradient-to-r from-cyan-400 to-purple-400 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-transform hover:scale-105 flex items-center gap-2 disabled:opacity-50">
                            <Save size={14} /> Save
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <FieldRow icon={User} label="Full Name" name="name" value={isEditing ? editForm.name : profile.name} edit={isEditing} onChange={handleEditChange} placeholder="Rahul Sharma" />
                      <FieldRow icon={Mail} label="Email Address" name="email" type="email" value={isEditing ? editForm.email : profile.email} edit={isEditing} onChange={handleEditChange} placeholder="rahul@example.com" error={errors.email} hint="Valid email" />
                      <FieldRow icon={Smartphone} label="Phone Number" name="phone" value={isEditing ? editForm.phone : profile.phone} edit={isEditing} onChange={handleEditChange} placeholder="+91 98765 43210" error={errors.phone} hint="Valid phone" />
                      <FieldRow icon={Zap} label="Default UPI ID" name="upiId" value={isEditing ? editForm.upiId : profile.upiId} edit={isEditing} onChange={handleEditChange} placeholder="rahul@okaxis" error={errors.upiId} hint="Valid UPI ID" />
                      {isEditing && (
                        <>
                          <FieldRow icon={Calendar} label="Date of Birth" name="dob" type="date" value={editForm.dob} edit={true} onChange={handleEditChange} />
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">City</p>
                            <input name="city" value={editForm.city} onChange={handleEditChange} placeholder="Mumbai, Delhi…" className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Gender (optional)</p>
                            <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none transition-colors">
                              <option value="">Prefer not to say</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </section>
                </motion.div>
              )}

              {/* ── TICKETS ── */}
              {activeTab === "My Tickets" && (
                <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black">My Tickets</h3>
                    <span className="text-sm text-gray-500">{tickets.length} booking{tickets.length !== 1 ? "s" : ""}</span>
                  </div>
                  {tickets.length === 0 ? (
                    <div className="bg-[#0f0f15] border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                      <Ticket size={48} className="text-gray-600 mb-4" />
                      <h4 className="text-xl font-bold mb-2">No tickets yet</h4>
                      <p className="text-gray-500 mb-6 max-w-sm">Discover and book extraordinary events to see your tickets here.</p>
                      <a href="/events" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">Browse Events</a>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {tickets.map((tkt, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                          key={tkt.ticketId}
                          className="bg-[#0f0f15] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 h-full" />
                          <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                            <img src={tkt.eventPoster} alt={tkt.eventTitle} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 w-full relative z-10">
                            <div className="flex justify-between items-start mb-2">
                              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase text-cyan-400">
                                {tkt.ticketId}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">Qty: {tkt.count}</span>
                            </div>
                            <h4 className="text-xl font-black mb-3">{tkt.eventTitle}</h4>
                            <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-400">
                              <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(tkt.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              <span className="flex items-center gap-1.5"><MapPin size={14}/> {tkt.eventLocation}</span>
                            </div>
                            {tkt.seats && tkt.seats.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {tkt.seats.map(s => (
                                  <span key={s} className="text-[10px] font-mono bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">{s}</span>
                                ))}
                              </div>
                            )}
                            {tkt.totalPaid && (
                              <p className="text-sm font-black mt-3" style={{ color: "#a78bfa" }}>₹{tkt.totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 0 })} paid</p>
                            )}
                          </div>
                          <div className="w-full md:w-auto shrink-0">
                            <button onClick={() => toast.success("Downloading ticket…")} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors">
                              <Download size={16} /> E-Ticket
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── WISHLIST ── */}
              {activeTab === "Wishlist" && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h3 className="text-2xl font-black mb-8">Saved Events</h3>
                  {wishlist.length === 0 ? (
                    <div className="bg-[#0f0f15] border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                      <Heart size={48} className="text-gray-600 mb-4" />
                      <h4 className="text-xl font-bold mb-2">Nothing saved yet</h4>
                      <p className="text-gray-500 mb-6 max-w-sm">Tap the ❤️ on any event to save it here for later.</p>
                      <a href="/events" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">Browse Events</a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {wishlist.map((ev, idx) => (
                        <motion.div
                          key={ev.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.07 }}
                          className="bg-[#0f0f15] rounded-2xl border border-white/5 overflow-hidden relative"
                        >
                          <img src={ev.poster} alt={ev.title} className="w-full h-36 object-cover" />
                          <div className="p-4">
                            <h4 className="font-black text-sm mb-1 truncate">{ev.title}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10}/>{ev.location}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-black text-sm" style={{ color: ev.color }}>₹{ev.price?.toLocaleString("en-IN")}</span>
                              <div className="flex gap-2">
                                <a href={`/events/${ev.id}`} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors">Book</a>
                                <button onClick={() => handleRemoveWishlist(ev.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors">Remove</button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "Notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <section className="bg-[#0f0f15] p-8 rounded-3xl border border-white/5 shadow-xl">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Bell className="text-purple-400" /> Notifications</h3>
                    <div className="space-y-6">
                      {[
                        { key: "email", title: "Email Notifications", desc: "Booking confirmations, event reminders, and updates via email." },
                        { key: "push",  title: "Push Notifications",  desc: "Real-time alerts on your device when seats fill up fast." },
                        { key: "sms",   title: "SMS Alerts",          desc: "Critical ticket details and access codes via SMS." },
                      ].map((n) => (
                        <div key={n.key} className="flex items-center justify-between p-4 bg-[#161622] rounded-2xl border border-white/5">
                          <div>
                            <h4 className="font-bold text-white mb-1">{n.title}</h4>
                            <p className="text-sm text-gray-500">{n.desc}</p>
                          </div>
                          <button onClick={() => handleNotificationToggle(n.key)}
                            className={cn("w-12 h-6 rounded-full transition-colors relative", profile.notifications[n.key] ? "bg-cyan-500" : "bg-gray-700")}>
                            <span className={cn("absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform", profile.notifications[n.key] ? "translate-x-6" : "")} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === "Security" && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <section className="bg-[#0f0f15] p-8 rounded-3xl border border-white/5 shadow-xl">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Shield className="text-cyan-400" /> Security</h3>
                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-5 mb-10">
                      <h4 className="font-bold text-gray-300">Change Password</h4>
                      <input type="password" required className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" placeholder="Current Password" />
                      <input type="password" required className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" placeholder="New Password" />
                      <input type="password" required className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" placeholder="Confirm New Password" />
                      <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-black text-black shadow-[0_4px_20px_rgba(34,211,238,0.3)]">
                        Update Password
                      </button>
                    </form>
                    <div className="pt-8 border-t border-white/10">
                      <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2"><Lock size={16}/> Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500 mb-4">Protect your account with an extra layer of security. Currently disabled.</p>
                      <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">Enable 2FA</button>
                    </div>
                  </section>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
