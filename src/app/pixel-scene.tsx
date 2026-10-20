"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Props = { pixels: (string | null)[][] };

function PixelBlocks({ pixels }: Props) {
  const group = useRef<Group>(null);
  const rows = pixels.length;
  const columns = pixels[0]?.length ?? 0;
  const gap = 0.045;
  const size = 0.17;

  const blocks = useMemo(() => {
    return pixels.flatMap((row, y) =>
      row.flatMap((color, x) =>
        color
          ? [
              {
                key: `${x}-${y}`,
                color,
                x: (x - (columns - 1) / 2) * (size + gap),
                z: (y - (rows - 1) / 2) * (size + gap),
              },
            ]
          : []
      )
    );
  }, [pixels, columns, rows]);

  return (
    <group ref={group}>
      {blocks.map((block) => (
        <mesh key={block.key} position={[block.x, 0.08, block.z]} castShadow receiveShadow>
          <boxGeometry args={[size, 0.16, size]} />
          <meshStandardMaterial color={block.color} roughness={0.65} metalness={0.08} />
        </mesh>
      ))}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[columns * (size + gap) + 0.25, 0.12, rows * (size + gap) + 0.25]} />
        <meshStandardMaterial color="#e4ebe1" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function PixelScene({ pixels }: Props) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  function handleZoomIn() {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
      controlsRef.current.update();
    }
  }

  function handleZoomOut() {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
      controlsRef.current.update();
    }
  }

  function handleResetCamera() {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }

  return (
    <div className="pixel-scene">
      <Canvas
        camera={{ position: [0, 5.2, 7.5], fov: 40 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#edf1e9"]} />
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[-4, 8, 5]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[4, 5, -3]} intensity={0.6} />
        <PixelBlocks pixels={pixels} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 8}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Floating 3D Navigation Controls */}
      <div className="scene-controls-overlay">
        <button
          className="scene-control-btn"
          onClick={handleZoomIn}
          title="Aproximar visualização (+)"
          aria-label="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          className="scene-control-btn"
          onClick={handleZoomOut}
          title="Afastar visualização (-)"
          aria-label="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          className="scene-control-btn"
          onClick={handleResetCamera}
          title="Restaurar posição original da câmera"
          aria-label="Restaurar Câmera"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="scene-interactive-tip">
        <span>🖱️ Arraste para orbitar · Role para zoom</span>
      </div>

      <span className="scene-caption">RASTER / EXTRUDED 3D VOXELS</span>
    </div>
  );
}
