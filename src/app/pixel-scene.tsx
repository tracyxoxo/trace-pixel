"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type Props = { pixels: (string | null)[][] };

function PixelBlocks({ pixels }: Props) {
  const group = useRef<Group>(null);
  const rows = pixels.length;
  const columns = pixels[0]?.length ?? 0;
  const gap = 0.045;
  const size = 0.17;
  const blocks = pixels.flatMap((row, y) => row.flatMap((color, x) => color ? [{
    key: `${x}-${y}`,
    color,
    x: (x - (columns - 1) / 2) * (size + gap),
    z: (y - (rows - 1) / 2) * (size + gap),
  }] : []));

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.24) * 0.045;
  });

  return (
    <group ref={group}>
      {blocks.map((block) => (
        <mesh key={block.key} position={[block.x, 0.08, block.z]} castShadow receiveShadow>
          <boxGeometry args={[size, 0.16, size]} />
          <meshStandardMaterial color={block.color} roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[columns * (size + gap) + 0.18, 0.12, rows * (size + gap) + 0.18]} />
        <meshStandardMaterial color="#e4ebe1" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function PixelScene({ pixels }: Props) {
  return (
    <div className="pixel-scene">
      <Canvas camera={{ position: [0, 4.8, 7], fov: 39 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={["#edf1e9"]} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[-3, 7, 4]} intensity={2.2} castShadow />
        <PixelBlocks pixels={pixels} />
        <OrbitControls autoRotate autoRotateSpeed={0.6} enablePan={false} minDistance={5} maxDistance={11} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
      <span className="scene-caption">RASTER / EXTRUDED</span>
    </div>
  );
}
