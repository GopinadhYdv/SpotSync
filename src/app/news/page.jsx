import React from "react";
import Navbar from "../../components/Navbar";
import { motion } from "motion/react";
import { Newspaper, ChevronRight, Clock, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BRAND_NAME } from "../../components/BrandLogo";

export default function NewsPage() {
  const { data: news, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black tracking-widest uppercase text-silver-400 mb-6"
          >
            Insights & Updates
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-black tracking-tighter mb-6 italic"
          >
            {BRAND_NAME} News
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 leading-relaxed"
          >
            Product updates, industry shifts, and event intelligence from the
            teams shaping live experiences.
          </motion.p>
        </header>

        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-white/5 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Main Article */}
            <div className="md:col-span-8 space-y-12">
              {news?.length > 0 ? (
                news.map((item, idx) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="relative h-[400px] rounded-[2rem] overflow-hidden mb-8 border border-white/5">
                      <img
                        src={
                          item.image_url ||
                          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&fit=crop"
                        }
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt={item.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-8 left-8">
                        <span className="bg-white text-black px-4 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-4 inline-block">
                          Editor's Choice
                        </span>
                        <h2 className="text-4xl font-black tracking-tight leading-tight group-hover:text-silver-400 transition-colors">
                          {item.title}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2" />{" "}
                        {new Date(item.published_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <User size={14} className="mr-2" /> Admin Staff
                      </div>
                    </div>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-3xl">
                      {item.content ||
                        `${BRAND_NAME} is tracking how live events are getting faster, smarter, and more connected across discovery, booking, and attendee ops.`}
                    </p>
                    <button className="flex items-center text-silver-400 font-black hover:text-white transition-all uppercase tracking-widest text-sm">
                      Read Full Article{" "}
                      <ChevronRight size={16} className="ml-2" />
                    </button>
                  </motion.article>
                ))
              ) : (
                <div className="p-20 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
                  <Newspaper size={40} className="mx-auto mb-6 text-gray-700" />
                  <p className="text-gray-500 font-bold">
                    No news articles published yet.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="md:col-span-4 space-y-12">
              <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 shadow-xl">
                <h3 className="text-xl font-bold mb-8">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "AI Events",
                    "Music Festivals",
                    "Networking",
                    "Robotics",
                    "Future Tech",
                    "Design Summit",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold text-gray-400 cursor-pointer border border-white/10 transition-all"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-silver-400/20 to-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4 italic tracking-tight">
                    Stay Updated
                  </h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    Join 50k+ readers getting weekly notes on live event trends,
                    platform updates, and standout launches.
                  </p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl mb-4 focus:outline-none focus:border-white/30 text-sm"
                  />
                  <button className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-silver-400 transition-all shadow-xl uppercase tracking-widest text-xs">
                    Subscribe Now
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-all duration-1000 rotate-12">
                  <Newspaper size={180} />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
