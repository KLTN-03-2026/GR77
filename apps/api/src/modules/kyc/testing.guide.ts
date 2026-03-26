/**
 * KYC Module - Testing Guide
 *
 * 🧪 How to Test KYC Integration Locally
 *
 * Prerequisites:
 * - API running on http://localhost:3000
 * - Valid JWT token (from login endpoint)
 * - Postman or curl
 *
 * ============================================================================
 * TEST 1: Create Mock KYC Session
 * ============================================================================
 *
 * Endpoint: POST /kyc/sessions
 * Auth: Required (JWT Bearer Token)
 * Provider: "mock" (default)
 *
 * curl command:
 * ```bash
 * curl -X POST http://localhost:3000/kyc/sessions \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"provider":"mock"}'
 * ```
 *
 * Expected Response (200 OK):
 * ```json
 * {
 *   "sessionId": "123e4567-e89b-12d3-a456-426614174000",
 *   "provider": "mock",
 *   "redirectUrl": "https://mock-kyc-provider.example/verify/mock_xxx_1711275644000",
 *   "message": "KYC session created. Redirect user to verify documents."
 * }
 * ```
 *
 * ✅ What it tests:
 * - JWT authentication working
 * - KycService.createSession() logic
 * - Database insert (KycSession table)
 * - Session unique constraint (can't create 2 active sessions)
 *
 * ============================================================================
 * TEST 2: Get Latest KYC Session Status
 * ============================================================================
 *
 * Endpoint: GET /kyc/sessions/latest
 * Auth: Required (JWT Bearer Token)
 *
 * curl command:
 * ```bash
 * curl -X GET http://localhost:3000/kyc/sessions/latest \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 * ```
 *
 * Expected Response (Active Session):
 * ```json
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "provider": "mock",
 *   "status": "PROCESSING",
 *   "extractedFullName": null,
 *   "extractedDob": null,
 *   "createdAt": "2026-03-24T10:00:00Z",
 *   "updatedAt": "2026-03-24T10:00:00Z"
 * }
 * ```
 *
 * Expected Response (No Session):
 * ```json
 * {
 *   "status": "NOT_STARTED",
 *   "message": "No KYC session found"
 * }
 * ```
 *
 * ✅ What it tests:
 * - JWT authentication
 * - Database query (select latest by userId)
 * - Proper response format
 *
 * ============================================================================
 * TEST 3: Mock Webhook - Simulate Sumsub Decision
 * ============================================================================
 *
 * Endpoint: POST /kyc/webhook/mock
 * Auth: NOT Required (public webhook)
 * Mock Signature Verification: Skipped (testing)
 *
 * curl command:
 * ```bash
 * curl -X POST http://localhost:3000/kyc/webhook/mock \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "externalRef": "mock_PREVIOUS_SESSION_ID_TIMESTAMP",
 *     "decision": "APPROVED",
 *     "fullName": "John Doe",
 *     "dob": "1990-01-01",
 *     "reason": null
 *   }'
 * ```
 *
 * ⚠️ IMPORTANT: Replace "externalRef" with actual value from TEST 1 response!
 *
 * Expected Response (200 OK):
 * ```json
 * {
 *   "success": true,
 *   "message": "Webhook processed. KYC status: APPROVED"
 * }
 * ```
 *
 * ✅ What it tests:
 * - Webhook parsing (mock provider)
 * - Database update (KycSession)
 * - User KYC status sync
 * - Status mapping (decision → KycStatus)
 *
 * ============================================================================
 * TEST 4: Verify Updated Status
 * ============================================================================
 *
 * Now run TEST 2 again to verify status changed to APPROVED:
 *
 * curl command (same as TEST 2):
 * ```bash
 * curl -X GET http://localhost:3000/kyc/sessions/latest \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 * ```
 *
 * Expected Response:
 * ```json
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "provider": "mock",
 *   "status": "APPROVED",
 *   "extractedFullName": "John Doe",
 *   "extractedDob": "1990-01-01T00:00:00Z",
 *   "createdAt": "2026-03-24T10:00:00Z",
 *   "updatedAt": "2026-03-24T10:05:00Z"
 * }
 * ```
 *
 * ✅ What it tests:
 * - Webhook successfully updated DB
 * - Status persisted correctly
 * - Data visible to user immediately
 *
 * ============================================================================
 * TEST 5: Webhook Rejection Case
 * ============================================================================
 *
 * Create new session → Reject it:
 *
 * 1. Create new session (TEST 1)
 * 2. Send rejection webhook:
 * ```bash
 * curl -X POST http://localhost:3000/kyc/webhook/mock \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "externalRef": "NEW_SESSION_EXTERNAL_REF",
 *     "decision": "REJECTED",
 *     "fullName": "Jane Smith",
 *     "reason": "Document expired"
 *   }'
 * ```
 *
 * Expected Response:
 * ```json
 * {
 *   "success": true,
 *   "message": "Webhook processed. KYC status: REJECTED"
 * }
 * ```
 *
 * 3. Verify status:
 * ```bash
 * curl -X GET http://localhost:3000/kyc/sessions/latest \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 * ```
 *
 * Expected:
 * ```json
 * {
 *   "status": "REJECTED",
 *   "rejectReason": "Document expired"
 * }
 * ```
 *
 * ============================================================================
 * TEST 6: Error Cases
 * ============================================================================
 *
 * A) Webhook with invalid externalRef:
 * ```bash
 * curl -X POST http://localhost:3000/kyc/webhook/mock \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "externalRef": "nonexistent_ref",
 *     "decision": "APPROVED"
 *   }'
 * ```
 * Expected: 400/404 with error message
 *
 * B) Webhook to unknown provider:
 * ```bash
 * curl -X POST http://localhost:3000/kyc/webhook/unknown_provider \
 *   -H "Content-Type: application/json" \
 *   -d '{"externalRef": "xxx"}'
 * ```
 * Expected: 400 "Unknown KYC provider"
 *
 * C) GET without JWT:
 * ```bash
 * curl -X GET http://localhost:3000/kyc/sessions/latest
 * ```
 * Expected: 401 Unauthorized
 *
 * ============================================================================
 * TESTING SUMSUB INTEGRATION (When API Keys Available)
 * ============================================================================
 *
 * Setup:
 * 1. Get Sumsub API credentials from https://sumsub.com/
 * 2. Set .env variables:
 *    SUMSUB_API_KEY=xxx
 *    SUMSUB_SECRET_KEY=xxx
 *    SUMSUB_API_URL=https://api.sandbox.sumsub.com (for testing)
 * 3. Restart API server
 *
 * Test:
 * ```bash
 * curl -X POST http://localhost:3000/kyc/sessions \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"provider":"sumsub"}'
 * ```
 *
 * Expected: redirectUrl to Sumsub verification page
 * Then manually verify on Sumsub → webhook auto-fires
 *
 * ============================================================================
 * POSTMAN COLLECTION
 * ============================================================================
 *
 * You can import this into Postman for easier testing:
 *
 * 1. Create new Postman collection "KYC Tests"
 * 2. Add environment variables:
 *    - {{base_url}} = http://localhost:3000
 *    - {{jwt_token}} = your_jwt_from_login
 *    - {{session_id}} = from test 1 response
 * 3. Create 4 requests:
 *
 *    Request 1: Create Mock Session
 *    POST {{base_url}}/kyc/sessions
 *    Header: Authorization: Bearer {{jwt_token}}
 *    Body: {"provider":"mock"}
 *    Test Script:
 *      pm.environment.set("session_id", pm.response.json().sessionId);
 *      pm.environment.set("external_ref", pm.response.json().redirectUrl.split('/').pop());
 *
 *    Request 2: Get Status
 *    GET {{base_url}}/kyc/sessions/latest
 *    Header: Authorization: Bearer {{jwt_token}}
 *
 *    Request 3: Mock Webhook
 *    POST {{base_url}}/kyc/webhook/mock
 *    Body: {"externalRef":"{{external_ref}}","decision":"APPROVED"}
 *
 *    Request 4: Verify Status Changed
 *    GET {{base_url}}/kyc/sessions/latest
 *    Header: Authorization: Bearer {{jwt_token}}
 *
 * ============================================================================
 * EXPECTED DATABASE STATE AFTER TESTS
 * ============================================================================
 *
 * Query Prisma:
 * ```typescript
 * const sessions = await prisma.kycSession.findMany({
 *   include: { user: { select: { email: true } } }
 * });
 *
 * const user = await prisma.user.findUnique({
 *   where: { id: "YOUR_USER_ID" },
 *   select: { kycStatus: true }
 * });
 * ```
 *
 * Expected:
 * - Multiple KycSession records
 * - statuses: PROCESSING, APPROVED, REJECTED
 * - User.kycStatus synced with latest session
 * - externalRef, extractedFullName, extractedDob populated
 *
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 *
 * ❌ "Cannot find module 'axios'"
 * → Run: cd apps/api && pnpm add axios
 *
 * ❌ "SUMSUB_API_KEY undefined"
 * → Add to .env: SUMSUB_API_KEY=test_key
 * → Restart API server after .env change
 *
 * ❌ "KYC session not found"
 * → externalRef is wrong
 * → Copy exact value from TEST 1 redirectUrl
 *
 * ❌ "Webhook signature verification failed"
 * → Only happens if Sumsub provider
 * → Make sure SUMSUB_SECRET_KEY is correct
 * → For mock provider, signature check is skipped
 *
 * ❌ "TypesError" during compilation
 * → Run: pnpm install
 * → Check src/modules/kyc for syntax errors
 *
 * ============================================================================
 */

export const KYC_TESTING = {
  mockProvider: {
    createSession: 'POST /kyc/sessions {"provider":"mock"}',
    webhook: 'POST /kyc/webhook/mock {"externalRef":"...", "decision":"APPROVED"}',
  },
  sumsubProvider: {
    createSession: 'POST /kyc/sessions {"provider":"sumsub"}',
    webhook: 'POST /kyc/webhook/sumsub (auto from Sumsub)',
  },
};
