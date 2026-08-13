"use client";

import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

/** V2 · Liquid Glass + Aurora Reborn — kaca tebal yang membiaskan aurora. */

const BARIS = ["I Build", "and Host", "Websites."];

const wadah = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const kata = {
  hidden: { opacity: 0, y: "0.6em", filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 110, damping: 17 },
  },
};

export function HeroV2() {
  return (
    <section className="relative py-24 sm:py-32">
      {/* Panel kaca tebal — aurora dari layout terlihat membias di belakangnya */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
        className="glass-liquid radius-modern relative z-10 p-8 sm:p-12 lg:p-16"
      >
        <span className="eyebrow eyebrow-bright">
          Versi 02 · Liquid Glass + Aurora
        </span>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={wadah}
          className="display mt-6 text-[clamp(2.5rem,7.5vw,6.5rem)]"
        >
          {BARIS.map((b, i) => {
            const w = b.split(" ");
            return (
              <span key={b} className="block">
                {w.map((k, j) => (
                  <motion.span
                    key={`${b}-${j}`}
                    variants={kata}
                    className={[
                      "inline-block will-change-transform",
                      j < w.length - 1 ? "mr-[0.25em]" : "",
                      i === 2
                        ? "text-gradient"
                        : i === 0
                          ? "text-text-dim"
                          : "text-text",
                    ].join(" ")}
                  >
                    {k}
                  </motion.span>
                ))}
              </span>
            );
          })}
        </motion.h1>

        <p className="mt-8 max-w-xl text-sm leading-relaxed text-text-dim">
          Kaca tebal, cahaya aurora yang melayang, dan pantulan yang berubah
          saat kamu menggulir. Warna dipakai sebagai cahaya — bukan sebagai cat.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <MagneticButton
            href="#karya-demo"
            className="inline-block rounded-full bg-gradient-to-r from-aurora to-violet px-6 py-3 text-sm font-semibold text-black shadow-[0_10px_40px_-12px_var(--color-aurora)]"
          >
            Lihat Karya
          </MagneticButton>
          <motion.a
            href="#karya-demo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="glass rounded-full px-6 py-3 text-sm font-medium text-text"
          >
            Contact me
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
