import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

const shaderGradientProps = {
  animate: 'on',
  axesHelper: 'off',
  bgColor1: '#000000',
  bgColor2: '#000000',
  brightness: 1.2,
  cAzimuthAngle: 170,
  cDistance: 3.4,
  cPolarAngle: 70,
  cameraZoom: 1,
  color1: '#4aeaff',
  color2: '#6bf5ff',
  color3: '#ffffff',
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
  reflection: 0.1,
  rotationX: 45,
  rotationY: 0,
  rotationZ: 0,
  shader: 'defaults',
  type: 'waterPlane',
  uAmplitude: 0,
  uDensity: 1.2,
  uFrequency: 0,
  uSpeed: 0.2,
  uStrength: 3.4,
  uTime: 0,
  wireframe: false,
} as const

export function ShaderGradientBackground() {
  return (
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
  )
}
