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
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { SetupProgress } from '../components/SetupProgress'
import { StepActions } from '../components/StepActions'
import { cropLibrary, type CropId } from '../constants/crops'
import { setupSteps } from '../constants/setupSteps'
import type { GoalData, GoalPriority, SetupFarmData } from '../types/planning'

type GeneratePlanPageProps = {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
  onBackToDefineGoal: () => void
  onContinue: () => void
}

const pricePerKgByCrop: Record<CropId, number> = {
  lettuce: 2.2,
  basil: 3.8,
  kale: 2.7,
  mint: 3.2,
}

type GridCoord = { row: number; col: number }

type PreviewCell = {
  color: string
  label: string
}

type CropAllocation = {
  cropId: CropId
  count: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const edgeDistance = (coord: GridCoord, rows: number, cols: number) => {
  const fromTop = coord.row
  const fromLeft = coord.col
  const fromBottom = rows - 1 - coord.row
  const fromRight = cols - 1 - coord.col
  return Math.min(fromTop, fromLeft, fromBottom, fromRight)
}

const getNeighborIndexes = (index: number, rows: number, cols: number) => {
  const row = Math.floor(index / cols)
  const col = index % cols
  const neighbors: number[] = []
  const candidates: GridCoord[] = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ]

  candidates.forEach((candidate) => {
    if (
      candidate.row >= 0 &&
      candidate.row < rows &&
      candidate.col >= 0 &&
      candidate.col < cols
    ) {
      neighbors.push(candidate.row * cols + candidate.col)
    }
  })

  return neighbors
}

const allocateCounts = ({
  selectedCropIds,
  goalData,
  usedCells,
  priority,
}: {
  selectedCropIds: CropId[]
  goalData: GoalData
  usedCells: number
  priority: GoalPriority
}): CropAllocation[] => {
  const crops = selectedCropIds
  if (crops.length === 0 || usedCells <= 0) return []

  const weights = crops.map((cropId) => {
    const target = goalData.cropGoals[cropId]?.targetPerWeek ?? 0
    const reserve = goalData.cropGoals[cropId]?.reservePercent ?? 0
    const weightedDemand = target * (1 + reserve / 100)
    const reserveBoost = priority === 'minimize-stockout' ? 1 + reserve / 220 : 1
    const revenueBoost =
      priority === 'maximize-space' ? 1 + (pricePerKgByCrop[cropId] - 2) * 0.09 : 1
    return Math.max(1, weightedDemand * reserveBoost * revenueBoost)
  })

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const baseline = Math.min(usedCells, crops.length)
  const counts = crops.map(() => 0)

  for (let i = 0; i < baseline; i += 1) counts[i] = 1

  let remaining = usedCells - baseline
  if (remaining <= 0) {
    return crops.map((cropId, idx) => ({ cropId, count: counts[idx] }))
  }

  const extrasRaw = weights.map((weight) => (weight / totalWeight) * remaining)
  const extrasFloor = extrasRaw.map((value) => Math.floor(value))
  extrasFloor.forEach((extra, idx) => {
    counts[idx] += extra
  })
  remaining -= extrasFloor.reduce((sum, value) => sum + value, 0)

  if (remaining > 0) {
    const remainders = extrasRaw
      .map((value, idx) => ({ idx, remainder: value - Math.floor(value) }))
      .sort((a, b) => b.remainder - a.remainder)
    for (let i = 0; i < remaining; i += 1) {
      const slot = remainders[i % remainders.length]
      counts[slot.idx] += 1
    }
  }

  return crops.map((cropId, idx) => ({ cropId, count: counts[idx] }))
}

const createGridPreview = ({
  selectedCropIds,
  goalData,
  selectedCropsById,
}: {
  selectedCropIds: CropId[]
  goalData: GoalData
  selectedCropsById: Map<CropId, (typeof cropLibrary)[number]>
}) => {
  const cols = 12
  const rows = 6
  const totalCells = cols * rows
  const usedRatioTarget = 1
  const usedCells = clamp(
    Math.round(totalCells * usedRatioTarget),
    Math.min(selectedCropIds.length, totalCells),
    totalCells,
  )

  const allocations = allocateCounts({
    selectedCropIds,
    goalData,
    usedCells,
    priority: goalData.priority,
  })

  const cellOwners: Array<CropId | null> = Array.from({ length: totalCells }, () => null)
  const allIndexes = Array.from({ length: totalCells }, (_, idx) => idx)

  const scoreCell = (cropId: CropId, index: number) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    const edge = edgeDistance({ row, col }, rows, cols)
    const maxEdge = Math.floor(Math.min(rows, cols) / 2)

    let score = 0
    if (cropId === 'mint') {
      score += (maxEdge - edge) * 3.2
      score += (index % 2) * 0.3
    } else if (cropId === 'lettuce') {
      score += edge * 1.1
      score += row * 0.2
    } else if (cropId === 'kale') {
      score += edge * 1.25
      score += (rows - row) * 0.15
    } else if (cropId === 'basil') {
      score += edge * 0.9
      score += (rows - 1 - row) * 0.24
    }

    const neighbors = getNeighborIndexes(index, rows, cols)
    neighbors.forEach((neighborIndex) => {
      const owner = cellOwners[neighborIndex]
      if (owner === cropId) score += 2.8
      else if (owner) score -= 0.35
    })

    return score
  }

  const placeCrop = (cropId: CropId, count: number) => {
    if (count <= 0) return
    const placedIndexes: number[] = []

    for (let i = 0; i < count; i += 1) {
      const candidatePool =
        placedIndexes.length > 0
          ? Array.from(
              new Set(
                placedIndexes.flatMap((idx) =>
                  getNeighborIndexes(idx, rows, cols).filter((neighborIdx) => cellOwners[neighborIdx] === null),
                ),
              ),
            )
          : allIndexes.filter((idx) => cellOwners[idx] === null)

      const fallbackPool = allIndexes.filter((idx) => cellOwners[idx] === null)
      const pool = candidatePool.length > 0 ? candidatePool : fallbackPool
      if (pool.length === 0) break

      let bestIndex = pool[0]
      let bestScore = scoreCell(cropId, bestIndex)
      for (let c = 1; c < pool.length; c += 1) {
        const idx = pool[c]
        const score = scoreCell(cropId, idx)
        if (score > bestScore) {
          bestScore = score
          bestIndex = idx
        }
      }

      cellOwners[bestIndex] = cropId
      placedIndexes.push(bestIndex)
    }
  }

  const placementOrder = [...allocations].sort((a, b) => {
    if (a.cropId === 'mint' && b.cropId !== 'mint') return -1
    if (b.cropId === 'mint' && a.cropId !== 'mint') return 1
    return b.count - a.count
  })

  placementOrder.forEach((allocation) => placeCrop(allocation.cropId, allocation.count))

  const cells: Array<PreviewCell | null> = cellOwners.map((cropId) => {
    if (!cropId) return null
    const crop = selectedCropsById.get(cropId)
    if (!crop) return null
    return { color: crop.accent, label: crop.name }
  })

  return { cols, cells }
}

export function GeneratePlanPage({
  farm,
  selectedCropIds,
  goalData,
  onBackToDefineGoal,
  onContinue,
}: GeneratePlanPageProps) {
  const selectedCrops = useMemo(
    () => cropLibrary.filter((crop) => selectedCropIds.includes(crop.id)),
    [selectedCropIds],
  )

  const capacityModel = useMemo(() => {
    const available = farm.rows * farm.columns
    const required = selectedCrops.reduce((total, crop) => {
      const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
      const reserve = goalData.cropGoals[crop.id]?.reservePercent ?? 0
      return total + (target * (1 + reserve / 100)) / crop.yieldPerGrid
    }, 0)

    return {
      available,
      required,
      utilizationPercent: Math.max(10, Math.min(99, Math.round((required / available) * 100))),
    }
  }, [farm.columns, farm.rows, goalData.cropGoals, selectedCrops])

  const totalRevenue = useMemo(() => {
    const weekly = selectedCrops.reduce((sum, crop) => {
      const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
      return sum + target * pricePerKgByCrop[crop.id]
    }, 0)
    return weekly * 4
  }, [goalData.cropGoals, selectedCrops])

  const averageReserve = useMemo(() => {
    if (selectedCrops.length === 0) return 0
    const total = selectedCrops.reduce(
      (sum, crop) => sum + (goalData.cropGoals[crop.id]?.reservePercent ?? 0),
      0,
    )
    return Math.round(total / selectedCrops.length)
  }, [goalData.cropGoals, selectedCrops])

  const stockoutRisk = averageReserve >= 18 ? 'Low' : averageReserve >= 12 ? 'Medium' : 'High'

  const analysisSteps = [
    { label: 'Analyzing farm layout', progress: 100, status: 'done' as const, icon: LayoutGrid },
    { label: 'Balancing crop cycles', progress: 100, status: 'done' as const, icon: Sprout },
    { label: 'Optimizing grid allocation', progress: 78, status: 'running' as const, icon: Sparkles },
    { label: 'Forecasting harvest schedule', progress: 20, status: 'pending' as const, icon: CalendarDays },
  ]

  const gridPreview = useMemo(() => {
    const selectedCropsById = new Map(selectedCrops.map((crop) => [crop.id, crop]))
    return createGridPreview({
      selectedCropIds,
      goalData,
      selectedCropsById,
    })
  }, [goalData, selectedCropIds, selectedCrops])

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
              onNext={onContinue}
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
              <span>
                <b className="fallow"></b>Fallow
              </span>
            </div>

            <div
              className="generate-grid"
              style={{ gridTemplateColumns: `repeat(${gridPreview.cols}, minmax(0, 1fr))` }}
            >
              {gridPreview.cells.map((cell, index) => (
                <span
                  key={index}
                  className={`generate-grid-cell ${cell ? '' : 'fallow'}`}
                  style={cell ? { backgroundColor: cell.color } : undefined}
                  title={cell?.label ?? 'Fallow'}
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

            <div className="generate-metrics">
              <article>
                <p>Utilization</p>
                <strong>{capacityModel.utilizationPercent}%</strong>
              </article>
              <article>
                <p>Stockout risk</p>
                <strong>{stockoutRisk}</strong>
              </article>
              <article>
                <p>Expected revenue</p>
                <strong>${(totalRevenue / 1000).toFixed(1)}k</strong>
              </article>
            </div>

            <div className="generate-note">
              <ShieldCheck size={16} />
              Required {capacityModel.required.toFixed(0)} grids/week vs available{' '}
              {capacityModel.available} grids/week.
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
