import { CapabilityCard } from './CapabilityCard.js';
import { useApiResource } from '../api/useApiResource.js';

type Activity = { type: string; minutes: number; points: number; occurredAt?: string };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const state = useApiResource<ActivityResponse>('/api/activities');
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      emptyMessage="No activities yet."
      state={state}
      isEmpty={(data) => data.activities.length === 0}
    >
      {({ activities }) => (
        <ul className="list-group">
          {activities.map((activity, index) => (
            <li className="list-group-item" key={`${activity.type}-${activity.occurredAt ?? index}`}>
              <strong>{activity.type}</strong> — {activity.minutes} min · {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
