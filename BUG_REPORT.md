# 🐛 Twiller Application - Complete Bug Report
**Generated:** 2026-11-07
**Tested by:** AI QA Inspector

---

## 🔴 CRITICAL BUGS (App-Breaking)  [## all fixed in 7/11/2026  ]

### 1. **Profile Avatar Button Logs User Out Instead of Navigation**
**Location:** `frontend/src/Components/Layout/AppLayout.jsx:7`
**Issue:** The user profile button at the bottom-left sidebar calls `logout` instead of navigating or showing a menu.
```jsx
<Button onClick={logout} ...>  {/* ❌ WRONG */}
  <Avatar src={user?.avatar} />
  <Typography>{user?.displayName}</Typography>
</Button>
```
**Expected:** Should navigate to `/profile` or open a dropdown menu with logout option.
**Impact:** Users get logged out every time they click their profile avatar.

---

### 2. **Unlike/Unretweet Not Working - Backend Missing DELETE/TOGGLE Logic**
**Location:** `backend/index.js:94-122`
**Issue:** Like and retweet endpoints only ADD interactions, never remove them. Once liked/retweeted, clicking again does nothing.
```js
// Current backend - only increments
if (!tweet.likedBy.includes(userId)) {
  tweet.likes += 1;
  tweet.likedBy.push(userId);
}
// Missing: else block to unlike
```
**Expected:** Should toggle - if already liked, remove the like and decrement count.
**Impact:** Users cannot unlike or un-retweet posts.

---

### 3. **Edit Profile Doesn't Persist - User State Reverts After Interaction**
**Location:** `frontend/src/Context/AuthContext.jsx:32-45`
**Issue:** After updating profile, the `onAuthStateChanged` listener re-fetches from backend via `getLoggedInUser()`, but it doesn't refetch after profile updates. Then on any auth state change (like clicking logout button by mistake), the old cached data is restored.
**Root Cause:** `updateProfile` only updates local state + backend, but doesn't invalidate or re-trigger the auth listener.
**Impact:** Profile edits appear to work but revert randomly.

---

## 🟡 HIGH PRIORITY BUGS

### 4. **User Avatar/Name Shows as Fallback After Unlike**
**Location:** `frontend/src/Components/TweetCard.jsx:41`
**Issue:** When unliking/re-tweeting, the backend returns the updated tweet, but the `author` field is not populated (it's just an ObjectId string, not the full user object).
```js
// Backend returns tweet with author: "507f1f77bcf86cd799439011" (just ID)
// Frontend expects author: { displayName: "...", avatar: "..." }
```
**Backend Issue:** `index.js:94-122` - Like/retweet endpoints don't `.populate('author')` before returning.
**Impact:** After interaction, tweet author shows as fallback avatar (first letter) instead of real data.

---

### 5. **No Authentication/Authorization on Backend APIs**
**Location:** All backend routes
**Issue:** Anyone can hit the API without authentication. No JWT tokens, no session validation.
```js
// Anyone can do:
POST /post { author: "any-user-id", content: "fake tweet" }
POST /like/tweet-id { userId: "any-user-id" }
```
**Impact:** Security vulnerability - impersonation, fake data, unauthorized actions.

---

### 6. **Image Upload Doesn't Actually Upload - Just Creates Blob URL**
**Location:** `frontend/src/Components/TweetComposer.jsx:38-41`
```js
const upload = (e) => {
  const f = e.target.files?.[0];
  if (f) setImage(URL.createObjectURL(f));  // ❌ Local blob only
};
```
**Issue:** The image is a `blob:http://localhost...` URL that only exists in the user's browser. It's sent to the backend as a string, but the blob doesn't exist on the server or for other users.
**Expected:** Should upload to cloud storage (Firebase Storage, Cloudinary, S3) and save the real URL.
**Impact:** Images don't show for other users or after refresh.

---

## 🟠 MEDIUM PRIORITY BUGS

### 7. **Date.now() Called at Schema Definition Time**
**Location:** `backend/models/user.js:10` and `backend/models/tweet.js:11`
```js
joinedDate: { type: Date, default: Date.now() }  // ❌ Called once at app start
timestamp: { type: Date, default: Date.now() }   // ❌ Same
```
**Issue:** `Date.now()` is executed when the schema is defined (app startup), so ALL users/tweets get the same timestamp.
**Fix:** Remove the parentheses:
```js
default: Date.now  // ✅ Function reference, called per document
```
**Impact:** All users show the same "Joined" date, all tweets have identical timestamps.

---

### 8. **No Error Handling in TweetCard Interactions**
**Location:** `frontend/src/Components/TweetCard.jsx:19-37`
```js
const like = async () => {
  try {
    setItem((await client.post(...)).data);
  } catch (e) {
    console.error(e);  // ❌ Just logs, no user feedback
  }
};
```
**Issue:** If the API fails (network error, server down), the user sees nothing - the heart stays unfilled but no error toast/message appears.
**Impact:** Silent failures confuse users.

---

### 9. **Race Condition in Google Sign-In**
**Location:** `frontend/src/Context/AuthContext.jsx:32-45` and `81-100`
**Issue:** Both `onAuthStateChanged` listener AND `googlesignin()` function call `getLoggedInUser()` simultaneously for new users. They race to register the user, potentially creating duplicates or failing.
**Current State:** Already partially fixed by having both handle registration, but could be optimized.

---

### 10. **No Loading State After Profile Edit Submit**
**Location:** `frontend/src/Components/EditProfileDialog.jsx:50-58`
**Issue:** Dialog closes immediately after submit, but if the API is slow, the profile page still shows old data for a moment.
**Expected:** Show loading spinner, wait for backend response, then close dialog and refresh profile view.

---

## 🟢 LOW PRIORITY / POLISH BUGS

### 11. **Back Button on Profile Does Nothing**
**Location:** `frontend/src/Pages/ProfilePage.jsx:42-44`
```jsx
<IconButton sx={{ color: "#fff" }}>
  <ArrowBack />  {/* No onClick handler */}
</IconButton>
```
**Expected:** Should navigate back or to home.

---

### 12. **Tabs on Profile Do Nothing Except "Posts"**
**Location:** `frontend/src/Pages/ProfilePage.jsx:140-152`
**Issue:** Replies, Highlights, Articles, Media tabs just show "Nothing to see here yet" placeholder.
**Expected:** Either implement or remove unused tabs.

---

### 13. **Default Location/Website Shown Even If User Doesn't Have One**
**Location:** `frontend/src/Pages/ProfilePage.jsx:102, 107`
```jsx
<Typography>{user.location || "Earth"}</Typography>
<Typography>{user.website || "example.com"}</Typography>
```
**Issue:** Shows "Earth" and "example.com" as defaults even when user hasn't set these fields.
**Expected:** Hide these fields if empty, or make the fallback less misleading.

---

### 14. **No Validation on Tweet Content**
**Location:** `frontend/src/Components/TweetComposer.jsx:21`
```js
if (!content.trim()) return;  // ✅ Good
```
**Backend Issue:** `backend/index.js:75` doesn't validate content - accepts empty strings if the frontend validation is bypassed.

---

### 15. **No Pagination - All Tweets Loaded at Once**
**Location:** `frontend/src/Pages/FeedPage.jsx:12-18` and `backend/index.js:85`
**Issue:** `GET /post` returns ALL tweets from the database. With 10,000+ tweets, this will freeze the app.
**Expected:** Implement pagination or infinite scroll.

---

## 🔵 MISSING FEATURES (Not bugs, but critical gaps)

### 16. **No Comment/Reply Functionality**
The UI shows a comment button and `comments` count, but there's no backend route or modal to post comments.

### 17. **No Tweet Deletion**
Users can't delete their own tweets.

### 18. **No User Search/Discovery**
Can't search for or view other users' profiles.

### 19. **No Refresh After Tweet Post**
`TweetComposer` adds the new tweet to local state, but the tweet's `author` field is just an ID (not populated), so the new tweet shows broken author data until refresh.

---

## 📊 SUMMARY

| Severity | Count | Fixed? |
|----------|-------|--------|
| Critical | 3 | ❌ |
| High | 3 | ❌ |
| Medium | 5 | ❌ |
| Low | 5 | ❌ |
| **TOTAL** | **16** | **0** |

---

## 🛠️ IMMEDIATE ACTION ITEMS (Priority Order)

1. **Fix logout button** - 5 min fix, highest UX impact
2. **Fix unlike/unretweet** - Backend toggle logic needed
3. **Fix Date.now() in schemas** - 2 min fix, data integrity issue
4. **Add .populate('author') to like/retweet routes** - Fixes avatar reversion
5. **Implement image upload to cloud storage** - Currently broken for multi-user use
6. **Add backend authentication middleware** - Security critical
7. **Add error toasts/feedback** - Better UX
8. **Fix profile edit persistence** - Add re-fetch after update

---

**End of Report**
