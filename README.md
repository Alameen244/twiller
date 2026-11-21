# twiller
twitter clone




## Account Recovery (Forgot Password)

### What it does
- **Dedicated route and page:** Dedicated `/forgot-password` route and UI (`ForgotPasswordPage`) accessible to logged-out users from the sign-in screen.
- **Dual recovery methods:** Users can reset their password using either their **registered email address** or **verified phone number** (`+91` format).
- **OTP verification:**
  - **Email:** Generates a cryptographically hashed 6-digit OTP delivered via Brevo (valid for 10 minutes, rate-limited, single-use).
  - **Phone:** Sends a 6-digit SMS verification code via Twilio Verify.
- **Once-per-day reset limit:** Users are permitted to complete a password reset only **once per day** (calculated in Indian Standard Time, IST). If a user attempts to request or submit another reset on the same day, the system blocks the request with HTTP 429 and displays the warning:
  > *"You can use this option only one time per day."*
- **Letters-only password generator:** Includes a built-in random password generator producing secure passwords consisting **exclusively of uppercase and lowercase letters** (no numbers, no special characters), with a one-click copy button.
- **Session invalidation:** Successfully resetting the password immediately revokes all active Firebase refresh tokens, forcing old sessions on all devices to sign out.

---

### How it works
1. **Initiation:** The user navigates to `/forgot-password` and selects either **Email** or **Phone**.
2. **Account resolution:** 
   - Backend validates input format (RFC email format or E.164 phone format).
   - Case-insensitive email lookup (`en` locale collation) or verified phone lookup (`isPhoneVerified: true`).
   - Verifies whether the account has a password provider in Firebase; Google-only OAuth accounts are gracefully rejected with a message to sign in using Google.
3. **Daily limit check:** Checks MongoDB `passwordresets` collection for an existing record with `{ user, dayKey }` where `dayKey` is today's date in IST (`YYYY-MM-DD`). If found, returns HTTP 429 with code `DAILY_LIMIT`.
4. **OTP dispatch:** 
   - Email: Creates a salted/HMAC-hashed OTP entry in `EmailOtp` and sends the email via Brevo.
   - Phone: Calls Twilio Verify API to dispatch SMS.
5. **Reset & atomic slot claim:**
   - User inputs the 6-digit OTP, new password, and confirmation password (or generates one).
   - The OTP is verified (Brevo hash verification or Twilio Verify check).
   - The daily slot is claimed atomically in MongoDB via a unique compound index (`{ user: 1, dayKey: 1 }`). Duplicate attempts trigger error code `11000` and return HTTP 429.
   - Password is updated in Firebase via `adminAuth.updateUser()`. If Firebase update fails, the claimed slot is rolled back automatically.
   - `adminAuth.revokeRefreshTokens()` is called to sign out previous sessions.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/users/forgot-password/request` | `POST` | Validates user, checks daily limit, sends email/SMS OTP (rate-limited: max 5 req/min per IP) |
| `/api/v1/users/forgot-password/reset` | `POST` | Validates OTP, atomically claims daily slot, updates password in Firebase, and revokes tokens |

---

### Password Generator Details
Implemented in `frontend/src/helper/passwordGenerator.js` (`generateLettersPassword`):
- **Character set:** `[A-Za-z]` (52 possible uppercase and lowercase letters). All numbers, spaces, and special symbols are strictly excluded.
- **CSPRNG randomness:** Uses browser `crypto.getRandomValues()` instead of pseudo-random `Math.random()`.
- **Zero modulo bias:** Implements rejection sampling with `BYTE_LIMIT = 256 - (256 % 52)` so all 52 letters have an identical, uniform probability distribution.
- **Guaranteed complexity:** Enforces presence of at least one uppercase `[A-Z]` and one lowercase `[a-z]` character, defaulting to 16 characters (well above the 8-character minimum).

---

### Design Decisions & Edge Cases
- **IST day boundary:** Uses `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' })` to produce the `dayKey` (`YYYY-MM-DD`). Since cloud servers typically run on UTC, calculating by IST prevents midnight boundary bugs in India.
- **Fair limit consumption:** The daily reset limit is only consumed after a **successful** reset. If a user mistypes an OTP, requests an OTP resend, or lets the OTP expire, their daily allowance is not wasted.
- **Race-condition safe:** The MongoDB index `{ user: 1, dayKey: 1 }` with `unique: true` prevents concurrent reset exploitation.
- **Brute-force protection:** In addition to the once-per-day rule, `forgotPasswordRateLimiter` restricts OTP requests to 5 requests per minute per IP address.
- **Twilio unverified numbers:** Handles Twilio trial account restrictions gracefully (error `21608`) by returning an informative message to use a verified demo number.

---

### Environment Variables
| Variable | Service | Purpose |
|---|---|---|
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | Backend | Sending email OTPs |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` | Backend | Sending & verifying SMS OTPs |
| `OTP_HMAC_SECRET` | Backend | HMAC hashing for email OTP storage |

---

## Login Security and Login History

### What it does
- Every login records the **browser, operating system, device category (desktop / laptop / mobile) and IP address**, stored in the `loginhistories` collection.
- Users can see their own history under **Settings → Login history** (date and time in IST, browser, OS, device, IP, status). Only the account owner can read it.
- **Google Chrome** logins must verify a 6-digit OTP sent to the registered email. This applies to every login method (email/password, sign-up and Google sign-in).
- **Microsoft Edge** logins need no extra step. Other browsers (Firefox, Safari, Brave and so on) also log in without an OTP.
- **Mobile** logins are allowed only between **10:00 AM and 1:00 PM IST**. Attempts outside it are blocked and recorded with status `blocked`. Tablets count as mobile.

### How it works
1. The user signs in with Firebase.
2. The frontend calls `POST /api/v1/users/login-session`. The backend reads the user-agent and IP, applies the mobile time window, and creates a history row.
3. For Chrome, the row is `pending` and an OTP is emailed (via Brevo). The app stays locked until `POST /login-session/verify` succeeds, then the row becomes `success`.
4. If the login is blocked, the frontend signs the user out and shows the reason.

| Endpoint | Purpose |
|---|---|
| `POST /users/login-session` | Record the login, apply rules, send OTP if needed |
| `POST /users/login-session/verify` | Verify the email OTP |
| `POST /users/login-session/resend-otp` | Resend the OTP (rate limited) |
| `GET /users/login-history` | Owner-only login history |

### Design decisions
- **Detection:** `ua-parser-js@1` (MIT licensed, pure JavaScript, no external service). The browser name comes from the parser, not a text search, so Edge (whose user-agent also contains "Chrome") is not treated as Chrome.
- **Chrome on iOS** reports itself as `CriOS`, which is handled explicitly.
- **Brave** sends a Chrome user-agent, so the frontend reports it using `navigator.brave.isBrave()` and it is treated as "other".
- **Laptop vs desktop:** a user-agent cannot tell them apart, so the frontend sends `screen.width` and widths up to 1600 px are labelled "laptop". This is a heuristic.
- **OTP storage:** a reusable `EmailOtp` model with a `purpose` field (HMAC-hashed, 10-minute TTL, 5 attempts, single use), so other features can reuse it.
- **Time window:** always computed in IST with `Intl` (not server time), because the server runs in UTC.
- **Local testing:** `BYPASS_TIME_WINDOWS=true` in `backend/.env` skips the time window. It is **ignored when `NODE_ENV=production`**, so it cannot weaken the deployed app.

### Known limitations
- Browser, OS and device type come from the client's user-agent and can be changed by the user (for example "Request desktop site", or DevTools device emulation). This is inherent to user-agent based detection.
- Windows 11 reports itself as "Windows 10" in the user-agent.
- The OTP gate is enforced by the app flow: Firebase has already authenticated the user, and the backend records whether each session is verified. Protected API routes do not yet reject unverified sessions.
- Devices are classified by user-agent and screen width only, with no IP geolocation.

### Environment variables
| Variable | Where | Notes |
|---|---|---|
| `OTP_HMAC_SECRET` | backend | Required |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | backend | Email OTP |
| `BYPASS_TIME_WINDOWS` | backend `.env` (local only) | Do not set on Render |
| `NODE_ENV=production` | Render | Disables the bypass |
