import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../src/app.js';

let database;
process.env.JWT_SECRET = 'integration-test-secret-with-enough-length';
process.env.MONGOMS_DOWNLOAD_DIR = new URL('../.cache/mongodb-binaries', import.meta.url).pathname.replace(/^\/(.:)/, '$1');

before(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await database?.stop();
});

test('coach and trainee can complete the core HabitHive workflow', async () => {
  const coachRegistration = await request(app).post('/api/auth/register').send({
    name: 'Test Coach', email: 'coach@example.test', password: 'StrongPass123!', role: 'coach',
  }).expect(201);
  const traineeRegistration = await request(app).post('/api/auth/register').send({
    name: 'Test Trainee', email: 'trainee@example.test', password: 'StrongPass123!', role: 'trainee',
  }).expect(201);
  const coachToken = coachRegistration.body.token;
  const traineeToken = traineeRegistration.body.token;

  const invitation = await request(app)
    .post('/api/relationships')
    .set('Authorization', `Bearer ${coachToken}`)
    .send({ traineeEmail: 'trainee@example.test' })
    .expect(201);
  assert.equal(invitation.body.relationship.status, 'pending');

  await request(app)
    .patch(`/api/relationships/${invitation.body.relationship._id}/accept`)
    .set('Authorization', `Bearer ${traineeToken}`)
    .expect(200);

  const assigned = await request(app)
    .post('/api/habits/assign')
    .set('Authorization', `Bearer ${coachToken}`)
    .send({
      traineeId: traineeRegistration.body.user._id,
      title: 'Walk after lunch', category: 'fitness', frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6], targetValue: 20, unit: 'minutes', color: 'emerald',
    })
    .expect(201);
  assert.equal(assigned.body.habit.title, 'Walk after lunch');

  const date = new Date().toISOString().slice(0, 10);
  await request(app)
    .post('/api/check-ins')
    .set('Authorization', `Bearer ${traineeToken}`)
    .send({ habitId: assigned.body.habit._id, date, status: 'completed', value: 20 })
    .expect(201);

  const overview = await request(app)
    .get('/api/analytics/overview')
    .set('Authorization', `Bearer ${traineeToken}`)
    .expect(200);
  assert.equal(overview.body.overview.activeHabits, 1);
  assert.equal(overview.body.overview.today.completed, 1);
  assert.equal(overview.body.overview.today.rate, 100);

  const forbidden = await request(app)
    .post('/api/habits/assign')
    .set('Authorization', `Bearer ${traineeToken}`)
    .send({ traineeId: traineeRegistration.body.user._id, title: 'Not allowed' })
    .expect(403);
  assert.match(forbidden.body.message, /permission/i);
});
