"use client";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import styles from "./Overlay.module.css";

export default function Overlay() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        confetti({
            particleCount: 15,
            spread: 60,
            origin: { x, y },
            colors: ['#FFD700', '#FFA500', '#FDFBF7'], // Gold, Orange, Cream
            shapes: ['star'],
            gravity: 1.2,
            scalar: 0.7,
            drift: 0,
            ticks: 40
        });
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

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
        
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 8.5 }}
            onAnimationComplete={() => triggerPetalRain()}
            className={styles.subtext}
        >
          Just wanted to make you smile today.
        </motion.p>
      </div>
    </div>
  );
}

function triggerPetalRain() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ffccd5', '#ff99ac'],
      shapes: ['circle'],
      gravity: 0.6,
      scalar: 0.8,
      drift: 0.5,
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ffccd5', '#ff99ac'],
      shapes: ['circle'],
      gravity: 0.6,
      scalar: 0.8,
      drift: -0.5,
    });
  }, 250);
}
