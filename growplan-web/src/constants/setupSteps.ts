export type SetupStep = {
  id: number
  title: string
  subtitle: string
}

export const setupSteps: SetupStep[] = [
  { id: 1, title: 'Setup Farm', subtitle: 'Configure your farm layout' },
  { id: 2, title: 'Select Crops', subtitle: 'Choose crops to grow' },
  { id: 3, title: 'Define Goal', subtitle: 'Set your targets and priorities' },
  { id: 4, title: 'Generate Plan', subtitle: 'AI will create your optimal plan' },
  { id: 5, title: 'Confirm Plan', subtitle: 'Review and confirm your plan' },
]

