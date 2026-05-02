import { useMemo } from 'react'
import {
  AlertTriangle,
  Bell,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Droplets,
  Grid3X3,
  Leaf,
  MessageSquare,
  Send,
  ShieldCheck,
  Sprout,
  Thermometer,
  Waves,
} from 'lucide-react'
import { cropLibrary, type CropId } from '../constants/crops'
import type { GoalData, SetupFarmData } from '../types/planning'

type DashboardPageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
  onBackToConfirm: () => void
}

const pricePerKgByCrop: Record<CropId, number> = {
  lettuce: 2.2,
  basil: 3.8,
  kale: 2.7,
  mint: 3.2,
}

const sideItems = [
  { label: 'Overview', icon: Grid3X3, active: true },
  { label: 'Farm Grid', icon: Sprout },
  { label: 'Plan', icon: CalendarDays },
  { label: 'Crops', icon: Leaf },
  { label: 'Sensors', icon: Waves },
  { label: 'Alerts', icon: Bell },
]

const flowItems = [
  'Setup Farm',
  'Define Goal',
  'Generate Plan',
  'Execute',
  'Monitor',
  'Re-plan',
  'Harvest',
]

export function DashboardPage({
  farm,
  selectedCropIds,
  goalData,
  onBackToConfirm,
}: DashboardPageProps) {
  const selectedCrops = useMemo(
    () => cropLibrary.filter((crop) => selectedCropIds.includes(crop.id)),
    [selectedCropIds],
  )

  const stats = useMemo(() => {
    const available = farm.rows * farm.columns
    const required = selectedCrops.reduce((total, crop) => {
      const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
      const reserve = goalData.cropGoals[crop.id]?.reservePercent ?? 0
      return total + (target * (1 + reserve / 100)) / crop.yieldPerGrid
    }, 0)
    const utilization = Math.max(35, Math.min(100, Math.round((required / available) * 100)))
    const revenue = selectedCrops.reduce((sum, crop) => {
      const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
      return sum + target * pricePerKgByCrop[crop.id]
    }, 0)
    const reserveAvg =
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
      revenue: revenue * 4,
      stockoutRisk: reserveAvg >= 18 ? 'Low' : reserveAvg >= 12 ? 'Medium' : 'High',
    }
  }, [farm.columns, farm.rows, goalData.cropGoals, selectedCrops])

  const accountInitials =
    farm.farmName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || 'GF'

  const primaryCrop = selectedCrops[0]
  const primaryGoal = primaryCrop ? goalData.cropGoals[primaryCrop.id]?.targetPerWeek ?? 0 : 0

  const gridCells = useMemo(() => {
    return Array.from({ length: 100 }, (_, idx) => {
      const crop = selectedCrops[idx % Math.max(selectedCrops.length, 1)]
      return {
        cropId: crop?.id ?? 'lettuce',
        name: crop?.name ?? 'Crop',
        color: crop?.accent ?? '#dfe5e2',
      }
    })
  }, [selectedCrops])

  const cropMix = useMemo(() => {
    const total = gridCells.length
    return selectedCrops.map((crop) => {
      const count = gridCells.filter((cell) => cell.cropId === crop.id).length
      return {
        id: crop.id,
        name: crop.name,
        color: crop.accent,
        count,
        percent: Math.round((count / total) * 100),
      }
    })
  }, [gridCells, selectedCrops])

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-side">
        <div className="dashboard-logo-box">
          <Leaf size={20} />
        </div>

        <nav className="dashboard-nav">
          {sideItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.label} type="button" className={item.active ? 'active' : ''}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-title">
            <h1>AgriMatrix</h1>
          </div>
          <div className="dashboard-top-actions">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <button type="button" className="farm-selector">
              {farm.farmName}
              <ChevronDown size={15} />
            </button>
            <button type="button" className="dashboard-user">
              <span>{accountInitials}</span>
            </button>
          </div>
        </header>

        <section className="dashboard-kpis">
          <article>
            <p>Utilization</p>
            <strong>{stats.utilization}%</strong>
          </article>
          <article>
            <p>Expected revenue</p>
            <strong>${(stats.revenue / 1000).toFixed(1)}k</strong>
          </article>
          <article>
            <p>Stockout risk</p>
            <strong>{stats.stockoutRisk}</strong>
          </article>
          <article className="goal-kpi">
            <p>
              Goal: {primaryGoal} kg {primaryCrop?.name.toLowerCase() ?? 'crop'} / week
            </p>
            <span>{Math.max(78, Math.min(97, stats.utilization - 3))}% target progress</span>
          </article>
          <article className="risk-kpi">
            <p>Risk: lettuce delay +5 days</p>
            <strong>Re-plan suggested</strong>
          </article>
        </section>

        <section className="dashboard-content">
          <div className="dashboard-left-stack">
            <section className="dashboard-grid-card">
              <header>
                <h2>Farm Grid</h2>
                <span>{farm.rows}x{farm.columns}</span>
              </header>
              <div className="dashboard-grid-layout">
                <div className="dashboard-grid">
                  {gridCells.map((cell, idx) => (
                    <span
                      key={idx}
                      style={{ backgroundColor: cell.color }}
                      title={cell.name}
                    ></span>
                  ))}
                </div>

                <aside className="dashboard-grid-insights">
                  <section className="crop-mix-card">
                    <h3>Crop Mix</h3>
                    {cropMix.map((item) => (
                      <article key={item.id}>
                        <div>
                          <b style={{ backgroundColor: item.color }}></b>
                          <span>{item.name}</span>
                        </div>
                        <p>{item.percent}%</p>
                        <small>({item.count}/100)</small>
                      </article>
                    ))}
                  </section>

                  <section className="sensor-mini-card">
                    <h3>Live Sensors (Zone Avg)</h3>
                    <article>
                      <span>
                        <Droplets size={13} />
                        pH
                      </span>
                      <strong>6.1</strong>
                      <small>Optimal</small>
                    </article>
                    <article>
                      <span>
                        <Waves size={13} />
                        EC
                      </span>
                      <strong>1.8 mS/cm</strong>
                      <small>Optimal</small>
                    </article>
                    <article>
                      <span>
                        <Thermometer size={13} />
                        Temperature
                      </span>
                      <strong>21.4 c</strong>
                      <small>Optimal</small>
                    </article>
                  </section>
                </aside>
              </div>
            </section>

            <section className="dashboard-plan-card">
              <header>
                <h2>8-Week Plan</h2>
              </header>
              <div className="plan-mini-table">
                {selectedCrops.map((crop, idx) => (
                  <article key={crop.id} className="plan-mini-row">
                    <strong>{crop.name}</strong>
                    <div className="plan-mini-track">
                      <span
                        style={{
                          backgroundColor: crop.accent,
                          gridColumn: `${1 + (idx % 3)} / span ${3 + (idx % 2)}`,
                        }}
                      ></span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="dashboard-copilot">
            <header>
              <h2>
                <Bot size={18} />
                AI Copilot
              </h2>
            </header>

            <section className="copilot-goal-pill">
              <p>
                Goal: {primaryGoal} kg {primaryCrop?.name.toLowerCase() ?? 'crop'} / week
              </p>
              <span>Reserve policy active</span>
            </section>

            <div className="chat-bubble user">
              Why is Lettuce in A1-D5 and not in E1-E5?
            </div>
            <div className="chat-bubble bot">
              Lettuce is in A1-D5 because that zone has the most stable microclimate and helps hit
              weekly target with lower delay risk.
            </div>

            <div className="copilot-actions">
              <button type="button">Explain risk</button>
              <button type="button">Show alternatives</button>
            </div>

            <label className="copilot-input">
              <input placeholder="Ask AgriMatrix..." />
              <Send size={16} />
            </label>

            <button type="button" className="back-confirm-btn" onClick={onBackToConfirm}>
              <MessageSquare size={16} />
              Back to Confirm Plan
            </button>
          </aside>
        </section>

        <section className="dashboard-flow-strip">
          {flowItems.map((item, idx) => {
            const done = idx <= 3
            const active = idx === 4
            return (
              <article key={item} className={active ? 'active' : ''}>
                <span>{done ? <Check size={14} /> : idx + 1}</span>
                <p>{item}</p>
              </article>
            )
          })}
          <div className="flow-risk-badge">
            <AlertTriangle size={14} />
            <span>Delay watch</span>
          </div>
          <div className="flow-status-pill">
            <ShieldCheck size={14} />
            <span>Plan locked</span>
          </div>
        </section>
      </section>
    </main>
  )
}
