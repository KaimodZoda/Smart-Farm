import { useState } from 'react'
import './App.css'
import { cropLibrary, type CropId } from './constants/crops'
import { DefineGoalPage } from './pages/DefineGoalPage'
import { SelectCropsPage } from './pages/SelectCropsPage'
import { SetupFarmPage } from './pages/SetupFarmPage'
import { WelcomePage } from './pages/WelcomePage'
import type { CropGoalsById, GoalData, SetupFarmData } from './types/planning'

type Page = 'welcome' | 'setup-farm' | 'select-crops' | 'define-goal'

const createInitialSetupFarmData = (): SetupFarmData => ({
  farmName: 'GreenRise Farm',
  farmLocation: 'Bangkok',
  rows: 10,
  columns: 12,
  lightingZones: 3,
  irrigationZones: 2,
  growingSystem: 'Hydroponic NFT',
  lightingAssignments: [],
  irrigationAssignments: [],
})

const createInitialCropGoals = (): CropGoalsById => {
  return cropLibrary.reduce(
    (acc, crop) => ({
      ...acc,
      [crop.id]: {
        targetPerWeek: crop.defaultTargetPerWeek,
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

  if (page === 'define-goal') {
    return (
      <DefineGoalPage
        farm={setupFarmData}
        selectedCropIds={selectedCropIds}
        initialGoalData={goalData}
        onBackToSelectCrops={() => setPage('select-crops')}
        onContinue={(nextGoalData) => {
          setGoalData(nextGoalData)
          setPage('define-goal')
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
          setPage('select-crops')
        }}
      />
    )
  }

  return <WelcomePage onStartDemo={() => setPage('setup-farm')} />
}

export default App
