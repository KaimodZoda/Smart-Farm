import type { CropId } from '../constants/crops'

export type GoalPriority = 'maximize-space' | 'minimize-stockout'

export type SetupFarmData = {
  farmName: string
  farmLocation: string
  rows: number
  columns: number
  lightingZones: number
  irrigationZones: number
  growingSystem: string
  lightingAssignments: number[]
  irrigationAssignments: number[]
}

export type CropGoal = {
  targetPerWeek: number
  reservePercent: number
}

export type CropGoalsById = Record<CropId, CropGoal>

export type GoalData = {
  planningHorizon: string
  priority: GoalPriority
  cropGoals: CropGoalsById
}

export type GeneratedPlanCell = {
  cropId: CropId
  color: string
  label: string
}

export type GeneratedPlanData = {
  rows: number
  columns: number
  cells: GeneratedPlanCell[]
  utilizationPercent: number
  requiredCapacity: number
  availableCapacity: number
  stockoutRisk: 'Low' | 'Medium' | 'High'
  expectedRevenue: number
}
