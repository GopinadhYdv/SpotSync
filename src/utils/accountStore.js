// ─── SpotSync Account Store ────────────────────────────────────────────────
// Persists user profile + purchased tickets + wishlist in localStorage.
// Keep the legacy `spotsync_*` keys to avoid losing existing local data.

const PROFILE_KEY  = "spotsync_profile";
const TICKETS_KEY  = "spotsync_tickets";
const WISHLIST_KEY = "spotsync_wishlist";

const DEFAULT_PROFILE = {
  name: "",
  email: "",
  phone: "",
  upiId: "",
  avatarUrl: "",
  dob: "",
  city: "",
  gender: "",
  memberSince: new Date().getFullYear(),
  tier: "Explorer",
  notifications: {
    email: true,
    push: false,
    sms: false,
  },
};

// ── Broadcast helper ──────────────────────────────────────────────────────────
function broadcast(key) {
  try {
    // Dispatch a custom storage event so other components can re-read
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {}
}

// ── Profile ───────────────────────────────────────────────────────────────────

export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(updates) {
  try {
    const current = getProfile();
    const merged = { ...current, ...updates };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    broadcast(PROFILE_KEY);
    return merged;
  } catch {
    return getProfile();
  }
}

export function saveNotifications(notifications) {
  const profile = getProfile();
  return saveProfile({ notifications: { ...profile.notifications, ...notifications } });
}

export function getUpiId() {
  return getProfile().upiId || "";
}

export function getProfileField(field) {
  return getProfile()[field] || "";
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export function getTickets() {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTicket(ticket) {
  try {
    const existing = getTickets();
    const updated = [ticket, ...existing];
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    broadcast(TICKETS_KEY);
    return updated;
  } catch {
    return getTickets();
  }
}

export function clearTickets() {
  localStorage.removeItem(TICKETS_KEY);
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleWishlist(event) {
  try {
    const existing = getWishlist();
    const idx = existing.findIndex((e) => String(e.id) === String(event.id));
    let updated;
    if (idx >= 0) {
      updated = existing.filter((_, i) => i !== idx);
    } else {
      updated = [{ id: event.id, title: event.title, poster: event.poster, date: event.date, location: event.location, price: event.price, color: event.color }, ...existing];
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    broadcast(WISHLIST_KEY);
    return { list: updated, added: idx < 0 };
  } catch {
    return { list: getWishlist(), added: false };
  }
}

export function isWishlisted(eventId) {
  return getWishlist().some((e) => String(e.id) === String(eventId));
}
