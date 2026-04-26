import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Calendar,
  MapPin,
  Sparkles,
  TrendingUp,
  Star,
  Music,
  Cpu,
  Utensils,
  Trophy,
  Flame,
  Landmark,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { getStoredEvents, subscribeToEvents } from "../utils/adminStore";
import { loadEvents } from "../utils/eventService";
// ── 3D Hexagonal Prism Cube Component ────────────────────────────────────────
function HexagonalCube({ events, currentFace, onFaceClick }) {
  const radius = 260; // translateZ distance for each face
  const faces = events.slice(0, 6);

  return (
    <div
      style={{
        perspective: "1400px",
        perspectiveOrigin: "50% 50%",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 260,
          height: 340,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(-8deg) rotateY(${currentFace}deg)`,
          transition: "transform 1.1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {faces.map((event, index) => {
          const angle = index * 60;
          const isActive = Math.abs(((currentFace % 360) + 360) % 360 - ((360 - angle) % 360)) < 30;
          return (
            <div
              key={event.id}
              onClick={() => onFaceClick(index)}
              style={{
                position: "absolute",
                width: 260,
                height: 340,
                transformStyle: "preserve-3d",
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
                cursor: "pointer",
                borderRadius: 20,
                overflow: "hidden",
                border: `2px solid ${isActive ? event.color : "rgba(255,255,255,0.12)"}`,
                boxShadow: isActive
                  ? `0 0 40px ${event.color}55, 0 0 80px ${event.color}22, inset 0 0 20px ${event.color}11`
                  : "0 20px 60px rgba(0,0,0,0.6)",
                transition: "border-color 0.5s, box-shadow 0.5s",
              }}
            >
              {/* Poster Image */}
              <img
                src={event.poster}
                alt={event.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)`,
                }}
              />

              {/* Glassmorphism Badge */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.05em",
                }}
              >
                {event.badge}
              </div>

              {/* Bottom Info */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: event.color,
                    marginBottom: 6,
                  }}
                >
                  {event.category}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.3,
                    marginBottom: 8,
                  }}
                >
                  {event.title}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: event.color,
                  }}
                >
                  ₹{event.price.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Floating Particles ────────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
    size: Math.random() > 0.8 ? 2 : 1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/25"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -120, 0], opacity: [0.1, 0.7, 0.1], scale: [1, 1.8, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
}

// ── Event Card (Grid) ─────────────────────────────────────────────────────────
function EventCard({ event, index }) {
  const Icon = event?.icon || Calendar;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative rounded-3xl overflow-hidden cursor-pointer"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl rounded-3xl"
        style={{ background: `radial-gradient(ellipse at center, ${event.color}33, transparent 70%)` }}
      />

      <div
        className="relative rounded-3xl overflow-hidden border border-white/8 group-hover:border-white/20 transition-all duration-500"
        style={{
          background: "linear-gradient(145deg, #161616, #0d0d0d)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Image */}
        <div className="h-56 overflow-hidden relative">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Price badge */}
          <div
            className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${event.color}, ${event.accent})`,
              boxShadow: `0 4px 20px ${event.color}66`,
            }}
          >
            ₹{event.price.toLocaleString("en-IN")}
          </div>

          {/* Category chip */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
            <Icon size={12} style={{ color: event.color }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">
              {event.category}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 space-y-3">
          <h3
            className="text-lg font-black leading-tight line-clamp-2 transition-colors duration-300"
            style={{ color: "#fff" }}
          >
            {event.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{event.description}</p>

          <div className="flex flex-col gap-1.5 text-gray-500 text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={12} style={{ color: event.color }} />
              {new Date(event.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={12} style={{ color: event.color }} />
              {event.location}
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="flex items-center justify-center w-full py-3 rounded-xl font-black text-sm group/btn transition-all duration-300 mt-1"
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
            Book Now
            <ChevronRight size={15} className="ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [currentFace, setCurrentFace] = useState(0);
  const [activeFaceIdx, setActiveFaceIdx] = useState(0);

  useEffect(() => {
    setEvents(getStoredEvents() || []);
    loadEvents().then((nextEvents) => setEvents(nextEvents || []));
    return subscribeToEvents((nextEvents) => setEvents(nextEvents || []));
  }, []);

  // Auto-rotate every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFaceIdx((prev) => {
        const next = (prev + 1) % 6;
        setCurrentFace(-(next * 60));
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleFaceClick = (idx) => {
    setActiveFaceIdx(idx);
    setCurrentFace(-(idx * 60));
  };

  const activeEvent = events.length > 0 ? events[activeFaceIdx % events.length] : null;

  if (!activeEvent) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ background: "#060608" }}>
        Loading experiences...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white overflow-hidden"
      style={{ background: "#060608" }}
    >
      <Navbar />

      {/* ────────────────── HERO ────────────────── */}
      <section className="relative min-h-screen overflow-hidden pt-20">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Ambient Glows */}
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #6d28d944 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #1d4ed833 0%, transparent 70%)" }}
        />

        <FloatingParticles />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

            {/* ── Left: Copy ── */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="z-10 space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md"
                style={{
                  background: "rgba(109,40,217,0.15)",
                  borderColor: "rgba(139,92,246,0.4)",
                }}
              >
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  India's #1 Real-Time Event Platform
                </span>
              </motion.div>

              {/* Headline */}
              <div>
                <h1
                  className="font-black tracking-tighter leading-none mb-5"
                  style={{ fontSize: "clamp(3.5rem,8vw,5.5rem)" }}
                >
                  Discover
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${activeEvent.color}, ${activeEvent.accent}, #818cf8)`,
                      transition: "background-image 0.8s ease",
                    }}
                  >
                    Epic Events
                  </span>
                </h1>
                <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                  Discover India's most extraordinary live experiences — concerts, tech
                  summits, cultural festivals & more. Book instantly, track in real-time,
                  and never miss a moment.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/events"
                  className="group flex items-center justify-center px-8 py-4 rounded-xl font-black transition-all text-white text-base"
                  style={{
                    background: `linear-gradient(135deg, #7c3aed, #2563eb)`,
                    boxShadow: "0 0 40px rgba(124,58,237,0.35)",
                  }}
                >
                  Explore Events
                  <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#featured"
                  className="flex items-center justify-center px-8 py-4 rounded-xl font-bold text-sm text-white/80 hover:text-white transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  View All Events
                </a>
              </div>

              {/* Active Event Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaceIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="p-5 rounded-2xl border backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${activeEvent.color}11, transparent)`,
                    borderColor: `${activeEvent.color}33`,
                  }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: activeEvent.color }}
                  >
                    {activeEvent.badge} · Now Showing
                  </div>
                  <div className="font-black text-lg mb-1">{activeEvent.title}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <MapPin size={12} style={{ color: activeEvent.color }} />
                    {activeEvent.location}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/8">
                {[
                  { label: "Events", value: "500+", icon: Calendar },
                  { label: "Attendees", value: "50K+", icon: Star },
                  { label: "Cities", value: "25+", icon: MapPin },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                  >
                    <div className="flex items-center mb-1">
                      <stat.icon size={14} className="text-purple-400 mr-2" />
                      <div className="text-2xl font-black">{stat.value}</div>
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Right: 3D Hexagonal Prism ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.3, delay: 0.4 }}
              className="relative flex items-center justify-center"
              style={{ height: 520 }}
            >
              {/* Dynamic ambient glow behind cube */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-1000"
                style={{ background: `radial-gradient(ellipse, ${activeEvent.color}, transparent 70%)` }}
              />

              {/* Cube */}
              <div className="relative w-full h-full">
                {events.length >= 6 && (
                  <HexagonalCube
                    events={events}
                    currentFace={currentFace}
                    onFaceClick={handleFaceClick}
                  />
                )}
              </div>

              {/* Navigation Dots */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {events.slice(0, 6).map((event, idx) => (
                  <button
                    key={event.id}
                    onClick={() => handleFaceClick(idx)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: activeFaceIdx === idx ? 28 : 8,
                      height: 8,
                      background: activeFaceIdx === idx ? event.color : "rgba(255,255,255,0.2)",
                      boxShadow: activeFaceIdx === idx ? `0 0 12px ${event.color}` : "none",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-500 z-10"
        >
          <span className="text-[10px] uppercase tracking-widest mb-2">Scroll</span>
          <div className="w-5 h-9 border-2 border-gray-700 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 bg-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ────────────────── FEATURED EVENTS GRID ────────────────── */}
      <section
        id="featured"
        className="py-32 relative"
        style={{ background: "linear-gradient(to bottom, #060608, #040406)" }}
      >
        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-14">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border backdrop-blur-md"
                style={{
                  background: "rgba(109,40,217,0.15)",
                  borderColor: "rgba(139,92,246,0.35)",
                }}
              >
                <TrendingUp size={12} className="text-purple-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/70">
                  Trending Now
                </span>
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-3">
                Featured Events
              </h2>
              <p className="text-gray-500 max-w-md text-base">
                Handpicked premium Indian experiences. Book early to secure your exclusive access.
              </p>
            </div>
            <Link
              to="/events"
              className="hidden md:flex items-center text-purple-400 hover:text-purple-300 transition-colors font-bold text-sm group"
            >
              View All
              <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {events.slice(0, 9).map((event, idx) => (
              <EventCard key={event.id} event={event} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── CTA ────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #1a0533 0%, #060608 50%, #001233 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-md"
              style={{ background: "rgba(109,40,217,0.15)", borderColor: "rgba(139,92,246,0.4)" }}>
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-purple-300">
                Thousands of events await
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              Ready to Experience
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Something Extraordinary?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-14 max-w-xl mx-auto leading-relaxed">
              Join thousands of event enthusiasts discovering India's premium experiences.
              Your next unforgettable moment awaits.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-gray-100 transition-all text-base shadow-[0_0_60px_rgba(255,255,255,0.25)] group"
            >
              Explore All Events
              <ChevronRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer
        className="py-20 border-t"
        style={{ background: "#040406", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3
              className="text-3xl font-black mb-4 tracking-tight"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #67e8f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Ease Events
            </h3>
            <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
              India's real-time event booking platform. Discover, explore, and secure your
              spot at the most exclusive experiences across the nation.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white/50">Navigation</h4>
            <ul className="space-y-3 text-gray-500 text-sm">
              {[
                { label: "Events Directory", href: "/events" },
                { label: "Latest News", href: "/news" },
                { label: "About Us", href: "/about" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white/50">Connect</h4>
            <ul className="space-y-3 text-gray-500 text-sm">
              {["Instagram", "Twitter (X)", "LinkedIn"].map((s) => (
                <li key={s}>
                  <a href="#" className="hover:text-white transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-xs"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <p>© 2026 Ease Events. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
