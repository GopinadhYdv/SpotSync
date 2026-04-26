import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, Ticket, TrendingUp, Settings, LogOut,
  Plus, Edit, Trash2, Star, DollarSign, User, ShieldAlert, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import {
  adminLogin, isAdminLoggedIn, setAdminAuth, getAnalytics,
  getEventRatings, subscribeToEvents
} from "../../utils/adminStore";
import { createRemoteEvent, deleteRemoteEvent, loadEvents, updateRemoteEvent } from "../../utils/eventService";

const defaultEventForm = () => ({
  title: "",
  category: "",
  location: "",
  venueAddress: "",
  date: "",
  time: "18:00",
  price: 0,
  capacity: 100,
  organizer: "Ease Events",
  badge: "New Event",
  color: "#7c3aed",
  accent: "#3b82f6",
  featured: false,
  shortDescription: "",
  longDescription: "",
  poster: "",
  seatLayout: {
    sections: [
      { id: "floor", label: "Floor - General", rows: 4, cols: 12, color: "#10b981", priceAdd: 0 },
      { id: "lower", label: "Lower Deck - Premium", rows: 3, cols: 10, color: "#6366f1", priceAdd: 500 },
      { id: "vip", label: "Upper Deck - VIP", rows: 2, cols: 8, color: "#f59e0b", priceAdd: 1500 },
    ],
  },
});

function mapEventToForm(event) {
  const base = defaultEventForm();
  return {
    ...base,
    ...event,
    venueAddress: event?.venueAddress || event?.location || "",
    shortDescription: event?.shortDescription || event?.description || "",
    longDescription: event?.longDescription || event?.description || "",
    seatLayout: {
      sections: base.seatLayout.sections.map((section, index) => ({
        ...section,
        ...(event?.seatLayout?.sections?.[index] || {}),
      })),
    },
  };
}

function AdminLoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminLogin(email, password)) {
      setAdminAuth(true);
      onLogin();
    } else {
      setError("Invalid credentials. Try admin359@gmail.com / admin123");
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <ShieldAlert size={32} className="text-purple-500" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white text-center mb-6">Admin Login</h2>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-4 text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="admin359@gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-all">Login</button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState(defaultEventForm());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isAdminLoggedIn());
    refreshData();
    return subscribeToEvents(() => refreshData());
  }, []);

  const refreshData = async () => {
    await loadEvents();
    setAnalytics(getAnalytics());
  };

  useEffect(() => {
    if (isModalOpen) {
      setEventForm(editingEvent ? mapEventToForm(editingEvent) : defaultEventForm());
    }
  }, [editingEvent, isModalOpen]);

  if (!isAuthenticated) {
    return <AdminLoginForm onLogin={() => { setIsAuthenticated(true); refreshData(); }} />;
  }

  const handleLogout = () => {
    setAdminAuth(false);
    setIsAuthenticated(false);
  };

  const handleFieldChange = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeatSectionChange = (index, field, value) => {
    setEventForm((prev) => ({
      ...prev,
      seatLayout: {
        sections: prev.seatLayout.sections.map((section, sectionIndex) =>
          sectionIndex === index ? { ...section, [field]: value } : section,
        ),
      },
    }));
  };

  const handlePosterUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleFieldChange("poster", ev.target?.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const eventData = {
      ...eventForm,
      price: Number(eventForm.price),
      capacity: Number(eventForm.capacity),
      description: eventForm.shortDescription,
      seatLayout: {
        sections: eventForm.seatLayout.sections.map((section) => ({
          ...section,
          rows: Number(section.rows),
          cols: Number(section.cols),
          priceAdd: Number(section.priceAdd),
          priceLabel: Number(section.priceAdd) > 0 ? `+₹${Number(section.priceAdd).toLocaleString("en-IN")}` : "Included",
        })),
      },
    };

    try {
      let savedEvent;
      if (editingEvent?.id) {
        savedEvent = await updateRemoteEvent(editingEvent.id, eventData);
      } else {
        savedEvent = await createRemoteEvent(eventData);
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      setEventForm(defaultEventForm());
      await refreshData();
      if (!editingEvent?.id && savedEvent?.id) {
        navigate(`/events/${savedEvent.id}`);
      }
    } catch (error) {
      window.alert(error.message || "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if(window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteRemoteEvent(id);
        await refreshData();
      } catch (error) {
        window.alert(error.message || "Failed to delete event.");
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-green-500 flex items-center">
            <TrendingUp size={12} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070707] text-white flex">
      {/* Persistent Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col fixed inset-y-0 z-50">
        <div className="flex items-center space-x-3 mb-12 px-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Calendar className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight italic">EaseAdmin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: "overview", name: "Overview", icon: LayoutDashboard },
            { id: "events", name: "Manage Events", icon: Calendar },
            { id: "ratings", name: "Ratings & Reviews", icon: Star },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-left",
                activeTab === link.id
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-gray-500 hover:text-white hover:bg-white/5",
              )}
            >
              <link.icon size={20} />
              <span>{link.name}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-2">
          <a href="/" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white transition-all">
            <LayoutDashboard size={20} />
            <span>View Public Site</span>
          </a>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-left">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight flex items-center gap-3">
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'events' && 'Event Management'}
              {activeTab === 'ratings' && 'Guest Ratings'}
            </h1>
            <p className="text-gray-500">
              {activeTab === 'overview' && 'Monitor your event ecosystem performance and metrics.'}
              {activeTab === 'events' && 'Create, edit, and categorize your events.'}
              {activeTab === 'ratings' && 'View what guests are saying about past events.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'events' && (
              <button 
                onClick={() => { setEditingEvent(null); setEventForm(defaultEventForm()); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <Plus size={18} /> New Event
              </button>
            )}
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold">A</div>
              <div className="text-xs pr-2">
                <p className="font-bold">Admin User</p>
                <p className="text-gray-500">Superuser</p>
              </div>
            </div>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && analytics && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <StatCard title="Total Events" value={analytics.totalEvents} icon={Calendar} color="bg-blue-600" trend="Active & Past" />
              <StatCard title="Featured Events" value={analytics.featuredEvents} icon={Star} color="bg-purple-600" trend="Promoted" />
              <StatCard title="Total Bookings (Simulated)" value={analytics.totalBookings} icon={Ticket} color="bg-orange-600" trend="All Time" />
              <StatCard title="Total Revenue" value={'₹' + analytics.totalRevenue.toLocaleString("en-IN")} icon={DollarSign} color="bg-green-600" trend="Estimated" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#111111] p-8 rounded-3xl border border-white/5 shadow-xl">
                <h3 className="text-xl font-bold mb-8">Revenue Analytics (Simulated)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.revenueData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#555", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#555", fontSize: 12 }} dx={-10} tickFormatter={(val) => '₹'+(val/1000)+'k'} />
                      <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", color: "#fff" }} itemStyle={{ color: "#a855f7" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 shadow-xl">
                <h3 className="text-xl font-bold mb-6">Events Breakdown</h3>
                <div className="space-y-6">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                     <span className="text-gray-400 font-bold">Upcoming / Current</span>
                     <span className="text-2xl font-black text-blue-400">{analytics.currentEvents}</span>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                     <span className="text-gray-400 font-bold">Past Events</span>
                     <span className="text-2xl font-black text-purple-400">{analytics.pastEvents}</span>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                     <span className="text-gray-400 font-bold">Featured Events</span>
                     <span className="text-2xl font-black text-orange-400">{analytics.featuredEvents}</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && analytics && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-[#111111] rounded-3xl border border-white/5 shadow-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 font-bold text-gray-400 py-5">Event Title</th>
                    <th className="p-4 font-bold text-gray-400 py-5">Date</th>
                    <th className="p-4 font-bold text-gray-400 py-5">Status</th>
                    <th className="p-4 font-bold text-gray-400 py-5 text-right flex-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.events.map((ev) => {
                    const isPast = new Date(ev.date) < new Date();
                    return (
                      <tr key={ev.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 py-4">
                          <div className="font-bold text-white">{ev.title}</div>
                          <div className="text-xs text-gray-500">{ev.location}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {new Date(ev.date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", isPast ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20")}>
                            {isPast ? "Past" : "Active"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingEvent(ev); setIsModalOpen(true); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20"><Edit size={16}/></button>
                            <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {analytics.events.length === 0 && (
                    <tr><td colSpan="4" className="text-center p-8 text-gray-500">No events found. Create one!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* RATINGS TAB */}
        {activeTab === "ratings" && analytics && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {analytics.past.length === 0 ? (
              <div className="text-gray-500">No past events available for ratings to show.</div>
            ) : (
              analytics.past.map(ev => {
                const ratings = getEventRatings(ev.id);
                const avg = ratings.length ? (ratings.reduce((s,r) => s+r.stars, 0) / ratings.length).toFixed(1) : 0;
                return (
                  <div key={ev.id} className="bg-[#111] p-6 rounded-3xl border border-white/5 shadow-xl mb-6">
                    <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-xl font-bold">{ev.title}</h3>
                        <p className="text-gray-500 text-sm">Event Date: {new Date(ev.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                         <div className="flex items-center gap-1 text-yellow-400 mb-1 justify-end">
                           <Star fill={avg >= 1 ? "currentColor" : "none"} size={16}/>
                           <Star fill={avg >= 2 ? "currentColor" : "none"} size={16}/>
                           <Star fill={avg >= 3 ? "currentColor" : "none"} size={16}/>
                           <Star fill={avg >= 4 ? "currentColor" : "none"} size={16}/>
                           <Star fill={avg >= 5 ? "currentColor" : "none"} size={16}/>
                           <span className="text-white font-bold ml-2">{avg} / 5</span>
                         </div>
                         <div className="text-xs text-gray-500">{ratings.length} Reviews</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {ratings.length === 0 ? (
                        <p className="text-gray-600 text-sm italic">No reviews yet for this event.</p>
                      ) : (
                        ratings.map(r => (
                          <div key={r.id} className="bg-black/50 p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-sm text-gray-300 flex items-center gap-2"><User size={14}/> {r.user}</span>
                              <span className="text-yellow-400 flex text-xs">{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{r.comment}</p>
                            <div className="text-right mt-2"><span className="text-[10px] text-gray-600">{new Date(r.date).toLocaleString()}</span></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </motion.div>
        )}
      </main>

      {/* EVENT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={()=>setIsModalOpen(false)} />
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-[#111] p-8 rounded-3xl w-full max-w-2xl relative border border-white/10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button onClick={()=>setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={24}/></button>
              <h2 className="text-2xl font-black mb-6">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <form onSubmit={handleSaveEvent} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-400 mb-2">Event Title</label>
                    <input value={eventForm.title} onChange={(e) => handleFieldChange("title", e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                    <input value={eventForm.category} onChange={(e) => handleFieldChange("category", e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Date</label>
                    <input type="date" value={eventForm.date} onChange={(e) => handleFieldChange("date", e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" style={{ colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Start Time</label>
                    <input type="time" value={eventForm.time} onChange={(e) => handleFieldChange("time", e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" style={{ colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Organizer</label>
                    <input value={eventForm.organizer} onChange={(e) => handleFieldChange("organizer", e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-400 mb-2">Location/Venue</label>
                    <input value={eventForm.location} onChange={(e) => handleFieldChange("location", e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-400 mb-2">Venue Address / Maps Label</label>
                    <input value={eventForm.venueAddress} onChange={(e) => handleFieldChange("venueAddress", e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Price (₹)</label>
                    <input type="number" value={eventForm.price} onChange={(e) => handleFieldChange("price", e.target.value)} required min="0" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Capacity</label>
                    <input type="number" value={eventForm.capacity} onChange={(e) => handleFieldChange("capacity", e.target.value)} required min="1" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Theme Color (Hex)</label>
                    <input type="color" value={eventForm.color} onChange={(e) => handleFieldChange("color", e.target.value)} className="w-full h-[46px] bg-black border border-white/10 rounded-xl p-1 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Accent Color</label>
                    <input type="color" value={eventForm.accent} onChange={(e) => handleFieldChange("accent", e.target.value)} className="w-full h-[46px] bg-black border border-white/10 rounded-xl p-1 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Badge</label>
                    <input value={eventForm.badge} onChange={(e) => handleFieldChange("badge", e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-400 mb-2">Poster</label>
                    <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                      <div className="space-y-3">
                        <input type="url" value={eventForm.poster} onChange={(e) => handleFieldChange("poster", e.target.value)} placeholder="Paste poster image URL or upload below" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" />
                        <input type="file" accept="image/*" onChange={(e) => handlePosterUpload(e.target.files?.[0])} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white" />
                      </div>
                      <div className="h-40 rounded-2xl overflow-hidden border border-white/10 bg-black/60">
                        {eventForm.poster ? (
                          <img src={eventForm.poster} alt="Poster preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-center text-xs font-bold text-gray-500 px-4">Poster preview</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                     <input type="checkbox" id="featured" checked={eventForm.featured} onChange={(e) => handleFieldChange("featured", e.target.checked)} className="w-5 h-5 accent-purple-500" />
                     <label htmlFor="featured" className="font-bold text-gray-300">Feature this event on homepage</label>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-400 mb-2">Short Description</label>
                    <textarea value={eventForm.shortDescription} onChange={(e) => handleFieldChange("shortDescription", e.target.value)} rows="3" required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-400 mb-2">Full Event Details</label>
                    <textarea value={eventForm.longDescription} onChange={(e) => handleFieldChange("longDescription", e.target.value)} rows="5" required className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"></textarea>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-gray-400">Seat Map Sections</label>
                      <span className="text-xs text-gray-500">These values drive the booking seat map in real time.</span>
                    </div>
                    <div className="space-y-3">
                      {eventForm.seatLayout.sections.map((section, index) => (
                        <div key={section.id} className="grid grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                          <input value={section.label} onChange={(e) => handleSeatSectionChange(index, "label", e.target.value)} className="col-span-4 md:col-span-2 bg-black border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Section label" />
                          <input type="number" min="1" value={section.rows} onChange={(e) => handleSeatSectionChange(index, "rows", e.target.value)} className="bg-black border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Rows" />
                          <input type="number" min="1" value={section.cols} onChange={(e) => handleSeatSectionChange(index, "cols", e.target.value)} className="bg-black border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Cols" />
                          <input type="number" min="0" value={section.priceAdd} onChange={(e) => handleSeatSectionChange(index, "priceAdd", e.target.value)} className="bg-black border border-white/10 rounded-xl p-3 text-white outline-none" placeholder="Upgrade price" />
                          <input type="color" value={section.color} onChange={(e) => handleSeatSectionChange(index, "color", e.target.value)} className="h-[48px] bg-black border border-white/10 rounded-xl p-1 outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                   <button type="button" onClick={()=>setIsModalOpen(false)} disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50">Cancel</button>
                   <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50">
                     {isSaving ? "Saving..." : editingEvent ? 'Save Changes' : 'Create Event'}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
