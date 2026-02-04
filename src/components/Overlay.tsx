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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 2.5, ease: "easeOut" }}
        className={styles.footer}
      >
        <p className={styles.quote}>
          &ldquo;A small reminder that some gestures don’t need many words.&rdquo;
        </p>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 4.5 }}
            className={styles.subtext}
        >
          Just wanted to make you smile today.
        </motion.p>
      </motion.div>
    </div>
  );
}
