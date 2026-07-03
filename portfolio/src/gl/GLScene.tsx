import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ImageDistortionMaterial } from './ImageDistortionMaterial';

// Extend R3F so it knows about our custom material
extend({ ImageDistortionMaterial });


interface WebGLImageProps {
  url: string;
  isHovered: boolean;
}

const WebGLImage: React.FC<WebGLImageProps> = ({ url, isHovered }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<any>(null);
  const texture = useTexture(url);

  useFrame((state) => {
    if (material.current) {
      // Animate time
      material.current.uTime = state.clock.elapsedTime;
      // Smoothly interpolate hover state for organic feeling
      material.current.uHoverState = THREE.MathUtils.lerp(
        material.current.uHoverState,
        isHovered ? 1 : 0,
        0.1
      );
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1, 32, 32]} />
      {/* @ts-ignore */}
      <imageDistortionMaterial
        ref={material}
        uTexture={texture}
        transparent
      />
    </mesh>
  );
};

interface GLSceneProps {
  activeImageUrl: string | null;
}

export const GLScene: React.FC<GLSceneProps> = ({ activeImageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for Performance (Stop WebGL when offscreen)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh',
        pointerEvents: 'none', 
        zIndex: 'var(--z-canvas)',
        opacity: activeImageUrl ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}
    >
      {/* Only render Canvas if container is visible to save battery */}
      {isVisible && activeImageUrl && (
        <Canvas camera={{ position: [0, 0, 1], fov: 50 }}>
          <WebGLImage url={activeImageUrl} isHovered={!!activeImageUrl} />
        </Canvas>
      )}
    </div>
  );
};
