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

type SetupFarmPageProps = {
  onBackToWelcome: () => void
  onContinue: () => void
}

type ZoneTool = 'lighting' | 'irrigation'

export function SetupFarmPage({ onBackToWelcome, onContinue }: SetupFarmPageProps) {
  const [farmName, setFarmName] = useState('GreenRise Farm')
  const [farmLocation, setFarmLocation] = useState('Bangkok')
  const [rows, setRows] = useState(10)
  const [columns, setColumns] = useState(12)
  const [lightingZones, setLightingZones] = useState(3)
  const [irrigationZones, setIrrigationZones] = useState(2)
  const [growingSystem, setGrowingSystem] = useState('Hydroponic NFT')
  const [activeTool, setActiveTool] = useState<ZoneTool>('lighting')
  const [activeLightingZone, setActiveLightingZone] = useState(1)
  const [activeIrrigationZone, setActiveIrrigationZone] = useState(1)
  const [lightingAssignments, setLightingAssignments] = useState<number[]>([])
  const [irrigationAssignments, setIrrigationAssignments] = useState<number[]>([])
  const [dragStartIdx, setDragStartIdx] = useState<number | null>(null)
  const [dragCurrentIdx, setDragCurrentIdx] = useState<number | null>(null)

  const totalGrids = useMemo(() => rows * columns, [rows, columns])

  useEffect(() => {
    const nextLighting = Array.from({ length: totalGrids }, (_, idx) => {
      const rowIndex = Math.floor(idx / columns)
      return Math.min(lightingZones, Math.floor((rowIndex * lightingZones) / rows) + 1)
    })
    setLightingAssignments(nextLighting)
  }, [columns, lightingZones, rows, totalGrids])

  useEffect(() => {
    const nextIrrigation = Array.from({ length: totalGrids }, (_, idx) => {
      const colIndex = idx % columns
      return Math.min(irrigationZones, Math.floor((colIndex * irrigationZones) / columns) + 1)
    })
    setIrrigationAssignments(nextIrrigation)
  }, [columns, irrigationZones, totalGrids])

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
    const nextLighting = Array.from({ length: totalGrids }, (_, idx) => {
      const rowIndex = Math.floor(idx / columns)
      return Math.min(lightingZones, Math.floor((rowIndex * lightingZones) / rows) + 1)
    })
    const nextIrrigation = Array.from({ length: totalGrids }, (_, idx) => {
      const colIndex = idx % columns
      return Math.min(irrigationZones, Math.floor((colIndex * irrigationZones) / columns) + 1)
    })
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

  return (
    <main className="setup-page">
      <AppHeader accountName={farmName} accountInitials="GS" />

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
              <StepActions
                onBack={onBackToWelcome}
                onNext={onContinue}
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
