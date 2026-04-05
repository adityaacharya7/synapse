/* eslint-disable react/no-unknown-property */
// @ts-nocheck
'use client';
import { Suspense, useEffect, useRef, useState, Component } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from './card.glb';
import lanyardTexture from './lanyard.png';

import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

class LanyardErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.warn('Lanyard 3D error:', error); }
  render() {
    if (this.state.hasError) return this.props.fallback || (
      <div className="lanyard-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '1.5rem' }}>
        <p style={{ color: '#999', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>3D preview unavailable</p>
      </div>
    );
    return this.props.children;
  }
}

export interface LanyardUserData {
  name?: string;
  avatar?: string;
  graduationYear?: string;
  currentLevel?: string;
  targetRole?: string;
}

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  userData?: LanyardUserData;
}

// Draw a simple back side for the card
function drawBackCanvas(logoImg?: HTMLImageElement): HTMLCanvasElement {
  const W = 900, H = 1264; // matching card face
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, 'rgba(30, 15, 60, 0.95)');
  bg.addColorStop(0.5, 'rgba(25, 12, 55, 0.95)');
  bg.addColorStop(1, 'rgba(20, 10, 48, 0.95)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(124, 58, 237, 0.35)';
  ctx.lineWidth = 4;
  ctx.roundRect(6, 6, W - 12, H - 12, 14);
  ctx.stroke();

  const cx = W / 2;
  const cy = H / 2;

  if (logoImg) {
    const logoS = 280;
    ctx.globalAlpha = 0.8; // subtle transparency for back logo
    ctx.drawImage(logoImg, cx - logoS / 2, cy - logoS / 2 - 80, logoS, logoS);
    ctx.globalAlpha = 1.0;
  }

  // "SYNAPSE" text
  ctx.font = '900 64px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
  ctx.fillText('S Y N A P S E', cx, cy + 120);

  // Decorative dots
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx - 18 + i * 18, H - 50, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(124, 58, 237, 0.4)';
    ctx.fill();
  }

  return c;
}

// Draw user info onto a canvas for the overlay plane (standard UV, no GLB mapping issues)
function drawOverlayCanvas(userData?: LanyardUserData, logoImg?: HTMLImageElement): HTMLCanvasElement {
  const W = 900, H = 1264; // ~0.71 aspect ratio matching card face
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // Transparent base (we'll see the dark card behind)
  ctx.clearRect(0, 0, W, H);

  // Deep purple background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, 'rgba(30, 15, 60, 0.95)');
  bg.addColorStop(0.5, 'rgba(25, 12, 55, 0.95)');
  bg.addColorStop(1, 'rgba(20, 10, 48, 0.95)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 16);
  ctx.fill();

  // Subtle purple border
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.35)';
  ctx.lineWidth = 4;
  ctx.roundRect(6, 6, W - 12, H - 12, 14);
  ctx.stroke();

  // Top accent line
  const accent = ctx.createLinearGradient(W * 0.15, 0, W * 0.85, 0);
  accent.addColorStop(0, 'rgba(124, 58, 237, 0)');
  accent.addColorStop(0.5, 'rgba(124, 58, 237, 0.7)');
  accent.addColorStop(1, 'rgba(59, 130, 246, 0)');
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W * 0.15, 36);
  ctx.lineTo(W * 0.85, 36);
  ctx.stroke();

  const cx = W / 2;
  let y = 80;

  // Synapse logo
  if (logoImg) {
    const logoS = 220;
    ctx.drawImage(logoImg, cx - logoS / 2, y, logoS, logoS);
    y += logoS + 30;
  }

  // "SYNAPSE" text
  ctx.font = '900 56px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#a78bfa';
  ctx.fillText('S Y N A P S E', cx, y);
  y += 80;

  // Divider
  const divGrad = ctx.createLinearGradient(cx - 140, 0, cx + 140, 0);
  divGrad.addColorStop(0, 'rgba(124, 58, 237, 0)');
  divGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.5)');
  divGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 140, y);
  ctx.lineTo(cx + 140, y);
  ctx.stroke();
  y += 55;

  // Avatar circle
  const avatarR = 120;
  const avatarCY = y + avatarR;
  const aGrad = ctx.createLinearGradient(cx - avatarR, avatarCY - avatarR, cx + avatarR, avatarCY + avatarR);
  aGrad.addColorStop(0, '#7c3aed');
  aGrad.addColorStop(1, '#3b82f6');
  ctx.beginPath();
  ctx.arc(cx, avatarCY, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = aGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Initial letter
  const init = (userData?.name || 'S').charAt(0).toUpperCase();
  ctx.font = `900 108px "Inter", "Segoe UI", sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(init, cx, avatarCY + 3);
  y = avatarCY + avatarR + 50;

  // Name
  const name = userData?.name || 'Synapse Student';
  ctx.font = '900 82px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let dName = name;
  while (ctx.measureText(dName).width > W - 100 && dName.length > 3) dName = dName.slice(0, -1);
  if (dName !== name) dName += '…';
  ctx.fillText(dName, cx, y);
  y += 100;

  // Class info
  const classInfo = `Class of ${userData?.graduationYear || '2025'} · ${userData?.currentLevel || 'Beginner'}`;
  ctx.font = '600 46px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(classInfo, cx, y);
  y += 72;

  // Role badge
  const role = (userData?.targetRole || 'Student').toUpperCase();
  ctx.font = '800 42px "Inter", "Segoe UI", sans-serif';
  const roleTextW = ctx.measureText(role).width;
  const roleW = roleTextW + 72;
  const roleH = 64;
  const roleX = cx - roleW / 2;
  const bGrad = ctx.createLinearGradient(roleX, y, roleX + roleW, y + roleH);
  bGrad.addColorStop(0, 'rgba(124, 58, 237, 0.35)');
  bGrad.addColorStop(1, 'rgba(59, 130, 246, 0.35)');
  ctx.fillStyle = bGrad;
  ctx.beginPath();
  ctx.roundRect(roleX, y, roleW, roleH, roleH / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#c4b5fd';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, cx, y + roleH / 2);

  // Bottom decorative dots
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx - 18 + i * 18, H - 50, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(124, 58, 237, 0.4)';
    ctx.fill();
  }

  return c;
}


export default function Lanyard({
  position = [0, 0, 6],
  gravity = [0, -40, 0],
  fov = 45,
  transparent = true,
  userData
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LanyardErrorBoundary>
      <div className="lanyard-wrapper">
        <Canvas
          camera={{ position, fov }}
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{ alpha: transparent, antialias: true, powerPreference: 'default' }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={Math.PI} />
            <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
              <Band isMobile={isMobile} userData={userData} />
            </Physics>
            <Environment blur={0.75}>
              <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
            </Environment>
          </Suspense>
        </Canvas>
      </div>
    </LanyardErrorBoundary>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  userData?: LanyardUserData;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, userData }: BandProps) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const { width, height } = useThree((state) => state.size);
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: any = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const { nodes, materials } = useGLTF(cardGLB) as any;
  const strapTexture = useTexture(lanyardTexture);
  useEffect(() => {
    strapTexture.anisotropy = 16;
    strapTexture.needsUpdate = true;
  }, [strapTexture]);

  // Overlay texture — drawn onto its own plane, bypassing GLB UV mapping
  const [overlayTexture] = useState<THREE.CanvasTexture>(() => {
    const canvas = drawOverlayCanvas(userData);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  });

  const [backOverlayTexture] = useState<THREE.CanvasTexture>(() => {
    const canvas = drawBackCanvas();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  });

  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    logo.onload = () => {
      overlayTexture.image = drawOverlayCanvas(userData, logo);
      overlayTexture.needsUpdate = true;
      backOverlayTexture.image = drawBackCanvas(logo);
      backOverlayTexture.needsUpdate = true;
    };
    logo.onerror = () => {
      overlayTexture.image = drawOverlayCanvas(userData);
      overlayTexture.needsUpdate = true;
      backOverlayTexture.image = drawBackCanvas();
      backOverlayTexture.needsUpdate = true;
    };
  }, [userData?.name, userData?.graduationYear, userData?.currentLevel, userData?.targetRole, overlayTexture, backOverlayTexture]);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.5]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.5]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.5]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  strapTexture.wrapS = strapTexture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 2.4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type={'fixed'} />
        <RigidBody position={[0.2, 0, 0]} ref={j1} {...segmentProps} type={'dynamic'}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.4, 0, 0]} ref={j2} {...segmentProps} type={'dynamic'}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.6, 0, 0]} ref={j3} {...segmentProps} type={'dynamic'}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[0.8, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={3.0}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            {/* Original card mesh (dark background) */}
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                color="#1a0b2e"
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>
            {/* Clip and clamp removed for cleaner look — strap connects directly */}

            {/* Overlay plane — shifted down slightly on card face */}
            <mesh position={[0, 0.48, 0.01]} renderOrder={1}>
              <planeGeometry args={[0.68, 0.96]} />
              <meshBasicMaterial
                map={overlayTexture}
                depthTest={false}
                transparent
                depthWrite={false}
              />
            </mesh>

            {/* Back Overlay plane — rotated 180 degrees */}
            <mesh position={[0, 0.48, -0.01]} rotation={[0, Math.PI, 0]} renderOrder={1}>
              <planeGeometry args={[0.68, 0.96]} />
              <meshBasicMaterial
                map={backOverlayTexture}
                depthTest={false}
                transparent
                depthWrite={false}
              />
            </mesh>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={true}
          resolution={[width, height]}
          useMap
          map={strapTexture}
          repeat={[4, 1]}
          lineWidth={isMobile ? 1.5 : 1}
        />
      </mesh>
    </>
  );
}
