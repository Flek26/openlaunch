import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { ShotDisplay } from './components/ShotDisplay';
import { ShotHistory } from './components/ShotHistory';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ClubPicker } from './components/ClubPicker';
import './App.css';

type View = 'live' | 'history';

function App() {
  const { connected, latestShot, shots, clearSession, setClub, simulateShot } = useSocket();
  const [currentView, setCurrentView] = useState<View>('live');
  const [selectedClub, setSelectedClub] = useState('driver');

  const handleClubChange = (club: string) => {
    setSelectedClub(club);
    setClub(club);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">OpenLaunch</h1>
        <div className="header__controls">
          <ClubPicker selectedClub={selectedClub} onClubChange={handleClubChange} />
          <ConnectionStatus connected={connected} />
        </div>
      </header>

      <nav className="nav">
        <button
          className={`nav__button ${currentView === 'live' ? 'nav__button--active' : ''}`}
          onClick={() => setCurrentView('live')}
        >
          Live
        </button>
        <button
          className={`nav__button ${currentView === 'history' ? 'nav__button--active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          History
          {shots.length > 0 && (
            <span className="nav__badge">{shots.length}</span>
          )}
        </button>
      </nav>

      <main className="main">
        {currentView === 'live' ? (
          <>
            <ShotDisplay shot={latestShot} isLatest={true} />
            <button className="simulate-button" onClick={simulateShot}>
              Simulate Shot
            </button>
          </>
        ) : (
          <ShotHistory
            shots={shots}
            onClearSession={clearSession}
          />
        )}
      </main>
    </div>
  );
}

export default App;
