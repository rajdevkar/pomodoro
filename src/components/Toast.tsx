"use client";

import { useAtom } from "jotai";
import { toastMessageAtom } from "@/store/atoms";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast() {
  const [message, setMessage] = useAtom(toastMessageAtom);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-black/80 dark:bg-white/90 text-white dark:text-black px-6 py-3 rounded-full shadow-xl backdrop-blur-md text-sm font-medium border border-white/10 dark:border-black/5"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
