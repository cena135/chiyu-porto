"use client";

import { motion } from "framer-motion";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Typewriter } from "@/components/ui/Typewriter";
import { DotPattern } from "@/components/ui/DotPattern";
import { Spotlight } from "@/components/ui/Spotlight";

/** V3 · Pro Veteran Coder — decrypt, typewriter, dan rona neon cyan / matrix green. */

export function HeroV3() {
  return (
    <section className="scanlines relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 inset-y-0 -z-10"
      >
        {/* fill-current + text-* supaya titiknya ikut warna neon, bukan putih */}
        <DotPattern
          className="fill-current text-[#22c55e]/[0.10]"
          id="dot-v3"
        />
      </div>
      {/* Spotlight diberi rona cyan, bukan putih */}
      <Spotlight
        className="-top-40 left-0 md:-top-24 md:left-40"
        fill="#22d3ee"
      />

      <div className="relative z-10 max-w-4xl">
        <p className="eyebrow" style={{ color: "#22d3ee" }}>
          <Typewriter
            text="$ ./deploy --target=t480 --tunnel=cloudflare"
            speed={26}
          />
        </p>

        <h1 className="display mt-6 text-[clamp(2rem,6vw,5rem)]">
          <span className="block text-[#4ade80]">
            <ScrambleText text="I Build" />
          </span>
          <span className="block text-[#d7ffe9]">
            <ScrambleText text="and Host" delay={220} />
          </span>
          <span className="block text-[#22d3ee]">
            <ScrambleText text="Websites." delay={440} />
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#4ade80]">
          <Typewriter
            text="Semuanya jalan di ThinkPad bekas di pojok kamar. Bukan di cloud, jadi tidak ada tagihan bulanan. Sejauh ini belum ada yang meledak."
            delay={900}
            speed={16}
          />
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {/* Kurung siku merenggang saat disorot — isyarat khas terminal,
              jauh lebih pas di sini daripada tombol yang mengejar kursor. */}
          <motion.a
            href="#karya-demo"
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center gap-1 rounded-md border border-[#22d3ee]/50 bg-[#22d3ee]/10 px-5 py-3 text-sm font-semibold text-[#22d3ee] shadow-[0_0_28px_-8px_#22d3ee]"
          >
            <motion.span variants={{ rest: { x: 0 }, hover: { x: -4 } }}>
              [
            </motion.span>
            <span>lihat-karya</span>
            <motion.span variants={{ rest: { x: 0 }, hover: { x: 4 } }}>
              ]
            </motion.span>
          </motion.a>
          <motion.a
            href="#karya-demo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="rounded-md border border-[#4ade80]/40 px-6 py-3 text-sm font-medium text-[#4ade80]"
          >
            ./contact
          </motion.a>
        </div>
      </div>
    </section>
  );
}
