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

## Subscription Plans (Razorpay)

Users get a tweet-posting limit based on their subscription plan. Plans are bought through **Razorpay (test mode)**, and a successful payment sends an invoice email with the plan details.

### Plans

| Plan | Price | Tweet limit |
|------|-------|-------------|
| Free | ₹0 | 1 tweet (in total) |
| Bronze | ₹100 / month | 3 tweets |
| Silver | ₹300 / month | 5 tweets |
| Gold | ₹1000 / month | Unlimited |

Paid plans last 30 days. After that the account falls back to the Free plan.

### Payment time restriction
Payments are only allowed between **10:00 AM and 11:00 AM IST**. Any attempt outside this window is blocked by the backend (`PAYMENT_WINDOW_CLOSED`, HTTP 403) when the order is created, and the Premium page shows the payments as closed. The time is always calculated in IST, whatever the server's time zone.

The verification step is deliberately not blocked by the window, so a user who paid at 10:59 still gets the plan they paid for.

> **To test on the deployed site, make the payment between 10:00 AM and 11:00 AM IST.**
> Razorpay is in test mode, so no real money moves. In the payment popup, choose UPI and enter `success@razorpay` to simulate a successful payment (or `failure@razorpay` for a failed one). Razorpay's documented test cards also work, but real cards do not.

### How it works
1. The user opens **Premium** (Settings, or the "Subscribe" button) and picks a plan.
2. The frontend asks the backend to create an order (`POST /api/v1/subscriptions/order`). The backend checks the time window, reads the price from its own plan list (the frontend never sends a price) and creates a Razorpay order.
3. The Razorpay Checkout popup opens. The user pays.
4. The frontend sends the three values Razorpay returns to `POST /api/v1/subscriptions/verify`.
5. The backend recomputes the signature (HMAC-SHA256 of `order_id|payment_id` with the key secret) and compares it with the one received. Only a matching signature activates the plan.
6. The plan is activated for 30 days with a fresh tweet counter, and an invoice email is sent.

### Tweet limit
- The limit is enforced in the backend when a tweet is created, for the logged-in user taken from the Firebase token. The `author` sent by the client is ignored.
- A per-user **counter** is increased atomically (only if it is below the limit), so deleting tweets cannot give quota back and two quick requests cannot both pass.
- If saving the tweet fails, the reserved slot is given back.
- Users who already had more tweets than the Free limit keep their tweets but cannot post more until they upgrade.
- When the limit is reached the API returns `TWEET_LIMIT_REACHED` (HTTP 403) and the composer shows a toast that links to the plans.
- The composer has a usage ring that opens a small popup with the plan, tweets used and tweets left.

### Reliability and security
- The payment is verified with a signature check on the server (constant-time comparison).
- Verification is idempotent: a double click or retry never activates the plan twice (one atomic `created` to `paid` update per order).
- The order must belong to the logged-in user.
- If the invoice email fails, the payment and plan are kept (`invoiceEmailSent` stays `false` in the payment record).
- The frontend retries verification a few times on network errors, in case the free-tier server is waking up.

### Invoice email
Sent through the Brevo API after a verified payment. It contains the invoice number, date (IST), payment ID, order ID, plan, tweet limit, validity date and the total paid.

### API
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/subscriptions/plans` | No | Plans and whether payments are open now |
| GET | `/api/v1/subscriptions/me` | Yes | Current plan and tweet usage |
| POST | `/api/v1/subscriptions/order` | Yes | Create a Razorpay order (time window enforced) |
| POST | `/api/v1/subscriptions/verify` | Yes | Verify the payment and activate the plan |

### Environment variables
Backend (`backend/.env`, and on Render):
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```
The frontend needs no new variable: the backend sends the public key ID with each order.

For local testing only, `BYPASS_TIME_WINDOWS=true` skips the time windows. It is ignored when `NODE_ENV=production`.

### Main files
- Backend: `constants/plans.js`, `models/subscriptionModel.js`, `models/paymentModel.js`, `services/subscriptionService.js`, `controllers/subscriptionController.js`, `routes/subscriptionRoutes.js`, `config/razorpay.js`, `templates/invoiceEmailTemplate.js`, `services/emailService.js`
- Frontend: `Pages/PlansPage.jsx` and its `Plans/` components, `helper/razorpayCheckout.js`, `Apis/subscriptionApi.js`, `Components/UsageIndicator.jsx`, `Components/TweetComposer.jsx`

## Audio Tweets

Users can record their voice in the browser, or upload an audio file, and post it as a tweet. Every upload is protected by an email OTP and by strict size, duration and time limits.

### Rules

| Rule | How it is enforced |
|---|---|
| OTP to the registered email before any upload | A 6-digit code is emailed (Brevo). A correct code gives a single-use upload grant that is valid for 15 minutes. |
| Maximum 5 minutes | The recorder stops at 4:59, the browser checks uploaded files, and the backend trusts the duration measured by Cloudinary. Anything over 300 s is deleted from Cloudinary and rejected. |
| Maximum 100 MB | multer `limits.fileSize` on the server (and a browser check). Larger files are rejected with HTTP 413 while receiving, never fully stored. |
| Only 2:00 PM to 7:00 PM IST | Checked on the backend when the OTP is requested, when it is verified, before the file is received and again before saving. Always calculated in IST, never in server time. |
| Plan limit | An audio tweet counts as one tweet in the user's subscription plan (same atomic slot as text tweets). |

### How it works
1. The user opens the audio dialog (mic button in the composer) and records with the browser `MediaRecorder` API, or chooses an audio file. A preview player and an optional caption (max 300 characters) are shown.
2. On **Post audio tweet**, the backend checks the time window and emails an OTP.
3. After the correct code is entered, the grant is created and the upload starts automatically with a progress bar.
4. Before the file is received, the backend re-checks the time window and the grant. The grant is used up when the upload is accepted, so one OTP allows one upload.
5. The file is stored on Cloudinary (`resource_type: video`, folder `twiller/audio`). The returned duration is checked, then the tweet is saved with `audio: { url, publicId, duration, bytes }`.
6. If anything fails after this point, the temporary file, the Cloudinary asset and the reserved plan slot are all cleaned up.
7. Deleting an audio tweet also deletes its file from Cloudinary.

If a user cancels an upload before it finishes, the verification is still valid and posting again does not need a new code. Cancel is not available once the upload reaches 100%, because the server is already processing the file.

### API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/tweets/audio/otp/request` | `POST` | Checks the time window and emails the OTP (rate limited: 5 requests per 15 minutes per IP) |
| `/api/v1/tweets/audio/otp/verify` | `POST` | Verifies the OTP (max 5 attempts) and creates the upload grant |
| `/api/v1/tweets/audio` | `POST` | Multipart upload (field `audio`, optional `content`). Creates the audio tweet |

All three need the Firebase token.

| Error code | HTTP | Meaning |
|---|---|---|
| `AUDIO_WINDOW_CLOSED` | 403 | Outside 2:00 PM to 7:00 PM IST |
| `AUDIO_OTP_REQUIRED` | 403 | No valid grant (OTP not verified, expired or already used) |
| `AUDIO_TOO_LARGE` | 413 | File over 100 MB |
| `INVALID_AUDIO_TYPE` | 415 | Not an accepted audio type |
| `AUDIO_TOO_LONG` | 422 | Longer than 5 minutes |
| `AUDIO_DURATION_UNKNOWN` | 422 | Duration could not be read |
| `TWEET_LIMIT_REACHED` | 403 | Subscription plan limit reached |
| `AUDIO_UPLOAD_FAILED` | 502 | Cloudinary upload failed |

### Design decisions
- **Disk storage for uploads:** the file never sits in memory, which matters on Render's free 512 MB instance.
- **Checks before the file is received:** the time window and the grant are checked before multer, so a blocked request never uploads up to 100 MB.
- **Duration from Cloudinary:** browser metadata can be faked, and recorded WebM files often report no duration.
- **Grant stored per user on the server:** the browser never handles a secret that could be forged or replayed. It is single use and expires automatically (MongoDB TTL index).
- **Browser formats:** Chrome and Firefox record WebM or Ogg, Safari records MP4. The recorder picks the first supported format and Cloudinary accepts all of them.
- **Text tweets** are now limited to 300 characters on the backend as well, with a character counter in the composer.

### Environment variables
No new variables. It uses the existing `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `BREVO_*` and `OTP_HMAC_SECRET`. For local testing only, `BYPASS_TIME_WINDOWS=true` skips the time window. It is ignored when `NODE_ENV=production`, so do not set it on Render.

> **To test on the deployed site, post the audio tweet between 2:00 PM and 7:00 PM IST.** Outside this time the feature is blocked on purpose and shows a notice. The microphone works on the deployed site because Vercel serves HTTPS.

### Known limitations
- Cloudinary's free plan has a monthly credit quota. Storage and bandwidth for audio count against it.
- Upload progress shows the browser-to-server part. The server then sends the file to Cloudinary, so the bar can show "Processing" for a few seconds.
- The recorder's format depends on the browser. Very old browsers without `MediaRecorder` can still upload a file.

### Main files
- Backend: `constants/audioLimits.js`, `models/audioUploadGrantModel.js`, `services/audioGrantService.js`, `services/audioStorageService.js`, `controllers/audioOtpController.js`, `controllers/audioTweetController.js`, `middlewares/audioUpload.middleware.js`, `routes/tweetRoutes.js`
- Frontend: `Apis/audioApi.js`, `helper/useAudioRecorder.js`, `helper/audioConstants.js`, `Components/Audio/AudioTweetDialog.jsx`, `AudioOtpStep.jsx`, `AudioUploadStep.jsx`, `Components/TweetCard.jsx`, `Components/TweetComposer.jsx`
