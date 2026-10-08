import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { CheckIn } from '../models/CheckIn.js';
import { CoachRelationship } from '../models/CoachRelationship.js';
import { Goal } from '../models/Goal.js';
import { Habit } from '../models/Habit.js';
import { User } from '../models/User.js';
import { isHabitScheduledFor } from '../services/analyticsService.js';
import { addUtcDays, startOfUtcDay } from '../utils/date.js';

const demoPassword = 'HabitHive123!';

async function seed() {
  await connectDatabase();
  await Promise.all([
    CheckIn.deleteMany({}),
    Goal.deleteMany({}),
    Habit.deleteMany({}),
    CoachRelationship.deleteMany({}),
    User.deleteMany({}),
  ]);

  const [coach, trainee, secondTrainee] = await User.create([
    {
      name: 'Maya Santos', email: 'coach@habithive.test', password: demoPassword,
      role: 'coach', avatarColor: 'violet', bio: 'Strength and consistency coach.',
    },
    {
      name: 'Alex Rivera', email: 'trainee@habithive.test', password: demoPassword,
      role: 'trainee', avatarColor: 'amber', bio: 'Building a balanced daily routine.',
    },
    {
      name: 'Jamie Cruz', email: 'jamie@habithive.test', password: demoPassword,
      role: 'trainee', avatarColor: 'emerald', bio: 'Training for better energy and focus.',
    },
  ]);

  const [relationship, secondRelationship] = await CoachRelationship.create([
    { coach: coach._id, trainee: trainee._id, status: 'active', startedAt: addUtcDays(new Date(), -60) },
    { coach: coach._id, trainee: secondTrainee._id, status: 'active', startedAt: addUtcDays(new Date(), -30) },
  ]);

  const today = startOfUtcDay();
  const habits = await Habit.create([
    {
      owner: trainee._id, assignedBy: coach._id, relationship: relationship._id,
      title: 'Morning mobility', description: 'Complete a gentle mobility sequence before breakfast.',
      category: 'fitness', frequency: 'daily', targetValue: 15, unit: 'minutes', color: 'amber',
      startDate: addUtcDays(today, -45),
    },
    {
      owner: trainee._id, assignedBy: coach._id, relationship: relationship._id,
      title: 'Hydration target', description: 'Drink water steadily throughout the day.',
      category: 'nutrition', frequency: 'daily', targetValue: 8, unit: 'glasses', color: 'sky',
      startDate: addUtcDays(today, -45),
    },
    {
      owner: trainee._id, title: 'Read before bed', description: 'Read without a phone nearby.',
      category: 'learning', frequency: 'daily', targetValue: 20, unit: 'pages', color: 'violet',
      startDate: addUtcDays(today, -35),
    },
    {
      owner: trainee._id, title: 'Plan tomorrow', description: 'Write the three most important tasks for tomorrow.',
      category: 'productivity', frequency: 'weekdays', targetValue: 1, unit: 'plan', color: 'emerald',
      startDate: addUtcDays(today, -28),
    },
    {
      owner: secondTrainee._id, assignedBy: coach._id, relationship: secondRelationship._id,
      title: 'Evening walk', category: 'fitness', frequency: 'daily', targetValue: 25, unit: 'minutes',
      color: 'emerald', startDate: addUtcDays(today, -30),
    },
  ]);

  const checkIns = [];
  for (let daysAgo = 34; daysAgo >= 0; daysAgo -= 1) {
    const date = addUtcDays(today, -daysAgo);
    habits.forEach((habit, index) => {
      if (!isHabitScheduledFor(habit, date) || (daysAgo + index) % 6 === 0) return;
      checkIns.push({
        habit: habit._id,
        user: habit.owner,
        date,
        status: 'completed',
        value: habit.targetValue,
        note: daysAgo === 0 ? 'Felt focused today.' : '',
      });
    });
  }
  await CheckIn.insertMany(checkIns);

  await Goal.create([
    {
      trainee: trainee._id, coach: coach._id, title: 'Reach 85% weekly consistency',
      description: 'Complete at least 85% of all scheduled habits this week.',
      metric: 'completion_rate', target: 85, period: 'weekly',
      startDate: addUtcDays(today, -today.getUTCDay() + 1), endDate: addUtcDays(today, 7),
    },
    {
      trainee: trainee._id, title: 'Build a 14-day rhythm',
      metric: 'streak', target: 14, period: 'custom', startDate: addUtcDays(today, -7), endDate: addUtcDays(today, 21),
    },
  ]);

  console.log('HabitHive demo data seeded.');
  console.log('Coach: coach@habithive.test / HabitHive123!');
  console.log('Trainee: trainee@habithive.test / HabitHive123!');
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);

