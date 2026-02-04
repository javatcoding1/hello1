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
  roughness: 0.6, // Less glossy to avoid pink highlights
  metalness: 0.1,
  clearcoat: 0.0, 
  sheen: 0.5, // Reduced sheen to avoid washing out the red
  sheenRoughness: 0.5,
  sheenColor: new THREE.Color("#ff0000"), 
  side: THREE.DoubleSide
});

// --- Improved Rose Geometry Function (Cyclic Harmonic Rose) ---
// Generates a more natural, overlapping petal shape compared to separated petals.
// However, the best "rose" look often comes from many tightly packed separate petals.
// Let's refine the single-petal function to be TALLER and CUPPED more deeply.

const rosePetalFunction = (u: number, v: number, target: THREE.Vector3) => {
    // u (0..1): Azimuthal / curvature width
    // v (0..1): Vertical height
    
    // Taller aspect ratio for rose petals (narrow base, wide top, but tall)
    const angle = (u - 0.5) * Math.PI * 1.2; // Wider spread (1.2x PI)
    
    // Width profile: Sine based but sharply tapered at bottom
    // v^0.5 makes it wider faster at bottom? No, v^2 makes it narrow at bottom.
    // Let's use standard sine hump.
    const width = Math.sin(v * Math.PI) * 0.6; // 0.6 width factor
    
    // Base shape
    let x = width * Math.sin(angle);
    let z = width * Math.cos(angle) * 0.8; // Deep cup (0.8 depth)
    let y = v * 1.5; // Tall petal (1.5 height)
    
    // Deformations:
    // 1. Cup curve: The "belly" of the petal sticks out.
    // At v=0.5, we want z to be pushed out? 
    // Actually, simple sine cylinder segment is already cupped.
    
    // 2. Curl back at tip (v > 0.7)
    // Rotate around X axis
    const curlStart = 0.6;
    if (v > curlStart) {
        const curlFactor = (v - curlStart) / (1 - curlStart); // 0 to 1
        // Curl angle exponential
        const curlAngle = Math.pow(curlFactor, 2) * Math.PI * 0.8; 
        
        // Rotate (y, z)
        // Shift y relative to pivot at curlStart
        const pivotY = curlStart * 1.5;
        const dy = y - pivotY;
        const dz = z; // relative z?
        
        // We want to curl "backwards" (negative Z direction relative to petal face?)
        // If petal faces +Z, curl away means... positive Z? No, normal is +Z?
        // Let's just rotate.
        
        const _y = Math.cos(curlAngle) * dy - Math.sin(curlAngle) * z;
        const _z = Math.sin(curlAngle) * dy + Math.cos(curlAngle) * z;
        y = pivotY + _y;
        z = _z; 
    }
    
    // 3. Wavy edges (ruffle)
    // Perturb Z based on sin(u)
    z += Math.cos(u * Math.PI * 10) * 0.02 * v;

    target.set(x, y, z);
};


function ParametricPetal({ index, total, layer, bloom }: { index: number, total: number, layer: number, bloom: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    
    // Spiral arrangement (Phyllotaxis) is better than concentric circles for roses
    // But for simplicity of layers, let's keep layers but rotate them.
    const angleInfo = (index / total) * Math.PI * 2 + (layer * Math.PI * 0.5);
    
    useFrame(() => {
        if (meshRef.current) {
            // Animation:
            // Center petals (low layer) stay TIGHT.
            // Outer petals (high layer) fall OPEN clearly.
            
            // Bloom 0: All closed tight up (vertical or slightly inward).
            // Bloom 1: Inner slightly open, Outer fully dropped.
            
            const isInner = layer < 3;
            const isOuter = layer >= 3;
            
            // Base Angle (Closed state)
            // 0 is vertical.
            // Tip IN -> Positive X rotation? 
            // In geometry, petal stands up towards Y. Normal might be Z.
            // If we rotate X positive, tip goes BACK (negative Z).
            // If we rotate X negative, tip goes FRONT (positive Z).
            // We want petals to face Center (0,0,0).
            // They are at radius R.
            
            // Closed: Tilted IN towards center (X = 0.5?)
            // Open: Tilted OUT away from center (X = -0.5 or -1.0)
            
            const closedRot = 0.3; 
            const openRot = -1.2 - (layer * 0.2); // Outer layers drop more
            
            // Time lag: Inner layers open LATER.
            // Remap bloom (0..1)
            let localBloom = bloom;
            // if layer 0 (innermost), bloom only starts when global > 0.5
            // if layer 5 (outermost), bloom starts at 0.0
            
            const startThreshold = (5 - layer) * 0.1; // Outer starts at 0, Inner starts at 0.5
            localBloom = THREE.MathUtils.smoothstep(bloom, startThreshold, 1.0);
            
            const currentRot = THREE.MathUtils.lerp(closedRot, openRot, localBloom);
            
            meshRef.current.rotation.x = currentRot;
            
            // Breathing
            meshRef.current.position.y = (bloom * 0.2) + Math.sin(Date.now() * 0.001 + layer) * 0.01;
            // Push out radius
            meshRef.current.position.z = layer * 0.05 + (bloom * 0.1); 
        }
    })

    return (
        <group rotation={[0, angleInfo, 0]}>
             {/* Shift geometry so pivot is at base (roughly 0,0,0) */}
             <group position={[0, 0, 0.1 + layer * 0.05]}> 
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
          groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
          groupRef.current.position.y = -1.0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      }
  });

  // Dense, many layers for "Rose" look (not Lotus)
  // Lotus is flat/wide. Rose is tall/tight center.
  // We need many small inner petals.
  const layers = [
      { count: 3, scale: 0.25, y: 0.4 }, // Tight bud
      { count: 4, scale: 0.35, y: 0.35 },
      { count: 5, scale: 0.45, y: 0.3 },
      { count: 6, scale: 0.6, y: 0.25 },
      { count: 7, scale: 0.75, y: 0.2 },
      { count: 8, scale: 0.9, y: 0.15 },
      { count: 10, scale: 1.1, y: 0.1 },
      { count: 12, scale: 1.3, y: 0.05 }, // Outer
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
                     <PetalWrapper 
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

function PetalWrapper({ index, total, layer, bloomRef }: any) {
    return <ParametricPetal index={index} total={total} layer={layer} bloom={0} />;
}

// Fix: PetalWrapper was not passing the Ref value correctly in previous step, 
// causing static look. We need to read the ref INSIDE the component that animates.
// Actually ParametricPetal consumes the prop 'bloom'. 
// We need a component that reads the ref and passes the value, or reads the ref inside useFrame.

// Let's rewrite the wrapper to read ref.
function PetalWrapperCorrected({ index, total, layer, bloomRef }: any) {
    // We can't force re-render of this component easily from the ref.
    // So we must use a component that hooks into useFrame and updates the Ref-based animation itself.
    // `ParametricPetal` as defined above ALREADY HAS useFrame but it takes `bloom` as a prop?
    // In my previous code `ParametricPetal` took `bloom` as a number.
    // I need to change `ParametricPetal` to accept `bloomRef`.
    
    return <ParametricPetalWithRef index={index} total={total} layer={layer} bloomRef={bloomRef} />;
}

function ParametricPetalWithRef({ index, total, layer, bloomRef }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const angleInfo = (index / total) * Math.PI * 2 + (layer * Math.PI * 0.618); // Golden ratio offset to avoid lining up
    
    useFrame(() => {
        if (meshRef.current) {
            const bloom = bloomRef.current.value;
             
             // Bloom Logic Copied & Refined for "Rose" vs "Lotus"
             // Rose: Center remains closed longer.
             
             // Thresholds for opening
             // Layer 0 (Inner): Starts opening at bloom > 0.8
             // Layer 7 (Outer): Starts opening at bloom > 0.0
             
             const maxLayer = 7; 
             // normalized layer 0..1
             const layerNorm = layer / maxLayer; 
             
             // Inverse start time: Outer starts first.
             // start = (1 - layerNorm) * 0.5? 
             // Outer (1) starts at 0. Inner (0) starts at 0.5.
             const startT = (1 - Math.min(layerNorm, 1)) * 0.2; // Outer starts early
             const endT = 0.5 + (1 - Math.min(layerNorm, 1)) * 0.5; // Staggered end
             
             const localBloom = THREE.MathUtils.smoothstep(bloom, startT, endT);
             
             // Rotations
             // Closed: 0.5 (Tucked in tight)
             // Open: -0.4 (Still somewhat upward/cupped, not flat)
             // Previous open was -1.0 which is too flat/lotus-like.
             
             const closedRot = 0.5; 
             const baseOpenRot = -0.4; // Much more upright
             // Outer layers can drop a bit more, but not too much
             const openRot = baseOpenRot - (layerNorm * 0.4); 
             
             // If innermost, keep very upright
             let targetRot = openRot;
             if (layer < 2) targetRot = 0.2; // Inner stays positive (cupped in)
             
             const currentRot = THREE.MathUtils.lerp(closedRot, targetRot, localBloom);
             
             meshRef.current.rotation.x = currentRot;
             
             // Expand Radius slightly less to keep tight form
             meshRef.current.position.z = layer * 0.04 + (localBloom * 0.1);
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
