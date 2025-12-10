import type { Shot } from '../types/shot';
import './ShotDisplay.css';

interface ShotDisplayProps {
  shot: Shot | null;
  isLatest?: boolean;
}

export function ShotDisplay({ shot, isLatest = true }: ShotDisplayProps) {
  if (!shot) {
    return (
      <div className="shot-display shot-display--empty">
        <div className="shot-display__waiting">
          <div className="shot-display__waiting-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <p>Waiting for shot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`shot-display ${isLatest ? 'shot-display--latest' : ''}`}>
      <div className="shot-display__grid">
        {/* Ball Speed - Primary metric */}
        <div className="metric metric--primary">
          <span className="metric__value">{shot.ball_speed_mph.toFixed(1)}</span>
          <span className="metric__unit">mph</span>
          <span className="metric__label">Ball Speed</span>
        </div>

        {/* Carry Distance */}
        <div className="metric metric--primary">
          <span className="metric__value">{shot.estimated_carry_yards}</span>
          <span className="metric__unit">yds</span>
          <span className="metric__label">Est. Carry</span>
          <span className="metric__range">
            {shot.carry_range[0]}-{shot.carry_range[1]}
          </span>
        </div>

        {/* Club Speed */}
        <div className="metric metric--secondary">
          <span className="metric__value">
            {shot.club_speed_mph ? shot.club_speed_mph.toFixed(1) : '--'}
          </span>
          <span className="metric__unit">mph</span>
          <span className="metric__label">Club Speed</span>
        </div>

        {/* Smash Factor */}
        <div className="metric metric--secondary">
          <span className="metric__value">
            {shot.smash_factor ? shot.smash_factor.toFixed(2) : '--'}
          </span>
          <span className="metric__label">Smash Factor</span>
        </div>
      </div>
    </div>
  );
}
