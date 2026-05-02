import { useMemo } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CircleCheckBig,
  Droplets,
  Grid3X3,
  Leaf,
  Send,
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

const dashboardNav = [
  { icon: BarChart3, label: 'Overview', active: true },
  { icon: Grid3X3, label: 'Farm Grid' },
  { icon: Sprout, label: 'Plan' },
  { icon: Waves, label: 'Crops' },
  { icon: Thermometer, label: 'Sensors' },
  { icon: AlertTriangle, label: 'Alerts' },
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

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-side">
        <div className="dashboard-brand">
          <Leaf size={20} />
          <strong>GrowPlan AI</strong>
        </div>

        <nav className="dashboard-nav">
          {dashboardNav.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.label} type="button" className={item.active ? 'active' : ''}>
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-top">
          <div>
            <h1>Overview</h1>
            <p>{farm.farmName}</p>
          </div>
          <button type="button" className="dashboard-user">
            <span>{accountInitials}</span>
            {farm.farmName}
          </button>
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
              Goal: {selectedCrops[0] ? goalData.cropGoals[selectedCrops[0].id]?.targetPerWeek : 0} kg / week
            </p>
            <span>
              {selectedCrops[0]?.name ?? 'Primary crop'} target progress 93%
            </span>
          </article>
          <article className="risk-kpi">
            <p>Risk: lettuce delay +5 days</p>
            <strong>Re-plan suggested</strong>
          </article>
        </section>

        <section className="dashboard-content">
          <div className="dashboard-grid-card">
            <header>
              <h2>Farm Grid</h2>
              <span>{farm.rows}x{farm.columns}</span>
            </header>
            <div className="dashboard-grid">
              {Array.from({ length: 100 }, (_, idx) => {
                const crop = selectedCrops[idx % Math.max(selectedCrops.length, 1)]
                return (
                  <span
                    key={idx}
                    style={{ backgroundColor: crop?.accent ?? '#dfe5e2' }}
                    title={crop?.name ?? 'Crop'}
                  ></span>
                )
              })}
            </div>
            <footer>
              <span>
                <Droplets size={14} />
                pH 6.1
              </span>
              <span>
                <Waves size={14} />
                EC 1.8 mS/cm
              </span>
              <span>
                <Thermometer size={14} />
                21.4 c
              </span>
            </footer>
          </div>

          <aside className="dashboard-copilot">
            <header>
              <h2>
                <Bot size={18} />
                AI Copilot
              </h2>
            </header>
            <div className="chat-bubble user">
              Why is Lettuce in A1-D5 and not in E1-E5?
            </div>
            <div className="chat-bubble bot">
              Lettuce is in A1-D5 because that area has the most stable microclimate and supports
              your weekly target with lower risk of delay.
            </div>
            <div className="copilot-actions">
              <button type="button">Explain risk</button>
              <button type="button">Show alternatives</button>
            </div>
            <label className="copilot-input">
              <input placeholder="Ask GrowPlan AI..." />
              <Send size={16} />
            </label>
            <button type="button" className="back-confirm-btn" onClick={onBackToConfirm}>
              <CircleCheckBig size={16} />
              Back to Confirm Plan
            </button>
          </aside>
        </section>
      </section>
    </main>
  )
}
