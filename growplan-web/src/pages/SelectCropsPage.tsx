import { useMemo, useState } from 'react'
import {
  Grid3X3,
  Plus,
  Search,
  Sprout,
  Timer,
  X,
} from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { SetupProgress } from '../components/SetupProgress'
import { StepActions } from '../components/StepActions'
import { cropLibrary, type CropCategory, type CropId } from '../constants/crops'
import { setupSteps } from '../constants/setupSteps'

type SelectCropsPageProps = {
  farmName: string
  selectedCropIds: CropId[]
  onBackToSetup: () => void
  onContinue: (selectedCropIds: CropId[]) => void
}

export function SelectCropsPage({
  farmName,
  selectedCropIds: initialSelectedCropIds,
  onBackToSetup,
  onContinue,
}: SelectCropsPageProps) {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'All' | CropCategory>('All')
  const [selectedCropIds, setSelectedCropIds] = useState<CropId[]>(initialSelectedCropIds)
  const accountInitials =
    farmName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || 'GF'

  const visibleCrops = useMemo(() => {
    return cropLibrary.filter((crop) => {
      const matchesCategory = categoryFilter === 'All' || crop.category === categoryFilter
      const matchesQuery = crop.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [categoryFilter, query])

  const selectedCrops = useMemo(() => {
    return cropLibrary.filter((crop) => selectedCropIds.includes(crop.id))
  }, [selectedCropIds])

  const totalEstimatedYield = useMemo(() => {
    const value = selectedCrops.reduce((acc, crop) => acc + crop.yieldPerGrid, 0)
    return value.toFixed(1)
  }, [selectedCrops])

  const toggleCrop = (cropId: CropId) => {
    setSelectedCropIds((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId],
    )
  }

  const removeCrop = (cropId: CropId) => {
    setSelectedCropIds((prev) => prev.filter((id) => id !== cropId))
  }

  return (
    <main className="setup-page">
      <AppHeader accountName={farmName} accountInitials={accountInitials} />

      <section className="setup-workspace">
        <SetupProgress activeStep={2} steps={setupSteps} />

        <section className="setup-main select-main">
          <section className="select-library-card">
            <header className="select-header">
              <h1>Select Crops</h1>
              <p>Choose the crops you want to include in your plan.</p>
            </header>

            <div className="select-controls">
              <label className="search-input" aria-label="Search crops">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search crops..."
                />
              </label>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'All' | CropCategory)}
              >
                <option value="All">All Categories</option>
                <option value="Leafy Green">Leafy Green</option>
                <option value="Herb">Herb</option>
              </select>
            </div>

            <div className="crop-card-grid">
              {visibleCrops.map((crop) => {
                const isSelected = selectedCropIds.includes(crop.id)

                return (
                  <article key={crop.id} className={`crop-card ${isSelected ? 'selected' : ''}`}>
                    <div className="crop-thumb" style={{ backgroundColor: crop.accent }}>
                      <Sprout size={28} />
                    </div>
                    <h3>{crop.name}</h3>
                    <span className="crop-chip">{crop.category}</span>

                    <p>
                      <Timer size={14} />
                      {crop.growthDays}
                    </p>
                    <p>
                      <Grid3X3 size={14} />
                      {crop.yieldPerGrid.toFixed(1)} kg / grid
                    </p>

                    <button
                      type="button"
                      className={`crop-action ${isSelected ? 'remove' : 'add'}`}
                      onClick={() => toggleCrop(crop.id)}
                    >
                      {isSelected ? <X size={16} /> : <Plus size={16} />}
                      {isSelected ? 'Remove' : 'Add Crop'}
                    </button>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="selected-crops-card">
            <header>
              <h2>Selected Crops</h2>
              <span>{selectedCrops.length}</span>
            </header>
            <p>Review your selected crops. You can remove crops or add more from the library.</p>

            <div className="selected-list">
              {selectedCrops.map((crop) => (
                <article key={crop.id} className="selected-item">
                  <div className="selected-thumb" style={{ backgroundColor: crop.accent }}>
                    <Sprout size={18} />
                  </div>
                  <div>
                    <h3>{crop.name}</h3>
                    <small>{crop.category}</small>
                    <p>
                      <Timer size={12} />
                      {crop.growthDays}
                      <span className="dot-sep">|</span>
                      <Grid3X3 size={12} />
                      {crop.yieldPerGrid.toFixed(1)} kg / grid
                    </p>
                  </div>
                  <button
                    type="button"
                    className="remove-selected"
                    onClick={() => removeCrop(crop.id)}
                    aria-label={`Remove ${crop.name}`}
                  >
                    <X size={14} />
                  </button>
                </article>
              ))}
            </div>

            <div className="selected-summary">
              <p>
                Total crops selected
                <strong>{selectedCrops.length}</strong>
              </p>
              <p>
                Total estimated yield
                <strong>{totalEstimatedYield} kg / grid</strong>
              </p>
            </div>

            <StepActions
              onBack={onBackToSetup}
              onNext={() => onContinue(selectedCropIds)}
              backLabel="Back"
              nextLabel="Continue"
              nextDisabled={selectedCrops.length === 0}
            />
          </aside>
        </section>
      </section>
    </main>
  )
}
