"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Link to Gymnopédie No. 1 (Erik Satie) - Public Domain / CC0
  const AUDIO_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Kevin_MacLeod_-_Erik_Satie_Gymnopedie_No_1.ogg";

  useEffect(() => {
    // Attempt auto-play gently
    const playPromise = audioRef.current?.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        // Auto-play was prevented
        console.log("Auto-play prevented, waiting for user interaction");
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <audio ref={audioRef} src={AUDIO_URL} loop />
      
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-[var(--bg-warm-cream)]/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-[var(--accent-rose-gold)] text-[var(--text-primary)] transition-colors hover:bg-white"
        aria-label={isPlaying ? "Mute music" : "Play music"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        {isPlaying ? (
          <Volume2 size={24} strokeWidth={1.5} />
        ) : (
          <VolumeX size={24} strokeWidth={1.5} />
        )}
      </motion.button>
    </div>
  );
}
