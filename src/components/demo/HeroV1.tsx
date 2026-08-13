"use client";

import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Spotlight } from "@/components/ui/Spotlight";
import { DotPattern } from "@/components/ui/DotPattern";

/** V1 · Apple Pro Clean Modern — monokrom presisi, tanpa satu pun aksen warna. */

const BARIS = ["I Build", "and Host", "Websites."];

const wadah = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const kata = {
  hidden: { opacity: 0, y: "0.5em" },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 16 },
  },
};

export function HeroV1() {
  return (
    <section className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 inset-y-0 -z-10"
      >
        <DotPattern />
      </div>
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />

      <div className="relative z-10 max-w-4xl">
        <span className="eyebrow">Versi 01 · Apple Pro Clean Modern</span>

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
                      i === 0 ? "text-text-dim" : "text-text",
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
          Presisi, ruang lapang, dan kontras yang tenang. Tidak ada warna yang
          menarik perhatian — yang bekerja hanya tipografi dan bidang.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <MagneticButton
            href="#karya-demo"
            className="inline-block rounded-full bg-text px-6 py-3 text-sm font-semibold text-black"
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
      </div>
    </section>
  );
}
