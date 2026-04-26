import React from "react";
import Navbar from "../../components/Navbar";
import { motion } from "motion/react";
import { Users, Shield, Award, Sparkles } from "lucide-react";
import { BRAND_NAME } from "../../components/BrandLogo";

export default function AboutPage() {
  const values = [
    {
      name: "Innovation",
      desc: "Designing faster, clearer ways to coordinate live experiences.",
      icon: Sparkles,
    },
    {
      name: "Community",
      desc: "Helping audiences, organizers, and crews move together in sync.",
      icon: Users,
    },
    {
      name: "Excellence",
      desc: "Raising the bar for booking, updates, and check-in experiences.",
      icon: Award,
    },
    {
      name: "Security",
      desc: "Protecting your identity, payments, and passes with care.",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-8 italic"
          >
            Making Live Events <span className="text-cyan-300">Flow Better.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
          >
            {BRAND_NAME} is built to keep discovery, booking, communication, and entry
            in sync for every live event moment.
          </motion.p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-silver-400/5 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Mission */}
      <section className="py-32 max-w-7xl mx-auto px-4 border-y border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-silver-400 mb-6 block">
              The Vision
            </span>
            <h2 className="text-5xl font-black tracking-tight mb-8">
              Our mission is to remove the messy gaps between planning and showing up.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              We believe great event software should feel invisible. From the first
              browse to the final gate scan, {BRAND_NAME} gives organizers and attendees
              one shared source of truth.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-br from-[#111] to-black rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&fit=crop"
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black text-center mb-20 tracking-tight">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, idx) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-10 bg-[#111111] rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all text-center group"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <v.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">{v.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
