# eKYC Verification Feature - Developer Test Checklist

## Quick Start
```bash
# 1. Pull latest code
git checkout feature/require-ekyc-for-campaign-creation

# 2. Install dependencies (if needed)
pnpm install

# 3. Run migrations (update database)
cd apps/api
npx prisma migrate deploy  # or: npx prisma migrate dev

# 4. Start API server
cd apps/api
pnpm dev

# 5. Start Web app
cd apps/web
pnpm dev

# 6. Open browser
# API: http://localhost:3001
# Web: http://localhost:3000
```

---

## Checklist A: Database & Schema ✅

- [x] Migration file created: `apps/api/prisma/migrations/20260412000000_add_kyc_verification/migration.sql`
- [x] Migration SQL correct: `ALTER TABLE "users" ADD COLUMN "is_kyc_verified" BOOLEAN NOT NULL DEFAULT false;`
- [x] Prisma schema updated: `isKycVerified Boolean @default(false) @map("is_kyc_verified")`
- [x] Column maps correctly to database
- [x] Default value set to false (safe)

**Run SQL to verify in database:**
```sql
-- Connect to database
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_kyc_verified';

-- Should return:
-- | column_name      | data_type | is_nullable |
-- | is_kyc_verified  | boolean   | NO          |

-- Check default values
SELECT * FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_kyc_verified';
```

---

## Checklist B: API Backend ✅

### Files Modified
- [x] `apps/api/src/modules/campaigns/campaigns.service.ts` - Added eKYC check
- [x] `apps/api/src/modules/campaigns/campaigns.controller.ts` - Endpoint exists
- [x] JWT auth guard applied to POST `/campaigns`

### Test: Campaign Creation Without eKYC

**Steps:**
1. Register new user: `POST /auth/register`
2. Login: `POST /auth/login` → Get access token
3. Try to create campaign: `POST /campaigns`

**Expected Results:**
- [ ] Status Code: `403 Forbidden`
- [ ] Error Message: `"You must complete eKYC verification to create a campaign"`
- [ ] Response includes `statusCode: 403`

**cURL Command:**
```bash
curl -X POST http://localhost:3001/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test campaign",
    "category": "Healthcare",
    "locationText": "Hanoi",
    "fundingGoalAmount": 1000000,
    "minimumDonationAmount": 10000,
    "startAt": "2026-04-15T00:00:00Z",
    "endAt": "2026-05-15T00:00:00Z"
  }'
```

### Test: Campaign Creation With eKYC

**Steps:**
1. Register new user
2. Login → Get token
3. **Manually update database:**
   ```sql
   UPDATE users SET is_kyc_verified = true 
   WHERE email = 'your-test@example.com';
   ```
4. Verify update:
   ```sql
   SELECT is_kyc_verified FROM users 
   WHERE email = 'your-test@example.com';  -- Should return: true
   ```
5. Try to create campaign again

**Expected Results:**
- [ ] Status Code: `201 Created`
- [ ] Response includes `id`, `title`, `status: "PENDING"`
- [ ] Campaign created successfully

---

## Checklist C: API Endpoint - /auth/me ✅

### Test: Get User Info

**Steps:**
1. Ensure user has valid JWT token
2. Call: `GET /auth/me`

**Expected Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "username",
  "isVerified": true,
  "isKycVerified": false,    // ← NEW FIELD
  "role": "USER",
  "profile": { ... },
  "wallet": { ... },
  ...
}
```

- [ ] Response includes `isKycVerified` field
- [ ] Value is `boolean` (not string or null)
- [ ] Defaults to `false` for new users
- [ ] Updates to `true` after verification

---

## Checklist D: Frontend UI ✅

### Files Modified
- [x] `apps/web/src/app/(app)/creator/campaigns/new/page.tsx`
- [x] ExclamationIcon imported
- [x] State management added
- [x] Banner implemented
- [x] Form controls disabled
- [x] Submit button updated

### Test: UI - Not Verified

**Steps:**
1. User WITHOUT eKYC verification
2. Navigate to: `http://localhost:3000/creator/campaigns/new`

**Expected Visuals:**
- [ ] Yellow warning banner appears at top
- [ ] Banner has yellow icon (ExclamationIcon)
- [ ] Banner text: "eKYC Verification Required"
- [ ] Banner message: "To create and manage campaigns, you must complete eKYC verification with your ID card/passport first."
- [ ] Button: "Complete eKYC Verification →" (clickable)

**Form State:**
- [ ] Title input field: **disabled** (50% opacity, gray background)
- [ ] Description field: **disabled**
- [ ] Category dropdown: **disabled**
- [ ] Location input: **disabled**
- [ ] Cover image upload: **disabled** (grayed out button)
- [ ] Gallery upload: **disabled** (grayed out button)
- [ ] Funding amount input: **disabled**
- [ ] Min donation input: **disabled**
- [ ] Start date input: **disabled**
- [ ] End date input: **disabled**
- [ ] Auto-close checkbox: **disabled**

**Submit Button:**
- [ ] Button text: "Complete eKYC to Create"
- [ ] Button **disabled** (grayed, not clickable)
- [ ] Cursor changes to `not-allowed` on hover

### Test: UI - Is Verified

**Steps:**
1. User WITH eKYC verification (set `isKycVerified = true` in DB)
2. Navigate to: `http://localhost:3000/creator/campaigns/new`

**Expected Visuals:**
- [ ] Yellow warning banner **NOT** visible
- [ ] All form inputs **enabled** (100% opacity, normal colors)
- [ ] Submit button text: "Save"
- [ ] Submit button **enabled** (clickable, normal color)
- [ ] Can type in all fields
- [ ] Can upload images
- [ ] Can submit form

### Test: Submit Button Text States

- [ ] Initial load (checking): "Checking..."
- [ ] Not verified: "Complete eKYC to Create"
- [ ] Verified, ready: "Save"
- [ ] Saving: "Saving..."

### Test: Banner CTA Button

- [ ] Click "Complete eKYC Verification →"
- [ ] Should navigate to: `/creator/verify-kyc`
- [ ] Verify page exists or shows placeholder

---

## Checklist E: Error Handling ✅

### Test: API Timeout

**Steps:**
1. Start with network online
2. Turn off network/API in DevTools
3. Refresh page

**Expected:**
- [ ] Page loads (doesn't crash)
- [ ] Form is **disabled** (safe default)
- [ ] No errors in console
- [ ] Error message may show (optional)

### Test: Invalid Token

**Steps:**
1. Manually edit localStorage
2. Change `accessToken` to invalid value
3. Refresh page

**Expected:**
- [ ] Page loads gracefully
- [ ] Form is **disabled** (safe default)
- [ ] On form submit: redirected to login

### Test: Campaign Creation Error

**Steps:**
1. User verified but campaign creation fails (API error)
2. Try to create campaign

**Expected:**
- [ ] Red error banner shows
- [ ] Error message displays
- [ ] Form remains visible
- [ ] Can correct and retry

---

## Checklist F: Security Validation ✅

### Backend Security
- [x] eKYC check happens on **server** (not skipped if client disabled)
- [x] JWT token required for endpoint
- [x] User ID extracted from token (not request body)
- [x] Database verified for isKycVerified (not trusting frontend)
- [x] Proper HTTP status codes (403 for forbidden, not 400)

### Frontend Security
- [ ] No hardcoded tokens in code
- [ ] Tokens only in localStorage (not cookies for this app)
- [ ] No KYC/identity data exposed in frontend code
- [ ] Safe error messages (don't leak system info)
- [ ] Form disabled by default (fail-safe)

---

## Checklist G: Cross-Browser Testing

- [ ] Chrome/Chromium (primary)
- [ ] Firefox (alternative)
- [ ] Safari (if on Mac)
- [ ] Edge (Windows)

**Things to check:**
- Form styling renders correctly
- Banner styles apply properly
- Input disabled state visible
- Button hover states work
- Text readable on all browsers

---

## Checklist H: Mobile Responsive

- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)

**Things to check:**
- Banner message readable
- Form inputs accessible
- Button size appropriate
- No horizontal scroll
- Touch target at least 44x44px

---

## Checklist I: Accessibility

- [ ] Yellow banner has sufficient contrast
- [ ] Icon has alt text or aria-label
- [ ] Form labels associated with inputs
- [ ] Disabled inputs marked properly
- [ ] Button state changes announced
- [ ] Can navigate with keyboard only (Tab key)

**WCAG Test:**
```
Run in browser DevTools:
- F12 → Lighthouse → Accessibility
- Check score ≥ 90
```

---

## Checklist J: Git & Documentation ✅

- [x] Files committed to feature branch
- [x] Commit message: "feature: require eKYC verification for campaign creation"
- [x] All changes documented
- [x] Test files created (`TEST_EKEYC_VERIFICATION.md`)
- [x] API requests documented (`TEST_API_REQUESTS.http`)

---

## Final Verification

**All checks complete?** Run this command:

```bash
cd /d/Projects/GR77
git status  # Should be clean (no uncommitted changes)
git log --oneline -5  # Verify commit is there
```

**Expected output:**
```
12ad791 feature: require eKYC verification for campaign creation
...
```

---

## Sign-Off

| Role | Status | Date | Notes |
|------|--------|------|-------|
| Developer | ✅ Complete | 2026-04-12 | All code implemented |
| QA | ⏳ Pending | TBD | Manual testing needed |
| Product | ⏳ Pending | TBD | Feature approval |

**QA Testing Instructions:**
1. Follow all checklists above
2. Test on staging environment
3. Document any issues
4. Update status when complete

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [Next.js Forms](https://nextjs.org/docs/pages/building-your-application/data-fetching/forms-and-mutations)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

Generated: 2026-04-12  
Version: 1.0
