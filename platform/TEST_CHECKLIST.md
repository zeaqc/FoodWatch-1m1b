# FoodWatch — Test Checklist

Run these tests manually after starting the platform. Automated test stubs
are in `server/src/__tests__/` (add Jest + Supertest as shown below for CI).

---

## Phase 1: Authentication

### Donor Registration
- [ ] Register with valid data → OTP sent (check console in dev mode)
- [ ] Try registering with the same email → expect 409 Conflict
- [ ] Leave out required fields → expect 422 with field errors
- [ ] Submit `safetyAccepted: false` → expect 422
- [ ] Submit `consentGiven: false` for Aadhaar → expect 422
- [ ] Enter a 12-digit Aadhaar number in the last-4-digits field → expect 422
- [ ] Enter a full Aadhaar number → must be rejected by frontend validation (maxLength 4)

### OTP Verification
- [ ] Submit correct OTP → `phoneVerified: true` in DB
- [ ] Submit wrong OTP → expect 400
- [ ] Submit OTP after 10 minutes → expect 400 "OTP expired"
- [ ] Resend OTP → new OTP in console, old OTP now invalid

### Receiver Registration
- [ ] Register with NGO reg number → saved correctly
- [ ] Register without NGO reg number → allowed (optional field)
- [ ] Register with invalid phone number → expect 422

### Login
- [ ] Login with correct credentials → receive JWT + user object
- [ ] Login with wrong password → expect 401
- [ ] Login with non-existent email → expect 401
- [ ] JWT contains `{ id, role }` → verify with jwt.io

---

## Phase 2: Donation CRUD

### Create Donation
- [ ] Donor (phone verified) creates donation → 201 + donation in DB
- [ ] Set `preparedAt` to a future datetime → expect 422
- [ ] Set `quantity: 0` → expect 422
- [ ] Upload a >5 MB photo → expect 400
- [ ] Upload a PDF file as photo → expect 400
- [ ] Omit `safetyAccepted` → expect 422
- [ ] `expiresAt` = `preparedAt` + `shelfLifeHours` → verify in DB
- [ ] Donor without phone verification tries to add donation → expect 403

### Get Donations
- [ ] `GET /api/donations` → returns available donations, excludes expired
- [ ] Filter by `category=veg` → only veg items returned
- [ ] Filter by `city=Delhi` → only Delhi items returned
- [ ] Geo filter with `lat/lng/radius` → sorted by distance

### Edit / Delete
- [ ] Donor edits own available donation → 200
- [ ] Donor tries to edit claimed donation → expect 400
- [ ] Donor deletes own available donation → status becomes `removed`
- [ ] Donor tries to delete another donor's donation → expect 404

---

## Phase 3: Claim Flow

### Claim
- [ ] Receiver claims an available donation → status changes to `claimed`
- [ ] Two receivers claim the same donation simultaneously → only one succeeds, other gets 409
- [ ] Receiver tries to claim an expired donation → expect 409
- [ ] Donor tries to claim (role check) → expect 403

### Collect
- [ ] Receiver marks collected → `receiverConfirmed: true` in Claim
- [ ] Donor marks confirmed → `donorConfirmed: true` in Claim
- [ ] After both confirm → Claim status = `collected`, Donation status = `collected`
- [ ] Partial confirmation (only one side) → status stays `pending`

### Cancel
- [ ] Receiver cancels claim → Donation reverts to `available`
- [ ] Cannot cancel a `collected` claim → expect 400

---

## Phase 4: Admin

- [ ] Admin verifies a donor → `isVerified: true`, notification sent
- [ ] Admin disables a user → user cannot login
- [ ] Admin removes a donation → status becomes `removed`
- [ ] Non-admin tries to access `/api/admin/*` → expect 403

---

## Phase 5: Reports & Safety

- [ ] Submit a report on a donation → `reportCount` increments
- [ ] Submit 3 reports → donation auto-removed
- [ ] Same user reports same donation twice → check for duplicates in reports array

---

## Phase 6: Notifications

- [ ] After claim: donor receives in-app notification
- [ ] After collection: both parties receive notifications
- [ ] Expiry warning (30 min before): donor receives in-app + email (check console in dev)
- [ ] `GET /api/impact/notifications` → returns sorted list
- [ ] `PATCH /api/impact/notifications/read-all` → unreadCount becomes 0

---

## Phase 7: Impact API

- [ ] `GET /api/impact` → returns all real numbers (no hard-coded values)
- [ ] After creating + collecting a donation → `mealsShared` increments
- [ ] `sdgAlignment` object present with SDG1, SDG2, SDG3, SDG11, SDG12, SDG17

---

## Phase 8: Frontend

- [ ] `/` loads with live impact stats
- [ ] `/register` → donor/receiver toggle works, all validation fires
- [ ] `/verify-otp` → redirects to correct dashboard after verification
- [ ] `/browse` → grid + map view both load
- [ ] `/browse` → countdown timer shows correctly, expired items not shown
- [ ] Claim from browse page → real-time update (item disappears or shows `claimed`)
- [ ] Donor dashboard → 4 tabs (all/available/claimed/collected) filter correctly
- [ ] Receiver dashboard → claim cards show pickup address + contact
- [ ] Admin panel → stats, user table, donation table, report list all load
- [ ] `/impact` → all 6 charts render; SDG cards show real numbers
- [ ] Notification bell → shows unread count badge, clicking marks read

---

## Phase 9: Security

- [ ] All `/api/donations` write endpoints return 401 without JWT
- [ ] All `/api/admin/*` endpoints return 403 for non-admin JWT
- [ ] Rate limiter: send 25 requests to `/api/auth/login` in 15 min → expect 429
- [ ] Check response headers for `X-Powered-By: Express` → should be absent (Helmet)
- [ ] Check `CORS` header on cross-origin request → only `CLIENT_ORIGIN` allowed

---

## Automated Test Stubs (Jest + Supertest)
Add to `server/src/__tests__/auth.test.js`:
```javascript
const request = require('supertest');
const app     = require('../../src/index');

describe('POST /api/auth/register/donor', () => {
  it('rejects future preparedAt', async () => {
    // ... test body
  });
  it('rejects missing safetyAccepted', async () => {
    // ... test body
  });
});
```
Run: `cd server && npm test`
