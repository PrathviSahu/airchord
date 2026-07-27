import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ── Lightfall GLSL ported into Three.js as a fullscreen background quad ──
// Exact settings from reactbits.dev/backgrounds/lightfall screenshot:
//   Color 1: #000000, Color 2: #101011, Color 3: #b378b1
//   Speed: 0.3, StreakCount: 3, StreakWidth: 1, StreakLength: 0.8
//   Density: 0.7, Twinkle: 1, Glow: 1, BgGlow: 0.6, Zoom: 3
//   MouseStrength: 0.5, MouseRadius: 0.55

// Vertex: bypass MVP completely, output NDC coords directly
const vert = /* glsl */`
void main() {
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

const frag = /* glsl */`
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

// Up to 8 streak colors
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}

void main() {
  // Fragment coord from NDC: reconstruct pixel position
  vec2 fragCoord = (gl_FragCoord.xy);
  vec4 color;
  mainImage(color, fragCoord);
  gl_FragColor = color;
}
`

function hexToVec3(hex: string): THREE.Vector3 {
  const c = hex.replace('#', '').padEnd(6, '0')
  return new THREE.Vector3(
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  )
}

// Settings matching the React Bits screenshot exactly
const COLORS = ['#000000', '#101011', '#b378b1']
const BG_COLOR = '#000000'

export default function LightfallBackground() {
  const { size, gl } = useThree()
  const mouseRef = useRef<[number, number]>([0, 0])

  // Build uniforms once
  const uniforms = useRef<Record<string, THREE.IUniform>>({
    iResolution: { value: new THREE.Vector3(size.width, size.height, 1) },
    iMouse:      { value: new THREE.Vector2(0, 0) },
    iTime:       { value: 0 },
    uColor0: { value: hexToVec3(COLORS[0] ?? '#000000') },
    uColor1: { value: hexToVec3(COLORS[1] ?? COLORS[0] ?? '#000000') },
    uColor2: { value: hexToVec3(COLORS[2] ?? COLORS[1] ?? '#000000') },
    uColor3: { value: hexToVec3(COLORS[2] ?? '#000000') },
    uColor4: { value: hexToVec3(COLORS[2] ?? '#000000') },
    uColor5: { value: hexToVec3(COLORS[2] ?? '#000000') },
    uColor6: { value: hexToVec3(COLORS[2] ?? '#000000') },
    uColor7: { value: hexToVec3(COLORS[2] ?? '#000000') },
    uColorCount:   { value: COLORS.length },
    uBgColor:      { value: hexToVec3(BG_COLOR) },
    uMouseColor:   { value: hexToVec3(COLORS[2] ?? '#b378b1') },
    uSpeed:        { value: 0.3 },
    uStreakCount:  { value: 3 },
    uStreakWidth:  { value: 1.0 },
    uStreakLength: { value: 0.8 },
    uGlow:         { value: 1.0 },
    uDensity:      { value: 0.7 },
    uTwinkle:      { value: 1.0 },
    uZoom:         { value: 3.0 },
    uBgGlow:       { value: 0.6 },
    uOpacity:      { value: 1.0 },
    uMouseEnabled: { value: 1.0 },
    uMouseStrength:{ value: 0.5 },
    uMouseRadius:  { value: 0.55 },
  })

  // Track mouse over the canvas
  useEffect(() => {
    const canvas = gl.domElement
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = [
        (e.clientX - rect.left) * (canvas.width / rect.width),
        canvas.height - (e.clientY - rect.top) * (canvas.height / rect.height),
      ]
    }
    canvas.addEventListener('mousemove', onMove)
    return () => canvas.removeEventListener('mousemove', onMove)
  }, [gl])

  useFrame(({ clock, size: s }) => {
    uniforms.current.iTime.value = clock.getElapsedTime()
    ;(uniforms.current.iResolution.value as THREE.Vector3).set(
      s.width * window.devicePixelRatio,
      s.height * window.devicePixelRatio,
      1,
    )
    // Smooth mouse damping
    const cur = uniforms.current.iMouse.value as THREE.Vector2
    const [tx, ty] = mouseRef.current
    cur.x += (tx - cur.x) * 0.12
    cur.y += (ty - cur.y) * 0.12
  })

  return (
    // renderOrder=-100 → drawn first (behind guitar)
    // depthTest/depthWrite=false → doesn't interfere with 3D depth
    <mesh renderOrder={-100}>
      {/* 2×2 plane in NDC space — vertex shader will pin it to screen */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms.current}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
