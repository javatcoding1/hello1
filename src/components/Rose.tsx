"use client";

import { useRef } from "react";
import { useFrame, extend, ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";

extend({ ParametricGeometry });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      parametricGeometry: ReactThreeFiber.Object3DNode<ParametricGeometry, typeof ParametricGeometry>;
    }
  }
}

// --- Materials ---
const ROSE_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#880000"), // Pure Deep Red
  emissive: new THREE.Color("#330000"),
  emissiveIntensity: 0.1,
  roughness: 0.6, 
  metalness: 0.1,
  clearcoat: 0.0, 
  sheen: 0.5,
  sheenRoughness: 0.5,
  sheenColor: new THREE.Color("#ff0000"), 
  side: THREE.DoubleSide
});

// --- Rose Geometry Function ---
const rosePetalFunction = (u: number, v: number, target: THREE.Vector3) => {
    const angle = (u - 0.5) * Math.PI * 1.2; 
    const width = Math.sin(v * Math.PI) * 0.6;
    
    let x = width * Math.sin(angle);
    let z = width * Math.cos(angle) * 0.8; 
    let y = v * 1.5; 
    
    // Curl back at tip
    const curlStart = 0.6;
    if (v > curlStart) {
        const curlFactor = (v - curlStart) / (1 - curlStart);
        const curlAngle = Math.pow(curlFactor, 2) * Math.PI * 0.8; 
        const pivotY = curlStart * 1.5;
        const dy = y - pivotY;
        
        const _y = Math.cos(curlAngle) * dy - Math.sin(curlAngle) * z;
        const _z = Math.sin(curlAngle) * dy + Math.cos(curlAngle) * z;
        y = pivotY + _y;
        z = _z; 
    }
    
    // Wavy edges
    z += Math.cos(u * Math.PI * 10) * 0.02 * v;
    target.set(x, y, z);
};

function ParametricPetal({ index, total, layer, bloomRef }: { index: number, total: number, layer: number, bloomRef: React.MutableRefObject<{ value: number }> }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const angleInfo = (index / total) * Math.PI * 2 + (layer * Math.PI * 0.618);
    
    useFrame((state) => {
        if (meshRef.current) {
             const bloom = bloomRef.current.value;
             
             // Bloom Logic
             const maxLayer = 7; 
             const layerNorm = layer / maxLayer; 
             const startT = (1 - Math.min(layerNorm, 1)) * 0.2; 
             const endT = 0.5 + (1 - Math.min(layerNorm, 1)) * 0.5;
             const localBloom = THREE.MathUtils.smoothstep(bloom, startT, endT);
             
             // Rotations
             const closedRot = 0.5; 
             const baseOpenRot = -0.4;
             const openRot = baseOpenRot - (layerNorm * 0.4); 
             
             let targetRot = openRot;
             if (layer < 2) targetRot = 0.2; // Inner stays cupped
             
             const currentRot = THREE.MathUtils.lerp(closedRot, targetRot, localBloom);
             meshRef.current.rotation.x = currentRot;
             
             // Position Expansion
             meshRef.current.position.z = layer * 0.04 + (localBloom * 0.1);

             // Subtle Breathing Animation (Living Flower Effect)
             const time = state.clock.elapsedTime;
             const breath = Math.sin(time * 2 + layer) * 0.005; // Gentle oscillation
             meshRef.current.position.y = breath;
             meshRef.current.rotation.z = Math.cos(time * 1.5 + layer) * 0.02; // Subtle swaying
        }
    })

    return (
        <group rotation={[0, angleInfo, 0]}>
             <group position={[0, 0, 0.05 + layer * 0.02]}> 
                 <mesh ref={meshRef} material={ROSE_MATERIAL}>
                    <parametricGeometry args={[rosePetalFunction, 20, 20]} /> 
                 </mesh>
             </group>
        </group>
    );
}

export function Rose() {
  const groupRef = useRef<THREE.Group>(null);
  const bloomState = useRef({ value: 0 });

  useFrame((state, delta) => {
      // Bloom 0 -> 1 very slowly
      bloomState.current.value = THREE.MathUtils.damp(bloomState.current.value, 1, 0.1, delta);
      
      if (groupRef.current) {
          // General rotation
          groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
          // Floating
          groupRef.current.position.y = -1.0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      }
  });

  const layers = [
      { count: 3, scale: 0.25, y: 0.4 }, 
      { count: 4, scale: 0.35, y: 0.35 },
      { count: 5, scale: 0.45, y: 0.3 },
      { count: 6, scale: 0.6, y: 0.25 },
      { count: 7, scale: 0.75, y: 0.2 },
      { count: 8, scale: 0.9, y: 0.15 },
      { count: 10, scale: 1.1, y: 0.1 },
      { count: 12, scale: 1.3, y: 0.05 },
  ];

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
        {/* Stem */}
        <mesh position={[0, -3, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 6, 16]} />
            <meshStandardMaterial color="#3a5f0b" roughness={0.8} />
        </mesh>

        {layers.map((layer, lIdx) => (
             <group key={lIdx} position={[0, layer.y, 0]} scale={layer.scale}>
                 {Array.from({ length: layer.count }).map((_, pIdx) => (
                     <ParametricPetal 
                        key={pIdx} 
                        index={pIdx} 
                        total={layer.count} 
                        layer={lIdx} 
                        bloomRef={bloomState} 
                    />
                 ))}
             </group>
        ))}
        
        {/* Inner glow/stamen */}
        <pointLight position={[0, 0.5, 0]} intensity={1.0} color="#ff3333" distance={1.5} />
    </group>
  );
}
