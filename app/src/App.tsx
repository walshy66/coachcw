import { useState } from 'react';
import './App.css';
import LandingPage from './pages/landing/LandingPage';
import ProfilePage from './pages/profile/ProfilePage';
import SessionPage from './pages/session/SessionPage';

type Page = 'landing' | 'profile' | 'session';

function App() {
  const [page, setPage] = useState<Page>('landing');

  if (page === 'profile') {
    return <ProfilePage onNavigate={(target) => setPage(target)} />;
  }

  if (page === 'session') {
    return <SessionPage onNavigate={(target) => setPage(target)} />;
  }

  return <LandingPage onNavigate={(target) => setPage(target)} />;
}

export default App;
