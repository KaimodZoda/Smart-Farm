import type { CropId } from '../constants/crops'

export type GoalPriority = 'maximize-space' | 'minimize-stockout'

export type SetupFarmData = {
  farmName: string
  farmLocation: string
  rows: number
  columns: number
  lightingZones: number
  irrigationZones: number
  nurseryCapacity: number
  seedlingLeadDays: number
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

export type CropPlanSummary = {
  cropId: CropId
  label: string
  color: string
  allocatedCells: number
  targetPerWeek: number
  reservePercent: number
  seedlingsPerWeek: number
}

export type PlanTimelineRow = {
  cropId: CropId
  label: string
  color: string
  seedWeek: number
  transplantWeek: number
  growWeeks: number
  harvestWeek: number
}

export type NurseryBatch = {
  cropId: CropId
  label: string
  color: string
  seedWeek: number
  transplantWeek: number
  seedlings: number
  status: 'Scheduled' | 'At capacity' | 'Over capacity'
}

export type NurseryLoadWeek = {
  week: number
  activeSeedlings: number
  capacity: number
  utilizationPercent: number
  risk: 'Low' | 'Medium' | 'High'
}

export type GeneratedPlanData = {
  rows: number
  columns: number
  cells: GeneratedPlanCell[]
  utilizationPercent: number
  requiredCapacity: number
  availableCapacity: number
  stockoutRisk: 'Low' | 'Medium' | 'High'
  seedlingCapacityRisk: 'Low' | 'Medium' | 'High'
  expectedRevenue: number
  cropSummaries: CropPlanSummary[]
  timelineRows: PlanTimelineRow[]
  nurserySchedule: NurseryBatch[]
  nurseryLoad: NurseryLoadWeek[]
}
