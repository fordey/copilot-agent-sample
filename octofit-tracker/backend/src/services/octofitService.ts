import { isValidObjectId } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type HttpError = Error & { status: number };

function httpError(message: string, status: number): HttpError {
  return Object.assign(new Error(message), { status });
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw httpError(`${field} is required`, 400);
  }
  return value.trim();
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError('Activity body must be an object', 400);
  const { userId, teamId } = input;
  const type = requiredText(input.type, 'type');
  const minutes = input.minutes;

  if (typeof userId !== 'string' || !isValidObjectId(userId)) {
    throw httpError('userId must be a valid ID', 400);
  }
  if (typeof teamId !== 'string' || !isValidObjectId(teamId)) {
    throw httpError('teamId must be a valid ID', 400);
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw httpError('minutes must be a positive number', 400);
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) throw httpError('userId and teamId must reference existing records', 404);

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw httpError('Team body must be an object', 400);
  const name = requiredText(input.name, 'name');
  const mascot = requiredText(input.mascot, 'mascot');
  const members = input.members ?? [];

  if (!Array.isArray(members)) throw httpError('members must be an array of user IDs', 400);
  if (!members.every((member): member is string => typeof member === 'string' && isValidObjectId(member))) {
    throw httpError('members must contain valid user IDs', 400);
  }

  const memberIds = [...new Set(members)];
  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== memberIds.length) throw httpError('All members must reference existing users', 404);
  }

  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const [teams, activityTotals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: string; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map<string, number>();
  for (const total of activityTotals) pointsByTeam.set(total._id.toString(), total.totalPoints);

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

function focusForActivity(type: string): string | undefined {
  switch (type.toLowerCase()) {
    case 'run':
    case 'cycle':
      return 'endurance';
    case 'strength':
      return 'strength';
    case 'walk':
      return 'mobility';
    default:
      return undefined;
  }
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('_id fitnessGoal').lean();
  if (!user) throw httpError('No user found for that email address', 404);

  const recentActivity = await Activity.findOne({ user: user._id })
    .sort({ occurredAt: -1 })
    .select('type')
    .lean();
  let focus = user.fitnessGoal;
  let reason = `Matches your ${focus} fitness goal.`;
  let workouts = await Workout.find({ focus }).lean();

  if (workouts.length === 0 && recentActivity) {
    const activityFocus = focusForActivity(recentActivity.type);
    if (activityFocus && activityFocus !== focus) {
      focus = activityFocus;
      reason = `Recommended based on your recent ${recentActivity.type} activity.`;
      workouts = await Workout.find({ focus }).lean();
    }
  }

  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
