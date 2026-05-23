"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, PointMaterial, Points } from "@react-three/drei";
import { memo, useMemo, useRef } from "react";
import * as THREE from "three";

const BACKGROUND_PARTICLE_COUNT = 720;
const MAIN_PARTICLE_COUNT = 1740;
const CORE_NODE_COUNT = 32;
const SPARSE_ACTIVE_NODE_COUNT = 40;
const TOPOLOGY_BRIDGE_NODE_COUNT = 24;
const CONNECTION_TARGET = 46;
const FIELD_SEED = 20260523;
const TAU = Math.PI * 2;

/*
  Paper-grade visual: ink-on-cream. The accent (brick orange) is used
  sparingly on the core nodes and a few inference paths to read as a
  scientific figure rather than a sci-fi HUD.
*/
const INK = "#1f1e1b";
const INK_SOFT = "#2a2926";
const INK_FAINT = "#4a4742";
const BRAND = "#c15f3c";
const BRAND_SOFT = "#d68869";

type Vec3 = [number, number, number];

type ConnectionPath = {
  depth: number;
  opacity: number;
  phase: number;
  points: Vec3[];
  accent: boolean;
};

type SpatialData = {
  backgroundPositions: Float32Array;
  connections: ConnectionPath[];
  corePositions: Float32Array;
  mainPositions: Float32Array;
  sparseActivePositions: Float32Array;
};

type MutableLineObject = THREE.Object3D & {
  material?: THREE.Material & {
    opacity?: number;
  };
};

type ParticleLayerProps = {
  color: string;
  opacity: number;
  phase: number;
  positions: Float32Array;
  pulse: number;
  pulseSpeed: number;
  rotationDrift: number;
  rotationEnvelope: number;
  rotationXSpeed?: number;
  rotationZEnvelope?: number;
  rotationZSpeed?: number;
  size: number;
};

type AnimatedPointLayerProps = ParticleLayerProps & {
  driftAmplitude: number;
  driftSpeed: number;
};

const CLUSTER_ANCHORS: Vec3[] = [
  [-0.32, 0.18, 0.12],
  [0.26, -0.16, -0.18],
  [0.13, 0.28, -0.08],
  [-0.12, -0.24, 0.2],
  [0.34, 0.08, 0.05],
  [-0.24, -0.05, -0.22],
];

function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createFoldedPoint(random: () => number, radiusScale = 1.75): Vec3 {
  const radius = Math.pow(random(), 2.4) * radiusScale;
  const theta = random() * TAU;
  const phi = Math.acos(1 - 2 * random());

  const baseX = radius * Math.sin(phi) * Math.cos(theta);
  const baseY = radius * Math.sin(phi) * Math.sin(theta);
  const baseZ = radius * Math.cos(phi);

  const fold = Math.sin(theta * 2.35 + phi * 1.4 + radius * 5.1) * 0.08;
  const sheet = Math.cos(theta * 1.3 - phi * 2.7) * radius * 0.045;
  const turn = Math.sin((baseX + baseZ - baseY) * 4.2) * 0.026;

  return [
    baseX * 1.18 + fold + turn * 0.42,
    baseY * 0.62 + sheet - turn * 0.22,
    baseZ * 0.48 + Math.cos(theta * 0.9 + phi) * 0.045 + turn,
  ];
}

function createParticlePositions(
  random: () => number,
  count: number,
  options: {
    anchorBlend: number;
    centerPull: number;
    jitter: number;
    radiusScale: number;
  },
) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const point = createFoldedPoint(random, options.radiusScale);
    const anchor = CLUSTER_ANCHORS[Math.floor(random() * CLUSTER_ANCHORS.length)];
    const anchorStrength = random() < 0.64 ? options.anchorBlend * random() : 0;
    const collapse = options.centerPull + random() * 0.08;

    positions[index * 3] =
      (point[0] * (1 - anchorStrength) + anchor[0] * anchorStrength) *
        collapse +
      (random() - 0.5) * options.jitter;
    positions[index * 3 + 1] =
      (point[1] * (1 - anchorStrength) + anchor[1] * anchorStrength) *
        collapse +
      (random() - 0.5) * options.jitter;
    positions[index * 3 + 2] =
      (point[2] * (1 - anchorStrength) + anchor[2] * anchorStrength) *
        collapse +
      (random() - 0.5) * options.jitter;
  }

  return positions;
}

function createCoreNodes(random: () => number) {
  return Array.from({ length: CORE_NODE_COUNT }, () => {
    const point = createFoldedPoint(random, 0.72);
    const anchor = CLUSTER_ANCHORS[Math.floor(random() * CLUSTER_ANCHORS.length)];
    const anchorStrength = 0.18 + random() * 0.18;

    return [
      point[0] * (1 - anchorStrength) + anchor[0] * anchorStrength * 0.6,
      point[1] * (1 - anchorStrength) + anchor[1] * anchorStrength * 0.6,
      point[2] * (1 - anchorStrength) + anchor[2] * anchorStrength * 0.6,
    ] satisfies Vec3;
  });
}

function createTopologyBridgeNodes(random: () => number) {
  return Array.from({ length: TOPOLOGY_BRIDGE_NODE_COUNT }, (_, index) => {
    const point = createFoldedPoint(random, 1 + random() * 0.22);
    const anchor = CLUSTER_ANCHORS[index % CLUSTER_ANCHORS.length];
    const anchorStrength = 0.2 + random() * 0.16;

    return [
      point[0] * 0.84 + anchor[0] * anchorStrength,
      point[1] * 0.82 + anchor[1] * anchorStrength,
      point[2] * 0.8 + anchor[2] * anchorStrength,
    ] satisfies Vec3;
  });
}

function createSparseActivePositions(random: () => number) {
  const positions = new Float32Array(SPARSE_ACTIVE_NODE_COUNT * 3);

  for (let index = 0; index < SPARSE_ACTIVE_NODE_COUNT; index += 1) {
    const radius = 1.6 + random() * 0.8;
    const theta = random() * TAU;
    const phi = Math.acos(1 - 2 * random());
    const foldBias = Math.sin(theta * 2.1 + phi * 1.25) * 0.08;

    positions[index * 3] =
      radius * Math.sin(phi) * Math.cos(theta) * 0.82 + foldBias;
    positions[index * 3 + 1] =
      radius * Math.sin(phi) * Math.sin(theta) * 0.34 +
      Math.cos(theta * 1.7) * 0.055;
    positions[index * 3 + 2] =
      radius * Math.cos(phi) * 0.36 + Math.sin(theta * 1.15) * 0.06;
  }

  return positions;
}

function flattenNodes(nodes: Vec3[]) {
  const positions = new Float32Array(nodes.length * 3);

  nodes.forEach((node, index) => {
    positions[index * 3] = node[0];
    positions[index * 3 + 1] = node[1];
    positions[index * 3 + 2] = node[2];
  });

  return positions;
}

function distance(a: Vec3, b: Vec3) {
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  const z = a[2] - b[2];

  return Math.sqrt(x * x + y * y + z * z);
}

function createConnectionPath(
  start: Vec3,
  end: Vec3,
  index: number,
  random: () => number,
): ConnectionPath {
  const phase = random() * TAU;
  const curve = 0.015 + random() * 0.04;
  const mid: Vec3 = [
    (start[0] + end[0]) * 0.5 + Math.sin(phase) * curve,
    (start[1] + end[1]) * 0.5 + Math.cos(phase * 0.8) * curve * 0.7,
    (start[2] + end[2]) * 0.5 + Math.sin(phase * 1.2) * curve * 0.76,
  ];

  return {
    depth: 0.004 + (index % 6) * 0.0018,
    opacity: Math.min(0.32, 0.18 + (index % 6) * 0.012),
    phase,
    points: [start, mid, end],
    // ~1 in 9 edges flagged as the inferred / highlighted path
    accent: index % 9 === 0,
  };
}

function createNearestNeighborTopology(nodes: Vec3[], random: () => number) {
  const candidates: Array<{
    a: number;
    b: number;
    distance: number;
    rank: number;
  }> = [];

  nodes.forEach((node, index) => {
    const neighbors = nodes
      .map((otherNode, otherIndex) => ({
        distance: distance(node, otherNode),
        index: otherIndex,
      }))
      .filter((neighbor) => neighbor.index !== index && neighbor.distance > 0.035)
      .sort((first, second) => first.distance - second.distance)
      .slice(0, 2);

    neighbors.forEach((neighbor, rank) => {
      candidates.push({
        a: Math.min(index, neighbor.index),
        b: Math.max(index, neighbor.index),
        distance: neighbor.distance,
        rank,
      });
    });
  });

  candidates.sort((first, second) => {
    if (first.rank !== second.rank) {
      return first.rank - second.rank;
    }

    return first.distance - second.distance;
  });

  const degree = new Array(nodes.length).fill(0) as number[];
  const used = new Set<string>();
  const connections: ConnectionPath[] = [];

  for (const candidate of candidates) {
    if (connections.length >= CONNECTION_TARGET) {
      break;
    }

    const key = `${candidate.a}:${candidate.b}`;

    if (
      used.has(key) ||
      degree[candidate.a] >= 3 ||
      degree[candidate.b] >= 3 ||
      candidate.distance > 0.68
    ) {
      continue;
    }

    used.add(key);
    degree[candidate.a] += 1;
    degree[candidate.b] += 1;
    connections.push(
      createConnectionPath(
        nodes[candidate.a],
        nodes[candidate.b],
        connections.length,
        random,
      ),
    );
  }

  return connections;
}

function createSpatialData(): SpatialData {
  const random = createSeededRandom(FIELD_SEED);
  const backgroundPositions = createParticlePositions(random, BACKGROUND_PARTICLE_COUNT, {
    anchorBlend: 0.18,
    centerPull: 0.82,
    jitter: 0.01,
    radiusScale: 1.95,
  });
  const mainPositions = createParticlePositions(random, MAIN_PARTICLE_COUNT, {
    anchorBlend: 0.3,
    centerPull: 0.8,
    jitter: 0.005,
    radiusScale: 1.75,
  });
  const coreNodes = createCoreNodes(random);
  const topologyNodes = [...coreNodes, ...createTopologyBridgeNodes(random)];
  const corePositions = flattenNodes(coreNodes);
  const sparseActivePositions = createSparseActivePositions(random);
  const connections = createNearestNeighborTopology(topologyNodes, random);

  return {
    backgroundPositions,
    connections,
    corePositions,
    mainPositions,
    sparseActivePositions,
  };
}

function InferencePath({
  connection,
  pulseIndex,
}: {
  connection: ConnectionPath;
  pulseIndex: number;
}) {
  const lineRef = useRef<MutableLineObject | null>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const line = lineRef.current;

    if (!line) {
      return;
    }

    timeRef.current += Math.min(delta, 0.04);
    const time = timeRef.current;
    line.position.z = Math.sin(time * 0.16 + connection.phase) * connection.depth;

    if (line.material?.opacity !== undefined) {
      const wobble = Math.sin(time * 0.7 + pulseIndex) * 0.04;
      const base = connection.accent ? 0.45 : connection.opacity;
      line.material.opacity = THREE.MathUtils.clamp(
        base + wobble,
        connection.accent ? 0.32 : 0.12,
        connection.accent ? 0.62 : 0.32,
      );
    }
  });

  return (
    <Line
      ref={(node) => {
        lineRef.current = node as MutableLineObject | null;
      }}
      points={connection.points}
      color={connection.accent ? BRAND : INK_FAINT}
      lineWidth={connection.accent ? 0.6 : 0.4}
      transparent
      opacity={connection.opacity}
      depthWrite={false}
    />
  );
}

function ParticleLayer({
  color,
  opacity,
  phase,
  positions,
  pulse,
  pulseSpeed,
  rotationDrift,
  rotationEnvelope,
  rotationXSpeed = 0.08,
  rotationZEnvelope,
  rotationZSpeed = 0.12,
  size,
}: ParticleLayerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const points = pointsRef.current;

    if (!points) {
      return;
    }

    timeRef.current += Math.min(delta, 0.04);
    const time = timeRef.current;

    points.rotation.x = Math.sin(time * rotationXSpeed + phase) * rotationEnvelope;
    points.rotation.y = time * rotationDrift;
    points.rotation.z =
      Math.sin(time * rotationZSpeed + phase) *
      (rotationZEnvelope ?? rotationEnvelope * 0.55);
    points.scale.setScalar(1 + Math.sin(time * pulseSpeed + phase) * pulse);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </Points>
  );
}

function AnimatedPointLayer({
  color,
  driftAmplitude,
  driftSpeed,
  opacity,
  phase,
  positions,
  pulse,
  pulseSpeed,
  rotationDrift,
  rotationEnvelope,
  rotationXSpeed = 0.08,
  rotationZEnvelope,
  rotationZSpeed = 0.12,
  size,
}: AnimatedPointLayerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const points = pointsRef.current;

    if (!points) {
      return;
    }

    timeRef.current += Math.min(delta, 0.04);
    const time = timeRef.current;

    const positionAttribute = points.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute | undefined;

    if (positionAttribute) {
      const buffer = positionAttribute.array as Float32Array;

      for (let index = 0; index < positions.length / 3; index += 1) {
        const stride = index * 3;
        const seed = phase + index * 1.618;
        const localDrift = driftAmplitude * (0.72 + (index % 5) * 0.07);

        buffer[stride] =
          positions[stride] + Math.sin(time * driftSpeed + seed) * localDrift;
        buffer[stride + 1] =
          positions[stride + 1] +
          Math.cos(time * driftSpeed * 0.83 + seed * 1.27) * localDrift * 0.56;
        buffer[stride + 2] =
          positions[stride + 2] +
          Math.sin(time * driftSpeed * 0.62 + seed * 0.77) * localDrift * 0.48;
      }

      positionAttribute.needsUpdate = true;
    }

    points.rotation.x = Math.sin(time * rotationXSpeed + phase) * rotationEnvelope;
    points.rotation.y = time * rotationDrift;
    points.rotation.z =
      Math.sin(time * rotationZSpeed + phase) *
      (rotationZEnvelope ?? rotationEnvelope * 0.55);
    points.scale.setScalar(1 + Math.sin(time * pulseSpeed + phase) * pulse);
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </Points>
  );
}

function TopologyLayer({ connections }: { connections: ConnectionPath[] }) {
  const topologyRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const topology = topologyRef.current;

    if (!topology) {
      return;
    }

    timeRef.current += Math.min(delta, 0.04);
    const time = timeRef.current;
    topology.rotation.y = time * 0.025;
    topology.rotation.x = Math.sin(time * 0.18) * 0.055;
    topology.rotation.z = Math.sin(time * 0.12) * 0.02;
    topology.scale.setScalar(1 + Math.sin(time * 0.65) * 0.045);
  });

  return (
    <group ref={topologyRef}>
      {connections.map((connection, index) => (
        <InferencePath
          key={`${connection.phase.toFixed(4)}-${index}`}
          connection={connection}
          pulseIndex={index}
        />
      ))}
    </group>
  );
}

function SpatialRig({ data }: { data: SpatialData }) {
  const rigRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    const rig = rigRef.current;

    if (!rig) {
      return;
    }

    const frameDelta = Math.min(delta, 0.04);
    timeRef.current += frameDelta;
    const time = timeRef.current;

    pointer.current.x = THREE.MathUtils.damp(
      pointer.current.x,
      state.pointer.x,
      1.1,
      frameDelta,
    );
    pointer.current.y = THREE.MathUtils.damp(
      pointer.current.y,
      state.pointer.y,
      1.1,
      frameDelta,
    );

    rig.position.x = THREE.MathUtils.damp(
      rig.position.x,
      pointer.current.x * 0.04,
      1.05,
      frameDelta,
    );
    rig.position.y = THREE.MathUtils.damp(
      rig.position.y,
      pointer.current.y * 0.03,
      1.05,
      frameDelta,
    );
    rig.rotation.x = THREE.MathUtils.damp(
      rig.rotation.x,
      -pointer.current.y * 0.042 + Math.sin(time * 0.05) * 0.01,
      1.05,
      frameDelta,
    );
    rig.rotation.y = THREE.MathUtils.damp(
      rig.rotation.y,
      pointer.current.x * 0.056 + Math.sin(time * 0.045) * 0.014,
      1.05,
      frameDelta,
    );
  });

  return (
    <group ref={rigRef}>
      <ParticleLayer
        color={INK_FAINT}
        opacity={0.18}
        phase={0.4}
        positions={data.backgroundPositions}
        pulse={0.006}
        pulseSpeed={0.32}
        rotationDrift={0.004}
        rotationEnvelope={0.018}
        size={0.005}
      />
      <ParticleLayer
        color={INK_SOFT}
        opacity={0.56}
        phase={0}
        positions={data.mainPositions}
        pulse={0.045}
        pulseSpeed={0.65}
        rotationDrift={0.025}
        rotationEnvelope={0.055}
        rotationXSpeed={0.18}
        rotationZEnvelope={0.02}
        rotationZSpeed={0.12}
        size={0.011}
      />
      <TopologyLayer connections={data.connections} />
      <AnimatedPointLayer
        color={INK}
        driftAmplitude={0.052}
        driftSpeed={0.34}
        opacity={0.92}
        phase={2.6}
        positions={data.corePositions}
        pulse={0.034}
        pulseSpeed={0.65}
        rotationDrift={0.025}
        rotationEnvelope={0.052}
        rotationXSpeed={0.18}
        rotationZEnvelope={0.022}
        rotationZSpeed={0.12}
        size={0.02}
      />
      <AnimatedPointLayer
        color={BRAND_SOFT}
        driftAmplitude={0.038}
        driftSpeed={0.13}
        opacity={0.78}
        phase={3.4}
        positions={data.sparseActivePositions}
        pulse={0.018}
        pulseSpeed={0.42}
        rotationDrift={0.012}
        rotationEnvelope={0.036}
        rotationXSpeed={0.14}
        rotationZEnvelope={0.014}
        rotationZSpeed={0.08}
        size={0.012}
      />
    </group>
  );
}

function ProteinScene() {
  const data = useMemo(() => createSpatialData(), []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4.35], fov: 42, near: 0.1, far: 12 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.4} />
        <SpatialRig data={data} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-[18%] bottom-7 h-px bg-gradient-to-r from-transparent via-[rgba(31,30,27,0.18)] to-transparent" />
    </div>
  );
}

export default memo(ProteinScene);
