import Image from "next/image";
"use client";

import dynamic from 'next/dynamic';
import Overlay from '@/components/Overlay';
import { CatAnimation } from '@/components/CatAnimation';

// Dynamically import Scene to avoid SSR issues with Canvas/WebGL
const Scene = dynamic(() => import('@/components/Scene'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#000000]" /> // Fallback background
});

export default function Home() {
  return (
    <main style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#000000' }}>
      <Scene />
      <Overlay />
      <CatAnimation />
    </main>
  );
}
