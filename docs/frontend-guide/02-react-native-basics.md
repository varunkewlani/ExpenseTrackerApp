# React Native, at the level this app uses it

## The core idea

In a web app, you'd render `<div>`, `<span>`, `<img>`. React Native renders **native widgets** instead (a `View` becomes a real Android/iOS view) — except on this project, since you're running via `expo start --web`, `react-native-web` translates those same components back into `<div>`s under the hood. Same component code, different renderer depending on platform. That's the whole pitch of RN.

Building blocks you actually use, all from `Home.tsx` / `Profile.tsx`:

| RN component      | Rough web equivalent      |
|--------------------|---------------------------|
| `View`             | `<div>`                   |
| `Text`             | `<span>`/`<p>` (text MUST be inside `<Text>`, unlike HTML) |
| `Image`            | `<img>`                   |
| `ScrollView`        | a `<div>` with `overflow: auto` |
| `TouchableOpacity` | a clickable `<div>`/`<button>` with a fade-on-press effect |
| `SafeAreaView`     | a `<div>` padded to avoid device notches/status bars |

## Props — same concept as method parameters

```tsx
// src/app/components/Expense.tsx
interface ExpenseProps { props: ExpenseDto; }
const Expense: React.FC<ExpenseProps> = ({props}) => {
  return <CustomText>{props.merchant}</CustomText>;
};

// usage, in Spends.tsx:
<Expense key={expense.key} props={expense} />
```

`props` here is just "arguments passed into a component," the same way you'd pass arguments into a Java method. `key` is special — React uses it internally to track list items efficiently across re-renders; it's not a prop your component reads.

## State — a field that re-renders the UI when it changes

```tsx
// Login.tsx
const [userName, setUserName] = useState('');
```

Think of this as a private field with a generated setter — except calling `setUserName(...)` doesn't just mutate a value, it tells React "re-render this component with the new value." That's the entire mental model of `useState`: state change → re-render.

```tsx
<TextInput
  value={userName}
  onChangeText={text => setUserName(text)}
/>
```

This is a **controlled input**: the text box's displayed value is *driven by* state (`value={userName}`), and every keystroke pushes the new value back into state (`onChangeText`). The component doesn't hold its own hidden text buffer — React does, via `userName`.

## Effects — "do this after render / on mount"

```tsx
// Login.tsx (currently commented out — see exercise doc)
useEffect(() => {
  const handleLogin = async () => { ... };
  handleLogin();
}, []);
```

`useEffect(fn, deps)` runs `fn` after the component renders. The second argument controls *when*:
- `[]` (empty array, as above) → runs once, right after the first render. Closest Java analogue: a constructor, or `@PostConstruct` in a Spring bean — "do this once when I come into existence."
- `[someValue]` → re-runs whenever `someValue` changes between renders.
- omitted entirely → runs after *every* render (rare, usually a mistake).

This is the standard place to fire an API call when a screen opens — which is exactly what both `Login.tsx` and `Spends.tsx` do (see doc 04).

## Navigation — routing, but client-side and imperative

```tsx
// App.tsx
const Stack = createNativeStackNavigator<RootStackParamList>();
<Stack.Navigator>
  <Stack.Screen name="Login" component={Login} />
  <Stack.Screen name="Home" component={Home} />
</Stack.Navigator>
```

This registers a map of route-name → component, similar in spirit to a Spring `@RequestMapping` table, except entirely client-side (no server round-trip, no URL by default). To move between screens:

```tsx
navigation.navigate('Home', {name: 'Home'});
```

`navigation` is a prop automatically injected into every screen component by the navigator — that's why `Login.tsx` can destructure `{navigation}` without importing or constructing it. If a screen name isn't registered in `<Stack.Navigator>`, calling `navigate('ThatName')` throws at runtime — you'll see this exact failure in exercise A.
