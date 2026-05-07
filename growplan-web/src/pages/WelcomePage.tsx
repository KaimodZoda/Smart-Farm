import { Cpu, Grid3X3, Leaf, ShieldCheck, Sparkles, Sprout } from 'lucide-react'
import dashboardPreviewImage from '../assets/dashboard.png'

type WelcomePageProps = {
  onOpenEmployer: () => void
  onOpenEmployee: () => void
}

const previewCells = [
  'lettuce',
  'lettuce',
  'lettuce',
  'mint',
  'mint',
  'mint',
  'lettuce',
  'lettuce',
  'lettuce',
  'mint',
  'mint',
  'mint',
  'basil',
  'basil',
  'basil',
  'chili',
  'chili',
  'chili',
  'basil',
  'basil',
  'basil',
  'chili',
  'chili',
  'chili',
]

export function WelcomePage({ onOpenEmployer, onOpenEmployee }: WelcomePageProps) {
  return (
    <main className="welcome-shell">
      <section className="welcome-content" aria-label="Welcome message">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            <Leaf size={26} strokeWidth={2.3} />
          </div>
          <span className="brand-text">AgriMatrix</span>
        </div>

        <p className="eyebrow">Welcome / Start</p>
        <h1>
          Plan smarter <span>crop cycles</span> for controlled farms
        </h1>
        <p className="lead">
          Build a practical planting layout for management, then hand off a clear
          AI work schedule that staff can execute immediately.
        </p>

        <div className="cta-row">
          <button type="button" className="btn btn-primary" onClick={onOpenEmployer}>
            <Sprout size={20} />
            For Employer
          </button>
          <button type="button" className="btn btn-secondary" onClick={onOpenEmployee}>
            <Grid3X3 size={18} />
            For Employee
          </button>
        </div>

        <div className="value-row">
          <article className="value-pill">
            <span className="pill-icon" aria-hidden="true">
              <Sparkles size={18} />
            </span>
            <span>AI planning</span>
          </article>
          <article className="value-pill">
            <span className="pill-icon" aria-hidden="true">
              <Grid3X3 size={18} />
            </span>
            <span>Grid optimization</span>
          </article>
          <article className="value-pill">
            <span className="pill-icon" aria-hidden="true">
              <Cpu size={18} />
            </span>
            <span>Azure powered</span>
          </article>
          <article className="value-pill">
            <span className="pill-icon" aria-hidden="true">
              <ShieldCheck size={18} />
            </span>
            <span>Reliable re-plan</span>
          </article>
        </div>
      </section>

      <section className="preview-panel" aria-label="Farm plan preview">
        <header className="panel-header">
          <div>
            <h2>Farm plan preview</h2>
            <p>
              <span className="status-dot" aria-hidden="true"></span>
              Active plan
            </p>
          </div>
          <label>
            Horizon
            <select defaultValue="8 weeks">
              <option>8 weeks</option>
              <option>6 weeks</option>
              <option>12 weeks</option>
            </select>
          </label>
        </header>

        <div className="preview-grid">
          <div className="grid-block" aria-label="Crop allocation preview">
            <div className="legend">
              <span className="crop lettuce">Lettuce</span>
              <span className="crop mint">Mint</span>
              <span className="crop basil">Basil</span>
              <span className="crop chili">Chili</span>
            </div>
            <div className="cells">
              {previewCells.map((crop, idx) => (
                <span
                  key={`${crop}-${idx}`}
                  className={`cell ${crop}`}
                  aria-hidden="true"
                ></span>
              ))}
            </div>
          </div>

          <div className="timeline" aria-label="Timeline preview">
            <h3>Planting timeline</h3>
            <div className="timeline-row">
              <span>Lettuce</span>
              <div className="track">
                <b className="phase planting"></b>
                <b className="phase growing"></b>
                <b className="phase harvest"></b>
              </div>
            </div>
            <div className="timeline-row">
              <span>Mint</span>
              <div className="track">
                <b className="phase planting"></b>
                <b className="phase growing"></b>
                <b className="phase harvest"></b>
              </div>
            </div>
            <div className="timeline-row">
              <span>Basil</span>
              <div className="track">
                <b className="phase planting"></b>
                <b className="phase growing"></b>
                <b className="phase harvest"></b>
              </div>
            </div>
          </div>
        </div>

        <footer className="panel-metrics">
          <article>
            <p>Utilization</p>
            <strong>94%</strong>
          </article>
          <article>
            <p>Stockout risk</p>
            <strong>Low</strong>
          </article>
          <article>
            <p>Expected revenue</p>
            <strong>$12.4k</strong>
          </article>
        </footer>

        <div className="ai-preview">
          <p>AI plan preview</p>
          <img
            src={dashboardPreviewImage}
            alt="AgriMatrix dashboard mockup showing grid, timeline, and AI copilot explanation"
          />
        </div>
      </section>
    </main>
  )
}
