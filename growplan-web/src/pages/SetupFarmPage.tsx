import { useEffect, useMemo, useState } from 'react'
import {
  Droplet,
  Grid3X3,
  Lightbulb,
  Plus,
  RotateCcw,
  Settings2,
  Waves,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { SetupProgress } from '../components/SetupProgress'
import { StepActions } from '../components/StepActions'
import { setupSteps } from '../constants/setupSteps'
import type { SetupFarmData } from '../types/planning'

type SetupFarmPageProps = {
  initialData: SetupFarmData
  onBackToWelcome: () => void
  onContinue: (data: SetupFarmData) => void
}

type ZoneTool = 'lighting' | 'irrigation'

const createDefaultLightingAssignments = (rows: number, columns: number, lightingZones: number) => {
  const totalGrids = rows * columns
  return Array.from({ length: totalGrids }, (_, idx) => {
    const rowIndex = Math.floor(idx / columns)
    return Math.min(lightingZones, Math.floor((rowIndex * lightingZones) / rows) + 1)
  })
}

const createDefaultIrrigationAssignments = (
  rows: number,
  columns: number,
  irrigationZones: number,
) => {
  const totalGrids = rows * columns
  return Array.from({ length: totalGrids }, (_, idx) => {
    const colIndex = idx % columns
    return Math.min(irrigationZones, Math.floor((colIndex * irrigationZones) / columns) + 1)
  })
}

export function SetupFarmPage({ initialData, onBackToWelcome, onContinue }: SetupFarmPageProps) {
  const [farmName, setFarmName] = useState(initialData.farmName)
  const [farmLocation, setFarmLocation] = useState(initialData.farmLocation)
  const [rows, setRows] = useState(initialData.rows)
  const [columns, setColumns] = useState(initialData.columns)
  const [lightingZones, setLightingZones] = useState(initialData.lightingZones)
  const [irrigationZones, setIrrigationZones] = useState(initialData.irrigationZones)
  const [nurseryCapacity, setNurseryCapacity] = useState(initialData.nurseryCapacity)
  const [seedlingLeadDays, setSeedlingLeadDays] = useState(initialData.seedlingLeadDays)
  const [growingSystem, setGrowingSystem] = useState(initialData.growingSystem)
  const [activeTool, setActiveTool] = useState<ZoneTool>('lighting')
  const [activeLightingZone, setActiveLightingZone] = useState(1)
  const [activeIrrigationZone, setActiveIrrigationZone] = useState(1)
  const [lightingAssignments, setLightingAssignments] = useState<number[]>(() => {
    const totalGrids = initialData.rows * initialData.columns
    if (initialData.lightingAssignments.length === totalGrids) {
      return initialData.lightingAssignments.map((zone) =>
        Math.min(Math.max(zone, 1), initialData.lightingZones),
      )
    }
    return createDefaultLightingAssignments(initialData.rows, initialData.columns, initialData.lightingZones)
  })
  const [irrigationAssignments, setIrrigationAssignments] = useState<number[]>(() => {
    const totalGrids = initialData.rows * initialData.columns
    if (initialData.irrigationAssignments.length === totalGrids) {
      return initialData.irrigationAssignments.map((zone) =>
        Math.min(Math.max(zone, 1), initialData.irrigationZones),
      )
    }
    return createDefaultIrrigationAssignments(
      initialData.rows,
      initialData.columns,
      initialData.irrigationZones,
    )
  })
  const [dragStartIdx, setDragStartIdx] = useState<number | null>(null)
  const [dragCurrentIdx, setDragCurrentIdx] = useState<number | null>(null)

  const totalGrids = useMemo(() => rows * columns, [rows, columns])

  useEffect(() => {
    setLightingAssignments((prev) => {
      if (prev.length !== totalGrids) {
        return createDefaultLightingAssignments(rows, columns, lightingZones)
      }
      return prev.map((zone) => Math.min(Math.max(zone, 1), lightingZones))
    })
  }, [columns, lightingZones, rows, totalGrids])

  useEffect(() => {
    setIrrigationAssignments((prev) => {
      if (prev.length !== totalGrids) {
        return createDefaultIrrigationAssignments(rows, columns, irrigationZones)
      }
      return prev.map((zone) => Math.min(Math.max(zone, 1), irrigationZones))
    })
  }, [columns, irrigationZones, rows, totalGrids])

  useEffect(() => {
    setActiveLightingZone((prev) => Math.min(prev, lightingZones))
  }, [lightingZones])

  useEffect(() => {
    setActiveIrrigationZone((prev) => Math.min(prev, irrigationZones))
  }, [irrigationZones])

  const lightingLegend = Array.from({ length: lightingZones }, (_, idx) => idx + 1)

  const irrigationLegend = Array.from({ length: irrigationZones }, (_, idx) => idx + 1)

  const dragRect = useMemo(() => {
    if (dragStartIdx === null || dragCurrentIdx === null) return null

    const startRow = Math.floor(dragStartIdx / columns)
    const startCol = dragStartIdx % columns
    const endRow = Math.floor(dragCurrentIdx / columns)
    const endCol = dragCurrentIdx % columns

    return {
      minRow: Math.min(startRow, endRow),
      maxRow: Math.max(startRow, endRow),
      minCol: Math.min(startCol, endCol),
      maxCol: Math.max(startCol, endCol),
    }
  }, [columns, dragCurrentIdx, dragStartIdx])

  const updateZoneAssignments = (startIdx: number, endIdx: number) => {
    const startRow = Math.floor(startIdx / columns)
    const startCol = startIdx % columns
    const endRow = Math.floor(endIdx / columns)
    const endCol = endIdx % columns

    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)

    const inSelection = (idx: number) => {
      const row = Math.floor(idx / columns)
      const col = idx % columns
      return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol
    }

    if (activeTool === 'lighting') {
      setLightingAssignments((prev) =>
        prev.map((zone, idx) => (inSelection(idx) ? activeLightingZone : zone)),
      )
      return
    }

    setIrrigationAssignments((prev) =>
      prev.map((zone, idx) => (inSelection(idx) ? activeIrrigationZone : zone)),
    )
  }

  const handleCellPointerDown = (idx: number) => {
    setDragStartIdx(idx)
    setDragCurrentIdx(idx)
  }

  const handleCellPointerEnter = (idx: number) => {
    if (dragStartIdx === null) return
    setDragCurrentIdx(idx)
  }

  const finalizeDrag = () => {
    if (dragStartIdx === null || dragCurrentIdx === null) return
    updateZoneAssignments(dragStartIdx, dragCurrentIdx)
    setDragStartIdx(null)
    setDragCurrentIdx(null)
  }

  const resetZones = () => {
    const nextLighting = createDefaultLightingAssignments(rows, columns, lightingZones)
    const nextIrrigation = createDefaultIrrigationAssignments(rows, columns, irrigationZones)
    setLightingAssignments(nextLighting)
    setIrrigationAssignments(nextIrrigation)
    setDragStartIdx(null)
    setDragCurrentIdx(null)
  }

  const isCellInDragRect = (idx: number) => {
    if (!dragRect) return false
    const row = Math.floor(idx / columns)
    const col = idx % columns
    return (
      row >= dragRect.minRow &&
      row <= dragRect.maxRow &&
      col >= dragRect.minCol &&
      col <= dragRect.maxCol
    )
  }

  const handleContinue = () => {
    onContinue({
      farmName: farmName.trim() || 'AgriMatrix Farm',
      farmLocation: farmLocation.trim() || 'Bangkok',
      rows,
      columns,
      lightingZones,
      irrigationZones,
      nurseryCapacity,
      seedlingLeadDays,
      growingSystem,
      lightingAssignments,
      irrigationAssignments,
    })
  }

  const accountInitials = farmName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'GF'

  return (
    <main className="setup-page">
      <AppHeader accountName={farmName} accountInitials={accountInitials} />

      <section className="setup-workspace">
        <SetupProgress activeStep={1} steps={setupSteps} />

        <section className="setup-main">
          <section className="setup-form-card">
            <h1>Setup Farm</h1>
            <p>Start by configuring your controlled-environment farm layout.</p>

            <div className="field-grid two-columns">
              <label>
                Farm name
                <input value={farmName} onChange={(e) => setFarmName(e.target.value)} />
              </label>
              <label>
                Farm location
                <input value={farmLocation} onChange={(e) => setFarmLocation(e.target.value)} />
              </label>
            </div>

            <div className="section-title">
              <span className="section-icon" aria-hidden="true">
                <Grid3X3 size={18} />
              </span>
              <div>
                <h2>Farm Layout</h2>
                <p>Define the size and structure of your growing area.</p>
              </div>
            </div>

            <div className="field-grid two-columns">
              <label>
                Total grids
                <input value={totalGrids} readOnly />
              </label>
              <span className="field-spacer"></span>
              <label>
                Rows
                <input
                  type="number"
                  min={4}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value) || 4)}
                />
              </label>
              <label>
                Columns
                <input
                  type="number"
                  min={4}
                  max={20}
                  value={columns}
                  onChange={(e) => setColumns(Number(e.target.value) || 4)}
                />
              </label>
            </div>

            <div className="section-title">
              <span className="section-icon" aria-hidden="true">
                <Settings2 size={18} />
              </span>
              <div>
                <h2>Controlled Environment</h2>
                <p>Configure your lighting and irrigation zones.</p>
              </div>
            </div>

            <div className="field-grid two-columns">
              <label>
                Lighting zones
                <select
                  value={lightingZones}
                  onChange={(e) => setLightingZones(Number(e.target.value))}
                >
                  <option value={2}>2 zones</option>
                  <option value={3}>3 zones</option>
                  <option value={4}>4 zones</option>
                </select>
              </label>
              <label>
                Irrigation zones
                <select
                  value={irrigationZones}
                  onChange={(e) => setIrrigationZones(Number(e.target.value))}
                >
                  <option value={1}>1 zone</option>
                  <option value={2}>2 zones</option>
                  <option value={3}>3 zones</option>
                </select>
              </label>
              <label className="full-width">
                Growing system
                <select
                  value={growingSystem}
                  onChange={(e) => setGrowingSystem(e.target.value)}
                >
                  <option>Hydroponic NFT</option>
                  <option>Hydroponic DWC</option>
                  <option>Aeroponic</option>
                  <option>Container garden</option>
                </select>
              </label>
              <label>
                Nursery capacity (seedlings)
                <input
                  type="number"
                  min={20}
                  max={2000}
                  value={nurseryCapacity}
                  onChange={(e) => setNurseryCapacity(Math.max(20, Number(e.target.value) || 20))}
                />
              </label>
              <label>
                Seedling lead time (days)
                <input
                  type="number"
                  min={7}
                  max={35}
                  value={seedlingLeadDays}
                  onChange={(e) => setSeedlingLeadDays(Math.max(7, Number(e.target.value) || 7))}
                />
              </label>
            </div>
          </section>

          <section className="setup-preview-card">
            <header>
              <div>
                <h2>Farm Layout Preview</h2>
                <p>
                  {rows} rows x {columns} columns ({totalGrids} total grids)
                </p>
              </div>
              <div className="preview-actions">
                <button
                  type="button"
                  className={`ghost-btn ${activeTool === 'lighting' ? 'active' : ''}`}
                  onClick={() => setActiveTool('lighting')}
                >
                  <Plus size={14} />
                  <Lightbulb size={14} />
                  Add Lighting Zone
                </button>
                <button
                  type="button"
                  className={`ghost-btn ${activeTool === 'irrigation' ? 'active' : ''}`}
                  onClick={() => setActiveTool('irrigation')}
                >
                  <Plus size={14} />
                  <Droplet size={14} />
                  Add Irrigation Zone
                </button>
                <button type="button" className="ghost-btn" onClick={resetZones}>
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </header>

            <div className="zone-assignment-bar">
              {activeTool === 'lighting' ? (
                <>
                  <span>Assign to lighting zone:</span>
                  <select
                    value={activeLightingZone}
                    onChange={(e) => setActiveLightingZone(Number(e.target.value))}
                  >
                    {lightingLegend.map((zone) => (
                      <option key={zone} value={zone}>
                        LZ {zone}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <span>Assign to irrigation zone:</span>
                  <select
                    value={activeIrrigationZone}
                    onChange={(e) => setActiveIrrigationZone(Number(e.target.value))}
                  >
                    {irrigationLegend.map((zone) => (
                      <option key={zone} value={zone}>
                        IZ {zone}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div
              className="farm-grid-preview"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              onPointerUp={finalizeDrag}
            >
              {Array.from({ length: totalGrids }, (_, idx) => (
                <span
                  key={idx}
                  className={`grid-cell zone-${lightingAssignments[idx] ?? 1} iz-${irrigationAssignments[idx] ?? 1} ${isCellInDragRect(idx) ? 'drag-preview' : ''}`}
                  onPointerDown={() => handleCellPointerDown(idx)}
                  onPointerEnter={() => handleCellPointerEnter(idx)}
                >
                  <b className={`irrigation-cell-tag iz-${irrigationAssignments[idx] ?? 1}`}>
                    IZ {irrigationAssignments[idx] ?? 1}
                  </b>
                </span>
              ))}

              {dragRect ? (
                <span
                  className={`drag-rect ${activeTool}`}
                  style={{
                    top: `${(dragRect.minRow / rows) * 100}%`,
                    left: `${(dragRect.minCol / columns) * 100}%`,
                    width: `${((dragRect.maxCol - dragRect.minCol + 1) / columns) * 100}%`,
                    height: `${((dragRect.maxRow - dragRect.minRow + 1) / rows) * 100}%`,
                  }}
                ></span>
              ) : null}
            </div>

            <footer className="preview-footer">
              <div className="legend-row">
                {lightingLegend.map((zone) => (
                  <span key={zone} className="legend-item">
                    <b className={`legend-swatch zone-${zone}`}></b>
                    LZ {zone}
                  </span>
                ))}
                {irrigationLegend.map((zone) => (
                  <span key={`iz-${zone}`} className="legend-item">
                    <b className={`legend-tag iz-${zone}`}>IZ {zone}</b>
                  </span>
                ))}
                <span className="legend-item">
                  <Lightbulb size={14} />
                  {lightingZones} lighting zones
                </span>
                <span className="legend-item">
                  <Waves size={14} />
                  {irrigationZones} irrigation zones
                </span>
              </div>

              <div className="nursery-summary-bar">
                <span>
                  Nursery capacity <strong>{nurseryCapacity}</strong> seedlings
                </span>
                <span>
                  Lead time <strong>{seedlingLeadDays}</strong> days before transplant
                </span>
              </div>

              <StepActions
                onBack={onBackToWelcome}
                onNext={handleContinue}
                backLabel="Back to Welcome"
                nextLabel="Save & Continue"
              />
            </footer>
          </section>
        </section>
      </section>
    </main>
  )
}
