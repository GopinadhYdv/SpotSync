import { INDIAN_EVENTS } from "./data.js";

export const ADMIN_CREDENTIALS = {
  email: "admin359@gmail.com",
  password: "admin123",
};

const EVENTS_KEY = "ease_admin_events";
const EVENTS_UPDATED_EVENT = "ease:events-updated";
const RATINGS_KEY = "ease_event_ratings";

const DEFAULT_SEAT_LAYOUT = {
  sections: [
    { id: "floor", label: "Floor - General", rows: 4, cols: 12, color: "#10b981", priceAdd: 0, priceLabel: "Included" },
    { id: "lower", label: "Lower Deck - Premium", rows: 3, cols: 10, color: "#6366f1", priceAdd: 500, priceLabel: "+₹500" },
    { id: "vip", label: "Upper Deck - VIP", rows: 2, cols: 8, color: "#f59e0b", priceAdd: 1500, priceLabel: "+₹1500" },
  ],
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

function broadcastEventsUpdate() {
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: EVENTS_KEY }));
    window.dispatchEvent(new CustomEvent(EVENTS_UPDATED_EVENT));
  } catch {}
}

function normalizeSeatLayout(seatLayout = {}) {
  const sections = Array.isArray(seatLayout.sections) && seatLayout.sections.length
    ? seatLayout.sections
    : DEFAULT_SEAT_LAYOUT.sections;

  return {
    sections: sections.map((section, index) => {
      const priceAdd = Math.max(0, Number(section.priceAdd) || 0);
      return {
        id: section.id || `section-${index + 1}`,
        label: section.label || `Section ${index + 1}`,
        rows: Math.max(1, Number(section.rows) || 1),
        cols: Math.max(1, Number(section.cols) || 1),
        color: section.color || DEFAULT_SEAT_LAYOUT.sections[index]?.color || "#7c3aed",
        priceAdd,
        priceLabel: section.priceLabel || (priceAdd > 0 ? `+₹${priceAdd.toLocaleString("en-IN")}` : "Included"),
      };
    }),
  };
}

function normalizeEvent(event, index = 0) {
  return {
    ...event,
    id: String(event.id || Date.now() + index),
    title: event.title || "Untitled Event",
    category: event.category || "General",
    location: event.location || "Venue TBA",
    venueAddress: event.venueAddress || event.location || "",
    date: event.date || new Date().toISOString().slice(0, 10),
    time: event.time || "18:00",
    price: Math.max(0, Number(event.price) || 0),
    capacity: Math.max(1, Number(event.capacity) || 100),
    featured: Boolean(event.featured),
    color: event.color || "#7c3aed",
    accent: event.accent || "#3b82f6",
    badge: event.badge || "New Event",
    poster: event.poster || "/events/tech-summit.png",
    description: event.description || event.shortDescription || "",
    shortDescription: event.shortDescription || event.description || "",
    longDescription: event.longDescription || event.description || event.shortDescription || "",
    organizer: event.organizer || "Ease Events",
    seatLayout: normalizeSeatLayout(event.seatLayout),
    iconName: event.iconName || "Calendar",
  };
}

function serializeEvents(events) {
  return events.map(({ icon, ...rest }, index) =>
    normalizeEvent({ ...rest, iconName: icon?.displayName || "Calendar" }, index),
  );
}

export function getStoredEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((event, index) => normalizeEvent(event, index)) : [];
    }
  } catch {}

  const seeded = serializeEvents(INDIAN_EVENTS);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveEvents(events) {
  const normalized = events.map((event, index) => normalizeEvent(event, index));
  localStorage.setItem(EVENTS_KEY, JSON.stringify(normalized));
  broadcastEventsUpdate();
}

export function addEvent(event) {
  const events = getStoredEvents();
  const newEvent = normalizeEvent({
    ...event,
    id: Date.now().toString(),
    iconName: "Calendar",
  });
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

export function updateEvent(id, updates) {
  const events = getStoredEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  events[idx] = normalizeEvent({ ...events[idx], ...updates });
  saveEvents(events);
  return events[idx];
}

export function deleteEvent(id) {
  const events = getStoredEvents().filter((e) => e.id !== id);
  saveEvents(events);
}

export function subscribeToEvents(callback) {
  if (typeof window === "undefined") return () => {};

  const handler = (event) => {
    if (!event || event.type === EVENTS_UPDATED_EVENT || event.key === EVENTS_KEY) {
      callback(getStoredEvents());
    }
  };

  window.addEventListener("storage", handler);
  window.addEventListener(EVENTS_UPDATED_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENTS_UPDATED_EVENT, handler);
  };
}

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

export function getAnalytics() {
  const events = getStoredEvents();
  const now = new Date();

  const current = events.filter((e) => new Date(`${e.date}T${e.time || "00:00"}`) >= now);
  const past = events.filter((e) => new Date(`${e.date}T${e.time || "00:00"}`) < now);
  const featured = events.filter((e) => e.featured);

  const bookings = events.map((e) => ({
    eventId: e.id,
    count: Math.floor((parseInt(e.id, 10) || 1) * 137 % 500) + 50,
  }));

  const totalRevenue = bookings.reduce((sum, b) => {
    const ev = events.find((e) => e.id === b.eventId);
    return sum + b.count * (ev?.price || 0);
  }, 0);

  const totalBookings = bookings.reduce((s, b) => s + b.count, 0);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueData = months.map((month, i) => ({
    month,
    revenue: 120000 + ((i + 3) * 47321) % 320000,
    bookings: 60 + ((i + 7) * 37) % 220,
  }));

  return {
    totalEvents: events.length,
    currentEvents: current.length,
    pastEvents: past.length,
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
