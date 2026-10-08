import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';

test('health endpoint reports the API is available', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok', service: 'HabitHive API' });
});

test('unknown API routes return a consistent JSON 404', async () => {
  const response = await request(app).get('/api/does-not-exist').expect(404);
  assert.match(response.body.message, /Route not found/);
});
