import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

type WorkoutSuggestion = { title: string; focus: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };
const suggestedUserEmail = 'mona@example.com';

export default function Workouts() {
  const state = useApiResource<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent(suggestedUserEmail)}`);
  return (
    <CapabilityCard
      title="Workout suggestions"
      description={`Recommendations for ${suggestedUserEmail}, based on fitness goals and recent activity.`}
      emptyMessage="No workout suggestions are available yet."
      state={state}
      isEmpty={(data) => data.suggestions.length === 0}
    >
      {({ suggestions }) => (
        <ul className="list-group">
          {suggestions.map((workout) => (
            <li className="list-group-item" key={workout.title}>
              <h3 className="h5">{workout.title}</h3>
              <p className="mb-1">Focus: {workout.focus}{workout.minutes ? ` · ${workout.minutes} min` : ''}{workout.difficulty ? ` · ${workout.difficulty}` : ''}</p>
              {workout.reason && <p className="mb-0">{workout.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
