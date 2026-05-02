import { useMemo } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleCheckBig,
  Info,
  Leaf,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { SetupProgress } from '../components/SetupProgress'
import { StepActions } from '../components/StepActions'
import { cropLibrary, type CropId } from '../constants/crops'
import { setupSteps } from '../constants/setupSteps'
import type { GoalData, SetupFarmData } from '../types/planning'

type ConfirmPlanPageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
  onBackToGenerate: () => void
  onConfirm: () => void
}

const pricePerKgByCrop: Record<CropId, number> = {
  lettuce: 2.2,
  basil: 3.8,
  kale: 2.7,
  mint: 3.2,
}

export function ConfirmPlanPage({
  farm,
  selectedCropIds,
  goalData,
  onBackToGenerate,
  onConfirm,
}: ConfirmPlanPageProps) {
  const selectedCrops = useMemo(
    () => cropLibrary.filter((crop) => selectedCropIds.includes(crop.id)),
    [selectedCropIds],
  )

  const metrics = useMemo(() => {
    const available = farm.rows * farm.columns
    const required = selectedCrops.reduce((total, crop) => {
      const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
      const reserve = goalData.cropGoals[crop.id]?.reservePercent ?? 0
      return total + (target * (1 + reserve / 100)) / crop.yieldPerGrid
    }, 0)

    const utilization = Math.max(30, Math.min(100, Math.round((required / available) * 100)))
    const weeklyRevenue = selectedCrops.reduce((sum, crop) => {
      const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
      return sum + target * pricePerKgByCrop[crop.id]
    }, 0)

    const avgReserve =
      selectedCrops.length === 0
        ? 0
        : Math.round(
            selectedCrops.reduce(
              (sum, crop) => sum + (goalData.cropGoals[crop.id]?.reservePercent ?? 0),
              0,
            ) / selectedCrops.length,
          )

    return {
      utilization,
      expectedRevenue: weeklyRevenue * 4,
      stockoutRisk: avgReserve >= 18 ? 'Low' : avgReserve >= 12 ? 'Medium' : 'High',
      replanSuggested: avgReserve < 15 || utilization >= 95,
    }
  }, [farm.columns, farm.rows, goalData.cropGoals, selectedCrops])

  const timelineRows = useMemo(() => {
    return selectedCrops.map((crop, idx) => ({
      id: crop.id,
      name: crop.name,
      color: crop.accent,
      plantingStart: 1 + (idx % 2),
      growingSpan: 3 + (idx % 2),
      harvestSpan: 1,
    }))
  }, [selectedCrops])

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
        <SetupProgress activeStep={5} steps={setupSteps} />

        <section className="setup-main confirm-main">
          <section className="confirm-plan-card">
            <header className="confirm-heading">
              <h1>Confirm Plan</h1>
              <p>Review your AI-generated plan and confirm to get started.</p>
            </header>

            <div className="confirm-kpis">
              <article>
                <span className="kpi-icon ok">
                  <CircleCheckBig size={18} />
                </span>
                <p>Utilization</p>
                <strong>{metrics.utilization}%</strong>
              </article>
              <article>
                <span className="kpi-icon good">
                  <Leaf size={18} />
                </span>
                <p>Expected revenue</p>
                <strong>${(metrics.expectedRevenue / 1000).toFixed(1)}k</strong>
              </article>
              <article>
                <span className="kpi-icon safe">
                  <ShieldCheck size={18} />
                </span>
                <p>Stockout risk</p>
                <strong>{metrics.stockoutRisk}</strong>
              </article>
              <article>
                <span className="kpi-icon warn">
                  <RefreshCcw size={18} />
                </span>
                <p>Re-plan suggested</p>
                <strong>{metrics.replanSuggested ? 'Yes' : 'No'}</strong>
              </article>
            </div>

            <div className="confirm-content">
              <section className="confirm-grid-card">
                <header>
                  <h2>Farm Grid</h2>
                  <span>{farm.rows} x {farm.columns}</span>
                </header>
                <div className="confirm-grid">
                  {Array.from({ length: 48 }, (_, index) => {
                    const crop = selectedCrops[index % Math.max(selectedCrops.length, 1)]
                    return (
                      <span
                        key={index}
                        style={{ backgroundColor: crop?.accent ?? '#dfe5e2' }}
                        title={crop?.name ?? 'Crop'}
                      >
                        {index + 1}
                      </span>
                    )
                  })}
                </div>
              </section>

              <section className="confirm-timeline-card">
                <header>
                  <h2>8-Week Plan</h2>
                  <CalendarDays size={16} />
                </header>
                <div className="confirm-timeline-table">
                  <div className="timeline-head">
                    <span>Crop</span>
                    {Array.from({ length: 8 }, (_, i) => (
                      <b key={i}>W{i + 1}</b>
                    ))}
                  </div>
                  {timelineRows.map((row) => (
                    <div key={row.id} className="timeline-row-confirm">
                      <span>{row.name}</span>
                      <div className="timeline-track-confirm">
                        <i
                          style={{
                            gridColumn: `${row.plantingStart} / span ${row.growingSpan}`,
                            backgroundColor: row.color,
                          }}
                        >
                          Growing
                        </i>
                        <i
                          style={{
                            gridColumn: `${row.plantingStart + row.growingSpan} / span ${row.harvestSpan}`,
                            backgroundColor: '#c7e7d0',
                          }}
                        >
                          Harvest
                        </i>
                      </div>
                    </div>
                  ))}
                </div>
                <p>
                  <Info size={14} />
                  Plan accounts for crop rotation, resource availability, and market demand.
                </p>
              </section>
            </div>
          </section>

          <aside className="confirm-side-card">
            <h2>
              <Sparkles size={18} />
              AI Copilot
            </h2>

            <section className="copilot-note">
              <h3>Why this plan?</h3>
              <p>
                This plan balances utilization, reserve buffers, and crop cycles with your current
                farm constraints.
              </p>
              <ul>
                <li>
                  <CheckCircle2 size={14} />
                  Reserve settings reduce short-term stockout risk.
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  Crop mix aligns to weekly target and spacing profile.
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  Harvest windows are staggered for smoother operations.
                </li>
              </ul>
            </section>

            <section className="replan-note">
              <h3>
                <AlertTriangle size={16} />
                Re-plan suggested
              </h3>
              <p>Market demand may shift during Week 6-8. Keep this plan flexible for updates.</p>
            </section>

            <StepActions
              onBack={onBackToGenerate}
              onNext={onConfirm}
              backLabel="Back"
              nextLabel="Confirm & Start"
            />
          </aside>
        </section>
      </section>
    </main>
  )
}
