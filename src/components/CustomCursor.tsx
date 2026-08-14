"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ThemeId } from "@/components/themes/types";

export function CustomCursor({ aktif }: { aktif: ThemeId }) {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth follow for the main cursor
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const down = () => setClicked(true);
    const up = () => setClicked(false);
    const mouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button, input, textarea, select")) {
        setHovered(true);
      }
    };
    const mouseOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button, input, textarea, select")) {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down, { passive: true });
    window.addEventListener("mouseup", up, { passive: true });
    window.addEventListener("mouseover", mouseOver, { passive: true });
    window.addEventListener("mouseout", mouseOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseover", mouseOver);
      window.removeEventListener("mouseout", mouseOut);
    };
  }, [mouseX, mouseY]);

  if (isTouch) return null;

  // --- Theme Specific Styles ---
  
  // Base variants
  const variants = {
    default: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 1.5,
      opacity: 0.8,
    },
    click: {
      scale: 0.9,
      opacity: 1,
    }
  };

  const getThemeCursor = () => {
    switch (aktif) {
      case "bento":
        return (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border-2 border-black/80 bg-white/50 backdrop-blur-sm"
            style={{ x: cursorX, y: cursorY }}
            variants={variants}
            animate={clicked ? "click" : hovered ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        );
      case "neo":
        return (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 -translate-x-1/2 -translate-y-1/2 border-4 border-black bg-[#ffdd57] shadow-[2px_2px_0_0_#000]"
            style={{ x: cursorX, y: cursorY, borderRadius: hovered ? "50%" : "0%" }}
            variants={{
              default: { scale: 1, rotate: 0 },
              hover: { scale: 1.2, rotate: 15 },
              click: { scale: 0.8, rotate: -15 }
            }}
            animate={clicked ? "click" : hovered ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        );
      case "clay":
        return (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] shadow-[inset_4px_4px_8px_#c3c8cf,inset_-4px_-4px_8px_#fdffff] transition-colors"
            style={{ x: cursorX, y: cursorY, backgroundColor: hovered ? "rgba(224, 229, 236, 0.5)" : "transparent" }}
            variants={{
              default: { scale: 1 },
              hover: { scale: 1.4 },
              click: { scale: 0.9 }
            }}
            animate={clicked ? "click" : hovered ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        );
      case "minimal":
        return (
          <>
            {/* Inner dot */}
            <motion.div
              className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
              style={{ x: mouseX, y: mouseY }}
              animate={{ opacity: hovered ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            />
            {/* Outer ring */}
            <motion.div
              className="pointer-events-none fixed left-0 top-0 z-[9998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/40"
              style={{ x: cursorX, y: cursorY }}
              variants={{
                default: { scale: 1, opacity: 0.5 },
                hover: { scale: 1.5, opacity: 1, backgroundColor: "rgba(0,0,0,0.05)" },
                click: { scale: 0.8, opacity: 1 }
              }}
              animate={clicked ? "click" : hovered ? "hover" : "default"}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </>
        );
      case "glasslight":
        return (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/20 shadow-lg backdrop-blur-md"
            style={{ x: cursorX, y: cursorY }}
            variants={{
              default: { scale: 1 },
              hover: { scale: 1.5, borderColor: "rgba(255,255,255,0.8)" },
              click: { scale: 0.9 }
            }}
            animate={clicked ? "click" : hovered ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        );
      case "editorial":
        return (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/30 text-black/50 mix-blend-difference"
            style={{ x: cursorX, y: cursorY }}
            variants={{
              default: { scale: 1 },
              hover: { scale: 1.5, borderColor: "rgba(255,255,255,0.8)", color: "rgba(255,255,255,0.8)" },
              click: { scale: 0.8 }
            }}
            animate={clicked ? "click" : hovered ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {hovered && <span className="font-serif text-sm italic">view</span>}
          </motion.div>
        );
      case "cyber":
        return (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] h-5 w-5 -translate-x-1/2 -translate-y-1/2 border border-[#4ade80] bg-[#4ade80]/20 mix-blend-screen"
            style={{ x: cursorX, y: cursorY }}
            variants={{
              default: { scale: 1, rotate: 0 },
              hover: { scale: 1.5, rotate: 45, backgroundColor: "rgba(74, 222, 128, 0.4)" },
              click: { scale: 0.5, rotate: -45 }
            }}
            animate={clicked ? "click" : hovered ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {hovered && (
              <span className="absolute -right-10 -top-6 animate-pulse text-[10px] text-[#4ade80]">
                [ACCESS]
              </span>
            )}
          </motion.div>
        );
      case "vanta":
        return (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[9999] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
            style={{ 
              x: cursorX, 
              y: cursorY,
              background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)"
            }}
            variants={{
              default: { scale: 1, opacity: 0.5 },
              hover: { scale: 1.8, opacity: 1 },
              click: { scale: 0.8, opacity: 0.8 }
            }}
            animate={clicked ? "click" : hovered ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        );
      default:
        return null;
    }
  };

  return getThemeCursor();
}
