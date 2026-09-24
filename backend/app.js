var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs')
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var app = express();

const db = require('./db');
const { loadAdminConfig, loadAllowedOrigins, loadTrustProxy } = require('./auth/config');
const { createCorsOptions } = require('./auth/cors');
const { createAuthRouter } = require('./auth/network');
const { createRequireAdmin } = require('./auth/middleware');

if (!process.env.MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not set (e.g. mongodb://127.0.0.1:27017/pysa)'
  );
}
db(process.env.MONGODB_URI);

// Loaded once at startup, not per-request: env vars never change while the
// process is running. Fails closed rather than crashing the process, so a
// missing/invalid admin setup never takes the public (read-only) site down
// (see backend/auth/middleware.js and backend/auth/network.js for how
// adminConfig.valid gates every protected route and POST /auth/login).
const adminConfig = loadAdminConfig(process.env);
if (!adminConfig.valid) {
  console.warn(
    `[auth] admin login is not configured (${adminConfig.errors.join('; ')}). ` +
      'POST /auth/login will answer 503 and every protected route will answer 401 ' +
      'until ADMIN_USERNAME, ADMIN_PASSWORD_HASH and JWT_SECRET are set.'
  );
}

// Off by default (matches Express's own default): only meaningful once the
// API sits behind a reverse proxy (see the README's "Deploying" note), so a
// plain `npm run dev`/`npm start` never trusts a header nobody sent.
const trustProxy = loadTrustProxy(process.env);
if (trustProxy.valid) {
  app.set('trust proxy', trustProxy.value);
} else {
  console.warn(
    '[app] TRUST_PROXY=true is refused (it would trust every hop and let any client ' +
      'spoof X-Forwarded-For to dodge the login rate limit); trust proxy stays disabled. ' +
      'Set it to a hop count (e.g. 1) or an explicit IP/CIDR list instead.'
  );
}

const uploadsPath = `./uploads`;
fs.mkdirSync(uploadsPath, { recursive: true });
app.use(cors(createCorsOptions(loadAllowedOrigins(process.env))));
console.log('servidor encendido');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', createAuthRouter(adminConfig));

app.use('/default', express.static(path.join(__dirname, 'public/images/')));
app.use('/static', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static(path.join(__dirname, 'public')));

router(app, createRequireAdmin(adminConfig));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

module.exports = app;
