import { useMemo } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  LayoutGrid,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Sprout,
  Waves,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { SetupProgress } from '../components/SetupProgress'
import { StepActions } from '../components/StepActions'
import { cropLibrary, type CropId } from '../constants/crops'
import { generatePlanData } from '../lib/planGenerator'
import type { GeneratedPlanData, GoalData, NurseryBatch, NurseryLoadWeek, SetupFarmData } from '../types/planning'

type ReplanPageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
  generatedPlan: GeneratedPlanData | null
  onBackToDashboard: () => void
  onApplyPlan: (plan: GeneratedPlanData) => void
}

const replanSteps = [
  { id: 1, title: 'Confirmed Plan', subtitle: 'Use the locked dashboard plan' },
  { id: 2, title: 'Incident', subtitle: 'Lettuce delay detected' },
  { id: 3, title: 'Re-plan', subtitle: 'Update schedule and nursery load' },
  { id: 4, title: 'Apply', subtitle: 'Send suggestion back to dashboard' },
]

const getNurseryRisk = (utilizationPercent: number): NurseryLoadWeek['risk'] => {
  if (utilizationPercent >= 100) return 'High'
  if (utilizationPercent >= 80) return 'Medium'
  return 'Low'
}

const rebuildNurseryLoad = ({
  batches,
  horizonWeeks,
  capacity,
}: {
  batches: NurseryBatch[]
  horizonWeeks: number
  capacity: number
}): NurseryLoadWeek[] => {
  return Array.from({ length: horizonWeeks }, (_, weekIndex) => {
    const week = weekIndex + 1
    const activeSeedlings = batches
      .filter((batch) => batch.seedWeek <= week && batch.transplantWeek > week)
      .reduce((sum, batch) => sum + batch.seedlings, 0)
    const utilizationPercent = capacity > 0 ? Math.round((activeSeedlings / capacity) * 100) : 0

    return {
      week,
      activeSeedlings,
      capacity,
      utilizationPercent,
      risk: getNurseryRisk(utilizationPercent),
    }
  })
}

const createLettuceDelayReplan = (plan: GeneratedPlanData, farm: SetupFarmData): GeneratedPlanData => {
  const horizonWeeks = Math.max(8, plan.nurseryLoad.length)
  const seedlingLeadWeeks = Math.max(1, Math.ceil(farm.seedlingLeadDays / 7))

  const timelineRows = plan.timelineRows.map((row) => {
    if (row.cropId !== 'lettuce') return row

    const transplantWeek = Math.min(horizonWeeks, row.transplantWeek + 1)
    const harvestWeek = Math.min(horizonWeeks, row.harvestWeek + 1)

    return {
      ...row,
      transplantWeek,
      harvestWeek,
      growWeeks: Math.max(1, harvestWeek - transplantWeek),
    }
  })

  const shiftedSchedule = plan.nurserySchedule.map((batch) => {
    if (batch.cropId !== 'lettuce') return batch

    const transplantWeek = Math.min(horizonWeeks, batch.transplantWeek + 1)
    const seedWeek = Math.max(1, transplantWeek - seedlingLeadWeeks)

    return {
      ...batch,
      seedWeek,
      transplantWeek,
    }
  })

  const nurseryLoad = rebuildNurseryLoad({
    batches: shiftedSchedule,
    horizonWeeks,
    capacity: farm.nurseryCapacity,
  })

  const peakNurseryWeek = nurseryLoad.reduce(
    (peak, week) => (week.activeSeedlings > peak.activeSeedlings ? week : peak),
    nurseryLoad[0] ?? {
      week: 1,
      activeSeedlings: 0,
      capacity: farm.nurseryCapacity,
      utilizationPercent: 0,
      risk: 'Low' as const,
    },
  )

  const statusByTransplantWeek = new Map<number, NurseryBatch['status']>()
  nurseryLoad.forEach((week) => {
    const status =
      week.risk === 'High' ? 'Over capacity' : week.risk === 'Medium' ? 'At capacity' : 'Scheduled'
    statusByTransplantWeek.set(week.week + 1, status)
  })

  return {
    ...plan,
    timelineRows,
    nurserySchedule: shiftedSchedule.map((batch) => ({
      ...batch,
      status: statusByTransplantWeek.get(batch.transplantWeek) ?? 'Scheduled',
    })),
    nurseryLoad,
    seedlingCapacityRisk: peakNurseryWeek.risk,
    stockoutRisk: plan.stockoutRisk === 'High' ? 'High' : 'Medium',
    expectedRevenue: Math.round(plan.expectedRevenue * 0.96),
  }
}

export function ReplanPage({
  farm,
  selectedCropIds,
  goalData,
  generatedPlan,
  onBackToDashboard,
  onApplyPlan,
}: ReplanPageProps) {
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

  const replannedPlan = useMemo(
    () => createLettuceDelayReplan(resolvedPlan, farm),
    [farm, resolvedPlan],
  )

  const peakNurseryLoad = useMemo(() => {
    return replannedPlan.nurseryLoad.reduce(
      (peak, item) => (item.activeSeedlings > peak.activeSeedlings ? item : peak),
      replannedPlan.nurseryLoad[0] ?? {
        week: 1,
        activeSeedlings: 0,
        capacity: farm.nurseryCapacity,
        utilizationPercent: 0,
        risk: 'Low' as const,
      },
    )
  }, [farm.nurseryCapacity, replannedPlan.nurseryLoad])

  const analysisSteps = [
    { label: 'Locking confirmed farm grid', progress: 100, status: 'done' as const, icon: LayoutGrid },
    { label: 'Reading incident: Lettuce delay +5 days', progress: 100, status: 'done' as const, icon: AlertTriangle },
    { label: 'Shifting Lettuce grow and harvest window', progress: 100, status: 'done' as const, icon: Sprout },
    { label: 'Rebalancing nursery queue', progress: 88, status: 'running' as const, icon: Waves },
    { label: 'Preparing operator-facing explanation', progress: 62, status: 'pending' as const, icon: CalendarDays },
  ]

  const accountInitials =
    farm.farmName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || 'GF'

  return (
    <main className="setup-page">
      <AppHeader accountName={farm.farmName} accountInitials={accountInitials} />

      <section className="setup-workspace">
        <SetupProgress activeStep={3} steps={replanSteps} />

        <section className="setup-main generate-main replan-main">
          <section className="generate-engine-card">
            <h1>Re-plan</h1>

            <div className="replan-incident-card">
              <span>
                <AlertTriangle size={18} />
              </span>
              <div>
                <p>Risk scenario</p>
                <strong>Lettuce delay +5 days</strong>
              </div>
            </div>

            <div className="ai-build-panel">
              <div className="ai-build-badge replan-badge">
                <RefreshCcw size={30} />
              </div>
              <h2>Building a safer schedule</h2>
              <p>
                The grid stays locked while AgriMatrix shifts the Lettuce window and recalculates
                nursery load.
              </p>

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

            <div className="replan-explain-card">
              <h2>Suggested trade-off</h2>
              <p>
                Lettuce moves one week later, Basil reserve stays protected, and Mint keeps its edge
                placement. Revenue dips slightly, but the operator gets a clearer transplant queue.
              </p>
            </div>

            <StepActions
              onBack={onBackToDashboard}
              onNext={() => onApplyPlan(replannedPlan)}
              backLabel="Back to Dashboard"
              nextLabel="Apply Re-plan"
            />
          </section>

          <aside className="generate-preview-card">
            <header>
              <h2>Updated Plan Preview</h2>
              <p>Lettuce delay scenario applied</p>
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
              className="generate-grid replan-grid"
              style={{ gridTemplateColumns: `repeat(${replannedPlan.columns}, minmax(0, 1fr))` }}
            >
              {replannedPlan.cells.map((cell, index) => (
                <span
                  key={index}
                  className={`generate-grid-cell ${cell.cropId === 'lettuce' ? 'delayed' : ''}`}
                  style={{ backgroundColor: cell.color }}
                  title={cell.label}
                ></span>
              ))}
            </div>

            <div className="mini-timeline replan-phase-timeline">
              <h3>Updated Schedule</h3>
              <div className="replan-week-head">
                {replannedPlan.nurseryLoad.slice(0, 8).map((item) => (
                  <span key={item.week}>W{item.week}</span>
                ))}
              </div>
              <div className="plan-mini-table">
                {replannedPlan.timelineRows.map((row) => (
                  <article key={row.cropId} className="plan-mini-row">
                    <strong>{row.label}</strong>
                    <div className="plan-mini-track">
                      <i
                        style={{
                          gridColumn: `${row.seedWeek} / span 1`,
                          backgroundColor: '#dce9ff',
                        }}
                      >
                        Seed
                      </i>
                      <i
                        style={{
                          gridColumn: `${row.transplantWeek} / span ${row.growWeeks}`,
                          backgroundColor: row.color,
                        }}
                      >
                        Grow
                      </i>
                      <i
                        style={{
                          gridColumn: `${row.harvestWeek} / span 1`,
                          backgroundColor: '#c7e7d0',
                        }}
                      >
                        Harvest
                      </i>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mini-timeline nursery-mini-timeline">
              <h3>Recalculated Nursery Load</h3>
              <div className="mini-months">
                {replannedPlan.nurseryLoad.slice(0, 8).map((item) => (
                  <span key={item.week}>W{item.week}</span>
                ))}
              </div>
              <div className="mini-rows nursery-mini-rows">
                <article className="mini-row nursery-load-row">
                  <small>Active</small>
                  <div className="mini-row-track">
                    {replannedPlan.nurseryLoad.slice(0, 8).map((item) => (
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
            </div>

            <div className="generate-metrics replan-metrics">
              <article>
                <p>Utilization</p>
                <strong>{replannedPlan.utilizationPercent}%</strong>
              </article>
              <article>
                <p>Stockout risk</p>
                <strong>{replannedPlan.stockoutRisk}</strong>
              </article>
              <article>
                <p>Expected revenue</p>
                <strong>${(replannedPlan.expectedRevenue / 1000).toFixed(1)}k</strong>
              </article>
              <article>
                <p>Nursery peak</p>
                <strong>{peakNurseryLoad.activeSeedlings}</strong>
              </article>
            </div>

            <div className="generate-note warn">
              <AlertTriangle size={16} />
              Lettuce phases shift one week later to reflect the delay.
            </div>

            <div className="generate-note">
              <ShieldCheck size={16} />
              Mint remains edge-placed and the original grid allocation stays locked.
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
