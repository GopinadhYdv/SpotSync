import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Calendar, MapPin, Clock, ArrowLeft, Share2, Heart,
  Info, Star, Navigation, Car, Train, PersonStanding, Bike,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import PaymentModal from "../../../components/PaymentModal";
import { getStoredEvents, addRating, getEventRatings, getAverageRating } from "../../../utils/adminStore";
import { isWishlisted, toggleWishlist } from "../../../utils/accountStore";
import { toast } from "sonner";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [travelMode, setTravelMode] = useState("driving");
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const ev = getStoredEvents().find((e) => String(e.id) === String(id));
    setEvent(ev);
    if (ev) {
      setReviews(getEventRatings(ev.id));
      setWishlisted(isWishlisted(ev.id));
    }
  }, [id]);

  const handleWishlist = () => {
    const { added } = toggleWishlist(event);
    setWishlisted(added);
    toast.success(added ? "Added to Wishlist ❤️" : "Removed from Wishlist");
  };

  const handleShareLocation = async () => {
    const url = `https://google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.location, text: `Venue for ${event.title}`, url }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Venue link copied!");
    }
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if(ratingStars < 1) return;
    const newReviews = addRating(id, { user: "Current User", stars: ratingStars, comment: ratingComment });
    setReviews(newReviews);
    setRatingStars(0);
    setRatingComment("");
    alert("Thank you for your review!");
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black mb-4">Event Not Found</h1>
        <Link to="/events" className="text-purple-400 hover:text-purple-300 flex items-center">
          <ArrowLeft size={16} className="mr-2" /> Back to Events
        </Link>
      </div>
    );
  }

  const Icon = event?.icon || Calendar;
  const isPast = event && new Date(event.date) < new Date();
  const avgRating = getAverageRating(event.id);

  return (
    <div className="min-h-screen bg-[#060608] text-white pb-32">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] mt-16 flex items-center">
        <div className="absolute inset-0">
          <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/60 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Link
            to="/events"
            className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors backdrop-blur-md bg-white/5 py-2 px-4 rounded-full border border-white/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Directory
          </Link>

          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/50 backdrop-blur-md border border-white/20"
                style={{ color: event.color }}
              >
                {event.badge}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/50 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-white/80"
              >
                <Icon size={12} style={{ color: event.color }} />
                {event.category}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
              {event.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Quick Info Bar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-wrap gap-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Calendar style={{ color: event.color }} />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Date</div>
                  <div className="font-bold">
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Clock style={{ color: event.color }} />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Time</div>
                  <div className="font-bold">06:00 PM onwards</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <MapPin style={{ color: event.color }} />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Venue</div>
                  <div className="font-bold">{event.location}</div>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Info size={24} style={{ color: event.color }} />
                About This Event
              </h2>
              <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-relaxed">
                <p>{event.longDescription}</p>
                <p>
                  Secure your spot today to experience world-class amenities, premium F&B stalls, 
                  safe and designated zones for families, and an unparalleled atmosphere. This is 
                  more than an event—it's a lifelong memory.
                </p>
              </div>
            </motion.div>

            {/* Enhanced Google Maps Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Navigation size={24} style={{ color: event.color }} />
                Venue & Directions
              </h2>
              <div
                className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                style={{ background: "#0a0a10" }}
              >
                {/* Transport mode pills */}
                <div className="flex gap-2 p-4 border-b border-white/5">
                  {[
                    { mode: "driving",  icon: Car,             label: "Drive" },
                    { mode: "transit",  icon: Train,           label: "Transit" },
                    { mode: "walking",  icon: PersonStanding,  label: "Walk" },
                    { mode: "bicycling",icon: Bike,            label: "Bike" },
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setTravelMode(mode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: travelMode === mode ? event.color : "rgba(255,255,255,0.05)",
                        color: travelMode === mode ? "#000" : "rgba(255,255,255,0.5)",
                        border: travelMode === mode ? `1px solid ${event.color}` : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: travelMode === mode ? `0 0 14px ${event.color}55` : "none",
                      }}
                    >
                      <Icon size={12} />{label}
                    </button>
                  ))}
                </div>

                {/* Map embed */}
                <div className="p-2">
                  <iframe
                    width="100%"
                    height="340"
                    style={{ border: 0, borderRadius: "1.2rem", display: "block", filter: "saturate(0.85) brightness(0.9)" }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
                    title={`Map for ${event.location}`}
                  />
                </div>

                {/* Bottom bar */}
                <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={14} style={{ color: event.color }} />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShareLocation}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-all hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.1)" }}
                    >
                      <Share2 size={12} /> Share
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location)}&travelmode=${travelMode}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all hover:opacity-90"
                      style={{
                        background: `linear-gradient(135deg, ${event.color}, ${event.accent || "#3b82f6"})`,
                        color: "#000", border: "none",
                        boxShadow: `0 4px 16px ${event.color}44`,
                      }}
                    >
                      <Navigation size={12} /> Get Directions ↗
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Ratings & Reviews for Past Events */}
            {isPast && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 bg-[#111] p-8 rounded-3xl border border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Star size={24} className="text-yellow-400" />
                    Guest Reviews
                  </h2>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                     <span className="text-yellow-400 font-bold">{avgRating.toFixed(1)}</span>
                     <Star size={14} className="text-yellow-400 fill-yellow-400" />
                     <span className="text-gray-400 text-sm ml-1">({reviews.length} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet. Be the first to share your experience!</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="bg-black/50 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm text-gray-300">{r.user}</span>
                          <span className="text-yellow-400 flex text-xs tracking-widest">
                            {"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="font-bold mb-4">Write a review</h3>
                  <form onSubmit={handleRatingSubmit} className="space-y-4">
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button type="button" key={star} onClick={() => setRatingStars(star)} 
                          className={`text-2xl transition-colors ${star <= ratingStars ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} required
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none" 
                      placeholder="Share your thoughts about this event..." rows="3"
                    ></textarea>
                    <button type="submit" disabled={ratingStars === 0} 
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold disabled:opacity-50 transition-opacity">
                      Submit Review
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="sticky top-32 bg-[#111] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Starting from</div>
                    <div className="text-4xl font-black" style={{ color: event.color }}>
                      ₹{event.price.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-gray-400">General Admission</span>
                    <span className="font-bold">Available</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-gray-400">VIP Pass</span>
                    <span className="font-bold text-orange-400">Fast Filling</span>
                  </div>
                </div>

                {isPast ? (
                  <div className="w-full py-4 rounded-xl font-black text-white text-lg overflow-hidden bg-red-500/20 border border-red-500/30 text-center">
                    Event Has Ended
                  </div>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 rounded-xl font-black text-black text-lg transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${event.color}, ${event.accent})`,
                    }}
                  >
                    Book Tickets Now
                  </button>
                )}

                <div className="flex justify-center gap-6 mt-6">
                  <button onClick={handleShareLocation} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Share2 size={16} /> Share
                  </button>
                  <button onClick={handleWishlist} className={`flex items-center gap-2 text-sm transition-colors ${wishlisted ? "text-pink-400" : "text-gray-400 hover:text-white"}`}>
                    <Heart size={16} fill={wishlisted ? "currentColor" : "none"} /> {wishlisted ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              {/* Decorative gradient bar at bottom */}
              <div 
                className="h-2 w-full" 
                style={{ background: `linear-gradient(90deg, ${event.color}, ${event.accent})` }}
              />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
      />
    </div>
  );
}
