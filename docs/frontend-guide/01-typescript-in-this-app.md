# TypeScript, at the level this app uses it

You know Java. TypeScript here is doing a much lighter-weight version of the same job: catching type mistakes before runtime. The big difference to internalize up front:

> **TypeScript types are erased at build time.** Babel strips them out; nothing checks them unless you separately run `tsc`. Unlike `javac`, a type error does **not** stop the app from running — it's closer to a linter warning than a compiler error. (We proved this earlier: your code had 24 real type errors and still ran fine in the browser.)

## 1. Interfaces = your DTOs

You already write these in Java. Same idea, structural instead of nominal:

```ts
// src/app/pages/dto/ExpenseDto.ts
export interface ExpenseDto {
  key: number;
  amount: number;
  merchant: string;
  currency: string;
  createdAt: Date;
}
```

Compare to a Java DTO/record with the same fields. The difference: TS doesn't care that a value was *declared* as `ExpenseDto` — it only checks that the object *shape* matches (structural typing). Java's DTOs are nominal: you can't pass a `Foo` where a `Bar` is expected even if the fields are identical.

`UserDto.ts` shows an **optional field**, the TS equivalent of `Optional<String>` or a nullable column:

```ts
export interface UserDto {
  userId: string;
  firstName: string;
  profilePic?: string; // the `?` means it can be omitted entirely
}
```

## 2. Function/component prop types

`Profile.tsx` types a small component explicitly:

```ts
interface ProfileItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ icon, label, value }) => (...)
```

`React.FC<Props>` just means "a function component whose props match `Props`." If you call `<ProfileItem label="x" />` without `value`, TS flags it — like a Java method call missing a required parameter.

**Contrast with `Login.tsx`**, which does *not* type its props:

```ts
const Login = ({navigation}) => { ... }
```

`navigation` is implicitly `any` here — TS has zero idea what shape it is. This is exactly the kind of gap that caused the red squigglies we saw earlier in `CustomBox.tsx`. It's not a special case, it's the same "no interface declared" issue, just less visibly broken.

## 3. Union types

`Spends.tsx`:

```ts
const [error, setError] = useState<string | null>(null);
```

`string | null` = "this variable is either a string, or null." Closest Java analogue: a field typed `String` where you also have to null-check it — except here the type system forces you to acknowledge both cases (e.g. `error && <Text>{error}</Text>`), similar in spirit to `Optional<String>`.

## 4. What actually broke in `CustomBox.tsx`

Real example from your code, since you'll see it in the IDE:

```ts
const CustomBox = ({style = {}, children, ...props}) => {
  ...
  <Box style={[styles.headingContainer, style.mainBox, style.styles]}>
```

`style` defaults to `{}` with no declared shape, so TS infers its type as the *empty object type*. `style.mainBox` then genuinely doesn't exist on that type — TS error `TS2339: Property 'mainBox' does not exist on type '{}'`. In Java terms: this is like calling `.getMainBox()` on an `Object` reference with no cast — except Java would refuse to compile, while here it just prints a squiggly and moves on, because Babel doesn't check it at runtime.

**Interview-level takeaway:** TypeScript in a React Native/Expo project is opt-in safety, not a hard gate like `javac`. Bundler (Metro/Babel) strips types; a separate `tsc --noEmit` step (usually wired into CI, not always into local dev) is what actually enforces them.
