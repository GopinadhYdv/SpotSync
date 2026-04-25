import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import {
  X, CreditCard, Smartphone, CheckCircle2,
  Loader2, Calendar, MapPin, Download, Share2, ChevronRight, Info,
} from "lucide-react";
import { getProfile, saveTicket } from "../utils/accountStore";
import SeatMap from "./SeatMap";
import useRazorpay from "../utils/useRazorpay";

// ─────────────────────────────────────────────────────────────────────────────
// CSS KEYFRAMES  (injected once)
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&display=swap');

  @keyframes carpetFloat {
    0%,100% { transform: rotateX(4deg) rotateY(-1deg) translateY(0px); }
    33%      { transform: rotateX(-2deg) rotateY(1.5deg) translateY(-10px); }
    66%      { transform: rotateX(3deg) rotateY(-2deg) translateY(-5px); }
  }
  @keyframes carpetShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fringeWave {
    0%,100% { transform: scaleY(1) skewX(0deg); }
    25%     { transform: scaleY(0.85) skewX(3deg); }
    75%     { transform: scaleY(0.9) skewX(-2deg); }
  }
  @keyframes qrGlow {
    0%,100% { opacity:.45; transform:scale(1); }
    50%     { opacity:1;   transform:scale(1.07); }
  }
  @keyframes prismBar {
    0%   { background-position: 0% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes dustRise {
    0%   { opacity:0; transform:translateY(0) scale(0.6); }
    40%  { opacity:1; }
    100% { opacity:0; transform:translateY(-80px) scale(1.4); }
  }
  @keyframes scrollUnroll {
    0%   { clip-path: inset(0 0 100% 0); opacity:0; }
    15%  { opacity:1; }
    100% { clip-path: inset(0 0 0% 0); }
  }
  @keyframes threadShimmer {
    0%,100% { opacity:.3; }
    50%     { opacity:.9; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// QR CANVAS — animated shimmer
// ─────────────────────────────────────────────────────────────────────────────
const QR_PATTERN = [
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

function QRCodeCanvas({ size = 100, accentColor = "#7c3aed" }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tick      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const cell = size / 21;
    const loop = () => {
      const t = tick.current;
      ctx.fillStyle = "rgba(8,4,24,0.97)";
      ctx.fillRect(0, 0, size, size);
      QR_PATTERN.forEach((row, r) =>
        row.forEach((v, c) => {
          if (!v) return;
          const wave  = Math.sin(t * 0.03 + r * 0.5 + c * 0.3) * 0.5 + 0.5;
          const glint = Math.sin(t * 0.04 - c * 0.2) * 0.5 + 0.5;
          const isCor = (r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7);
          ctx.fillStyle = isCor
            ? `rgba(168,85,247,${0.85 + wave * 0.15})`
            : `rgba(${~~(120+wave*80)},${~~(80+wave*60)},${~~(220+wave*35)},${0.6+wave*0.4})`;
          ctx.beginPath();
          ctx.roundRect(c*cell+.5, r*cell+.5, cell-1, cell-1, 1.5);
          ctx.fill();
          if (glint > 0.85) {
            ctx.fillStyle = `rgba(255,255,255,${(glint-.85)*3})`;
            ctx.beginPath();
            ctx.roundRect(c*cell+.5, r*cell+.5, cell-1, cell-1, 1.5);
            ctx.fill();
          }
        })
      );
      tick.current++;
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <div style={{ position:"relative", width:size, height:size, borderRadius:8, overflow:"hidden" }}>
      <canvas ref={canvasRef} width={size} height={size} style={{ display:"block" }} />
      <div style={{
        position:"absolute", inset:-4, borderRadius:12, pointerEvents:"none",
        background:`radial-gradient(ellipse, ${accentColor}55 0%, transparent 70%)`,
        animation:"qrGlow 2.5s ease-in-out infinite",
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARPET FRINGE — decorative strip with individual tassels
// ─────────────────────────────────────────────────────────────────────────────
function CarpetFringe({ color, position = "top", width = 300 }) {
  const count = Math.floor(width / 8);
  const isTop = position === "top";
  return (
    <div style={{
      display:"flex", alignItems: isTop ? "flex-end" : "flex-start",
      justifyContent:"center", width:"100%", overflow:"hidden",
      height:18, flexShrink:0,
      background: isTop
        ? `linear-gradient(to bottom, ${color}22, transparent)`
        : `linear-gradient(to top, ${color}22, transparent)`,
    }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          width:5, flex:"0 0 5px", marginRight:2,
          height: 10 + Math.sin(i * 0.8) * 4,
          background:`linear-gradient(${isTop?"to bottom":"to top"}, ${color}, ${color}44)`,
          borderRadius: isTop ? "0 0 3px 3px" : "3px 3px 0 0",
          opacity: 0.7 + Math.sin(i * 1.2) * 0.3,
          animation:`fringeWave ${1.8 + (i%3)*0.4}s ease-in-out infinite`,
          animationDelay:`${i * 0.06}s`,
          transformOrigin: isTop ? "top center" : "bottom center",
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARPET BORDER — ornamental woven frame
// ─────────────────────────────────────────────────────────────────────────────
function CarpetBorder({ color }) {
  return (
    <>
      {/* outer frame lines */}
      {[2, 6, 10].map((w, i) => (
        <div key={i} style={{
          position:"absolute", inset: i*4,
          border:`${i===1?2:1}px solid ${color}${i===1?"66":"33"}`,
          borderRadius: 22-(i*4),
          pointerEvents:"none",
          boxShadow: i===1 ? `inset 0 0 12px ${color}11` : "none",
        }}/>
      ))}
      {/* corner ornaments */}
      {[[6,6],[6,"auto"],[" auto",6],["auto","auto"]].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          top:i<2?8:undefined, bottom:i>=2?8:undefined,
          left:i%2===0?8:undefined, right:i%2===1?8:undefined,
          width:14, height:14, borderRadius:"50%",
          background:`radial-gradient(circle, ${color}88, ${color}22)`,
          boxShadow:`0 0 8px ${color}66`,
          animation:`threadShimmer ${2+i*0.3}s ease-in-out infinite`,
          animationDelay:`${i*0.4}s`,
        }}/>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DUST PARTICLES — rise as carpet unrolls
// ─────────────────────────────────────────────────────────────────────────────
function DustParticles({ color, active }) {
  const dust = Array.from({ length: 20 }, (_, i) => ({
    x: 10 + Math.random() * 280,
    delay: Math.random() * 0.8,
    dur: 1.2 + Math.random() * 1,
    size: 2 + Math.random() * 3,
    col: [color, "#a855f7", "#c4b5fd", "#93c5fd"][i % 4],
  }));
  return (
    <AnimatePresence>
      {active && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:20, overflow:"hidden", borderRadius:"inherit" }}>
          {dust.map((d, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:0, x:d.x, scale:0.5 }}
              animate={{ opacity:[0,0.9,0], y:-70, scale:1.5 }}
              transition={{ duration:d.dur, delay:d.delay, ease:"easeOut" }}
              style={{
                position:"absolute", bottom:0,
                width:d.size, height:d.size,
                borderRadius:"50%", background:d.col,
                boxShadow:`0 0 4px ${d.col}`,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGIC CARPET TICKET — the main animated ticket reveal
// ─────────────────────────────────────────────────────────────────────────────
function MagicCarpetTicket({ event, name, ticketCount, ticketId, ticketRef }) {
  const [unrolled, setUnrolled] = useState(false);
  const [dustActive, setDustActive] = useState(false);
  const accentColor = event?.color || "#7c3aed";
  const barcode = ticketId || "EE0000000000";

  useEffect(() => {
    // start dust first, then unroll
    const t1 = setTimeout(() => setDustActive(true), 100);
    const t2 = setTimeout(() => setUnrolled(true), 300);
    const t3 = setTimeout(() => setDustActive(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{ position:"relative" }}>
      {/* dust sparks */}
      <DustParticles color={accentColor} active={dustActive} />

      {/* ── THE CARPET WRAPPER ─────────────────────────── */}
      <motion.div
        initial={{
          scaleY: 0.015,
          rotateX: 88,
          y: -180,
          opacity: 0,
          transformOrigin: "top center",
        }}
        animate={unrolled ? {
          scaleY: 1,
          rotateX: 0,
          y: 0,
          opacity: 1,
          transformOrigin: "top center",
        } : {}}
        transition={{
          type: "spring",
          stiffness: 38,
          damping: 12,
          mass: 1.2,
          opacity: { duration: 0.25 },
        }}
        style={{
          width: 310,
          perspective: 1200,
          transformStyle: "preserve-3d",
        }}
      >
        {/* floating hover after unroll */}
        <motion.div
          animate={unrolled ? { animation: "carpetFloat 6s ease-in-out infinite" } : {}}
          transition={{ delay: 1.2 }}
          style={{
            position:"relative",
            borderRadius: 22,
            // Carpet background — rich midnight weave
            background: `
              linear-gradient(145deg, #12082e 0%, #0e0520 45%, #090618 100%)
            `,
            boxShadow: `
              0 0 0 1px ${accentColor}33,
              0 30px 70px rgba(0,0,0,0.85),
              0 0 60px ${accentColor}33,
              inset 0 1px 0 rgba(255,255,255,0.08)
            `,
            animation: unrolled ? "carpetFloat 6s ease-in-out 1.4s infinite" : "none",
          }}
        >
          {/* Ornamental border */}
          <CarpetBorder color={accentColor} />

          {/* Prism top bar */}
          <div style={{
            height: 5, borderRadius:"22px 22px 0 0",
            background:"linear-gradient(90deg,#7c3aed,#a855f7,#ec4899,#3b82f6,#06b6d4,#8b5cf6)",
            backgroundSize:"200% 100%", animation:"prismBar 3s linear infinite",
          }}/>

          {/* Top fringe */}
          <CarpetFringe color={accentColor} position="top" width={310} />

          {/* ── CARPET TEXTURE OVERLAY (woven pattern) ── */}
          <div style={{
            position:"absolute", inset:0, borderRadius:"inherit", pointerEvents:"none",
            backgroundImage:`
              repeating-linear-gradient(45deg, ${accentColor}08 0px, ${accentColor}08 1px, transparent 1px, transparent 8px),
              repeating-linear-gradient(-45deg, ${accentColor}06 0px, ${accentColor}06 1px, transparent 1px, transparent 8px)
            `,
          }}/>

          {/* ── UNROLL REVEAL CONTENT ── */}
          <motion.div
            initial={{ clipPath:"inset(0 0 100% 0)", opacity:0 }}
            animate={unrolled ? { clipPath:"inset(0 0 0% 0)", opacity:1 } : {}}
            transition={{ duration: 1.1, delay: 0.15, ease:[0.22,1,0.36,1] }}
          >
            {/* Event poster strip */}
            <div style={{ height:90, position:"relative", overflow:"hidden" }}>
              <img src={event?.poster} alt={event?.title}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
              <div style={{
                position:"absolute", inset:0,
                background:"linear-gradient(to top, rgba(12,4,30,0.97) 0%, rgba(12,4,30,0.35) 60%, transparent 100%)",
              }}/>
              {/* E-TICKET badge */}
              <div style={{
                position:"absolute", top:10, left:14,
                display:"inline-flex", alignItems:"center", gap:5,
                padding:"3px 10px", borderRadius:50,
                background:"rgba(168,85,247,0.2)", border:"1px solid rgba(168,85,247,0.5)",
              }}>
                <span style={{ fontSize:8, color:"#c4b5fd", fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase" }}>✦ E-TICKET</span>
              </div>
              {/* Shimmer sweep overlay */}
              <div style={{
                position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none",
                background:`linear-gradient(105deg, transparent 25%, ${accentColor}22 50%, transparent 75%)`,
                backgroundSize:"200% 100%", animation:"carpetShimmer 3s linear 1.5s infinite",
              }}/>
            </div>

            {/* Title */}
            <div style={{ padding:"14px 18px 8px" }}>
              <h3 style={{
                margin:0, fontSize:18, fontWeight:900, letterSpacing:"-0.02em", lineHeight:1.2,
                background:"linear-gradient(135deg,#fff 0%,#c4b5fd 55%,#93c5fd 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                fontFamily:"'Outfit',sans-serif",
              }}>
                {event?.title}
              </h3>
            </div>

            {/* Details grid */}
            <div style={{ padding:"0 18px 12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { label:"DATE",     value: new Date(event?.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}), icon:"📅" },
                { label:"TIME",     value:"06:00 PM IST", icon:"🕐" },
                { label:"ATTENDEE", value: name||"Guest", icon:"👤" },
                { label:"TICKETS",  value:`${ticketCount} × Standard`, icon:"🎫" },
              ].map((item, i) => (
                <motion.div key={item.label}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div style={{ fontSize:7, fontWeight:800, color:`${accentColor}bb`, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:2 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#fff", lineHeight:1.3 }}>{item.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Venue */}
            <div style={{ margin:"0 18px 10px", padding:"10px 14px", borderRadius:12, background:`${accentColor}14`, border:`1px solid ${accentColor}28` }}>
              <div style={{ fontSize:7, fontWeight:800, color:`${accentColor}bb`, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:2 }}>📍 VENUE</div>
              <div style={{ fontSize:11, fontWeight:700, color:"#fff" }}>{event?.location}</div>
            </div>

            {/* Price + status */}
            <div style={{
              margin:"0 18px 14px", padding:"10px 14px", borderRadius:12,
              background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.28)",
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div>
                <div style={{ fontSize:7, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:1 }}>TOTAL PAID</div>
                <div style={{ fontSize:18, fontWeight:900, color:accentColor }}>
                  ₹{(event?.price * ticketCount * 1.18).toLocaleString("en-IN",{maximumFractionDigits:0})}
                </div>
              </div>
              <motion.div
                animate={{ scale:[1,1.07,1], opacity:[0.8,1,0.8] }}
                transition={{ duration:2, repeat:Infinity }}
                style={{
                  display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:50,
                  background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.4)",
                }}
              >
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 8px #10b981" }}/>
                <span style={{ fontSize:9, fontWeight:800, color:"#10b981", letterSpacing:"0.05em" }}>CONFIRMED</span>
              </motion.div>
            </div>

            {/* Perforation line */}
            <div style={{ position:"relative", padding:"10px 16px", background:"rgba(0,0,0,0.2)" }}>
              <div style={{ position:"absolute", left:-13, top:"50%", transform:"translateY(-50%)", width:13, height:13, borderRadius:"0 50% 50% 0", background:"#050510" }}/>
              <div style={{ position:"absolute", right:-13, top:"50%", transform:"translateY(-50%)", width:13, height:13, borderRadius:"50% 0 0 50%", background:"#050510" }}/>
              <div style={{ width:"100%", height:1, background:`repeating-linear-gradient(90deg,${accentColor}55 0px,${accentColor}55 6px,transparent 6px,transparent 12px)` }}/>
            </div>

            {/* QR zone */}
            <div ref={ticketRef} style={{ padding:"14px 18px 16px" }}>
              <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                <motion.div
                  initial={{ opacity:0, scale:0.3, rotate:-20 }}
                  animate={{ opacity:1, scale:1, rotate:0 }}
                  transition={{ delay:0.9, type:"spring", stiffness:80 }}
                  style={{ flexShrink:0, position:"relative" }}
                >
                  <QRCodeCanvas size={88} accentColor={accentColor}/>
                  <div style={{
                    position:"absolute", inset:0, pointerEvents:"none", borderRadius:8,
                    boxShadow:`0 0 18px ${accentColor}66, inset 0 0 8px ${accentColor}22`,
                  }}/>
                </motion.div>

                <motion.div
                  initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.05 }}
                  style={{ flex:1, minWidth:0 }}
                >
                  <div style={{ fontSize:7, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>TICKET ID</div>
                  <div style={{ fontSize:12, fontWeight:900, color:"#c4b5fd", fontFamily:"monospace", letterSpacing:"0.04em", marginBottom:8 }}>{ticketId}</div>
                  {/* Barcode */}
                  <div style={{ display:"flex", gap:1, alignItems:"flex-end", height:22, marginBottom:3 }}>
                    {barcode.split("").map((ch,i)=>(
                      <div key={i} style={{
                        width:i%3===0?2.5:1.2,
                        height:9+((ch.charCodeAt(0)*3+i*7)%13),
                        background:i%3===0?accentColor:"rgba(255,255,255,0.45)",
                        borderRadius:1, alignSelf:"flex-end",
                      }}/>
                    ))}
                  </div>
                  <div style={{ fontSize:7, color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>{barcode}</div>
                </motion.div>
              </div>

              {/* Branding */}
              <div style={{
                marginTop:12, paddingTop:10,
                borderTop:"1px solid rgba(255,255,255,0.06)",
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:10, fontWeight:900, color:"rgba(255,255,255,0.25)", fontStyle:"italic" }}>Ease Events</span>
                <span style={{ fontSize:7, color:"rgba(255,255,255,0.15)", letterSpacing:"0.08em" }}>SCAN AT ENTRY</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom fringe */}
          <CarpetFringe color={accentColor} position="bottom" width={310} />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRIC BG — subtle moving grid inside success screen
// ─────────────────────────────────────────────────────────────────────────────
function GeoBg({ color }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", borderRadius:"inherit" }}>
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06 }}>
        <defs>
          <pattern id="geogrid" width="55" height="55" patternUnits="userSpaceOnUse">
            <path d="M 55 0 L 0 0 0 55" fill="none" stroke={color} strokeWidth="0.6"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geogrid)"/>
      </svg>
      {[0,1,2].map(i=>(
        <motion.div key={i}
          style={{
            position:"absolute",
            left:`${15+i*32}%`, top:`${8+i*22}%`,
            width:50+i*28, height:50+i*28, opacity:0.07,
          }}
          animate={{ y:[0,-20,0], rotate:[0,60,0], opacity:[0.04,0.12,0.04] }}
          transition={{ duration:9+i*2, repeat:Infinity, delay:i*1.3, ease:"easeInOut" }}
        >
          <svg viewBox="0 0 100 100"><polygon points="50,2 94,26 94,74 50,98 6,74 6,26" fill="none" stroke={color} strokeWidth="2"/></svg>
        </motion.div>
      ))}
      <motion.div style={{
        position:"absolute", top:"15%", right:"-8%",
        width:320, height:320, borderRadius:"50%",
        background:`radial-gradient(ellipse,${color}15 0%,transparent 70%)`,
        filter:"blur(40px)",
      }}
        animate={{ scale:[1,1.3,1], opacity:[0.5,1,0.5] }}
        transition={{ duration:5, repeat:Infinity }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEON EDGE PULSE — flashes along the screen border on entry
// ─────────────────────────────────────────────────────────────────────────────
function NeonEdgePulse({ color }) {
  return (
    <>
      {[
        { style:{ top:-2,left:0,right:0,height:3 }, bg:`linear-gradient(90deg,transparent,${color},#2563eb,transparent)`, delay:0 },
        { style:{ bottom:-2,left:0,right:0,height:3 }, bg:`linear-gradient(90deg,transparent,#2563eb,${color},transparent)`, delay:.1 },
        { style:{ left:-2,top:0,bottom:0,width:3 }, bg:`linear-gradient(180deg,transparent,${color},transparent)`, delay:.05 },
        { style:{ right:-2,top:0,bottom:0,width:3 }, bg:`linear-gradient(180deg,transparent,#2563eb,transparent)`, delay:.15 },
      ].map((e,i)=>(
        <motion.div key={i}
          initial={{ scale:0, opacity:0 }}
          animate={{ scale:1, opacity:[0,1,0.7] }}
          transition={{ duration:0.9, delay:e.delay, ease:"easeOut" }}
          style={{
            position:"absolute", ...e.style,
            background:e.bg, borderRadius:3,
            boxShadow:`0 0 16px ${color},0 0 30px ${color}66`, zIndex:60,
          }}
        />
      ))}
      {/* corner sparks */}
      {[{top:-5,left:-5},{top:-5,right:-5},{bottom:-5,left:-5},{bottom:-5,right:-5}].map((p,i)=>(
        <motion.div key={i}
          initial={{ scale:0, opacity:0 }}
          animate={{ scale:[0,2.5,0], opacity:[0,1,0] }}
          transition={{ duration:0.7, delay:0.25+i*0.05, repeat:1, repeatDelay:2 }}
          style={{
            position:"absolute",...p, width:12, height:12, borderRadius:"50%",
            background:color, boxShadow:`0 0 20px ${color},0 0 40px ${color}88`, zIndex:61,
          }}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLASSMORPHISM FLOATING PILLS
// ─────────────────────────────────────────────────────────────────────────────
function GlassPill({ icon, label, value, color, delay, floatDur = 3 }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.5, y:20 }}
      animate={{ opacity:1, scale:1, y:0 }}
      transition={{ delay, type:"spring", stiffness:90, damping:14 }}
    >
      <motion.div
        animate={{ y:[0,-8,0] }}
        transition={{ duration:floatDur, repeat:Infinity, ease:"easeInOut", delay }}
        style={{
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"8px 14px", borderRadius:50,
          background:"rgba(255,255,255,0.07)", backdropFilter:"blur(16px)",
          border:"1px solid rgba(255,255,255,0.14)",
          boxShadow:`0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.1),0 0 16px ${color}22`,
          whiteSpace:"nowrap",
        }}
      >
        <span style={{ fontSize:14 }}>{icon}</span>
        <div>
          <div style={{ fontSize:8, fontWeight:800, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
          <div style={{ fontSize:12, fontWeight:800, color:"#fff" }}>{value}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC SUCCESS FULL-SCREEN — magic carpet reveal
// ─────────────────────────────────────────────────────────────────────────────
function CinematicSuccess({ event, name, ticketCount, ticketId, onClose, onDownload, onShare, ticketRef }) {
  const [phase, setPhase] = useState(0);
  const color = event?.color || "#7c3aed";

  useEffect(() => {
    const t1 = setTimeout(()=>setPhase(1), 150);   // edge pulse
    const t2 = setTimeout(()=>setPhase(2), 600);   // carpet unrolls
    const t3 = setTimeout(()=>setPhase(3), 2000);  // floating pills appear
    return ()=>{ clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }}
        style={{
          position:"fixed", inset:0, zIndex:55, overflow:"hidden",
          background:"linear-gradient(135deg,#04030c 0%,#07080f 45%,#040312 80%,#030408 100%)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        }}
      >
        {/* neon edge flash */}
        {phase >= 1 && <NeonEdgePulse color={color}/>}

        {/* geo bg */}
        <GeoBg color={color}/>

        {/* header */}
        <motion.div
          initial={{ opacity:0, y:-28 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.3, duration:0.7 }}
          style={{ textAlign:"center", marginBottom:24, zIndex:10, position:"relative" }}
        >
          <motion.div
            animate={{ scale:[1,1.15,1] }} transition={{ delay:2, duration:0.4 }}
            style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:50, height:50, borderRadius:"50%", marginBottom:10,
              background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.4)",
              boxShadow:"0 0 28px rgba(16,185,129,0.3)",
            }}
          >
            <CheckCircle2 size={26} color="#10b981"/>
          </motion.div>
          <h2 style={{
            margin:0, fontSize:26, fontWeight:900, letterSpacing:"-0.02em",
            background:"linear-gradient(135deg,#fff 0%,#c4b5fd 60%,#93c5fd 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            fontFamily:"'Outfit',sans-serif",
          }}>
            Booking Confirmed!
          </h2>
          <p style={{ margin:"6px 0 0", fontSize:13, color:"rgba(255,255,255,0.4)" }}>
            ✨ Your magic ticket is unrolling…
          </p>
        </motion.div>

        {/* ── CARPET + PILLS ── */}
        <div style={{ position:"relative", zIndex:10 }}>
          {/* ambient glow */}
          <motion.div
            style={{
              position:"absolute", bottom:-30, left:"50%", transform:"translateX(-50%)",
              width:350, height:50, borderRadius:"50%",
              background:`radial-gradient(ellipse,${color}44 0%,transparent 70%)`,
              filter:"blur(18px)", pointerEvents:"none",
            }}
            animate={phase>=2?{ opacity:[0.3,0.9,0.3], scaleX:[0.8,1.1,0.8] }:{ opacity:0 }}
            transition={{ duration:3, repeat:Infinity }}
          />

          {phase >= 2 && (
            <MagicCarpetTicket
              event={event} name={name}
              ticketCount={ticketCount} ticketId={ticketId}
              ticketRef={ticketRef}
            />
          )}

          {/* floating pills */}
          <AnimatePresence>
            {phase >= 3 && (
              <>
                <div style={{ position:"absolute", top:"10%", right:"-145px" }}>
                  <GlassPill icon="📅" label="Date" value={new Date(event?.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})} color={color} delay={0.1} floatDur={3.2}/>
                </div>
                <div style={{ position:"absolute", top:"42%", left:"-160px" }}>
                  <GlassPill icon="📍" label="Venue" value={event?.location?.split(",")[0]||"Venue"} color="#3b82f6" delay={0.2} floatDur={2.9}/>
                </div>
                <div style={{ position:"absolute", bottom:"22%", right:"-150px" }}>
                  <GlassPill icon="✅" label="Status" value="Verified" color="#10b981" delay={0.3} floatDur={3.5}/>
                </div>
                <div style={{ position:"absolute", bottom:"6%", left:"-140px" }}>
                  <GlassPill icon="🎫" label="Qty" value={`${ticketCount} Ticket${ticketCount>1?"s":""}`} color="#ec4899" delay={0.15} floatDur={4}/>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* action buttons */}
        <motion.div
          initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:1.6 }}
          style={{ marginTop:26, display:"flex", gap:12, zIndex:10, position:"relative" }}
        >
          <motion.button onClick={onDownload} whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
            style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"13px 28px", borderRadius:50,
              background:`linear-gradient(135deg,${color},#3b82f6)`,
              border:"none", color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer",
              boxShadow:`0 0 28px ${color}55,inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            <Download size={16}/> Download Ticket
          </motion.button>
          <motion.button onClick={onShare} whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
            style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"13px 24px", borderRadius:50,
              background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", backdropFilter:"blur(10px)",
            }}
          >
            <Share2 size={16}/> Share
          </motion.button>
          <motion.button onClick={onClose} whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
            style={{
              padding:"13px 24px", borderRadius:50,
              background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
              color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:700,
              cursor:"pointer", backdropFilter:"blur(10px)",
            }}
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAYMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────
// ── UPI App card ─────────────────────────────────────────────────────────────
function UpiAppCard({ app, finalAmount, accentColor }) {
  const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
  const handleClick = () => {
    if (isMobile) {
      window.location.href = app.link;
    } else {
      alert(`Open ${app.name} on your mobile and pay ₹${finalAmount.toLocaleString("en-IN")} to spotsync@upi`);
    }
  };
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px", borderRadius: 14,
        background: app.bg, border: `1px solid ${app.border}`,
        cursor: "pointer", width: "100%", textAlign: "left",
        transition: "box-shadow 0.2s",
        boxShadow: `0 0 0px ${app.color}00`,
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 20px ${app.color}33`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 0px ${app.color}00`}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: `linear-gradient(135deg, ${app.color}, ${app.color}88)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.05em",
        boxShadow: `0 4px 14px ${app.color}55`,
      }}>
        {app.logo}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{app.name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {isMobile ? "Tap to open app" : "Open on mobile to pay"}
        </div>
      </div>
      <ChevronRight size={16} color={app.color} />
    </motion.button>
  );
}

export default function PaymentModal({ isOpen, onClose, event }) {
  const [step, setStep]                 = useState(1); // 1=info 2=seats 3=payment 4=success
  const [ticketCount, setTicketCount]   = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketId, setTicketId]         = useState("");
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatUpgradeCost, setSeatUpgradeCost] = useState(0);
  const { processPayment } = useRazorpay();
  const ticketRef = useRef(null);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await toPng(ticketRef.current,{ cacheBust:true, style:{ margin:0 } });
      const a = document.createElement("a");
      a.download = `${ticketId}.png`; a.href = dataUrl; a.click();
    } catch(e){ console.error(e); }
  };

  const shareTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await toPng(ticketRef.current,{ cacheBust:true, style:{ margin:0 } });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${ticketId}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My Ticket to ${event.title}`,
          text: `I'm going to ${event.title}! Here's my ticket.`,
          files: [file]
        });
      } else {
        alert("Your browser does not support native file sharing. Please use the Download option.");
      }
    } catch(e) { console.error("Error sharing", e); }
  };

  useEffect(()=>{
    if(isOpen){
      setStep(1); setTicketCount(1); setIsProcessing(false);
      setTicketId(""); setSelectedSeats([]); setSeatUpgradeCost(0);
      const profile = getProfile();
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  },[isOpen]);

  if(!isOpen||!event) return null;

  const baseAmount  = event.price * ticketCount;
  const totalAmount = baseAmount + seatUpgradeCost;
  const taxes       = totalAmount * 0.18;
  const finalAmount = totalAmount + taxes;

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    processPayment({
      amount: finalAmount,
      eventTitle: event.title,
      userName: name,
      userEmail: email,
      onSuccess: (response) => {
        const id = Math.random().toString(36).substring(2,10).toUpperCase();
        const tid = `STK-${id}`;
        setTicketId(tid);
        
        // Save ticket to account store
        saveTicket({
          ticketId: tid,
          razorpay_payment_id: response.razorpay_payment_id,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          eventPoster: event.poster,
          count: ticketCount,
          seats: selectedSeats,
          totalPaid: finalAmount,
          bookedAt: new Date().toISOString(),
        });
        
        setIsProcessing(false);
        setStep(4);
      },
      onFailure: () => {
        setIsProcessing(false);
      }
    });
  };

  const payDisabled = isProcessing;

  // ── STEP 4: Full cinematic magic carpet screen ────────────
  if(step === 4){
    return(
      <AnimatePresence>
        <CinematicSuccess
          event={event} name={name}
          ticketCount={ticketCount} ticketId={ticketId}
          onClose={onClose} onDownload={downloadTicket} onShare={shareTicket}
          ticketRef={ticketRef}
        />
      </AnimatePresence>
    );
  }

  // ── STEPS 1, 2 & 3 ──────────────────────────────────────────
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>

        <motion.div
          initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.95,y:20}}
          className="relative bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row w-full max-w-3xl"
          style={{ boxShadow:`0 0 50px ${event.color}22` }}
        >
          {/* Left panel */}
          <div className="md:w-1/3 p-6 bg-white/5 border-r border-white/5 flex-col hidden md:flex relative">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{background:event.color}}/>
            <div className="rounded-xl overflow-hidden mb-6 h-40 border border-white/10 shadow-lg shrink-0">
              <img src={event.poster} alt={event.title} className="w-full h-full object-cover"/>
            </div>
            <div className="flex-1 flex flex-col">
              <h4 className="font-bold text-lg mb-2 text-white leading-tight">{event.title}</h4>
              <div className="text-gray-400 text-xs mb-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} style={{color:event.color}}/>
                  {new Date(event.date).toLocaleDateString("en-IN",{day:"numeric",month:"long"})}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} style={{color:event.color}}/>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              <div className="mt-auto border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{ticketCount} x ₹{event.price}</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Taxes (18% GST)</span>
                  <span>₹{taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-black text-lg pt-2 mt-2 border-t border-white/10" style={{color:event.color}}>
                  <span>Total</span><span>₹{finalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 p-6 md:p-8 relative min-h-[500px]">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all z-10">
              <X size={18}/>
            </button>

            {/* Step 1 */}
            {step===1 && (
              <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="h-full flex flex-col">
                <h3 className="text-2xl font-black mb-6">Book Tickets</h3>
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Number of Tickets</label>
                    <div className="flex items-center gap-4">
                      <button onClick={()=>setTicketCount(Math.max(1,ticketCount-1))} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">-</button>
                      <span className="text-2xl font-black w-8 text-center">{ticketCount}</span>
                      <button onClick={()=>setTicketCount(ticketCount+1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                    <input type="text" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" placeholder="Jane Doe" value={name} onChange={e=>setName(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
                    <input type="email" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white" placeholder="jane@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
                  </div>
                </div>
                <div className="mt-8 pt-4">
                  <button onClick={()=>setStep(2)} disabled={!name||!email}
                    className="w-full py-4 rounded-xl font-black text-black transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform hover:scale-[1.02]"
                    style={{background:`linear-gradient(135deg,${event.color},${event.accent})`}}>
                    Proceed to Seat Selection
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Seat Map */}
            {step===2 && (
              <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="h-full">
                <SeatMap 
                  event={event} 
                  ticketCount={ticketCount} 
                  onConfirm={(seats, extraCost) => {
                    setSelectedSeats(seats);
                    setSeatUpgradeCost(extraCost);
                    setStep(3);
                  }} 
                  onBack={() => setStep(1)} 
                />
              </motion.div>
            )}

            {/* Step 3: Order Summary & Pay */}
            {step===3 && (
              <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="h-full flex flex-col relative">
                {isProcessing && (
                  <div className="absolute inset-0 z-20 bg-[#0a0a0add] backdrop-blur-sm rounded-xl flex items-center justify-center flex-col">
                    <Loader2 size={40} className="animate-spin mb-4" style={{color:event.color}}/>
                    <p className="text-lg font-bold animate-pulse">Waiting for Payment...</p>
                    <p className="text-sm text-gray-400 mt-2">Complete payment in the Razorpay window</p>
                  </div>
                )}
                <h3 className="text-2xl font-black mb-6">Order Summary</h3>
                <div className="flex-1 space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Selected Seats</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seat => (
                        <span key={seat} className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-bold text-white">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Tickets ({ticketCount}x)</span>
                      <span className="text-white font-bold">₹{baseAmount.toLocaleString("en-IN")}</span>
                    </div>
                    {seatUpgradeCost > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Seat Upgrades</span>
                        <span className="text-white font-bold">₹{seatUpgradeCost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">GST (18%)</span>
                      <span className="text-white font-bold">₹{taxes.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                      <span className="text-white font-black text-lg">Total Amount</span>
                      <span className="text-2xl font-black" style={{color:event.color}}>₹{finalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                    <Info size={20} />
                    <p className="text-xs leading-relaxed">
                      Clicking "Pay Now" will open the secure Razorpay gateway. You can pay via UPI, Card, Netbanking, or Wallets.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 flex gap-4">
                  <button onClick={()=>setStep(2)} disabled={isProcessing} className="px-6 py-4 rounded-xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all">Back</button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="flex-1 py-4 rounded-xl font-black text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform hover:scale-[1.02]"
                    style={{background:`linear-gradient(135deg,${event.color},${event.accent})`}}
                  >
                    Pay Now with Razorpay
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
