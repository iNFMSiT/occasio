import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  RoundedBox,
  MeshTransmissionMaterial,
  Sparkles,
  Environment,
  Lightformer,
  ContactShadows,
} from '@react-three/drei';

// The lazy-loaded 3D centerpiece: a slowly tumbling glass gift box with a metallic
// ribbon and drifting sparkles. This module is the ONLY place three.js is imported,
// so it lands in its own chunk (loaded after first paint, landing-only).
//
// `active` toggles the render loop — the parent sets it false when the canvas is
// offscreen or the tab is hidden so we never burn GPU/battery on an unseen scene.

function GiftBox({ accent, sparkleColor }) {
  const group = useRef();

  // Gentle continuous spin on top of the Float bob, for a premium "hero object" feel.
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <group ref={group} scale={1.15}>
        {/* Glass body */}
        <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.14} smoothness={6}>
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}
            thickness={1.4}
            roughness={0.08}
            transmission={1}
            ior={1.4}
            chromaticAberration={0.06}
            anisotropy={0.2}
            distortion={0.2}
            distortionScale={0.3}
            color={accent}
            backside
          />
        </RoundedBox>

        {/* Ribbon — two thin metallic bands crossing the box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.62, 1.62, 0.22]} />
          <meshStandardMaterial color={accent} metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.22, 1.62, 1.62]} />
          <meshStandardMaterial color={accent} metalness={0.9} roughness={0.25} />
        </mesh>

        <Sparkles count={28} scale={3.4} size={2.6} speed={0.4} color={sparkleColor} />
      </group>
    </Float>
  );
}

export default function HeroScene({ active = true, accent = 0x7c3aed, sparkleColor = '#a78bfa' }) {
  return (
    <Canvas
      // Cap pixel ratio so retina/high-dpi phones don't render 3–4x the pixels.
      dpr={[1, 1.5]}
      // Pause the loop entirely when offscreen / tab hidden.
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 5.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} />
      <pointLight position={[-4, -2, -4]} intensity={0.6} color={sparkleColor} />

      <GiftBox accent={accent} sparkleColor={sparkleColor} />

      <ContactShadows position={[0, -1.7, 0]} opacity={0.35} scale={7} blur={2.6} far={3} />

      {/* Procedural environment for the glass reflections — no network fetch. */}
      <Environment resolution={256}>
        <Lightformer intensity={1.4} position={[0, 3, 2]} scale={4} />
        <Lightformer intensity={0.8} position={[3, 0, 2]} scale={3} color={sparkleColor} />
        <Lightformer intensity={0.6} position={[-3, 1, 1]} scale={3} />
      </Environment>
    </Canvas>
  );
}
