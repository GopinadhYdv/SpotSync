import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Calendar,
  MapPin,
  ChevronRight,
  Sparkles,
  Music,
  Cpu,
  Utensils,
  Trophy,
  Flame,
  Landmark,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { cn } from "../../utils/cn";
import { getStoredEvents, subscribeToEvents } from "../../utils/adminStore";
import { loadEvents } from "../../utils/eventService";
export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [view, setView] = useState("grid");

  const [events, setEvents] = useState([]);
  
  React.useEffect(() => {
    setEvents(getStoredEvents());
    loadEvents().then((nextEvents) => setEvents(nextEvents || []));
    return subscribeToEvents((nextEvents) => setEvents(nextEvents || []));
  }, []);

  // Filtering Logic
  const filteredEvents = events.filter((event) => {
    const matchSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "" || event.category === category;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(events.map((e) => e.category)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen text-white bg-[#060608]"
    >
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md mb-6 border"
              style={{
                background: "rgba(109,40,217,0.15)",
                borderColor: "rgba(139,92,246,0.4)",
              }}
            >
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-300 bg-clip-text text-transparent">
                Premium Event Collection
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              Events{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Directory
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Discover and explore the most exclusive events across India. From
              cultural festivals to tech summits, find your next unforgettable
              experience right here.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Filters & Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 space-y-6"
        >
          <div className="flex justify-between items-center">
            <p className="text-gray-400 font-medium">
              Showing <span className="text-white font-bold">{filteredEvents.length}</span> events
            </p>
            <div className="flex items-center space-x-2 bg-[#111] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === "list"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#111111] border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500/50 transition-all shadow-lg text-white"
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400"
                size={20}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#111111] border border-white/10 rounded-2xl focus:outline-none focus:border-purple-500/50 appearance-none transition-all shadow-lg text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Events Grid/List */}
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-gray-500"
            >
              No events found matching your criteria. Let's try adjusting your filters!
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              )}
            >
              {filteredEvents.map((event, idx) => {
                const Icon = Calendar; // Used to be event.icon which is un-serializable
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{
                      y: -8,
                      scale: 1.02,
                    }}
                    className={cn(
                      "group relative",
                      view === "grid" ? "" : "flex gap-0"
                    )}
                  >
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"
                      style={{ background: `radial-gradient(ellipse at center, ${event.color}44, transparent 70%)` }}
                    />

                    <div
                      className={cn(
                        "relative bg-[#111111] rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-white/20 transition-all w-full",
                        view === "list" ? "flex flex-col md:flex-row" : "flex flex-col"
                      )}
                    >
                      {/* Image */}
                      <div
                        className={cn(
                          "overflow-hidden relative",
                          view === "grid" ? "h-64" : "h-64 md:h-auto md:w-80 flex-shrink-0"
                        )}
                      >
                        <img
                          src={event.poster}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Price badge */}
                        <div
                          className="absolute top-4 right-4 backdrop-blur-md px-4 py-2 rounded-full text-sm font-black text-white shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${event.color}, ${event.accent})` }}
                        >
                          ₹{event.price.toLocaleString("en-IN")}
                        </div>

                        {/* Category */}
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-white/10">
                          <Icon size={12} style={{ color: event.color }} />
                          <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                            {event.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3
                            className="text-2xl font-bold mb-4 tracking-tight leading-tight transition-colors duration-300"
                            style={{ color: "#fff" }}
                          >
                            {event.title}
                          </h3>
                          <div className="flex flex-col gap-2 text-sm text-gray-400 mb-6">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} style={{ color: event.color }} />
                              {new Date(event.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} style={{ color: event.color }} />
                              {event.location}
                            </div>
                          </div>
                          {view === "list" && (
                            <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="flex items-center justify-between w-full py-4 px-6 rounded-xl transition-all font-black text-sm uppercase tracking-widest mt-4"
                          style={{
                            background: `linear-gradient(135deg, ${event.color}22, ${event.accent}11)`,
                            border: `1px solid ${event.color}44`,
                            color: event.color,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${event.color}, ${event.accent})`;
                            e.currentTarget.style.color = "#000";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${event.color}22, ${event.accent}11)`;
                            e.currentTarget.style.color = event.color;
                          }}
                        >
                          View Details
                          <ChevronRight size={18} className="transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
