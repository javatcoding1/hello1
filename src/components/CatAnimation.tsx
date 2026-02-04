"use client";

import { motion } from "framer-motion";

export function CatAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 1 }}
      className="fixed bottom-0 left-8 z-40 w-32 md:w-48 pointer-events-none"
    >
        {/* Source: Mochi Peach Cat giving gift/flower - Tenor */}
        <img 
            src="https://media.tenor.com/On7kvXyBoTwAAAAi/mochi-peach-cat-mochi-cat.gif" 
            alt="Cute cat offering flowers"
            className="w-full h-auto drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity"
        />
    </motion.div>
  );
}
