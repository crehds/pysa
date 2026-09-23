import { test, expect } from '../fixtures.js';
import { E2E_BACKEND_URL } from '../playwright.config.js';

// Abuse case: a protected write with no session cookie at all must be
// rejected, regardless of what the client sends. Playwright's `request`
// fixture (not page.request) has its own empty cookie jar and sends no
// Origin header, so this is a genuinely anonymous, server-to-server-style
// call — matching backend/test/route-protection.test.js at the HTTP layer
// against the real running e2e backend. Read-only otherwise: the rejected
// write never reaches the database, so no reseed is needed.
test('an anonymous write to a protected route is rejected with a generic 401', async ({
  request,
}) => {
  const res = await request.post(`${E2E_BACKEND_URL}/roles/setRoles`, {
    data: { roles: [{ name: 'carry' }] },
  });

  expect(res.status()).toBe(401);
  const body = await res.json();
  expect(body.error).toBe('Not authorized');
});
