import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, Goal, ShieldCheck, Sparkles } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { SetupProgress } from '../components/SetupProgress'
import { StepActions } from '../components/StepActions'
import { cropLibrary, type CropId } from '../constants/crops'
import { generatePlanData } from '../lib/planGenerator'
import { setupSteps } from '../constants/setupSteps'
import type { CropGoalsById, GoalData, GoalPriority, SetupFarmData } from '../types/planning'

type DefineGoalPageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  initialGoalData: GoalData
  onBackToSelectCrops: () => void
  onContinue: (goalData: GoalData) => void
}

const planningOptions = ['4 weeks', '8 weeks', '12 weeks', '16 weeks']

export function DefineGoalPage({
  farm,
  selectedCropIds,
  initialGoalData,
  onBackToSelectCrops,
  onContinue,
}: DefineGoalPageProps) {
  const [planningHorizon, setPlanningHorizon] = useState(initialGoalData.planningHorizon)
  const [priority, setPriority] = useState<GoalPriority>(initialGoalData.priority)
  const [cropGoals, setCropGoals] = useState<CropGoalsById>(initialGoalData.cropGoals)

  const selectedCrops = useMemo(
    () => cropLibrary.filter((crop) => selectedCropIds.includes(crop.id)),
    [selectedCropIds],
  )

  const optimizationLabel = useMemo(() => {
    return priority === 'maximize-space' ? 'Maximize space utilization' : 'Minimize stockout risk'
  }, [priority])

  const totalTargetPerWeek = useMemo(() => {
    return selectedCrops.reduce((total, crop) => total + (cropGoals[crop.id]?.targetPerWeek ?? 0), 0)
  }, [cropGoals, selectedCrops])

  const averageReserve = useMemo(() => {
    if (selectedCrops.length === 0) return 0
    const totalReserve = selectedCrops.reduce(
      (total, crop) => total + (cropGoals[crop.id]?.reservePercent ?? 0),
      0,
    )
    return Math.round(totalReserve / selectedCrops.length)
  }, [cropGoals, selectedCrops])

  const capacityState = useMemo(() => {
    const availableCapacityPerWeek = farm.rows * farm.columns
    const requiredGridPerWeek = selectedCrops.reduce((total, crop) => {
      const target = cropGoals[crop.id]?.targetPerWeek ?? 0
      const reserve = cropGoals[crop.id]?.reservePercent ?? 0
      const targetWithReserve = target * (1 + reserve / 100)
      return total + targetWithReserve / crop.yieldPerGrid
    }, 0)
    return {
      availableCapacityPerWeek,
      requiredGridPerWeek,
      exceeded: requiredGridPerWeek > availableCapacityPerWeek,
    }
  }, [cropGoals, farm.columns, farm.rows, selectedCrops])

  const planPreview = useMemo(
    () =>
      generatePlanData({
        farm,
        selectedCropIds,
        goalData: {
          planningHorizon,
          priority,
          cropGoals,
        },
      }),
    [cropGoals, farm, planningHorizon, priority, selectedCropIds],
  )

  const totalSeedlingsPerWeek = useMemo(() => {
    return planPreview.cropSummaries.reduce((sum, summary) => sum + summary.seedlingsPerWeek, 0)
  }, [planPreview.cropSummaries])

  const peakNurseryWeek = useMemo(() => {
    return planPreview.nurseryLoad.reduce(
      (peak, week) => (week.activeSeedlings > peak.activeSeedlings ? week : peak),
      planPreview.nurseryLoad[0] ?? {
        week: 1,
        activeSeedlings: 0,
        capacity: farm.nurseryCapacity,
        utilizationPercent: 0,
        risk: 'Low' as const,
      },
    )
  }, [farm.nurseryCapacity, planPreview.nurseryLoad])

  const updateTarget = (cropId: CropId, nextValue: number) => {
    const safeTarget = Math.max(0, nextValue || 0)
    setCropGoals((prev) => ({
      ...prev,
      [cropId]: {
        ...prev[cropId],
        targetPerWeek: safeTarget,
      },
    }))
  }

  const updateReserve = (cropId: CropId, nextValue: number) => {
    const safeReserve = Math.min(50, Math.max(0, nextValue || 0))
    setCropGoals((prev) => ({
      ...prev,
      [cropId]: {
        ...prev[cropId],
        reservePercent: safeReserve,
      },
    }))
  }

  const accountInitials =
    farm.farmName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || 'GF'

  const handleContinue = () => {
    onContinue({
      planningHorizon,
      priority,
      cropGoals,
    })
  }

  return (
    <main className="setup-page">
      <AppHeader accountName={farm.farmName} accountInitials={accountInitials} />

      <section className="setup-workspace">
        <SetupProgress activeStep={3} steps={setupSteps} />

        <section className="setup-main goal-main">
          <section className="define-goal-card">
            <header className="define-goal-header">
              <h1>Define Goal</h1>
              <p>Set your production targets and business priorities.</p>
            </header>

            <section className="goal-section">
              <h2>Production Targets</h2>

              <div className="crop-goal-list">
                {selectedCrops.map((crop) => {
                  const config = cropGoals[crop.id]

                  return (
                    <article key={crop.id} className="crop-goal-item">
                      <div className="crop-goal-head">
                        <div className="selected-thumb" style={{ backgroundColor: crop.accent }}>
                          {crop.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p>{crop.name}</p>
                          <small>{crop.category}</small>
                        </div>
                      </div>

                      <div className="goal-input-row">
                        <label>
                          Goal / week (kg)
                          <input
                            type="number"
                            min={0}
                            max={1000}
                            value={config.targetPerWeek}
                            onChange={(event) => updateTarget(crop.id, Number(event.target.value))}
                          />
                        </label>
                        <label>
                          Reserve ({config.reservePercent}%)
                          <input
                            type="range"
                            min={0}
                            max={50}
                            step={1}
                            value={config.reservePercent}
                            onChange={(event) => updateReserve(crop.id, Number(event.target.value))}
                          />
                        </label>
                      </div>

                      <div className="goal-derived-row">
                        <span>Estimated seedlings / week</span>
                        <strong>
                          {planPreview.cropSummaries.find((summary) => summary.cropId === crop.id)
                            ?.seedlingsPerWeek ?? 0}
                        </strong>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="goal-section">
              <h2>Planning horizon</h2>
              <label className="horizon-field">
                <CalendarDays size={18} />
                <select value={planningHorizon} onChange={(event) => setPlanningHorizon(event.target.value)}>
                  {planningOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </label>
              <small>AI will plan production across this time period.</small>
            </section>

            <section className="goal-section">
              <h2>Optimization priority</h2>
              <div className="priority-switch">
                <button
                  type="button"
                  className={`priority-btn ${priority === 'maximize-space' ? 'active' : ''}`}
                  onClick={() => setPriority('maximize-space')}
                >
                  <Goal size={16} />
                  Maximize space utilization
                </button>
                <button
                  type="button"
                  className={`priority-btn ${priority === 'minimize-stockout' ? 'active' : ''}`}
                  onClick={() => setPriority('minimize-stockout')}
                >
                  <ShieldCheck size={16} />
                  Minimize stockout risk
                </button>
              </div>
              <small>Choose the primary objective for plan optimization.</small>
            </section>

            <StepActions onBack={onBackToSelectCrops} onNext={handleContinue} nextLabel="Generate Plan" />
          </section>

          <aside className="goal-summary-card">
            <h2>Goal Summary</h2>

            <div className="goal-summary-list">
              <article>
                <Goal size={22} />
                <div>
                  <p>Total target</p>
                  <strong>{totalTargetPerWeek} kg / week</strong>
                  <small>Across {selectedCrops.length} selected crops</small>
                </div>
              </article>
              <article>
                <ShieldCheck size={22} />
                <div>
                  <p>Average reserve</p>
                  <strong>{averageReserve}%</strong>
                  <small>Inventory safety buffer</small>
                </div>
              </article>
              <article>
                <CalendarDays size={22} />
                <div>
                  <p>Planning horizon</p>
                  <strong>{planningHorizon}</strong>
                  <small>Rolling window</small>
                </div>
              </article>
              <article>
                <Goal size={22} />
                <div>
                  <p>Optimization priority</p>
                  <strong>{optimizationLabel}</strong>
                  <small>Primary objective</small>
                </div>
              </article>
              <article>
                <Sparkles size={22} />
                <div>
                  <p>Seedlings / week</p>
                  <strong>{totalSeedlingsPerWeek}</strong>
                  <small>Derived from crop rotation and reserve</small>
                </div>
              </article>
            </div>

            <div className={`goal-alert ${capacityState.exceeded ? 'warning' : 'ok'}`}>
              <p>
                {capacityState.exceeded
                  ? 'Capacity constraints detected'
                  : 'Capacity is within range'}
              </p>
              <span>
                Required ~{capacityState.requiredGridPerWeek.toFixed(0)} grids/week vs available{' '}
                {capacityState.availableCapacityPerWeek} grids/week.
              </span>
            </div>

            <div
              className={`goal-alert ${planPreview.seedlingCapacityRisk === 'High' ? 'warning' : 'ok'}`}
            >
              <p>
                {planPreview.seedlingCapacityRisk === 'High'
                  ? 'Nursery capacity risk detected'
                  : 'Nursery capacity is within range'}
              </p>
              <span>
                Peak nursery load is {peakNurseryWeek.activeSeedlings} seedlings in Week{' '}
                {peakNurseryWeek.week} vs capacity {farm.nurseryCapacity}.
              </span>
            </div>

            <div className="goal-alert info">
              <p>What happens next?</p>
              <span>
                AgriMatrix will analyze your farm, crops, and constraints to generate an efficient
                planting and harvest plan.
              </span>
              <Sparkles size={16} />
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
