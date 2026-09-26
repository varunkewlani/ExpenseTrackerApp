# Styling & the component layers in this app

## `StyleSheet.create` — CSS-like, but it's just JS objects

```tsx
// Login.tsx
const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

<View style={styles.loginContainer}>
```

No cascading, no specificity rules, no selectors — every style is scoped to exactly the component that uses it (`StyleSheet.create` mostly just validates the object and optimizes it slightly; conceptually it's plain JS). `flex: 1` (flexbox) is the layout model — same flexbox you'd use in CSS, RN just defaults `flexDirection` to `column` instead of `row`.

The `style` prop also accepts an **array**, and later entries override earlier ones:

```tsx
<Text style={[styles.text, style]} {...props}>
```

That's from `CustomText.tsx` — the base style comes first, any style passed in as a prop overrides it. This is your app's version of "default value, unless caller specifies otherwise."

## `@gluestack-ui/themed` — a component library, like a UI kit

`Box`, `Button`, `Avatar`, `HStack`/`VStack`, `Icon` aren't built into React Native — they're a third-party design-system library, conceptually similar to using a Java Swing/JavaFX widget toolkit instead of hand-drawing every button. They come pre-styled and handle their own internal behavior (press states, focus, etc.), so you don't reimplement that per screen.

```tsx
// Nav.tsx
<Avatar>
  <AvatarFallbackText>SS</AvatarFallbackText>
  <AvatarImage source={{ uri: '...' }} alt="profile image" />
</Avatar>
```

`GluestackUIProvider` (wrapping the whole app in `App.tsx`, and again around `Home.tsx`) supplies the shared theme/config these components read from — it has to sit above anything that uses a gluestack component, the same way a DI container has to be initialized before beans can be injected.

## `CustomBox` / `CustomText` — your own wrapper components

```tsx
// CustomText.tsx
const CustomText = ({style, children, ...props}) => (
  <Text style={[styles.text, style]} {...props}>{children}</Text>
);
```

This is the composition pattern: instead of importing raw `Text` everywhere and repeating `style={{color: 'black', fontFamily: 'Helvetica'}}` on every screen, you write one wrapper with the defaults baked in, then use `<CustomText>` everywhere. Closest Java analogue: a base class (or a small utility/decorator) that applies common defaults so callers don't repeat themselves — DRY, applied to UI.

`CustomBox` does the same thing but for the "card with a drop-shadow" look used on Login/SignUp — one wrapper, reused instead of copy-pasted styling.

## `theme.ts` — centralized design tokens

```ts
export const theme = {
  colors: { primary: '#007AFF', ... },
  spacing: { xs: 4, sm: 8, md: 16, ... },
  typography: { fontSize: { sm: 14, base: 16, ... } },
};
```

Used like `theme.colors.primary`, `theme.spacing.lg` throughout `Profile.tsx` and `Expense.tsx`. This is the frontend equivalent of an app-wide constants/config class — one source of truth for colors/spacing/sizes instead of hardcoded hex codes and magic numbers scattered across files. Change `theme.colors.primary` once, every screen using it updates.

**Note:** `Home.tsx`'s inline styles and `Heading.tsx`'s use of `theme.colors.surface` (which doesn't exist — `theme.colors` has no top-level `surface`, only `surface.primary`/`surface.secondary`) is one of the real type errors from doc 01 — a good example of what happens when a shared constants object gets restructured but not every call site is updated.
