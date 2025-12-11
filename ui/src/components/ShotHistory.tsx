import { useState, useMemo } from 'react';
import type { Shot } from '../types/shot';
import { computeStats, getUniqueClubs } from '../types/shot';
import './ShotHistory.css';

interface ShotHistoryProps {
  shots: Shot[];
  onClearSession: () => void;
}

export function ShotHistory({ shots, onClearSession }: ShotHistoryProps) {
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const availableClubs = useMemo(() => getUniqueClubs(shots), [shots]);

  const filteredShots = useMemo(() => {
    if (selectedClub === null) return shots;
    return shots.filter((s) => s.club === selectedClub);
  }, [shots, selectedClub]);

  const stats = useMemo(() => computeStats(filteredShots), [filteredShots]);

  const reversedShots = [...filteredShots].reverse();

  return (
    <div className="shot-history">
      {/* Session Stats Summary */}
      {shots.length > 0 && (
        <div className="stats-summary">
          <div className="stats-summary__header">
            <h3 className="stats-summary__title">
              {selectedClub ? selectedClub.toUpperCase() : 'All Clubs'} Stats
            </h3>
          </div>

          {/* Club Filter Tabs */}
          {availableClubs.length > 0 && (
            <div className="club-filter">
              <button
                className={`club-filter__tab ${selectedClub === null ? 'club-filter__tab--active' : ''}`}
                onClick={() => setSelectedClub(null)}
              >
                All ({shots.length})
              </button>
              {availableClubs.map((club) => {
                const count = shots.filter((s) => s.club === club).length;
                return (
                  <button
                    key={club}
                    className={`club-filter__tab ${selectedClub === club ? 'club-filter__tab--active' : ''}`}
                    onClick={() => setSelectedClub(club)}
                  >
                    {club.toUpperCase()} ({count})
                  </button>
                );
              })}
            </div>
          )}

          <div className="stats-summary__grid">
            <div className="stat">
              <span className="stat__value">{stats.shot_count}</span>
              <span className="stat__label">Shots</span>
            </div>
            <div className="stat">
              <span className="stat__value">{stats.avg_ball_speed.toFixed(1)}</span>
              <span className="stat__label">Avg Ball</span>
            </div>
            <div className="stat">
              <span className="stat__value">{stats.max_ball_speed.toFixed(1)}</span>
              <span className="stat__label">Max Ball</span>
            </div>
            {stats.avg_club_speed && (
              <div className="stat">
                <span className="stat__value">{stats.avg_club_speed.toFixed(1)}</span>
                <span className="stat__label">Avg Club</span>
              </div>
            )}
            {stats.avg_smash_factor && (
              <div className="stat">
                <span className="stat__value">{stats.avg_smash_factor.toFixed(2)}</span>
                <span className="stat__label">Avg Smash</span>
              </div>
            )}
            <div className="stat">
              <span className="stat__value">{stats.avg_carry_est.toFixed(0)}</span>
              <span className="stat__label">Avg Carry</span>
            </div>
          </div>
          <button className="clear-button" onClick={onClearSession}>
            Clear Session
          </button>
        </div>
      )}

      {/* Shot List */}
      <div className="shot-list">
        <h3 className="shot-list__title">
          {selectedClub ? `${selectedClub.toUpperCase()} Shots` : 'Shot History'}
        </h3>
        {reversedShots.length === 0 ? (
          <p className="shot-list__empty">No shots recorded yet</p>
        ) : (
          <div className="shot-list__items">
            {reversedShots.map((shot, index) => (
              <div key={shot.timestamp} className="shot-item">
                <span className="shot-item__number">#{filteredShots.length - index}</span>
                {!selectedClub && <span className="shot-item__club">{shot.club}</span>}
                <div className="shot-item__data">
                  <span className="shot-item__ball">{shot.ball_speed_mph.toFixed(1)} mph</span>
                  <span className="shot-item__carry">{shot.estimated_carry_yards} yds</span>
                </div>
                {shot.smash_factor && (
                  <span className="shot-item__smash">{shot.smash_factor.toFixed(2)}</span>
                )}
                <span className="shot-item__time">
                  {new Date(shot.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
