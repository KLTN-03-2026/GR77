# 🔐 Accept Policy + Validation Implementation Guide

**Date:** March 26, 2026  
**Feature:** User Account Policy Acceptance with Validation  
**Status:** ✅ Code Ready (Awaiting DB Migration & Testing)

---

## 📋 Overview

This guide documents the implementation of policy acceptance (+validation) in the Kindlink registration flow.

### What Changed:

1. ✅ **Database Schema** - Added 2 new fields to `User` model
2. ✅ **DTOs** - Created `RegisterDto` with validation decorators
3. ✅ **AuthService** - Updated `register()` to check policy acceptance
4. ✅ **AuthController** - Updated register endpoint to use DTO
5. ✅ **UsersService** - Added methods for policy management
6. ✅ **UsersController** - Added endpoints to accept/check policy
7. ✅ **Config** - Added `POLICY_VERSION` to `.env`

---

## 🗄️ 1) Database Schema Changes

**File:** `apps/api/prisma/schema.prisma`

```prisma
model User {
  // ... existing fields ...
  
  // Policy Acceptance (NEW)
  acceptedPolicyAt DateTime? @map("accepted_policy_at")
  policyVersion    String?   @map("policy_version")
  
  // Relations ...
}
```

### Run Migration:

```bash
cd apps/api

# Generate Prisma Client (optional, but good practice)
pnpm prisma generate

# Create migration (when DB is running)
pnpm prisma migrate dev --name add_policy_acceptance

# Deploy migration to production DB
pnpm prisma migrate deploy
```

---

## 📝 2) Request/Response Examples

### 2.1) Register Endpoint

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "acceptPolicy": true
}
```

**Success Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "message": "Verification email sent"
}
```

**Error Responses:**

- **Policy not accepted (400):**
  ```json
  {
    "statusCode": 400,
    "message": "You must accept the policy to register"
  }
  ```

- **Email already exists (409):**
  ```json
  {
    "statusCode": 409,
    "message": "Email already exists"
  }
  ```

- **Validation error - invalid email (400):**
  ```json
  {
    "statusCode": 400,
    "message": ["email must be an email"],
    "error": "Bad Request"
  }
  ```

- **Validation error - password too short (400):**
  ```json
  {
    "statusCode": 400,
    "message": ["password must be longer than or equal to 8 characters"],
    "error": "Bad Request"
  }
  ```

---

### 2.2) Accept Policy Endpoint (After Registration)

**Endpoint:** `POST /users/me/accept-policy`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "acceptedPolicyAt": "2026-03-26T12:30:45.123Z",
  "policyVersion": "2026-03-26"
}
```

---

### 2.3) Check Policy Status Endpoint

**Endpoint:** `GET /users/me/policy-status`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response if update needed (200):**
```json
{
  "needsPolicyUpdate": true,
  "message": "Please accept the updated policy"
}
```

**Response if up-to-date (200):**
```json
{
  "needsPolicyUpdate": false,
  "message": "Policy is up to date"
}
```

---

## 🎨 3) Frontend Implementation

### 3.1) Register Form Component

```typescript
// Example: React component with form validation

import { useState } from 'react';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    acceptPolicy: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.acceptPolicy) {
        setError('You must accept the policy to register');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      // Redirect to email verification page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password (min 8 characters)"
        value={formData.password}
        onChange={handleChange}
        required
        minLength={8}
      />

      <label>
        <input
          type="checkbox"
          name="acceptPolicy"
          checked={formData.acceptPolicy}
          onChange={handleChange}
        />
        I agree to the Terms of Service and Privacy Policy
      </label>

      <button type="submit" disabled={!formData.acceptPolicy || loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>

      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### 3.2) Policy Update Check

```typescript
// After login, check if user needs to accept updated policy

export async function checkPolicyStatus(token: string) {
  const response = await fetch('/api/users/me/policy-status', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  return data.needsPolicyUpdate; // true or false
}

// If needsPolicyUpdate is true, show modal to accept new policy
export async function acceptNewPolicy(token: string) {
  const response = await fetch('/api/users/me/accept-policy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
}
```

---

## 🔧 4) Configuration

### .env file:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=kindlink
DATABASE_URL=postgresql://postgres:123456@localhost:5433/kindlink
JWT_ACCESS_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
POLICY_VERSION=2026-03-26
```

**Change `POLICY_VERSION`** value when policy is updated:
- When you update policy: Change value from `2026-03-26` to `2026-04-01` (or use timestamp)
- Users will then see `needsPolicyUpdate: true` until they accept new version
- This triggers FE to show modal asking them to accept new policy

---

## 🧪 5) Testing Checklist

### Postman/Manual Testing:

```
✅ Register with acceptPolicy=true → Success
✅ Register with acceptPolicy=false → 400 Bad Request
✅ Register with invalid email → 400 Validation Error
✅ Register with short password (< 8 chars) → 400 Validation Error
✅ Register with duplicate email → 409 Conflict
✅ Accept policy endpoint (POST /users/me/accept-policy) → 200 OK
✅ Check policy status (GET /users/me/policy-status) → 200 OK
✅ Change POLICY_VERSION in .env → needsPolicyUpdate becomes true
```

### Integration Tests:

```typescript
// apps/api/test/auth.e2e-spec.ts

describe('Auth - Policy Acceptance', () => {
  it('should register user with valid policy acceptance', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        acceptPolicy: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('test@example.com');
  });

  it('should reject registration without policy acceptance', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        acceptPolicy: false,
      })
      .expect(400);
  });
});
```

---

## 🚀 6) Deployment Checklist

Before pushing to production:

- [ ] Database migration created: `add_policy_acceptance`
- [ ] `.env` includes `POLICY_VERSION` config
- [ ] All code changes committed
- [ ] Tests passing
- [ ] Frontend form updated to include policy checkbox
- [ ] Terms of Service / Privacy Policy pages ready
- [ ] Email verification flow tested end-to-end

---

## 📱 7) User Experience Flow

```
┌─────────────────────────────────────────┐
│  FE: Register Page                      │
│  [Email input]                          │
│  [Password input]                       │
│  [✓] Accept T&C checkbox (disabled btn) │
│  [Register button]                      │
└─────────────────────────────────────────┘
              ↓ (POST /auth/register)
┌─────────────────────────────────────────┐
│  BE: AuthService.register()             │
│  1. Check acceptPolicy === true         │
│  2. Hash password                       │
│  3. Save to DB with policy info         │
│  4. Send verification email             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  FE: Email Verification Page            │
│  [Enter 6-digit code]                   │
│  [Verify button]                        │
└─────────────────────────────────────────┘
              ↓ (POST /auth/verify-email)
┌─────────────────────────────────────────┐
│  BE: Verify & Login                     │
│  1. Verify code                         │
│  2. Return accessToken + refreshToken   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  FE: Post-Login Policy Check            │
│  (GET /users/me/policy-status)          │
│  if needsPolicyUpdate === true          │
│    Show Modal: "New Policy Available"   │
│    [Accept button]                      │
└─────────────────────────────────────────┘
```

---

## 📞 Support & Notes

### Q: How often should I update `POLICY_VERSION`?

A: Update it whenever your Terms of Service or Privacy Policy changes. It's typically a date string (e.g., `2026-03-26`) or semantic version (e.g., `v1.0.0`).

### Q: Can users skip policy acceptance after registration?

A: Currently **NO** - policy acceptance is mandatory during registration. After registration, users can update it anytime via `/users/me/accept-policy`.

### Q: What if policy acceptance fails to save?

A: The entire registration transaction fails, user is not created. They can retry immediately.

### Q: Is policy version migration automatic?

A: **No**. When you update `POLICY_VERSION`:
1. Existing users will see `needsPolicyUpdate: true`
2. Frontend should prompt them to accept new policy
3. When they click "Accept", policy is updated to new version

### Q: How to test locally?

```bash
# 1. Start Docker + DB
docker-compose up -d postgres

# 2. Run migration
cd apps/api
pnpm prisma migrate dev

# 3. Start server
pnpm dev:api

# 4. Test endpoint
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.com",
    "password":"password123",
    "acceptPolicy":true
  }'
```

---

## 📚 Related Files

- [Schema Changes](./apps/api/prisma/schema.prisma)
- [RegisterDto](./apps/api/src/modules/auth/dto/register.dto.ts)
- [AuthService](./apps/api/src/modules/auth/auth.service.ts)
- [AuthController](./apps/api/src/modules/auth/auth.controller.ts)
- [UsersService](./apps/api/src/modules/users/users.service.ts)
- [UsersController](./apps/api/src/modules/users/users.controller.ts)
- [Environment Config](./.env)

---

**Implementation completed:** March 26, 2026  
**Ready for:** Database migration & Testing
