import { type LocationKey } from '../src/shared/dashboard.ts'

export type LiveLocationConfig = {
  key: LocationKey
  lat: number
  lon: number
  malaysiaLocationName: string
  warningAliases: string[]
}

export const liveLocationConfig: Record<LocationKey, LiveLocationConfig> = {
  tapah: {
    key: 'tapah',
    lat: 4.1972,
    lon: 101.2559,
    malaysiaLocationName: 'Tapah',
    warningAliases: ['Tapah', 'Batang Padang', 'Muallim'],
  },
  ipoh: {
    key: 'ipoh',
    lat: 4.5975,
    lon: 101.0901,
    malaysiaLocationName: 'Ipoh',
    warningAliases: ['Ipoh', 'Kinta', 'Kampar', 'Kuala Kangsar'],
  },
  taiping: {
    key: 'taiping',
    lat: 4.85,
    lon: 100.7333,
    malaysiaLocationName: 'Taiping',
    warningAliases: ['Taiping', 'Larut', 'Matang', 'Selama'],
  },
  lumut: {
    key: 'lumut',
    lat: 4.2323,
    lon: 100.6298,
    malaysiaLocationName: 'Lumut',
    warningAliases: ['Lumut', 'Manjung', 'Teluk Batik'],
  },
}
