# How the frontend talks to your backend

This is the part you'll actually get asked about. Short version to say out loud in an interview:

> "The RN app talks synchronous REST over HTTP to our services through a Kong API gateway. The frontend never touches Kafka directly — that's entirely internal to the backend."

## The architecture, as it actually exists in your services

```
 RN App (fetch)
      │  HTTP + Bearer token
      ▼
 Kong API Gateway  (the "Expens-KongA-..." ELB hostname hardcoded in the RN code)
      │
      ├──► authservice   → AuthController  (POST /auth/v1/signup, GET /auth/v1/ping)
      │                  → TokenController (POST /auth/v1/login, POST /auth/v1/refreshToken)
      ├──► userservice   → UserController  (GET /user/v1/getUser, POST /user/v1/createUpdate)
      └──► expense-service → ExpenseController (GET /expense/v1/getExpense, POST /expense/v1/addExpense)
                            → ExpenseConsumer (@KafkaListener — async, backend-only, no frontend involvement)
```

I confirmed these routes directly against your Java `@GetMapping`/`@PostMapping` annotations — the frontend code isn't guessing, it's calling exactly these.

## The one HTTP mechanism everything uses: `fetch`

```ts
// Spends.tsx
const response = await fetch(`${SERVER_BASE_URL}/expense/v1/getExpense`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
});
if (!response.ok) throw new Error(`Failed. Status: ${response.status}`);
const data = await response.json();
```

Map this directly to what you already know from the Java side calling out (`RestTemplate`/`HttpClient`/`WebClient`): build a URL, set headers, `await` the response, check the status code, parse the body. `fetch` returns a `Response` object; `response.ok` is `true` for 2xx, `response.json()` parses the body — nothing exotic.

## The full login lifecycle, following the real code path

1. **App opens on the Login screen.** `useEffect(() => { handleLogin() }, [])` fires once on mount (exercise B — currently commented out in your code).
2. **`LoginService.isLoggedIn()`** reads a stored token from `AsyncStorage` and calls `GET /auth/v1/ping` with `Authorization: Bearer <accessToken>`. Your `AuthController.ping()` (line 52) validates the JWT and returns something the frontend regex-checks as a UUID — if it matches, the token's still good.
3. **If the token's invalid/expired**, `refreshToken()` fires `POST /auth/v1/refreshToken` with the stored refresh token in the body. `TokenController.refreshToken()` (line 56) issues a new access/refresh pair.
4. **If refresh also fails**, the user sees the Login form and manually submits. `gotoHomePageWithLogin()` calls `POST /auth/v1/login` → `TokenController.login()` (line 39) → returns `{accessToken, token}` → both get written to `AsyncStorage` (exercise D) → `navigation.navigate('Home')`.
5. **On the Home screen**, `Spends.tsx`'s `useEffect` calls `fetchExpenses()` → `GET /expense/v1/getExpense` with the stored access token as a Bearer header (exercise C) → your `ExpenseController.getExpense()` returns the list → mapped into `ExpenseDto[]` and rendered.

Every one of those calls is stateless REST — the frontend carries its own identity (the Bearer token) on every request; the backend doesn't hold a session for it.

## `AsyncStorage` — where the token lives

```ts
await AsyncStorage.setItem('accessToken', data['accessToken']);
const token = await AsyncStorage.getItem('accessToken');
```

It's a simple async key-value store, conceptually `localStorage` for mobile (and it's literally backed by `localStorage` when running via `react-native-web`, like this project is). This is **not** the "HttpOnly cookie" pattern you'd expect from a browser-based session — it's closer to a mobile app keeping a token in local storage/keychain and attaching it manually to every request header.

## The thing that'll actually bite you: CORS

Native apps aren't subject to CORS — a phone doesn't care what "origin" a request came from. A **browser** does. Since this is now running via `expo start --web`, every one of those `fetch()` calls is a real browser cross-origin request to the Kong gateway's ELB hostname. If the backend doesn't respond with `Access-Control-Allow-Origin` (and handle the browser's preflight `OPTIONS` request), the browser blocks the response before your `.then`/`await` ever sees it — you'll get a network error in the console, not a clean 401/403. This is a backend/gateway config issue (Kong needs a CORS plugin, or the services need to emit the header), not something fixable in the RN code.

## Where Kafka fits — and why it's irrelevant to the frontend

```java
// ExpenseConsumer.java
@KafkaListener(topics = "${spring.kafka.topic-json.name}", ...)
public void listen(ExpenseDto eventData) { expenseService.createExpense(eventData); }
```

Somewhere in your write path, an expense event gets published to Kafka and this consumer picks it up asynchronously to persist it — decoupled from whatever produced the event. The frontend's `GET /expense/v1/getExpense` is a plain synchronous read against whatever's already been persisted; it has no idea Kafka exists, and never needs to. If asked "does the mobile app publish to Kafka," the answer is no — the frontend only ever speaks synchronous HTTP to the gateway; anything event-driven is purely a backend implementation detail behind that same REST boundary.
