# Hands-on exercises

5 real spots in your actual code are commented out right now, each tagged `👉 EXERCISE <letter>` so you can find them with a project-wide search for `EXERCISE`. Go to each file, read the comment in place, uncomment the block, save, reload the app (`http://localhost:8081`), and see what changes. Then decide whether to leave it on or comment it back — either is fine, this is just for you to build intuition.

You'll see some harmless "declared but never read" hints in the IDE while things are commented out (e.g. `useEffect` unused in `Login.tsx`) — that's expected; it goes away once you uncomment.

---

### Exercise A — Navigation route registration
**File:** [`App.tsx`](../../App.tsx) — inside `<Stack.Navigator>`

The `Profile` screen's `<Stack.Screen>` entry is commented out.

- **Right now:** tapping the avatar icon (top-right, on the Home screen, wired up in `Nav.tsx` via `navigation.navigate('Profile')`) throws a runtime error — react-navigation has no idea what "Profile" means because nothing registered it.
- **Uncomment it**, reload, tap the avatar again → it should now open the Profile screen with a header.
- **What this teaches:** a route name used with `navigate()` is just a string; it only resolves to an actual screen if something registered that exact name in a `<Stack.Navigator>`. There's no compile-time link between the two unless you lean on the `RootStackParamList` type (which this app defines but doesn't fully enforce).

### Exercise B — useEffect + API call on mount
**File:** [`src/app/pages/Login.tsx`](../../src/app/pages/Login.tsx) — inside the `Login` component, near the bottom

The whole auto-login `useEffect` is commented out.

- **Right now:** opening the app always shows the Login form, even if you have a valid token from a previous session.
- **Uncomment it**, reload → on mount it now calls `loginService.isLoggedIn()` (hits `GET /auth/v1/ping`), and either auto-navigates to Home or attempts a token refresh. Watch your browser's Network tab to see the actual request fire.
- **What this teaches:** `useEffect(fn, [])` = "run once when this screen first appears" — the standard place to kick off a data fetch or an auth check as soon as a screen mounts.

### Exercise C — Authorization header on a protected endpoint
**File:** [`src/app/pages/Spends.tsx`](../../src/app/pages/Spends.tsx) — inside `fetchExpenses()`

The `Authorization: Bearer ${accessToken}` header is commented out of the `fetch` call to `/expense/v1/getExpense`.

- **Right now:** the request goes out with no Bearer token — expect the backend to reject it (401/403), assuming you get past CORS at all.
- **Uncomment it**, reload → the token is sent again.
- **What this teaches:** REST APIs like yours are stateless — the server doesn't remember who you are between requests. Every single call has to prove identity again via the header. This is the frontend half of whatever auth check your Spring Security config does on the way in.

### Exercise D — Persisting the session (AsyncStorage)
**File:** [`src/app/pages/Login.tsx`](../../src/app/pages/Login.tsx) — inside `gotoHomePageWithLogin()`

The two `AsyncStorage.setItem(...)` calls (saving `refreshToken` and `accessToken` after a successful login) are commented out.

- **Right now:** logging in still navigates you to Home (the login *request* succeeded), but nothing gets saved — refresh the browser tab and you're back to square one, no session persisted.
- **Uncomment it**, log in again, then check your browser devtools → Application → Local Storage → `localhost:8081` — you should see the tokens actually written there (AsyncStorage is backed by `localStorage` on web).
- **What this teaches:** a successful API call and a persisted session are two different things — you have to explicitly store what you got back, or it's gone the moment the screen re-renders/reloads.

### Exercise E — Component composition
**File:** [`src/app/pages/Home.tsx`](../../src/app/pages/Home.tsx) — inside the `insightsContainer` `<View>`

`<SpendsInsights />` is commented out of the JSX tree (the component and its file are untouched).

- **Right now:** the Home screen renders with an empty insights panel — the graph and spends list are unaffected, because they're separate sibling components.
- **Uncomment it**, reload → the insights panel comes back.
- **What this teaches:** a screen like `Home.tsx` is just composed out of smaller independent components (`Nav`, `ExpenseTrackerGraph`, `SpendsInsights`, `Spends`). Removing one from the JSX tree doesn't delete or break it — it's the same idea as commenting out one `<div>` of unrelated content on a page; everything else keeps working. This is why React encourages breaking screens into small components in the first place.
