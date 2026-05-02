import { useState } from 'react'
import { SetupFarmPage } from './pages/SetupFarmPage'
import { WelcomePage } from './pages/WelcomePage'
import './App.css'

type Page = 'welcome' | 'setup-farm'

function App() {
  const [page, setPage] = useState<Page>('welcome')

  if (page === 'setup-farm') {
    return <SetupFarmPage onBackToWelcome={() => setPage('welcome')} />
  }

  return <WelcomePage onStartDemo={() => setPage('setup-farm')} />
}

export default App

