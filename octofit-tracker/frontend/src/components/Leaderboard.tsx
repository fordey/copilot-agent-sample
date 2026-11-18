import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const state = useApiResource<LeaderboardResponse>('/api/leaderboard');
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      emptyMessage="No leaderboard rankings yet."
      state={state}
      isEmpty={(data) => data.leaderboard.length === 0}
    >
      {({ leaderboard }) => (
        <ol className="list-group">
          {leaderboard.map((entry) => (
            <li className="list-group-item d-flex justify-content-between" key={entry.teamName}>
              <span>{entry.rank}. {entry.teamName}</span>
              <strong>{entry.totalPoints} points</strong>
            </li>
          ))}
        </ol>
      )}
    </CapabilityCard>
  );
}
