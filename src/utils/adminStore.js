import { INDIAN_EVENTS } from "./data.js";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const ADMIN_CREDENTIALS = {
  email: "admin359@gmail.com",
  password: "admin123",
};

export function adminLogin(email, password) {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
}

export function isAdminLoggedIn() {
  return localStorage.getItem("ease_admin_auth") === "true";
}

export function setAdminAuth(val) {
  if (val) localStorage.setItem("ease_admin_auth", "true");
  else localStorage.removeItem("ease_admin_auth");
}

// ── Events store ──────────────────────────────────────────────────────────────
const EVENTS_KEY = "ease_admin_events";

function serializeEvents(events) {
  // strip non-serializable icon component
  return events.map(({ icon, ...rest }) => ({ ...rest, iconName: icon?.displayName || "Calendar" }));
}

export function getStoredEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // seed with default events (serialized)
  const seeded = serializeEvents(INDIAN_EVENTS);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function addEvent(event) {
  const events = getStoredEvents();
  const newEvent = {
    ...event,
    id: Date.now().toString(),
    featured: event.featured || false,
    badge: event.badge || "🎟️ New",
    color: event.color || "#7c3aed",
    accent: event.accent || "#3b82f6",
    poster: event.poster || "/events/default.png",
    longDescription: event.longDescription || event.description || "",
    iconName: "Calendar",
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

export function updateEvent(id, updates) {
  const events = getStoredEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...updates };
  saveEvents(events);
  return events[idx];
}

export function deleteEvent(id) {
  const events = getStoredEvents().filter((e) => e.id !== id);
  saveEvents(events);
}

// ── Ratings store ─────────────────────────────────────────────────────────────
const RATINGS_KEY = "ease_event_ratings";

export function getRatings() {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function addRating(eventId, { user, stars, comment }) {
  const ratings = getRatings();
  if (!ratings[eventId]) ratings[eventId] = [];
  ratings[eventId].push({
    id: Date.now().toString(),
    user: user || "Guest",
    stars: Math.min(5, Math.max(1, stars)),
    comment,
    date: new Date().toISOString(),
  });
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  return ratings[eventId];
}

export function getEventRatings(eventId) {
  const ratings = getRatings();
  return ratings[eventId] || [];
}

export function getAverageRating(eventId) {
  const list = getEventRatings(eventId);
  if (!list.length) return 0;
  return list.reduce((s, r) => s + r.stars, 0) / list.length;
}

// ── Dashboard analytics ───────────────────────────────────────────────────────
export function getAnalytics() {
  const events = getStoredEvents();
  const now = new Date();

  const current  = events.filter((e) => new Date(e.date) >= now);
  const past     = events.filter((e) => new Date(e.date) < now);
  const featured = events.filter((e) => e.featured);

  // mock bookings from localStorage or generate deterministic values
  const bookings = events.map((e) => ({
    eventId: e.id,
    count: Math.floor((parseInt(e.id, 10) || 1) * 137 % 500) + 50,
  }));

  const totalRevenue = bookings.reduce((sum, b) => {
    const ev = events.find((e) => e.id === b.eventId);
    return sum + b.count * (ev?.price || 0);
  }, 0);

  const totalBookings = bookings.reduce((s, b) => s + b.count, 0);

  // monthly revenue mock
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueData = months.map((month, i) => ({
    month,
    revenue: Math.floor(Math.random() * 400000 + 80000),
    bookings: Math.floor(Math.random() * 300 + 50),
  }));

  return {
    totalEvents:   events.length,
    currentEvents: current.length,
    pastEvents:    past.length,
    featuredEvents: featured.length,
    totalBookings,
    totalRevenue,
    revenueData,
    current,
    past,
    featured,
    events,
  };
}
