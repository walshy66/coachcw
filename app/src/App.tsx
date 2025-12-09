import { useState } from 'react'
import './App.css'
import LandingPage from './pages/landing/LandingPage'
import ProfilePage from './pages/profile/ProfilePage'

type Page = 'landing' | 'profile'

function App() {
  const [page, setPage] = useState<Page>('landing')

  if (page === 'profile') {
    return <ProfilePage onNavigate={(target) => setPage(target)} />
  }

  return <LandingPage onNavigate={(target) => setPage(target)} />
}

export default App
