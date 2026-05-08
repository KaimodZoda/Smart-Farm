import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react'

type StepActionsProps = {
  onBack: () => void
  onNext: () => void
  onNextDisabledAttempt?: () => void
  nextHint?: string | null
  backLabel?: string
  nextLabel?: string
  nextDisabled?: boolean
  nextLoading?: boolean
}

export function StepActions({
  onBack,
  onNext,
  onNextDisabledAttempt,
  nextHint = null,
  backLabel = 'Back',
  nextLabel = 'Save & Continue',
  nextDisabled = false,
  nextLoading = false,
}: StepActionsProps) {
  const isNextNativelyDisabled = nextLoading || (nextDisabled && !onNextDisabledAttempt)

  const handleNextClick = () => {
    if (nextLoading) return
    if (nextDisabled) {
      onNextDisabledAttempt?.()
      return
    }
    onNext()
  }

  return (
    <div className="setup-primary-actions">
      <button type="button" className="btn btn-secondary" onClick={onBack}>
        <ArrowLeft size={16} />
        {backLabel}
      </button>
      {nextHint ? (
        <p className="step-next-hint" role="alert" aria-live="polite">
          {nextHint}
        </p>
      ) : null}
      <button
        type="button"
        className={`btn btn-primary ${nextDisabled ? 'is-disabled' : ''}`}
        onClick={handleNextClick}
        disabled={isNextNativelyDisabled}
        aria-disabled={nextDisabled}
      >
        {nextLoading ? <LoaderCircle size={16} className="spin" /> : <ArrowRight size={16} />}
        {nextLabel}
      </button>
    </div>
  )
}
