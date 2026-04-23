import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from "motion/react";
import Navbar from "../../components/Navbar";

// ── Shimmer QR Code Canvas ─────────────────────────────────────────────────
function QRCodeCanvas({ size = 120, glowColor = "#7c3aed" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cellSize = size / 21;

    // Deterministic QR-like pattern
    const pattern = [
      [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,0,1,1,0,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
      [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0],
      [0,1,1,0,1,0,0,0,1,0,0,1,0,1,0,1,1,0,1,0,1],
      [1,1,0,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,0],
      [0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,0,1,1,0,0,1],
      [1,0,0,0,1,1,1,0,0,1,0,1,0,1,1,1,0,0,0,1,0],
      [0,0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,1,1,0,1],
      [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,0,1,0,1,1],
      [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0,0],
      [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,1,0],
      [1,0,1,1,1,0,1,0,1,0,0,1,1,0,0,1,1,0,0,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,1,1,0,1,1,0,1,0],
      [1,0,0,0,0,0,1,0,1,1,1,0,0,0,1,1,0,0,1,0,1],
      [1,1,1,1,1,1,1,0,0,0,1,1,0,1,0,1,1,1,0,1,1],
    ];

    const draw = (t) => {
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.fillStyle = "rgba(10,6,30,0.95)";
      ctx.fillRect(0, 0, size, size);

      pattern.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell === 1) {
            const x = c * cellSize;
            const y = r * cellSize;
            const shimmer = Math.sin(t * 0.03 + r * 0.5 + c * 0.3) * 0.5 + 0.5;
            const isCorner =
              (r < 7 && c < 7) ||
              (r < 7 && c >= 14) ||
              (r >= 14 && c < 7);

            if (isCorner) {
              ctx.fillStyle = `rgba(168,85,247,${0.85 + shimmer * 0.15})`;
            } else {
              const alpha = 0.6 + shimmer * 0.4;
              ctx.fillStyle = `rgba(${Math.round(120 + shimmer * 80)},${Math.round(80 + shimmer * 60)},${Math.round(220 + shimmer * 35)},${alpha})`;
            }
            ctx.beginPath();
            ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, 1.5);
            ctx.fill();

            // Glint sweep
            const glint = Math.sin(t * 0.04 - c * 0.2) * 0.5 + 0.5;
            if (glint > 0.85) {
              ctx.fillStyle = `rgba(255,255,255,${(glint - 0.85) * 3})`;
              ctx.beginPath();
              ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, 1.5);
              ctx.fill();
            }
          }
        });
      });

      timeRef.current += 1;
      animRef.current = requestAnimationFrame(() => draw(timeRef.current));
    };

    animRef.current = requestAnimationFrame(() => draw(0));
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
      {/* Glow overlay */}
      <div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: 12,
          background: `radial-gradient(ellipse at center, ${glowColor}44 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "qrPulse 2.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ── Animated Geometric Background ─────────────────────────────────────────
function GeometricBackground() {
  const lines = Array.from({ length: 12 }, (_, i) => i);
  const hexagons = Array.from({ length: 7 }, (_, i) => i);
  const orbs = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* SVG Grid Lines */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="gridFade" cx="50%" cy="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
      </svg>

      {/* Floating hexagons */}
      {hexagons.map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${10 + i * 14}%`,
            top: `${15 + (i % 3) * 25}%`,
            width: 40 + i * 8,
            height: 40 + i * 8,
            opacity: 0.06 + i * 0.01,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 60, 0],
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="50,2 94,26 94,74 50,98 6,74 6,26"
              fill="none"
              stroke={i % 2 === 0 ? "#7c3aed" : "#2563eb"}
              strokeWidth="2"
            />
          </svg>
        </motion.div>
      ))}

      {/* Ambient orbs */}
      {orbs.map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 2) * 40}%`,
            width: `${100 + i * 60}px`,
            height: `${100 + i * 60}px`,
            borderRadius: "50%",
            background: i % 2 === 0
              ? "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 1.2,
          }}
        />
      ))}

      {/* Diagonal light beams */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {lines.map((i) => (
          <motion.line
            key={i}
            x1={`${i * 10 - 20}%`}
            y1="0%"
            x2={`${i * 10 + 20}%`}
            y2="100%"
            stroke={`hsl(${260 + i * 10}, 70%, 60%)`}
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Neon Edge Pulse ────────────────────────────────────────────────────────
function NeonEdgePulse({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Top edge */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: -2,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, transparent, #a855f7, #7c3aed, #2563eb, transparent)",
              borderRadius: 2,
              transformOrigin: "left",
              boxShadow: "0 0 12px #7c3aed, 0 0 24px #7c3aed66",
              zIndex: 10,
            }}
          />
          {/* Bottom edge */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            style={{
              position: "absolute",
              bottom: -2,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, transparent, #2563eb, #7c3aed, #a855f7, transparent)",
              borderRadius: 2,
              transformOrigin: "right",
              boxShadow: "0 0 12px #2563eb, 0 0 24px #2563eb66",
              zIndex: 10,
            }}
          />
          {/* Left edge */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
            style={{
              position: "absolute",
              left: -2,
              top: 0,
              bottom: 0,
              width: 3,
              background: "linear-gradient(180deg, transparent, #a855f7, #7c3aed, transparent)",
              borderRadius: 2,
              transformOrigin: "top",
              boxShadow: "0 0 12px #a855f7, 0 0 24px #a855f766",
              zIndex: 10,
            }}
          />
          {/* Right edge */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            style={{
              position: "absolute",
              right: -2,
              top: 0,
              bottom: 0,
              width: 3,
              background: "linear-gradient(180deg, transparent, #2563eb, #7c3aed, transparent)",
              borderRadius: 2,
              transformOrigin: "bottom",
              boxShadow: "0 0 12px #2563eb, 0 0 24px #2563eb66",
              zIndex: 10,
            }}
          />
          {/* Corner sparks */}
          {[
            { top: -6, left: -6 },
            { top: -6, right: -6 },
            { bottom: -6, left: -6 },
            { bottom: -6, right: -6 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, delay: 0.2, repeat: 2, repeatDelay: 1.5 }}
              style={{
                position: "absolute",
                ...pos,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#a855f7",
                boxShadow: "0 0 20px #a855f7, 0 0 40px #7c3aed",
                zIndex: 11,
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

// ── Glassmorphism Info Pill ───────────────────────────────────────────────
function GlassPill({ icon, label, value, color = "#a855f7", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 100 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 50,
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: `0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px ${color}22`,
        whiteSpace: "nowrap",
        cursor: "default",
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{value}</div>
      </div>
    </motion.div>
  );
}

// ── Ticket Perforation ────────────────────────────────────────────────────
function TicketPerforation({ color }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 1, margin: "0" }}>
      {/* Left notch */}
      <div style={{
        position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
        width: 20, height: 20, borderRadius: "0 50% 50% 0",
        background: "#07080f", zIndex: 5,
      }} />
      {/* Right notch */}
      <div style={{
        position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)",
        width: 20, height: 20, borderRadius: "50% 0 0 50%",
        background: "#07080f", zIndex: 5,
      }} />
      {/* Dashed line */}
      <div style={{
        width: "100%", height: 1,
        background: `repeating-linear-gradient(90deg, ${color}44 0px, ${color}44 8px, transparent 8px, transparent 14px)`,
      }} />
    </div>
  );
}

// ── Main Ticket Card ───────────────────────────────────────────────────────
function ETicket({ phase }) {
  const eventData = {
    title: "SYMPHONY OF COSMOS",
    subtitle: "An Immersive Orchestral Experience",
    date: "MAY 24, 2026",
    time: "8:00 PM IST",
    venue: "Jawaharlal Nehru Stadium",
    city: "NEW DELHI",
    seat: "A · ROW 4 · SEAT 12",
    category: "PREMIUM GOLD",
    ticketId: "EASE-2026-0542",
    price: "₹4,500",
    barcode: "EE2026054200012",
  };

  const isVisible = phase >= 2;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, rotateX: 45, opacity: 0, scale: 0.7 }}
          animate={{ y: 0, rotateX: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 15,
            mass: 1,
            duration: 1.2,
          }}
          style={{
            width: 320,
            borderRadius: 24,
            overflow: "visible",
            position: "relative",
            perspective: 800,
            filter: "drop-shadow(0 30px 60px rgba(124,58,237,0.5)) drop-shadow(0 10px 30px rgba(0,0,0,0.8))",
          }}
        >
          {/* ── Upper Ticket Body ── */}
          <motion.div
            style={{
              borderRadius: "24px 24px 0 0",
              overflow: "hidden",
              position: "relative",
              background: "linear-gradient(145deg, #12082a 0%, #0e0620 40%, #0a0818 100%)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderBottom: "none",
            }}
            animate={phase >= 3 ? { boxShadow: ["0 0 20px #7c3aed44", "0 0 50px #7c3aed88", "0 0 20px #7c3aed44"] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {/* Prismatic top bar */}
            <div style={{
              height: 5,
              background: "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899, #3b82f6, #06b6d4, #8b5cf6)",
              backgroundSize: "200% 100%",
              animation: "shimmerBar 3s linear infinite",
            }} />

            {/* Event header area */}
            <div style={{ padding: "22px 24px 18px" }}>
              {/* Category badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 50,
                  background: "rgba(168,85,247,0.15)",
                  border: "1px solid rgba(168,85,247,0.4)",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 8, color: "#a855f7", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  ✦ {eventData.category}
                </span>
              </motion.div>

              {/* Event title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #93c5fd 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {eventData.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}
              >
                {eventData.subtitle}
              </motion.p>
            </div>

            {/* Event details grid */}
            <div style={{ padding: "0 24px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "DATE", value: eventData.date, icon: "📅" },
                { label: "TIME", value: eventData.time, icon: "🕐" },
                { label: "VENUE", value: eventData.venue, icon: "📍" },
                { label: "SEAT", value: eventData.seat, icon: "💺" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  style={{ gridColumn: item.label === "VENUE" || item.label === "SEAT" ? "span 1" : "span 1" }}
                >
                  <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(168,85,247,0.7)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontSize: item.label === "VENUE" ? 10 : 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Price + Status row */}
            <div style={{
              margin: "0 24px 20px",
              padding: "12px 16px",
              borderRadius: 14,
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.25)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>TOTAL</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#a855f7" }}>{eventData.price}</div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 50,
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.4)",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#10b981", letterSpacing: "0.05em" }}>VERIFIED</span>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Perforation ── */}
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg, #10082a, #0c0619)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderTop: "none",
            borderBottom: "none",
            padding: "12px 20px",
          }}>
            <TicketPerforation color="#a855f7" />
          </div>

          {/* ── Lower Ticket Body (QR Zone) ── */}
          <motion.div
            style={{
              borderRadius: "0 0 24px 24px",
              background: "linear-gradient(145deg, #0c0619, #07080f)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderTop: "none",
              padding: "20px 24px 24px",
            }}
          >
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              {/* QR Code */}
              <motion.div
                initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 80 }}
                style={{ flexShrink: 0, position: "relative" }}
              >
                <QRCodeCanvas size={100} glowColor="#7c3aed" />
                <div style={{
                  position: "absolute", inset: 0,
                  pointerEvents: "none", borderRadius: 8,
                  boxShadow: "0 0 20px rgba(124,58,237,0.6), inset 0 0 10px rgba(168,85,247,0.2)",
                }} />
              </motion.div>

              {/* Ticket metadata */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                    TICKET ID
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#c4b5fd", fontFamily: "monospace", letterSpacing: "0.05em", marginBottom: 12 }}>
                    {eventData.ticketId}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                    BARCODE
                  </div>
                  {/* Barcode stripes */}
                  <div style={{ display: "flex", gap: 1.5, alignItems: "flex-end", height: 28, marginBottom: 4 }}>
                    {eventData.barcode.split("").map((char, i) => {
                      const h = 12 + ((char.charCodeAt(0) * 3 + i * 7) % 16);
                      return (
                        <div key={i} style={{
                          width: i % 3 === 0 ? 3 : 1.5,
                          height: h,
                          background: i % 3 === 0 ? "#a855f7" : "rgba(255,255,255,0.5)",
                          borderRadius: 1,
                          alignSelf: "flex-end",
                        }} />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", fontFamily: "monospace" }}>
                    {eventData.barcode}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* EaseEvents branding */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", fontStyle: "italic" }}>
                EaseEvents
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                POWERED BY EASE
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Smartphone Frame ──────────────────────────────────────────────────────
function SmartphoneFrame({ children, phase }) {
  return (
    <div
      style={{
        position: "relative",
        width: 360,
        height: 720,
        borderRadius: 50,
        background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f0f1a 100%)",
        border: "2.5px solid rgba(255,255,255,0.08)",
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.8),
          0 0 80px rgba(124,58,237,0.25),
          0 60px 120px rgba(0,0,0,0.9),
          inset 0 1px 0 rgba(255,255,255,0.12),
          inset 0 -1px 0 rgba(0,0,0,0.5)
        `,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Neon edge pulse */}
      <NeonEdgePulse active={phase >= 1} />

      {/* Phone side buttons */}
      <div style={{ position: "absolute", right: -5, top: 120, width: 5, height: 40, background: "rgba(255,255,255,0.08)", borderRadius: "0 4px 4px 0" }} />
      <div style={{ position: "absolute", left: -5, top: 140, width: 5, height: 30, background: "rgba(255,255,255,0.06)", borderRadius: "4px 0 0 4px" }} />
      <div style={{ position: "absolute", left: -5, top: 180, width: 5, height: 30, background: "rgba(255,255,255,0.06)", borderRadius: "4px 0 0 4px" }} />

      {/* Screen bezel */}
      <div
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: 42,
          overflow: "hidden",
          background: "#07080f",
        }}
      >
        {/* Status bar */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 20,
          background: "linear-gradient(to bottom, rgba(7,8,15,0.9), transparent)",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>9:41</span>
          <div style={{ width: 80, height: 20, borderRadius: 20, background: "#07080f", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>●●●</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>█▌</span>
          </div>
        </div>

        {/* Screen content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg, #07080f 0%, #0a0616 50%, #07080f 100%)",
          }}
        >
          {/* App header */}
          <div style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            padding: "16px 20px 12px",
            zIndex: 5,
          }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 11, fontWeight: 700, color: "rgba(168,85,247,0.8)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}
            >
              ✦ EaseEvents
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35 }}
              style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}
            >
              Your Ticket
            </motion.div>
          </div>

          {/* Ticket container with scroll area */}
          <div
            style={{
              position: "absolute",
              top: 100,
              left: 0,
              right: 0,
              bottom: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 20px",
              overflow: "hidden",
            }}
          >
            {children}
          </div>

          {/* Bottom navigation bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 75,
              background: "rgba(7,8,15,0.95)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "0 10px 15px",
            }}
          >
            {["🏠", "🎭", "🎫", "👤"].map((icon, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: i === 2 ? "rgba(124,58,237,0.2)" : "transparent",
                }}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {i === 2 && (
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#a855f7" }} />
                )}
              </div>
            ))}
          </motion.div>

          {/* Background subtle glow */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
                  pointerEvents: "none",
                  filter: "blur(20px)",
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Home indicator */}
      <div style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: 60,
        height: 4,
        borderRadius: 2,
        background: "rgba(255,255,255,0.4)",
      }} />
    </div>
  );
}

// ── Floating Info Tags ─────────────────────────────────────────────────────
function FloatingInfoTags({ phase }) {
  const tags = [
    { icon: "🎵", label: "EVENT", value: "Symphony of Cosmos", color: "#a855f7", x: -210, y: -60, delay: 1.4 },
    { icon: "📅", label: "DATE", value: "May 24, 2026", color: "#3b82f6", x: 190, y: -30, delay: 1.6 },
    { icon: "💺", label: "SEAT", value: "A · Row 4 · 12", color: "#ec4899", x: -200, y: 80, delay: 1.8 },
    { icon: "✅", label: "STATUS", value: "Confirmed", color: "#10b981", x: 185, y: 100, delay: 2.0 },
  ];

  return (
    <AnimatePresence>
      {phase >= 3 &&
        tags.map((tag) => (
          <motion.div
            key={tag.label}
            initial={{ opacity: 0, scale: 0.5, x: tag.x * 0.3, y: tag.y }}
            animate={{
              opacity: 1,
              scale: 1,
              x: tag.x,
              y: tag.y,
              transition: { delay: tag.delay, type: "spring", stiffness: 80, damping: 14 },
            }}
            style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -60, marginTop: -20, zIndex: 20 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: tag.delay }}
            >
              <GlassPill icon={tag.icon} label={tag.label} value={tag.value} color={tag.color} delay={0} />
            </motion.div>
            {/* Connector line */}
            <svg
              style={{
                position: "absolute",
                top: "50%",
                [tag.x > 0 ? "left" : "right"]: "100%",
                transform: "translateY(-50%)",
                width: 30,
                height: 2,
                overflow: "visible",
              }}
            >
              <motion.line
                x1={tag.x > 0 ? 0 : 30}
                y1={1}
                x2={tag.x > 0 ? 30 : 0}
                y2={1}
                stroke={tag.color}
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeDasharray="4 3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: tag.delay + 0.3, duration: 0.4 }}
              />
            </svg>
          </motion.div>
        ))}
    </AnimatePresence>
  );
}

// ── Particle Burst ─────────────────────────────────────────────────────────
function ParticleBurst({ active }) {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * Math.PI * 2,
    dist: 80 + Math.random() * 120,
    size: 2 + Math.random() * 4,
    color: ["#a855f7", "#7c3aed", "#3b82f6", "#ec4899", "#06b6d4"][i % 5],
  }));

  return (
    <AnimatePresence>
      {active && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30 }}>
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.dist,
                y: Math.sin(p.angle) * p.dist,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.02 }}
              style={{
                position: "absolute",
                left: "50%",
                top: "40%",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TicketDemoPage() {
  const [phase, setPhase] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const scheduleTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const playAnimation = useCallback(() => {
    clearAllTimeouts();
    setPhase(0);
    setBurstActive(false);
    setIsPlaying(true);

    scheduleTimeout(() => setPhase(1), 400);   // neon edge pulse
    scheduleTimeout(() => setPhase(2), 1200);  // ticket slides up
    scheduleTimeout(() => {                     // particle burst + floating tags
      setPhase(3);
      setBurstActive(true);
    }, 2400);
    scheduleTimeout(() => setBurstActive(false), 3800);
    scheduleTimeout(() => setIsPlaying(false), 4000);
  }, []);

  // Auto-play on mount
  useEffect(() => {
    const id = setTimeout(() => playAnimation(), 600);
    return () => {
      clearTimeout(id);
      clearAllTimeouts();
    };
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&family=Inter:wght@400;500;600;700;900&display=swap');

        @keyframes shimmerBar {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes qrPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #04030c 0%, #07080f 40%, #040310 70%, #030408 100%)",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
        }}
      >
        <Navbar />

        <GeometricBackground />

        {/* Page content */}
        <div
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            paddingBottom: 50,
            gap: 60,
          }}
        >
          {/* ── Hero Text ── */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ textAlign: "center", zIndex: 10, position: "relative" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 18px",
                borderRadius: 50,
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(168,85,247,0.35)",
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                ✦ Digital E-Ticket Experience
              </span>
            </motion.div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <span style={{
                background: "linear-gradient(135deg, #fff 0%, #e2d4ff 40%, #93c5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Your Ticket,
              </span>
              <br />
              <span style={{
                background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 40%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Reimagined.
              </span>
            </h1>

            <p style={{
              marginTop: 16,
              fontSize: 15,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 520,
              lineHeight: 1.7,
              letterSpacing: "0.01em",
            }}>
              A cinematic, high-tech digital ticket experience — with live QR generation,
              glassmorphic UI elements, and immersive 3D animations.
            </p>
          </motion.div>

          {/* ── Phone + Floating Tags Stage ── */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 760,
            }}
          >
            {/* Particle burst centered on phone */}
            <ParticleBurst active={burstActive} />

            {/* Ambient glow under phone */}
            <motion.div
              style={{
                position: "absolute",
                bottom: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 400,
                height: 80,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
              animate={{
                opacity: phase >= 2 ? [0.4, 0.9, 0.4] : 0,
                scaleX: [0.8, 1.1, 0.8],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* The Smartphone */}
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.85, rotateX: 20 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 70 }}
              style={{ perspective: 1000 }}
            >
              <SmartphoneFrame phase={phase}>
                <ETicket phase={phase} />
              </SmartphoneFrame>
            </motion.div>

            {/* Floating info tags */}
            <FloatingInfoTags phase={phase} />
          </div>

          {/* ── Replay Button ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ position: "relative", zIndex: 10 }}
          >
            <motion.button
              onClick={playAnimation}
              disabled={isPlaying}
              whileHover={{ scale: isPlaying ? 1 : 1.05 }}
              whileTap={{ scale: isPlaying ? 1 : 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 36px",
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.05em",
                cursor: isPlaying ? "not-allowed" : "pointer",
                border: "1px solid rgba(168,85,247,0.5)",
                background: isPlaying
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3))",
                color: isPlaying ? "rgba(255,255,255,0.3)" : "#d4b4fe",
                backdropFilter: "blur(10px)",
                boxShadow: isPlaying ? "none" : "0 0 30px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
                outline: "none",
              }}
            >
              {isPlaying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: "2px solid rgba(168,85,247,0.5)",
                      borderTopColor: "#a855f7",
                    }}
                  />
                  Animating...
                </>
              ) : (
                <>
                  <span style={{ fontSize: 18 }}>▶</span>
                  Replay Animation
                </>
              )}
            </motion.button>
          </motion.div>

          {/* ── Feature Highlights ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 820,
              position: "relative",
              zIndex: 10,
            }}
          >
            {[
              { icon: "⚡", title: "Neon Edge Pulse", desc: "Dynamic light tracing the device borders" },
              { icon: "🔲", title: "Live QR Shimmer", desc: "Animated QR with shimmering glow effects" },
              { icon: "💎", title: "Glassmorphism UI", desc: "Frosted glass floating info badges" },
              { icon: "🎞️", title: "Cinematic 3D Pop", desc: "Fluid spring-physics ticket reveal" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + i * 0.1 }}
                whileHover={{ y: -4, borderColor: "rgba(168,85,247,0.5)" }}
                style={{
                  padding: "16px 20px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  flex: "1 1 160px",
                  maxWidth: 190,
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{f.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
