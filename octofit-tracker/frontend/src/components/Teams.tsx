import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

type Team = { name: string; mascot?: string; members: Array<string | { name: string }> };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const state = useApiResource<TeamResponse>('/api/teams');
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      emptyMessage="No teams yet."
      state={state}
      isEmpty={(data) => data.teams.length === 0}
    >
      {({ teams }) => (
        <ul className="list-group">
          {teams.map((team) => (
            <li className="list-group-item" key={team.name}>
              <h3 className="h5">{team.name}</h3>
              {team.mascot && <p className="mb-1">Mascot: {team.mascot}</p>}
              <p className="mb-0">Members: {team.members.map((member) => typeof member === 'string' ? member : member.name).join(', ') || 'None'}</p>
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
