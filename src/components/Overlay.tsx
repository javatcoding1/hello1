"use client";

import { motion } from "framer-motion";
import styles from "./Overlay.module.css";

export default function Overlay() {
  return (
    <div className={styles.overlay}>
      
      {/* Header Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className={styles.header}
      >
        <h1 className={styles.title}>
          Happy Rose Day, Navaneetha <span className={styles.roseIcon}>🌹</span>
        </h1>
      </motion.div>

      {/* Spacer for the rose in the middle */}
      <div className={styles.spacer} />

      {/* Low-key bottom text */}
      <div className={styles.footer}>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
          className={styles.message}
        >
          I know the MBA exams have been exhausting lately,
          and your body hasn’t really gotten the rest it deserves.
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 4.5, ease: "easeOut" }}
          className={styles.message}
        >
          This is just a small, quiet reminder
          to slow down for a moment and be gentle with yourself today.
        </motion.p>

        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 6.5, ease: "easeOut" }}
            className={styles.message}
        >
          Hope this brings a little calm in between everything.
        </motion.p>
      </div>
    </div>
  );
}
