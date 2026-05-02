import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react'

type StepActionsProps = {
  onBack: () => void
  onNext: () => void
  backLabel?: string
  nextLabel?: string
  nextDisabled?: boolean
  nextLoading?: boolean
}

export function StepActions({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Save & Continue',
  nextDisabled = false,
  nextLoading = false,
}: StepActionsProps) {
  return (
    <div className="setup-primary-actions">
      <button type="button" className="btn btn-secondary" onClick={onBack}>
        <ArrowLeft size={16} />
        {backLabel}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
      >
        {nextLoading ? <LoaderCircle size={16} className="spin" /> : <ArrowRight size={16} />}
        {nextLabel}
      </button>
    </div>
  )
}

