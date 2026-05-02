import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bell,
  Grid3X3,
  HelpCircle,
  Leaf,
  Lightbulb,
  RotateCcw,
  Settings2,
  Waves,
} from 'lucide-react'

type SetupFarmPageProps = {
  onBackToWelcome: () => void
}

const setupSteps = [
  { id: 1, title: 'Setup Farm', subtitle: 'Configure your farm layout', state: 'active' },
  { id: 2, title: 'Select Crops', subtitle: 'Choose crops to grow', state: 'pending' },
  { id: 3, title: 'Define Goal', subtitle: 'Set your targets and priorities', state: 'pending' },
  { id: 4, title: 'Generate Plan', subtitle: 'AI will create your optimal plan', state: 'pending' },
  { id: 5, title: 'Confirm Plan', subtitle: 'Review and confirm your plan', state: 'pending' },
] as const

export function SetupFarmPage({ onBackToWelcome }: SetupFarmPageProps) {
  const [farmName, setFarmName] = useState('GreenRise Farm')
  const [farmLocation, setFarmLocation] = useState('Bangkok')
  const [rows, setRows] = useState(10)
  const [columns, setColumns] = useState(12)
  const [lightingZones, setLightingZones] = useState(3)
  const [irrigationZones, setIrrigationZones] = useState(2)
  const [growingSystem, setGrowingSystem] = useState('Hydroponic NFT')

  const totalGrids = useMemo(() => rows * columns, [rows, columns])

  const gridCells = Array.from({ length: totalGrids }, (_, idx) => {
    const rowIndex = Math.floor(idx / columns)
    if (rowIndex < Math.ceil(rows / 3)) return 'zone-1'
    if (rowIndex < Math.ceil((rows * 2) / 3)) return 'zone-2'
    return 'zone-3'
  })

  return (
    <main className="setup-page">
      <header className="setup-topbar">
        <div className="setup-brand">
          <div className="setup-brand-mark" aria-hidden="true">
            <Leaf size={22} strokeWidth={2.3} />
          </div>
          <span>GrowPlan AI</span>
        </div>

        <div className="setup-account">
          <button type="button" className="icon-btn" aria-label="Help">
            <HelpCircle size={18} />
          </button>
          <button type="button" className="icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className="account-chip">
            <span className="avatar">GS</span>
            <span>{farmName}</span>
          </div>
        </div>
      </header>

      <section className="setup-workspace">
        <aside className="setup-sidebar">
          <p className="setup-progress-title">Setup Progress</p>
          <p className="setup-progress-meta">1 of 5 completed</p>
          <div className="progress-track" aria-hidden="true">
            <span className="progress-fill"></span>
          </div>

          <ul className="step-list">
            {setupSteps.map((step) => (
              <li key={step.id} className={`step-item ${step.state}`}>
                <span className="step-badge">{step.id}</span>
                <div>
                  <p>{step.title}</p>
                  <small>{step.subtitle}</small>
                </div>
              </li>
            ))}
          </ul>
        </aside>

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
                <button type="button" className="ghost-btn">
                  <Settings2 size={16} />
                  Edit Zones
                </button>
                <button type="button" className="ghost-btn">
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </header>

            <div
              className="farm-grid-preview"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {gridCells.map((zone, idx) => (
                <span key={idx} className={`grid-cell ${zone}`}></span>
              ))}
            </div>

            <footer className="preview-footer">
              <div className="legend-row">
                <span className="legend-item">
                  <b className="legend-swatch zone-1"></b>
                  LZ 1
                </span>
                <span className="legend-item">
                  <b className="legend-swatch zone-2"></b>
                  LZ 2
                </span>
                <span className="legend-item">
                  <b className="legend-swatch zone-3"></b>
                  LZ 3
                </span>
                <span className="legend-item">
                  <Lightbulb size={14} />
                  {lightingZones} lighting zones
                </span>
                <span className="legend-item">
                  <Waves size={14} />
                  {irrigationZones} irrigation zones
                </span>
              </div>

              <div className="setup-primary-actions">
                <button type="button" className="btn btn-secondary" onClick={onBackToWelcome}>
                  <ArrowLeft size={16} />
                  Back to Welcome
                </button>
                <button type="button" className="btn btn-primary">
                  Save & Continue
                </button>
              </div>
            </footer>
          </section>
        </section>
      </section>
    </main>
  )
}

