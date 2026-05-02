export type CropCategory = 'Leafy Green' | 'Herb'

export type CropId = 'lettuce' | 'basil' | 'kale' | 'mint'

export type CropProfile = {
  id: CropId
  name: string
  category: CropCategory
  growthDays: string
  yieldPerGrid: number
  accent: string
  defaultTargetPerWeek: number
  defaultReservePercent: number
}

export const cropLibrary: CropProfile[] = [
  {
    id: 'lettuce',
    name: 'Lettuce',
    category: 'Leafy Green',
    growthDays: '28-35 days',
    yieldPerGrid: 1.2,
    accent: '#9edb66',
    defaultTargetPerWeek: 200,
    defaultReservePercent: 15,
  },
  {
    id: 'basil',
    name: 'Basil',
    category: 'Herb',
    growthDays: '25-30 days',
    yieldPerGrid: 0.6,
    accent: '#86c56a',
    defaultTargetPerWeek: 120,
    defaultReservePercent: 20,
  },
  {
    id: 'kale',
    name: 'Kale',
    category: 'Leafy Green',
    growthDays: '30-40 days',
    yieldPerGrid: 1.4,
    accent: '#64b95d',
    defaultTargetPerWeek: 160,
    defaultReservePercent: 12,
  },
  {
    id: 'mint',
    name: 'Mint',
    category: 'Herb',
    growthDays: '25-30 days',
    yieldPerGrid: 0.5,
    accent: '#73d0a8',
    defaultTargetPerWeek: 90,
    defaultReservePercent: 18,
  },
]
