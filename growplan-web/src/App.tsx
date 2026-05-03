import { useState } from 'react'
import './App.css'
import { cropLibrary, type CropId } from './constants/crops'
import { generatePlanData } from './lib/planGenerator'
import { DefineGoalPage } from './pages/DefineGoalPage'
import { ConfirmPlanPage } from './pages/ConfirmPlanPage'
import { DashboardPage } from './pages/DashboardPage'
import { GeneratePlanPage } from './pages/GeneratePlanPage'
import { ReplanPage } from './pages/ReplanPage'
import { SelectCropsPage } from './pages/SelectCropsPage'
import { SetupFarmPage } from './pages/SetupFarmPage'
import { WelcomePage } from './pages/WelcomePage'
import { WorkSchedulePage } from './pages/WorkSchedulePage'
import type { CropGoalsById, GeneratedPlanData, GoalData, SetupFarmData } from './types/planning'

type Page =
  | 'welcome'
  | 'setup-farm'
  | 'select-crops'
  | 'define-goal'
  | 'generate-plan'
  | 'confirm-plan'
  | 'dashboard'
  | 'replan'
  | 'work-schedule-employer'
  | 'work-schedule-employee'

const createInitialSetupFarmData = (): SetupFarmData => ({
  farmName: 'GreenRise Farm',
  farmLocation: 'Bangkok',
  rows: 10,
  columns: 12,
  lightingZones: 3,
  irrigationZones: 2,
  nurseryCapacity: 240,
  seedlingLeadDays: 14,
  growingSystem: 'Hydroponic NFT',
  lightingAssignments: [],
  irrigationAssignments: [],
})

const createInitialCropGoals = (): CropGoalsById => {
  return cropLibrary.reduce(
    (acc, crop) => ({
      ...acc,
      [crop.id]: {
        targetPerWeek: 0,
        reservePercent: crop.defaultReservePercent,
      },
    }),
    {} as CropGoalsById,
  )
}

const createInitialGoalData = (): GoalData => ({
  planningHorizon: '8 weeks',
  priority: 'maximize-space',
  cropGoals: createInitialCropGoals(),
})

function App() {
  const [page, setPage] = useState<Page>('welcome')
  const [setupFarmData, setSetupFarmData] = useState<SetupFarmData>(createInitialSetupFarmData)
  const [selectedCropIds, setSelectedCropIds] = useState<CropId[]>(
    cropLibrary.map((crop) => crop.id),
  )
  const [goalData, setGoalData] = useState<GoalData>(createInitialGoalData)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanData | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])

  if (page === 'dashboard') {
    return (
      <DashboardPage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        goalData={goalData}
        generatedPlan={generatedPlan}
        onBackToConfirm={() => setPage('confirm-plan')}
        onOpenReplan={() => setPage('replan')}
        onOpenWorkSchedule={() => setPage('work-schedule-employer')}
      />
    )
  }

  if (page === 'work-schedule-employer') {
    return (
      <WorkSchedulePage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        goalData={goalData}
        generatedPlan={generatedPlan}
        mode="employer"
        completedTaskIds={completedTaskIds}
        onToggleTask={(taskId) => {
          setCompletedTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
          )
        }}
        onBack={() => setPage('dashboard')}
      />
    )
  }

  if (page === 'work-schedule-employee') {
    return (
      <WorkSchedulePage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        goalData={goalData}
        generatedPlan={generatedPlan}
        mode="employee"
        completedTaskIds={completedTaskIds}
        onToggleTask={(taskId) => {
          setCompletedTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
          )
        }}
        onBack={() => setPage('welcome')}
      />
    )
  }

  if (page === 'replan') {
    return (
      <ReplanPage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        goalData={goalData}
        generatedPlan={generatedPlan}
        onBackToDashboard={() => setPage('dashboard')}
        onApplyPlan={(nextPlan) => {
          setGeneratedPlan(nextPlan)
          setPage('dashboard')
        }}
      />
    )
  }

  if (page === 'confirm-plan') {
    return (
      <ConfirmPlanPage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        goalData={goalData}
        generatedPlan={generatedPlan}
        onBackToGenerate={() => setPage('generate-plan')}
        onConfirm={() => setPage('dashboard')}
      />
    )
  }

  if (page === 'generate-plan') {
    return (
      <GeneratePlanPage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        goalData={goalData}
        generatedPlan={generatedPlan}
        onGeneratePlan={(nextPlan) => setGeneratedPlan(nextPlan)}
        onBackToDefineGoal={() => setPage('define-goal')}
        onContinue={() => setPage('confirm-plan')}
      />
    )
  }

  if (page === 'define-goal') {
    return (
      <DefineGoalPage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        initialGoalData={goalData}
        onBackToSelectCrops={() => setPage('select-crops')}
        onContinue={(nextGoalData) => {
          setGoalData(nextGoalData)
          setGeneratedPlan(generatePlanData({
            farm: setupFarmData,
            selectedCropIds,
            goalData: nextGoalData,
          }))
          setPage('generate-plan')
        }}
      />
    )
  }

  if (page === 'select-crops') {
    return (
      <SelectCropsPage
        farmName={setupFarmData.farmName}
        selectedCropIds={selectedCropIds}
        onBackToSetup={() => setPage('setup-farm')}
        onContinue={(nextSelectedCropIds) => {
          setSelectedCropIds(nextSelectedCropIds)
          setGeneratedPlan(null)
          setPage('define-goal')
        }}
      />
    )
  }

  if (page === 'setup-farm') {
    return (
      <SetupFarmPage
        initialData={setupFarmData}
        onBackToWelcome={() => setPage('welcome')}
        onContinue={(nextSetupFarmData) => {
          setSetupFarmData(nextSetupFarmData)
          setGeneratedPlan(null)
          setPage('select-crops')
        }}
      />
    )
  }

  return (
    <WelcomePage
      onOpenEmployer={() => setPage('setup-farm')}
      onOpenEmployee={() => setPage('work-schedule-employee')}
    />
  )
}

export default App
