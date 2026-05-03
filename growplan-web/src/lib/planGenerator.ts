import { cropLibrary, type CropId } from '../constants/crops'
import type {
  GeneratedPlanCell,
  GeneratedPlanData,
  GoalData,
  GoalPriority,
  SetupFarmData,
} from '../types/planning'

const pricePerKgByCrop: Record<CropId, number> = {
  lettuce: 2.2,
  basil: 3.8,
  kale: 2.7,
  mint: 3.2,
}

type GridCoord = { row: number; col: number }

type CropAllocation = {
  cropId: CropId
  count: number
}

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
  if (selectedCropIds.length === 0 || usedCells <= 0) return []

  const weights = selectedCropIds.map((cropId) => {
    const target = goalData.cropGoals[cropId]?.targetPerWeek ?? 0
    const reserve = goalData.cropGoals[cropId]?.reservePercent ?? 0
    const weightedDemand = target * (1 + reserve / 100)
    const reserveBoost = priority === 'minimize-stockout' ? 1 + reserve / 220 : 1
    const revenueBoost =
      priority === 'maximize-space' ? 1 + (pricePerKgByCrop[cropId] - 2) * 0.09 : 1
    return Math.max(1, weightedDemand * reserveBoost * revenueBoost)
  })

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const baseline = Math.min(usedCells, selectedCropIds.length)
  const counts = selectedCropIds.map(() => 0)

  for (let i = 0; i < baseline; i += 1) counts[i] = 1

  let remaining = usedCells - baseline
  if (remaining <= 0) {
    return selectedCropIds.map((cropId, idx) => ({ cropId, count: counts[idx] }))
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
      counts[remainders[i % remainders.length].idx] += 1
    }
  }

  return selectedCropIds.map((cropId, idx) => ({ cropId, count: counts[idx] }))
}

export function generatePlanData({
  farm,
  selectedCropIds,
  goalData,
}: {
  farm: SetupFarmData
  selectedCropIds: CropId[]
  goalData: GoalData
}): GeneratedPlanData {
  const selectedCrops = cropLibrary.filter((crop) => selectedCropIds.includes(crop.id))
  const selectedCropsById = new Map(selectedCrops.map((crop) => [crop.id, crop]))

  const availableCapacity = farm.rows * farm.columns
  const requiredCapacity = selectedCrops.reduce((total, crop) => {
    const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
    const reserve = goalData.cropGoals[crop.id]?.reservePercent ?? 0
    return total + (target * (1 + reserve / 100)) / crop.yieldPerGrid
  }, 0)

  const revenue = selectedCrops.reduce((sum, crop) => {
    const target = goalData.cropGoals[crop.id]?.targetPerWeek ?? 0
    return sum + target * pricePerKgByCrop[crop.id]
  }, 0)

  const averageReserve =
    selectedCrops.length === 0
      ? 0
      : Math.round(
          selectedCrops.reduce(
            (sum, crop) => sum + (goalData.cropGoals[crop.id]?.reservePercent ?? 0),
            0,
          ) / selectedCrops.length,
        )

  const stockoutRisk = averageReserve >= 18 ? 'Low' : averageReserve >= 12 ? 'Medium' : 'High'
  const allocations = allocateCounts({
    selectedCropIds,
    goalData,
    usedCells: availableCapacity,
    priority: goalData.priority,
  })

  const cellOwners: Array<CropId | null> = Array.from({ length: availableCapacity }, () => null)
  const allIndexes = Array.from({ length: availableCapacity }, (_, idx) => idx)

  const scoreCell = (cropId: CropId, index: number) => {
    const row = Math.floor(index / farm.columns)
    const col = index % farm.columns
    const edge = edgeDistance({ row, col }, farm.rows, farm.columns)
    const maxEdge = Math.floor(Math.min(farm.rows, farm.columns) / 2)

    let score = 0
    if (cropId === 'mint') {
      score += (maxEdge - edge) * 3.2
      score += (index % 2) * 0.3
    } else if (cropId === 'lettuce') {
      score += edge * 1.1
      score += row * 0.2
    } else if (cropId === 'kale') {
      score += edge * 1.25
      score += (farm.rows - row) * 0.15
    } else if (cropId === 'basil') {
      score += edge * 0.9
      score += (farm.rows - 1 - row) * 0.24
    }

    const neighbors = getNeighborIndexes(index, farm.rows, farm.columns)
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
                  getNeighborIndexes(idx, farm.rows, farm.columns).filter(
                    (neighborIdx) => cellOwners[neighborIdx] === null,
                  ),
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

  const cells: GeneratedPlanCell[] = cellOwners.map((cropId) => {
    const resolvedCropId = cropId ?? selectedCropIds[0] ?? 'lettuce'
    const crop = selectedCropsById.get(resolvedCropId) ?? cropLibrary[0]
    return {
      cropId: crop.id,
      color: crop.accent,
      label: crop.name,
    }
  })

  return {
    rows: farm.rows,
    columns: farm.columns,
    cells,
    utilizationPercent: Math.max(
      10,
      Math.min(100, Math.round((requiredCapacity / Math.max(availableCapacity, 1)) * 100)),
    ),
    requiredCapacity,
    availableCapacity,
    stockoutRisk,
    expectedRevenue: revenue * 4,
  }
}
