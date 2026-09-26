# Frontend Guide — Read This First

You built the backend (authservice, userservice, expense-service, ds-service). This frontend's screens/components came from an instructor's video, which you're now skipping. These docs exist so you can **explain what this app does in an interview**, at a 2-3 YOE level — not become a React expert.

Read in this order:

1. [01-typescript-in-this-app.md](01-typescript-in-this-app.md) — the TS you'll actually see in this code, mapped to Java concepts you already know.
2. [02-react-native-basics.md](02-react-native-basics.md) — components, props, state, effects, navigation.
3. [03-styling-and-components.md](03-styling-and-components.md) — StyleSheet, gluestack-ui, the CustomBox/CustomText pattern, theme.ts.
4. [04-api-and-data-flow.md](04-api-and-data-flow.md) — **the main one.** How this app talks to your backend, end-to-end, tied to your actual controllers (AuthController, TokenController, ExpenseController).
5. [05-hands-on-exercises.md](05-hands-on-exercises.md) — 5 spots in the real code I've commented out on purpose. Go to each file, read the comment, uncomment it, reload the app, see what changes. This is how you actually retain it instead of just reading.

Nothing here was invented — every snippet is copy-pasted from your actual files under `src/app/` and `App.tsx`, and every endpoint mentioned is a real `@GetMapping`/`@PostMapping` I found in your `authservice`/`userservice`/`service` (expense) repos.
