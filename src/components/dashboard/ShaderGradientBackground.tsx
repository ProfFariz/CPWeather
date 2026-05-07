import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

const shaderGradientProps = {
  animate: 'on',
  axesHelper: 'off',
  bgColor1: '#ecfdf5',
  bgColor2: '#f0fdfa',
  brightness: 1.3,
  cAzimuthAngle: 170,
  cDistance: 3.4,
  cPolarAngle: 70,
  cameraZoom: 1,
  color1: '#10b981',
  color2: '#14b8a6',
  color3: '#38bdf8',
  destination: 'onCanvas',
  embedMode: 'off',
  envPreset: 'city',
  format: 'gif',
  fov: 45,
  frameRate: 10,
  gizmoHelper: 'hide',
  grain: 'off',
  lightType: '3d',
  pixelDensity: 1,
  positionX: 0.1,
  positionY: 1.3,
  positionZ: -0.3,
  range: 'disabled',
  rangeEnd: 40,
  rangeStart: 0,
  reflection: 0.15,
  rotationX: 45,
  rotationY: 0,
  rotationZ: 0,
  shader: 'defaults',
  type: 'waterPlane',
  uAmplitude: 0,
  uDensity: 1.0,
  uFrequency: 0,
  uSpeed: 0.15,
  uStrength: 2.8,
  uTime: 0,
  wireframe: false,
} as const

export function ShaderGradientBackground() {
  return (
    <>
      <div aria-hidden="true" className="shader-gradient-background">
        <ShaderGradientCanvas
          fov={45}
          pixelDensity={1}
          pointerEvents="none"
          style={{ height: '100%', width: '100%' }}
        >
          <ShaderGradient {...shaderGradientProps} />
        </ShaderGradientCanvas>
      </div>
      <div aria-hidden="true" className="noise-overlay" />
      <div aria-hidden="true" className="nature-orb nature-orb-1" />
      <div aria-hidden="true" className="nature-orb nature-orb-2" />
      <div aria-hidden="true" className="nature-orb nature-orb-3" />
    </>
  )
}
