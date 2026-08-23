import { Region, RegionCategory } from '../types';

export interface RegionMetadata {
  id: Region;
  label: string;
  category: RegionCategory | 'ALL';
  center: [number, number];
  zoom: number;
  description: string;
  defaultZoneId: string;
  stateFilter?: string;
  bounds?: [[number, number], [number, number]];
}

export const REGIONS: Record<Region, RegionMetadata> = {
  'india': {
    id: 'india',
    label: 'All India',
    category: 'ALL',
    center: [22.5, 79.5],
    zoom: 5,
    description: 'National Hill Ranges, Escarpments & Mountain Belts',
    defaultZoneId: 'Z-WAY-01'
  },
  'western-ghats': {
    id: 'western-ghats',
    label: 'Western Ghats',
    category: 'Western Ghats',
    center: [13.2, 75.8],
    zoom: 7,
    description: 'Kerala, Maharashtra, Karnataka & Goa Escarpments',
    defaultZoneId: 'Z-WAY-01'
  },
  'western-himalayas': {
    id: 'western-himalayas',
    label: 'Western Himalayas',
    category: 'Western Himalayas',
    center: [31.5, 77.8],
    zoom: 7,
    description: 'Uttarakhand, Himachal Pradesh & Jammu-Kashmir Belts',
    defaultZoneId: 'Z-UTK-05'
  },
  'eastern-himalayas': {
    id: 'eastern-himalayas',
    label: 'Eastern Himalayas',
    category: 'Eastern Himalayas',
    center: [27.3, 88.4],
    zoom: 8,
    description: 'Sikkim, North Bengal (Darjeeling & Kalimpong) & Tista Valley',
    defaultZoneId: 'Z-SKM-09'
  },
  'northeast-hills': {
    id: 'northeast-hills',
    label: 'Northeast Hills',
    category: 'Northeast Hills',
    center: [25.5, 92.5],
    zoom: 7,
    description: 'Assam (Dima Hasao), Meghalaya (Khasi Hills) & Indo-Burma Arc',
    defaultZoneId: 'Z-ASM-10'
  },
  'nilgiris-eastern': {
    id: 'nilgiris-eastern',
    label: 'Nilgiris / Eastern',
    category: 'Eastern Ghats & Nilgiris',
    center: [13.5, 78.5],
    zoom: 7,
    description: 'Tamil Nadu Nilgiri Massif, Andhra Pradesh & Odisha Ghats',
    defaultZoneId: 'Z-NIL-04'
  }
};

export const REGION_LIST: RegionMetadata[] = Object.values(REGIONS);
export const REGION_DEFINITIONS = REGIONS;

export function regionToCategory(region: Region): RegionCategory | 'ALL' {
  return REGIONS[region]?.category || 'ALL';
}

export function categoryToRegion(category: RegionCategory | 'ALL'): Region {
  const found = REGION_LIST.find((r) => r.category === category);
  return found ? found.id : 'india';
}
