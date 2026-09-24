'use strict';

// Test-only admin credentials, shared by every backend test that needs a
// working admin session (both the full app via testEnv.js and the
// standalone hand-built apps in test/auth-*.test.js). Safe to commit: they
// unlock nothing but this suite's own throwaway app instances and the
// isolated test/e2e databases, never a real deployment.
//
// Deliberately NOT routed through support/testEnv.js: these constants must
// stay free of any Mongo/app side effects so the auth-only test files that
// use them can run without a database connection.
const TEST_ADMIN_USERNAME = 'test-admin';
const TEST_ADMIN_PASSWORD = 'Test-Admin-Passw0rd!';
// bcrypt hash (cost 10) of TEST_ADMIN_PASSWORD above.
const TEST_ADMIN_PASSWORD_HASH =
  '$2b$10$xM2G.wAkkEzITlNH5ZnJ1.3ji7SYdrGnbaKcsdMW6onA/X1xb5OPK';
const TEST_JWT_SECRET =
  '4a8a9d4d6a39cb78dfd19f77d3ce24206606b2a015fde8d74d21f6d4b73d8c09';

module.exports = {
  TEST_ADMIN_USERNAME,
  TEST_ADMIN_PASSWORD,
  TEST_ADMIN_PASSWORD_HASH,
  TEST_JWT_SECRET,
};
