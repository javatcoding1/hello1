"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { Rose } from "./Rose";
import { Suspense, useEffect } from "react";

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    // If width is small (mobile), move camera back
    const isMobile = size.width < 768;
    // Default Z is 7. Mobile needs more distance (~9-10) or wider FOV.
    // Let's just animate/set position.
    if (isMobile) {
        camera.position.z = 10;
        camera.position.y = 2.5; // Look down a bit more
    } else {
        camera.position.z = 7;
        camera.position.y = 2;
    }
  }, [camera, size.width]);

  return null;
}

export default function Scene() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 2, 7], fov: 40 }} 
        gl={{ antialias: false, alpha: false, toneMappingExposure: 1.2 }}
        dpr={[1, 1.5]} 
      >
        <color attach="background" args={['#1a0505']} /> 
        
        <ResponsiveCamera />

        <Suspense fallback={null}>
            {/* Environment for natural reflections on velvet */}
            <Environment preset="studio" />
            
            {/* Cinematic Lighting System */}
            
            {/* 1. Main Key Light (Warm, from top-right) */}
            <spotLight 
                position={[5, 10, 5]} 
                angle={0.3} 
                penumbra={0.5} 
                intensity={8} 
                color="#ffcccc" 
                castShadow
            />
            
            {/* 2. Fill Light (Soft pink/cool, from left) */}
            <pointLight position={[-5, 0, 5]} intensity={2} color="#ffb7b2" />
            
            {/* 3. Rim Light (Gold/Orange, from back-left for silhouette) */}
            {/* Crucial for velvet material definition */}
            <spotLight 
                position={[-5, 5, -5]} 
                angle={0.5} 
                penumbra={1} 
                intensity={15} 
                color="#ffaa00" 
            />
            
            {/* 4. Ambient floor glow */}
            <ambientLight intensity={0.5} color="#553333" />
            
            <Rose />

            {/* Premium Gold Sparkles */}
            <Sparkles 
                count={80} 
                scale={10} 
                size={3} 
                speed={0.2} 
                opacity={0.6} 
                color="#e6c200" // Gold
            />

            {/* Post Processing */}
            <EffectComposer>
                <Bloom 
                    luminanceThreshold={0.8} // Only very bright things glow
                    intensity={0.8} 
                    mipmapBlur // Softer, dreamier bloom
                />
                <Noise opacity={0.03} />
                <Vignette eskil={false} offset={0.3} darkness={0.8} />
            </EffectComposer>
            
            <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                autoRotate 
                autoRotateSpeed={0.3} // Slower, more elegant
                maxPolarAngle={Math.PI / 2} 
                minPolarAngle={Math.PI / 3}
            />
        </Suspense>
      </Canvas>
    </div>
  );
}
