import { useState } from 'react'
import { SelectCropsPage } from './pages/SelectCropsPage'
import { SetupFarmPage } from './pages/SetupFarmPage'
import { WelcomePage } from './pages/WelcomePage'
import './App.css'

type Page = 'welcome' | 'setup-farm' | 'select-crops'

function App() {
  const [page, setPage] = useState<Page>('welcome')

  if (page === 'select-crops') {
    return (
      <SelectCropsPage
        onBackToSetup={() => setPage('setup-farm')}
        onContinue={() => setPage('select-crops')}
      />
    )
  }

  if (page === 'setup-farm') {
    return (
      <SetupFarmPage
        onBackToWelcome={() => setPage('welcome')}
        onContinue={() => setPage('select-crops')}
      />
    )
  }

  return <WelcomePage onStartDemo={() => setPage('setup-farm')} />
}

export default App
