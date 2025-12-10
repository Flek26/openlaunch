import type { Shot, SessionStats } from '../types/shot';
import './ShotHistory.css';

interface ShotHistoryProps {
  shots: Shot[];
  stats: SessionStats | null;
  onClearSession: () => void;
}

export function ShotHistory({ shots, stats, onClearSession }: ShotHistoryProps) {
  const reversedShots = [...shots].reverse();

  return (
    <div className="shot-history">
      {/* Session Stats Summary */}
      {stats && stats.shot_count > 0 && (
        <div className="stats-summary">
          <h3 className="stats-summary__title">Session Stats</h3>
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
        <h3 className="shot-list__title">Shot History</h3>
        {reversedShots.length === 0 ? (
          <p className="shot-list__empty">No shots recorded yet</p>
        ) : (
          <div className="shot-list__items">
            {reversedShots.map((shot, index) => (
              <div key={shot.timestamp} className="shot-item">
                <span className="shot-item__number">#{shots.length - index}</span>
                <span className="shot-item__club">{shot.club}</span>
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
