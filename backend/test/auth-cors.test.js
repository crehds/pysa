'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cors = require('cors');
const request = require('supertest');
const { isAllowedOrigin, createCorsOptions } = require('../auth/cors');

test('isAllowedOrigin: no Origin header is allowed (curl, server-to-server)', () => {
  assert.equal(isAllowedOrigin(undefined, ['http://localhost:5173']), true);
});

test('isAllowedOrigin: an exact allowed origin passes', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173', ['http://localhost:5173']), true);
});

test('isAllowedOrigin: an origin not on the list is rejected', () => {
  assert.equal(isAllowedOrigin('https://evil.example.com', ['http://localhost:5173']), false);
});

test('isAllowedOrigin: a superstring of an allowed origin is not enough (exact match only)', () => {
  assert.equal(
    isAllowedOrigin('http://localhost:5173.evil.com', ['http://localhost:5173']),
    false
  );
});

function buildApp(allowedOrigins) {
  const app = express();
  app.use(cors(createCorsOptions(allowedOrigins)));
  app.get('/ping', (req, res) => res.status(200).json({ ok: true }));
  return app;
}

test('an allowed origin receives Access-Control-Allow-Origin and Allow-Credentials', async () => {
  const app = buildApp(['http://localhost:5173']);
  const res = await request(app).get('/ping').set('Origin', 'http://localhost:5173');
  assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(res.headers['access-control-allow-credentials'], 'true');
});

test('a disallowed origin gets no CORS headers back', async () => {
  const app = buildApp(['http://localhost:5173']);
  const res = await request(app).get('/ping').set('Origin', 'https://evil.example.com');
  assert.equal(res.headers['access-control-allow-origin'], undefined);
});

test('a request with no Origin header is allowed through with no CORS headers needed', async () => {
  const app = buildApp(['http://localhost:5173']);
  const res = await request(app).get('/ping');
  assert.equal(res.status, 200);
  assert.equal(res.headers['access-control-allow-origin'], undefined);
});
