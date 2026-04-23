import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Seat map layout config ───────────────────────────────────────────────────
function generateSeeding(eventId) {
  let seed = 0;
  if (!eventId) return 1;
  const str = String(eventId);
  for (let i = 0; i < str.length; i++) {
    seed += str.charCodeAt(i);
  }
  return seed;
}

function getSections(eventId) {
  const seed = generateSeeding(eventId);
  return [
    {
      id: "floor",
      label: "Floor — General",
      badge: "₹ Base",
      rows: 3 + (seed % 3),
      cols: 10 + (seed % 5),
      color: "#10b981",
      priceLabel: "Included",
      priceAdd: 0,
      emoji: "🟢",
    },
    {
      id: "lower",
      label: "Lower Deck — Premium",
      badge: "+₹500",
      rows: 2 + (seed % 2),
      cols: 8 + (seed % 4),
      color: "#6366f1",
      priceLabel: "+₹500",
      priceAdd: 500,
      emoji: "🔵",
    },
    {
      id: "vip",
      label: "Upper Deck — VIP",
      badge: "+₹1500",
      rows: 1 + (seed % 2),
      cols: 6 + (seed % 3),
      color: "#f59e0b",
      priceLabel: "+₹1500",
      priceAdd: 1500,
      emoji: "⭐",
    },
  ];
}

// Deterministic "pre-taken" seats based on seat id hash
function isTaken(eventId, sectionId, row, col) {
  const seed = generateSeeding(eventId);
  const hash = (seed + sectionId.charCodeAt(0) + row * 7 + col * 13) % 100;
  const rates = { floor: 45, lower: 30, vip: 20 };
  return hash < (rates[sectionId] || 30);
}

function SeatGrid({ section, selectedSeats, onToggle, maxSelect, eventId }) {
  const { id, rows, cols, color } = section;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "0.03em" }}>
          {section.label}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: color,
            background: `${color}18`,
            border: `1px solid ${color}44`,
            borderRadius: 20,
            padding: "2px 8px",
          }}
        >
          {section.priceLabel}
        </span>
      </div>

      {/* Stage indicator for floor section */}
      {id === "floor" && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 10,
            padding: "6px 0",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          🎤 Stage
        </div>
      )}

      {/* Seat grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} style={{ display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                width: 16,
                textAlign: "right",
                fontFamily: "monospace",
              }}
            >
              {String.fromCharCode(65 + r)}
            </span>
            {Array.from({ length: cols }, (_, c) => {
              const seatId = `${id}-${String.fromCharCode(65 + r)}${c + 1}`;
              const taken = isTaken(eventId, id, r, c);
              const selected = selectedSeats.includes(seatId);

              return (
                <motion.button
                  key={seatId}
                  disabled={taken}
                  onClick={() => onToggle(seatId, section)}
                  whileHover={!taken ? { scale: 1.25 } : {}}
                  whileTap={!taken ? { scale: 0.9 } : {}}
                  style={{
                    width: 22,
                    height: 18,
                    borderRadius: 4,
                    border: "none",
                    cursor: taken ? "not-allowed" : "pointer",
                    transition: "background 0.15s, box-shadow 0.15s",
                    background: taken
                      ? "rgba(255,255,255,0.08)"
                      : selected
                      ? color
                      : `${color}28`,
                    boxShadow: selected
                      ? `0 0 10px ${color}88`
                      : "none",
                    outline: selected ? `2px solid ${color}` : "none",
                    outlineOffset: 1,
                    position: "relative",
                  }}
                  title={taken ? "Taken" : seatId}
                >
                  {taken && (
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 7,
                        color: "rgba(255,255,255,0.2)",
                      }}
                    >
                      ✕
                    </span>
                  )}
                </motion.button>
              );
            })}
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                width: 16,
                fontFamily: "monospace",
              }}
            >
              {String.fromCharCode(65 + r)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main SeatMap component ───────────────────────────────────────────────────
export default function SeatMap({ event, ticketCount, onConfirm, onBack }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSections, setSelectedSections] = useState({});

  const accentColor = event?.color || "#7c3aed";
  const maxSelect = ticketCount;

  const handleToggle = (seatId, section) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        // Deselect
        const next = prev.filter((s) => s !== seatId);
        setSelectedSections((sec) => {
          const updated = { ...sec };
          delete updated[seatId];
          return updated;
        });
        return next;
      }
      if (prev.length >= maxSelect) return prev; // max reached
      setSelectedSections((sec) => ({ ...sec, [seatId]: section }));
      return [...prev, seatId];
    });
  };

  const extraCost = useMemo(() => {
    return selectedSeats.reduce((acc, seatId) => {
      const sec = selectedSections[seatId];
      return acc + (sec?.priceAdd || 0);
    }, 0);
  }, [selectedSeats, selectedSections]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          Choose Your Seats
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Select {maxSelect} seat{maxSelect > 1 ? "s" : ""}
          {selectedSeats.length > 0 && ` · ${selectedSeats.length} selected`}
        </p>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
          padding: "8px 12px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {[
          { color: "#10b981", label: "Available" },
          { color: "rgba(255,255,255,0.08)", label: "Taken", cross: true },
          { color: accentColor, label: "Selected" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 16,
                height: 14,
                borderRadius: 3,
                background: item.color,
                boxShadow: item.color !== "rgba(255,255,255,0.08)" ? `0 0 6px ${item.color}88` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: "rgba(255,255,255,0.25)",
              }}
            >
              {item.cross && "✕"}
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
              {item.label}
            </span>
          </div>
        ))}
        {selectedSeats.length > 0 && (
          <div style={{ marginLeft: "auto", fontSize: 11, color: accentColor, fontWeight: 800 }}>
            {selectedSeats.length}/{maxSelect}
          </div>
        )}
      </div>

      {/* Scrollable seat grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 4,
          marginBottom: 12,
        }}
      >
        {getSections(event?.id).map((section) => (
          <SeatGrid
            key={section.id}
            section={section}
            selectedSeats={selectedSeats}
            onToggle={handleToggle}
            maxSelect={maxSelect}
            eventId={event?.id}
          />
        ))}
      </div>

      {/* Selected seats chips */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
              padding: "8px 12px",
              background: `${accentColor}10`,
              border: `1px solid ${accentColor}30`,
              borderRadius: 10,
            }}
          >
            {selectedSeats.map((seatId) => (
              <span
                key={seatId}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: `${accentColor}22`,
                  color: accentColor,
                  border: `1px solid ${accentColor}44`,
                  fontFamily: "monospace",
                }}
              >
                {seatId}
              </span>
            ))}
            {extraCost > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#f59e0b",
                }}
              >
                +₹{extraCost.toLocaleString("en-IN")} upgrade
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onConfirm(selectedSeats, extraCost)}
          disabled={selectedSeats.length < maxSelect}
          style={{
            flex: 1,
            padding: "12px 20px",
            borderRadius: 12,
            background:
              selectedSeats.length < maxSelect
                ? "rgba(255,255,255,0.1)"
                : `linear-gradient(135deg, ${accentColor}, ${event?.accent || "#3b82f6"})`,
            border: "none",
            color: selectedSeats.length < maxSelect ? "rgba(255,255,255,0.3)" : "#000",
            fontSize: 14,
            fontWeight: 900,
            cursor: selectedSeats.length < maxSelect ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow:
              selectedSeats.length >= maxSelect
                ? `0 0 24px ${accentColor}44`
                : "none",
          }}
        >
          {selectedSeats.length < maxSelect
            ? `Select ${maxSelect - selectedSeats.length} more seat${maxSelect - selectedSeats.length !== 1 ? "s" : ""}`
            : "Confirm Seats → Payment"}
        </motion.button>
      </div>
    </div>
  );
}
