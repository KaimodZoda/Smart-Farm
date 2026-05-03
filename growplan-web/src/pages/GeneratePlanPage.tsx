import { useMemo } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  LayoutGrid,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Sprout,
  Waves,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { SetupProgress } from '../components/SetupProgress'
import { StepActions } from '../components/StepActions'
import { cropLibrary, type CropId } from '../constants/crops'
import { generatePlanData } from '../lib/planGenerator'
import { setupSteps } from '../constants/setupSteps'
import type { GeneratedPlanData, GoalData, SetupFarmData } from '../types/planning'

type GeneratePlanPageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
  generatedPlan: GeneratedPlanData | null
  onGeneratePlan: (plan: GeneratedPlanData) => void
  onBackToDefineGoal: () => void
  onContinue: () => void
}

export function GeneratePlanPage({
  farm,
  selectedCropIds,
  goalData,
  generatedPlan,
  onGeneratePlan,
  onBackToDefineGoal,
  onContinue,
}: GeneratePlanPageProps) {
  const selectedCrops = useMemo(
    () => cropLibrary.filter((crop) => selectedCropIds.includes(crop.id)),
    [selectedCropIds],
  )

  const resolvedPlan = useMemo(
    () =>
      generatedPlan ??
      generatePlanData({
        farm,
        selectedCropIds,
        goalData,
      }),
    [farm, generatedPlan, goalData, selectedCropIds],
  )

  const analysisSteps = [
    { label: 'Analyzing farm layout', progress: 100, status: 'done' as const, icon: LayoutGrid },
    { label: 'Balancing crop cycles', progress: 100, status: 'done' as const, icon: Sprout },
    { label: 'Optimizing grid allocation', progress: 100, status: 'done' as const, icon: Sparkles },
    { label: 'Scheduling seedling batches', progress: 82, status: 'running' as const, icon: Waves },
    { label: 'Forecasting harvest schedule', progress: 52, status: 'pending' as const, icon: CalendarDays },
  ]

  const accountInitials =
    farm.farmName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || 'GF'

  const handleContinue = () => {
    onGeneratePlan(resolvedPlan)
    onContinue()
  }

  return (
    <main className="setup-page">
      <AppHeader accountName={farm.farmName} accountInitials={accountInitials} />

      <section className="setup-workspace">
        <SetupProgress activeStep={4} steps={setupSteps} />

        <section className="setup-main generate-main">
          <section className="generate-engine-card">
            <h1>Generate Plan</h1>

            <div className="ai-build-panel">
              <div className="ai-build-badge">
                <Sparkles size={30} />
              </div>
              <h2>AI is building your optimal plan</h2>
              <p>This may take a minute while we analyze your farm and generate the best plan.</p>

              <div className="analysis-list">
                {analysisSteps.map((step) => {
                  const StepIcon = step.icon
                  return (
                    <article key={step.label} className="analysis-item">
                      <div className={`analysis-icon ${step.status}`}>
                        <StepIcon size={16} />
                      </div>
                      <div className="analysis-body">
                        <div className="analysis-head">
                          <p>{step.label}</p>
                          {step.status === 'done' ? (
                            <CheckCircle2 size={18} />
                          ) : step.status === 'running' ? (
                            <LoaderCircle size={18} className="spin" />
                          ) : (
                            <CircleDashed size={18} />
                          )}
                        </div>
                        <div className="analysis-track">
                          <span style={{ width: `${step.progress}%` }}></span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            <StepActions
              onBack={onBackToDefineGoal}
              onNext={handleContinue}
              backLabel="Back"
              nextLabel="View Draft Plan"
            />
          </section>

          <aside className="generate-preview-card">
            <header>
              <h2>Draft Plan Preview</h2>
              <p>Grid allocation preview</p>
            </header>

            <div className="generate-legend">
              {selectedCrops.map((crop) => (
                <span key={crop.id}>
                  <b style={{ backgroundColor: crop.accent }}></b>
                  {crop.name}
                </span>
              ))}
            </div>

            <div
              className="generate-grid"
              style={{ gridTemplateColumns: `repeat(${resolvedPlan.columns}, minmax(0, 1fr))` }}
            >
              {resolvedPlan.cells.map((cell, index) => (
                <span
                  key={index}
                  className="generate-grid-cell"
                  style={{ backgroundColor: cell.color }}
                  title={cell.label}
                ></span>
              ))}
            </div>

            <div className="mini-timeline">
              <h3>Mini Harvest Timeline</h3>
              <div className="mini-months">
                {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
              <div className="mini-rows">
                {selectedCrops.map((crop, idx) => {
                  const start = (idx % 3) + 1
                  const span = 2 + (idx % 2)
                  return (
                    <article key={crop.id} className="mini-row">
                      <small>{crop.name}</small>
                      <div className="mini-row-track">
                        <span
                          style={{
                            gridColumn: `${start} / span ${span}`,
                            backgroundColor: crop.accent,
                          }}
                        ></span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            <div className="mini-timeline nursery-mini-timeline">
              <h3>Nursery Load</h3>
              <div className="mini-months">
                {resolvedPlan.nurseryLoad.slice(0, 8).map((item) => (
                  <span key={item.week}>W{item.week}</span>
                ))}
              </div>
              <div className="mini-rows nursery-mini-rows">
                <article className="mini-row nursery-load-row">
                  <small>Active</small>
                  <div className="mini-row-track">
                    {resolvedPlan.nurseryLoad.slice(0, 8).map((item) => (
                      <span
                        key={item.week}
                        className={`nursery-load-bar risk-${item.risk.toLowerCase()}`}
                        style={{ gridColumn: `${item.week} / span 1` }}
                        title={`${item.activeSeedlings} seedlings in Week ${item.week}`}
                      ></span>
                    ))}
                  </div>
                </article>
              </div>
              <div className="nursery-batch-list">
                {resolvedPlan.cropSummaries.map((summary) => (
                  <article key={summary.cropId}>
                    <b style={{ backgroundColor: summary.color }}></b>
                    <span>{summary.label}</span>
                    <strong>{summary.seedlingsPerWeek}/week</strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="generate-metrics">
              <article>
                <p>Utilization</p>
                <strong>{resolvedPlan.utilizationPercent}%</strong>
              </article>
              <article>
                <p>Stockout risk</p>
                <strong>{resolvedPlan.stockoutRisk}</strong>
              </article>
              <article>
                <p>Expected revenue</p>
                <strong>${(resolvedPlan.expectedRevenue / 1000).toFixed(1)}k</strong>
              </article>
              <article>
                <p>Nursery risk</p>
                <strong>{resolvedPlan.seedlingCapacityRisk}</strong>
              </article>
            </div>

            <div className="generate-note">
              <ShieldCheck size={16} />
              Required {resolvedPlan.requiredCapacity.toFixed(0)} grids/week vs available{' '}
              {resolvedPlan.availableCapacity} grids/week.
            </div>

            <div className={`generate-note ${resolvedPlan.seedlingCapacityRisk === 'High' ? 'warn' : ''}`}>
              <Waves size={16} />
              Peak nursery load {Math.max(...resolvedPlan.nurseryLoad.map((item) => item.activeSeedlings), 0)} seedlings vs capacity{' '}
              {farm.nurseryCapacity}.
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
