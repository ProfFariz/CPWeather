import { type LocationKey } from '../src/shared/dashboard.ts'

export type LiveLocationConfig = {
  key: LocationKey
  lat: number
  lon: number
  malaysiaLocationName: string
  hikeTarget: string
  warningAliases: string[]
}

export const liveLocationConfig: Record<LocationKey, LiveLocationConfig> = {
  tapah: {
    key: 'tapah',
    lat: 4.1972,
    lon: 101.2559,
    malaysiaLocationName: 'Tapah',
    hikeTarget: 'Lata Iskandar route',
    warningAliases: ['Tapah', 'Batang Padang', 'Muallim'],
  },
  ipoh: {
    key: 'ipoh',
    lat: 4.5975,
    lon: 101.0901,
    malaysiaLocationName: 'Ipoh',
    hikeTarget: 'Kledang Hill route',
    warningAliases: ['Ipoh', 'Kinta', 'Kampar', 'Kuala Kangsar'],
  },
  'cameron-highlands': {
    key: 'cameron-highlands',
    lat: 4.4709,
    lon: 101.376,
    malaysiaLocationName: 'Cameron Highlands',
    hikeTarget: 'Cameron Highlands ridge walk',
    warningAliases: ['Cameron Highlands', 'Cameron', 'Tanah Rata', 'Brinchang'],
  },
  taiping: {
    key: 'taiping',
    lat: 4.85,
    lon: 100.7333,
    malaysiaLocationName: 'Taiping',
    hikeTarget: 'Bukit Larut route',
    warningAliases: ['Taiping', 'Larut', 'Matang', 'Selama'],
  },
  lumut: {
    key: 'lumut',
    lat: 4.2323,
    lon: 100.6298,
    malaysiaLocationName: 'Lumut',
    hikeTarget: 'Teluk Batik coastal trail',
    warningAliases: ['Lumut', 'Manjung', 'Teluk Batik'],
  },
  gopeng: {
    key: 'gopeng',
    lat: 4.4698,
    lon: 101.1647,
    malaysiaLocationName: 'Gopeng',
    hikeTarget: 'Gua Tempurung route',
    warningAliases: ['Gopeng', 'Kampar', 'Kinta', 'Gua Tempurung'],
  },
  gerik: {
    key: 'gerik',
    lat: 5.4273,
    lon: 101.1342,
    malaysiaLocationName: 'Gerik',
    hikeTarget: 'Royal Belum trail',
    warningAliases: ['Gerik', 'Grik', 'Hulu Perak', 'Royal Belum', 'Belum'],
  },
  'kampong-gajah': {
    key: 'kampong-gajah',
    lat: 4.1849,
    lon: 100.9381,
    malaysiaLocationName: 'Kampong Gajah',
    hikeTarget: 'Bukit Tunggal',
    warningAliases: ['Kampong Gajah', 'Kampung Gajah', 'Perak Tengah', 'Pasir Salak', 'Bota'],
  },
  sungkai: {
    key: 'sungkai',
    lat: 3.9973,
    lon: 101.3062,
    malaysiaLocationName: 'Sungkai',
    hikeTarget: 'Sungai Klah route',
    warningAliases: ['Sungkai', 'Batang Padang', 'Slim River', 'Bidor'],
  },
  'teluk-intan': {
    key: 'teluk-intan',
    lat: 4.0222,
    lon: 101.0208,
    malaysiaLocationName: 'Teluk Intan',
    hikeTarget: 'Kuala Gula boardwalk',
    warningAliases: ['Teluk Intan', 'Hilir Perak', 'Kuala Gula', 'Hutan Melintang'],
  },
}
