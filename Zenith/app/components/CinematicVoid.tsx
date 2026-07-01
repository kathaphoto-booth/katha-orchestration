'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * CinematicVoid.tsx
 * A high-fidelity React component rendering a timeless, quiet luxury void.
 * backdropped by slow-moving volumetric leaks and geometrically precise sheer threads.
 * 
 * Generated and orchestrated via GLM-5 Visual Director.
 */

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec3 uObsidian;
  uniform vec3 uKobeRust;
  uniform vec3 uBlackCoffee;
  
  varying vec2 vUv;

  #define WARP_SCALE 24.0
  #define WEFT_SCALE 24.0
  #define THREAD_WIDTH 0.03

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Woven thread pattern
  float wovenPattern(vec2 uv, float scale) {
    vec2 grid = fract(uv * scale);
    vec2 id = floor(uv * scale);
    
    // Warp threads
    float warp = smoothstep(0.5 - THREAD_WIDTH, 0.5, grid.x) * 
                 smoothstep(0.5 + THREAD_WIDTH, 0.5, grid.x);
    
    // Weft threads
    float weft = smoothstep(0.5 - THREAD_WIDTH, 0.5, grid.y) * 
                 smoothstep(0.5 + THREAD_WIDTH, 0.5, grid.y);
    
    float interlace = mod(id.x + id.y, 2.0);
    float woven = mix(warp, weft, interlace);
    
    return woven;
  }

  // Subtle thread shimmer
  float threadShimmer(vec2 uv, float time) {
    float shimmer = sin(uv.x * 80.0 + time * 2.0) * sin(uv.y * 80.0 - time * 1.5);
    return shimmer * 0.015 + 0.985; 
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 aspectUv = vec2(uv.x * aspect, uv.y);
    
    // Quick reveal phase from uProgress
    float revealPhase = smoothstep(0.0, 0.8, uProgress);
    
    // Diagonal sweep logic
    float diagonal = (uv.x + uv.y) * 0.5;
    float edge = revealPhase * 1.5 - 0.2; 
    
    // Reveal is 0 when ahead of the sweep, 1 when behind the sweep
    float reveal = 1.0 - smoothstep(edge - 0.05, edge + 0.05, diagonal);
    
    // Woven texture
    float woven = wovenPattern(aspectUv, WARP_SCALE);
    
    // Thread shimmer
    float shimmer = threadShimmer(aspectUv, uTime);
    
    // Color composition
    vec3 baseColor = mix(uObsidian, uBlackCoffee, woven * 0.5);
    baseColor = mix(baseColor, uKobeRust, woven * reveal * shimmer * 0.35);
    baseColor *= shimmer;
    
    // Highlight at the exact wavefront edge
    vec3 ecru = vec3(0.925, 0.906, 0.859);
    float distToEdge = abs(diagonal - edge);
    float edgeHighlight = smoothstep(0.06, 0.0, distToEdge) * reveal * woven;
    baseColor = mix(baseColor, ecru * 0.5, edgeHighlight);
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.3;
    
    // The canvas is opaque (alpha: false), so we must multiply by reveal to fade from true black
    vec3 finalColor = baseColor * reveal * vignette;
    
    // We add a tiny bit of Obsidian base so it doesn't stay pitch black when unrevealed, but rather a very dark void
    vec3 unrevealedVoid = uObsidian * 0.3 * vignette;
    finalColor = mix(unrevealedVoid, finalColor, reveal);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const CinematicVoid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const uniforms = {
      uTime: { value: 0.0 },
      uProgress: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uObsidian: { value: new THREE.Color('#161311') },
      uKobeRust: { value: new THREE.Color('#882D17') },
      uBlackCoffee: { value: new THREE.Color('#3D352E') },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    };
    window.addEventListener('resize', handleResize);

    let startTime: number | null = null;
    const duration = 1200; // 1.2s for the rapid lattice reveal

    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      
      const rawProgress = Math.min(elapsed / duration, 1);
      // Premium ease-out-expo (Math.pow 4)
      const progress = 1 - Math.pow(1 - rawProgress, 4);
      
      uniforms.uProgress.value = progress;
      uniforms.uTime.value = elapsed * 0.001;
      
      renderer.render(scene, camera);
    };
    
    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 w-full h-full bg-black overflow-hidden"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default CinematicVoid;
