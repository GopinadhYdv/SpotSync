import { addEvent, getStoredEvents, saveEvents, updateEvent, deleteEvent as deleteStoredEvent } from "./adminStore";

function getApiBase() {
  return import.meta.env.NEXT_PUBLIC_API_URL || "";
}

function mapApiEvent(event) {
  return {
    id: String(event.id),
    title: event.title,
    category: event.category,
    location: event.location,
    venueAddress: event.venueAddress || event.venue_address || event.location,
    date: event.date || event.event_date,
    time: event.time || event.event_time || "18:00",
    price: Number(event.price || 0),
    capacity: Number(event.capacity || 100),
    featured: Boolean(event.featured),
    badge: event.badge || "New Event",
    color: event.color || "#7c3aed",
    accent: event.accent || "#3b82f6",
    poster: event.poster || event.image_url || "/events/tech-summit.png",
    description: event.description || event.shortDescription || "",
    shortDescription: event.shortDescription || event.short_description || event.description || "",
    longDescription: event.longDescription || event.long_description || event.description || "",
    organizer: event.organizer || "Ease Events",
    seatLayout: event.seatLayout || event.seat_layout,
    iconName: event.iconName || "Calendar",
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let details = "Request failed";
    try {
      const errorBody = await response.json();
      details = errorBody.error || details;
    } catch {}
    throw new Error(details);
  }

  return response.json();
}

export async function loadEvents() {
  try {
    const events = await requestJson("/api/events");
    const mapped = Array.isArray(events) ? events.map(mapApiEvent) : [];
    saveEvents(mapped);
    return mapped;
  } catch (error) {
    console.warn("Falling back to cached events:", error);
    return getStoredEvents();
  }
}

export async function createRemoteEvent(payload) {
  try {
    const result = await requestJson("/api/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const mapped = mapApiEvent(result);
    const events = getStoredEvents().filter((event) => String(event.id) !== String(mapped.id));
    saveEvents([...events, mapped]);
    return mapped;
  } catch (error) {
    console.warn("Falling back to local event creation:", error);
    return addEvent(payload);
  }
}

export async function updateRemoteEvent(id, payload) {
  try {
    const result = await requestJson(`/api/events?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const mapped = mapApiEvent(result);
    const events = getStoredEvents().map((event) => (String(event.id) === String(id) ? mapped : event));
    saveEvents(events);
    return mapped;
  } catch (error) {
    console.warn("Falling back to local event update:", error);
    return updateEvent(String(id), payload);
  }
}

export async function deleteRemoteEvent(id) {
  try {
    await requestJson(`/api/events?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const events = getStoredEvents().filter((event) => String(event.id) !== String(id));
    saveEvents(events);
  } catch (error) {
    console.warn("Falling back to local event delete:", error);
    deleteStoredEvent(String(id));
  }
}
