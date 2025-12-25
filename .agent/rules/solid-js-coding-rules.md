---
trigger: always_on
glob: "**/*.{ts,tsx,js,jsx}"
description: Solid.js development best practices and coding standards
---

# Solid.js コーディングルール

このドキュメントは、Solid.js を使った開発における基本的な注意点、ベストプラクティス、React との違いについて記述します。

## 目次

1. [Solid.js とは](#solidjs-とは)
2. [React との主な違い](#react-との主な違い)
3. [リアクティビティシステム](#リアクティビティシステム)
4. [制御フロー](#制御フロー)
5. [イベントハンドリング](#イベントハンドリング)
6. [コンポーネント設計](#コンポーネント設計)
7. [エコシステム](#エコシステム)
8. [パフォーマンスのベストプラクティス](#パフォーマンスのベストプラクティス)
9. [よくあるミスと注意点](#よくあるミスと注意点)

---

## Solid.js とは

Solid.js は、細粒度のリアクティビティ（Fine-grained Reactivity）を採用した、高速でシンプルな UI フレームワークです。React ライクな JSX 構文を使用しながらも、仮想 DOM を使わず、リアクティブプリミティブによって効率的な UI 更新を実現します。

**主な特徴**:
- **仮想 DOM なし**: 実 DOM を直接更新するため、高速
- **細粒度のリアクティビティ**: 変更された部分のみを自動的に更新
- **React ライクな JSX**: 学習コストが低い
- **コンパイル時最適化**: ビルド時に効率的なコードに変換

---

## React との主な違い

### 1. JSX の扱い

#### React
```tsx
// React では JSX は毎回実行される（仮想 DOM を生成）
function Counter() {
  const [count, setCount] = useState(0);

  return <div>Count: {count}</div>; // 毎レンダリング時に実行
}
```

#### Solid.js
```tsx
// Solid.js では JSX は一度だけ実行される（実 DOM を生成）
function Counter() {
  const [count, setCount] = createSignal(0);

  return <div>Count: {count()}</div>; // 初回のみ実行、count() の部分だけが更新される
}
```

**重要な違い**:
- **React**: JSX は関数全体が再実行される
- **Solid.js**: JSX は初回のみ実行され、リアクティブな部分（`count()` など）のみが自動的に更新される

### 2. リアクティビティ

#### React
```tsx
// React では状態は値として扱う
const [count, setCount] = useState(0);
console.log(count); // 0
setCount(count + 1); // 値を直接設定
```

#### Solid.js
```tsx
// Solid.js では状態はゲッター/セッター関数として扱う
const [count, setCount] = createSignal(0);
console.log(count()); // 0 - 関数として呼び出す
setCount(count() + 1); // ゲッターで取得、セッターで設定

// または関数形式
setCount(prev => prev + 1);
```

**重要な違い**:
- **React**: `count` は値
- **Solid.js**: `count` はゲッター関数、`count()` で値を取得

### 3. 依存関係の追跡

#### React
```tsx
// React では依存配列を明示的に指定
useEffect(() => {
  console.log(count);
}, [count]); // 依存配列を手動で指定
```

#### Solid.js
```tsx
// Solid.js では自動的に依存関係を追跡
createEffect(() => {
  console.log(count()); // count() を呼び出すと自動的に依存関係として登録
});
```

**重要な違い**:
- **React**: 依存配列を手動で管理（バグの原因になりやすい）
- **Solid.js**: 関数内で呼び出された Signal を自動的に追跡

### 4. コンポーネントの実行タイミング

#### React
```tsx
// React コンポーネントは状態が変わるたびに再実行される
function MyComponent() {
  console.log('Rendered!'); // 毎レンダリング時に実行
  const [count, setCount] = useState(0);

  return <div>{count}</div>;
}
```

#### Solid.js
```tsx
// Solid.js コンポーネントは一度だけ実行される
function MyComponent() {
  console.log('Mounted!'); // マウント時に一度だけ実行
  const [count, setCount] = createSignal(0);

  return <div>{count()}</div>; // count() の部分だけが自動更新
}
```

**重要な違い**:
- **React**: コンポーネント関数は毎レンダリング時に実行
- **Solid.js**: コンポーネント関数は初回マウント時のみ実行

---

## リアクティビティシステム

Solid.js のコアは細粒度のリアクティビティシステムです。主なプリミティブを理解することが重要です。

### 1. Signals (`createSignal`)

最も基本的なリアクティブプリミティブ。状態を保持します。

```tsx
import { createSignal } from 'solid-js';

const [count, setCount] = createSignal(0);

// 読み取り
console.log(count()); // 0

// 書き込み
setCount(1);
setCount(prev => prev + 1);

// オブジェクトの場合
const [user, setUser] = createSignal({ name: 'Alice', age: 25 });

// ❌ 悪い例: イミュータブルでない更新
setUser(prev => {
  prev.name = 'Bob'; // これは避ける
  return prev;
});

// ✅ 良い例: イミュータブルな更新
setUser(prev => ({ ...prev, name: 'Bob' }));
```

**ベストプラクティス**:
- 常にイミュータブルに更新する
- オブジェクトや配列は新しいオブジェクト/配列を返す
- ネストしたオブジェクトの場合は `createStore` を検討

### 2. Effects (`createEffect`)

Signal の変更に反応して副作用を実行します。

```tsx
import { createEffect } from 'solid-js';

const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log('Count changed:', count()); // count が変わるたびに実行
});

// 複数の Signal を追跡
const [firstName, setFirstName] = createSignal('Alice');
const [lastName, setLastName] = createSignal('Smith');

createEffect(() => {
  console.log(`Full name: ${firstName()} ${lastName()}`);
  // firstName か lastName のどちらかが変わると実行
});
```

**注意点**:
- Effect 内で Signal を読み取ると、自動的に依存関係として追跡される
- 条件分岐で Signal を読み取る場合、依存関係が動的に変わる

```tsx
const [showName, setShowName] = createSignal(true);
const [name, setName] = createSignal('Alice');

createEffect(() => {
  if (showName()) {
    console.log(name()); // showName が true の時だけ name を追跡
  }
});
```

### 3. Memos (`createMemo`)

派生値をキャッシュします。依存する Signal が変わった時だけ再計算されます。

```tsx
import { createMemo } from 'solid-js';

const [firstName, setFirstName] = createSignal('Alice');
const [lastName, setLastName] = createSignal('Smith');

// ❌ 悪い例: 毎回計算される
const fullName = () => `${firstName()} ${lastName()}`;

// ✅ 良い例: 依存する Signal が変わった時だけ再計算
const fullName = createMemo(() => `${firstName()} ${lastName()}`);

// JSX 内で使用
<div>{fullName()}</div>
```

**使い分け**:
- **通常の関数**: 軽量な計算、キャッシュ不要
- **createMemo**: 重い計算、複数箇所で使用される派生値

### 4. Resources (`createResource`)

非同期データのフェッチとキャッシングを行います。

```tsx
import { createResource } from 'solid-js';

// 基本的な使い方
const [data] = createResource(fetchUser);

// 依存する Signal を持つ場合
const [userId, setUserId] = createSignal(1);
const [user] = createResource(userId, fetchUser);

// 完全な形
const [user, { mutate, refetch }] = createResource(userId, async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// JSX 内で使用
<Show when={user()} fallback={<div>Loading...</div>}>
  {(userData) => <div>{userData().name}</div>}
</Show>
```

**メソッド**:
- `mutate(newValue)`: データを手動で更新（再フェッチなし）
- `refetch()`: 強制的に再フェッチ

### 5. Stores (`createStore`)

ネストしたオブジェクトの細粒度のリアクティビティを実現します。

```tsx
import { createStore } from 'solid-js/store';

const [state, setState] = createStore({
  user: {
    name: 'Alice',
    age: 25,
    address: {
      city: 'Tokyo'
    }
  }
});

// ネストしたプロパティを直接更新
setState('user', 'name', 'Bob');
setState('user', 'address', 'city', 'Osaka');

// 関数形式
setState('user', 'age', age => age + 1);

// 読み取り（プロキシとして動作）
console.log(state.user.name); // 'Bob' - 関数呼び出し不要
```

**Signal vs Store の使い分け**:
- **Signal**: プリミティブ値、フラットなオブジェクト
- **Store**: ネストしたオブジェクト、複雑な状態管理

---

## 制御フロー

Solid.js では、JavaScript の `map`, `if`, `switch` の代わりに、専用の制御フローコンポーネントを使います。

### なぜ制御フローコンポーネントを使うのか？

React のように通常の JavaScript を使うと、全体が再実行されてしまいます。Solid.js の制御フローコンポーネントは、変更された要素のみを効率的に更新します。

### 1. For（リスト表示）

```tsx
import { For } from 'solid-js';

// ❌ 悪い例: map を使うと非効率
const [items, setItems] = createSignal([1, 2, 3]);
<div>
  {items().map(item => <div>{item}</div>)}
</div>

// ✅ 良い例: For を使う
<For each={items()}>
  {(item, index) => <div>{item} at {index()}</div>}
</For>

// オブジェクトの配列
const [users, setUsers] = createSignal([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

<For each={users()}>
  {(user) => <div>{user.name}</div>}
</For>

// fallback（空の場合）
<For each={items()} fallback={<div>No items</div>}>
  {(item) => <div>{item}</div>}
</For>
```

**重要**:
- `For` は `key` による最適化を自動的に行う（React の `key` prop は不要）
- デフォルトでは参照による等価性チェック
- プリミティブ値の配列の場合、要素の順序が変わると再レンダリングされる可能性がある

### 2. Show（条件表示）

```tsx
import { Show } from 'solid-js';

const [loggedIn, setLoggedIn] = createSignal(false);

// ❌ 悪い例: 三項演算子を使うと両方が評価される
<div>
  {loggedIn() ? <Dashboard /> : <Login />}
</div>

// ✅ 良い例: Show を使う（条件に応じて片方だけ評価）
<Show when={loggedIn()} fallback={<Login />}>
  <Dashboard />
</Show>

// 値を使用する場合（非 null チェック）
const [user, setUser] = createSignal<User | null>(null);

<Show when={user()} fallback={<div>Loading...</div>}>
  {(userData) => <div>Hello, {userData().name}</div>}
</Show>
```

**when の真値について**:
- `when` が真値の場合、子要素がレンダリングされる
- コールバック形式 `{(value) => ...}` を使うと、型が非 null に絞り込まれる

### 3. Switch / Match（多分岐）

```tsx
import { Switch, Match } from 'solid-js';

const [status, setStatus] = createSignal<'loading' | 'success' | 'error'>('loading');

<Switch>
  <Match when={status() === 'loading'}>
    <Spinner />
  </Match>
  <Match when={status() === 'success'}>
    <SuccessMessage />
  </Match>
  <Match when={status() === 'error'}>
    <ErrorMessage />
  </Match>
</Switch>

// fallback（どれにも一致しない場合）
<Switch fallback={<div>Unknown status</div>}>
  <Match when={status() === 'loading'}>
    <Spinner />
  </Match>
</Switch>
```

### 4. Index（位置ベースのリスト）

```tsx
import { Index } from 'solid-js';

const [items, setItems] = createSignal([1, 2, 3]);

// For vs Index
// For: 各要素の参照が変わらない限り再レンダリングしない（参照ベース）
// Index: インデックスが変わらない限り再レンダリングしない（位置ベース）

// ✅ Index: プリミティブ値の配列で順序が頻繁に変わる場合
<Index each={items()}>
  {(item, index) => <div>Item {index}: {item()}</div>}
</Index>

// ✅ For: オブジェクトの配列で id などのキーがある場合
const [users, setUsers] = createSignal([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

<For each={users()}>
  {(user) => <div>{user.name}</div>}
</For>
```

**For vs Index の使い分け**:
- **For**: オブジェクトの配列、参照ベースの最適化が有効
- **Index**: プリミティブ値の配列、要素が頻繁に変わる場合

---

## イベントハンドリング

### 1. イベントハンドラの種類

Solid.js には2種類のイベントハンドラがあります。

```tsx
// on: イベント（ネイティブイベント）
<button onClick={handleClick}>Click</button>

// on: イベント（バブリング、React と同じ）
<div onClick={handleClick}>
  <button>Click</button> {/* バブルする */}
</div>

// on:キャプチャ（キャプチャフェーズ）
<button on:click={handleClick}>Click</button>
```

**命名規則**:
- `onClick`: バブリングイベント（React と同じ）
- `on:click`: キャプチャイベント

### 2. イベントハンドラの定義

```tsx
// ✅ 良い例: インライン定義（Solid.js では問題ない）
<button onClick={() => setCount(count() + 1)}>+1</button>

// ✅ 良い例: 関数参照
const handleClick = () => setCount(count() + 1);
<button onClick={handleClick}>+1</button>

// ✅ 良い例: 引数を渡す
<button onClick={() => handleClick('value')}>Click</button>

// ✅ 良い例: 配列形式（引数を渡す別の方法）
<button onClick={[handleClick, 'value']}>Click</button>
```

**React との違い**:
- **React**: インライン関数は毎レンダリング時に新しく生成される（パフォーマンス問題）
- **Solid.js**: コンポーネントは一度だけ実行されるため、インライン関数でも問題ない

### 3. フォームイベント

```tsx
// input イベント（リアルタイム更新）
<input
  value={name()}
  onInput={(e) => setName(e.currentTarget.value)}
/>

// change イベント（フォーカスが外れた時）
<input
  value={name()}
  onChange={(e) => setName(e.currentTarget.value)}
/>

// select
<select
  value={selected()}
  onChange={(e) => setSelected(e.currentTarget.value)}
>
  <option value="a">A</option>
  <option value="b">B</option>
</select>

// form submit
<form onSubmit={(e) => {
  e.preventDefault();
  handleSubmit();
}}>
  <input type="submit" value="Submit" />
</form>
```

### 4. Ref の使用

```tsx
let inputRef: HTMLInputElement | undefined;

// ref 属性で要素への参照を取得
<input ref={inputRef} />

// コンポーネント内で使用
const focusInput = () => {
  inputRef?.focus();
};

// または型安全な方法
let inputRef!: HTMLInputElement;
<input ref={(el) => inputRef = el} />
```

---

## コンポーネント設計

### 1. コンポーネントの定義

```tsx
import type { Component } from 'solid-js';

// ✅ Props なしのコンポーネント
const MyComponent: Component = () => {
  return <div>Hello</div>;
};

// ✅ Props ありのコンポーネント
interface MyComponentProps {
  name: string;
  age?: number;
}

const MyComponent: Component<MyComponentProps> = (props) => {
  // props は直接アクセス可能（リアクティブプロキシ）
  return <div>Hello, {props.name}</div>;
};

// ✅ children を受け取る
import type { ParentComponent } from 'solid-js';

const Container: ParentComponent = (props) => {
  return <div class="container">{props.children}</div>;
};
```

### 2. Props のリアクティビティ

```tsx
// ❌ 悪い例: Props を分割代入するとリアクティビティを失う
const MyComponent: Component<{ count: number }> = ({ count }) => {
  return <div>{count}</div>; // count が更新されても反映されない
};

// ✅ 良い例: props から直接アクセス
const MyComponent: Component<{ count: number }> = (props) => {
  return <div>{props.count}</div>; // リアクティブ
};

// ✅ 良い例: splitProps を使う（一部を分割したい場合）
import { splitProps } from 'solid-js';

const MyComponent: Component<{ count: number; label: string }> = (props) => {
  const [local, others] = splitProps(props, ['count']);

  return (
    <div>
      {local.count} {/* リアクティブ */}
      {others.label} {/* リアクティブ */}
    </div>
  );
};

// ✅ 良い例: mergeProps を使う（デフォルト値）
import { mergeProps } from 'solid-js';

const MyComponent: Component<{ count?: number }> = (incomingProps) => {
  const props = mergeProps({ count: 0 }, incomingProps);

  return <div>{props.count}</div>; // デフォルト値 0
};
```

### 3. コンポーネントの分け方

#### プレゼンテーショナルコンポーネント

UI のみに集中し、状態を持たないコンポーネント。

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  onClick: () => void;
  loading?: boolean;
  children: any;
}

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.loading}
      class={css({
        px: '4',
        py: '2',
        bg: 'blue.500',
        color: 'white',
        rounded: 'md',
        _hover: { bg: 'blue.600' }
      })}
    >
      {props.loading ? 'Loading...' : props.children}
    </button>
  );
};
```

#### コンテナコンポーネント

ビジネスロジックと状態管理を担当するコンポーネント。

```tsx
// components/UserProfile.tsx
export const UserProfile: Component = () => {
  const { fetchWithAuth } = useAuth();
  const [user, { refetch }] = createResource(async () => {
    const res = await fetchWithAuth('/api/user');
    return res.json();
  });

  const handleUpdate = async (data: UpdateUserData) => {
    await fetchWithAuth('/api/user', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    refetch();
  };

  return (
    <Show when={user()} fallback={<Spinner />}>
      {(userData) => (
        <UserProfileView
          user={userData()}
          onUpdate={handleUpdate}
        />
      )}
    </Show>
  );
};

// components/UserProfileView.tsx（プレゼンテーショナル）
interface UserProfileViewProps {
  user: User;
  onUpdate: (data: UpdateUserData) => void;
}

export const UserProfileView: Component<UserProfileViewProps> = (props) => {
  return (
    <div>
      <h1>{props.user.name}</h1>
      <button onClick={() => props.onUpdate({ name: 'New Name' })}>
        Update
      </button>
    </div>
  );
};
```

### 4. カスタムフック（関数）

Solid.js には React の `use〜` という命名規則はありませんが、同様にロジックを再利用できます。

```tsx
// hooks/useCounter.ts
export function useCounter(initial = 0) {
  const [count, setCount] = createSignal(initial);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);

  return { count, increment, decrement, reset };
}

// 使用
const MyComponent: Component = () => {
  const counter = useCounter(10);

  return (
    <div>
      <p>Count: {counter.count()}</p>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.decrement}>-</button>
      <button onClick={counter.reset}>Reset</button>
    </div>
  );
};
```

### 5. Context の使用

```tsx
import { createContext, useContext } from 'solid-js';
import type { ParentComponent } from 'solid-js';

// Context の型定義
interface AuthContextValue {
  user: () => User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Context の作成
const AuthContext = createContext<AuthContextValue>();

// Provider コンポーネント
export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const userData = await res.json();
    setUser(userData);
  };

  const logout = () => setUser(null);

  const value: AuthContextValue = {
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 使用
const MyComponent: Component = () => {
  const { user, logout } = useAuth();

  return (
    <Show when={user()} fallback={<div>Not logged in</div>}>
      {(userData) => (
        <div>
          <p>Welcome, {userData().name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </Show>
  );
};
```

---

## エコシステム

このプロジェクトで使用している主要なライブラリとツール。

### 1. Panda CSS

ゼロランタイムの CSS-in-JS ライブラリ。ビルド時に静的 CSS を生成します。

```tsx
import { css } from 'styled-system/css';
import { Stack, Box, Flex, Grid } from 'styled-system/jsx';

// css 関数でスタイリング
<button class={css({
  px: '4',
  py: '2',
  bg: 'blue.500',
  color: 'white',
  rounded: 'md',
  _hover: { bg: 'blue.600' },
  _disabled: { opacity: 0.5, cursor: 'not-allowed' }
})}>
  Click me
</button>

// JSX スタイルコンポーネント
<Stack gap="4">
  <Box p="4" bg="slate.800" rounded="lg">
    <h2>Title</h2>
  </Box>
  <Flex justify="space-between" align="center">
    <span>Left</span>
    <span>Right</span>
  </Flex>
  <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </Grid>
</Stack>

// レスポンシブデザイン
<Box
  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
  p={{ base: '2', md: '4', lg: '6' }}
>
  Responsive text
</Box>
```

**特徴**:
- ゼロランタイム: ビルド時に静的 CSS を生成
- 型安全: TypeScript による補完とエラーチェック
- レスポンシブ: ブレークポイントベースのレスポンシブデザイン
- テーマ: カスタマイズ可能なデザイントークン

### 2. Ark UI

ヘッドレス UI コンポーネントライブラリ。アクセシビリティを考慮した UI を構築できます。

```tsx
import { Dialog } from '@/components/ui/dialog';

<Dialog.Root
  open={isOpen()}
  onOpenChange={(e) => setIsOpen(e.open)}
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  <Dialog.Backdrop />
  <Dialog.Positioner>
    <Dialog.Content>
      <Dialog.CloseTrigger />
      <Dialog.Header>
        <Dialog.Title>タイトル</Dialog.Title>
        <Dialog.Description>説明文</Dialog.Description>
      </Dialog.Header>

      <Dialog.Body>
        {/* コンテンツ */}
      </Dialog.Body>

      <Dialog.Footer>
        <Dialog.CloseTrigger asChild={(props) => (
          <Button variant="outline" {...props()}>キャンセル</Button>
        )}>
        </Dialog.CloseTrigger>
        <Button onClick={handleSubmit}>送信</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

**特徴**:
- ヘッドレス: スタイルは自由にカスタマイズ可能
- アクセシブル: WAI-ARIA 準拠
- Solid.js ネイティブ: Solid.js のリアクティビティに最適化

**主要コンポーネント**:
- `Dialog`: モーダルダイアログ
- `Select`: セレクトボックス
- `Tooltip`: ツールチップ
- `Popover`: ポップオーバー
- `Tabs`: タブ
- など

### 3. Solid Router

Solid.js 公式のルーティングライブラリ。

```tsx
import { Router, Route, Routes, A, Navigate } from '@solidjs/router';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/users/:id" component={UserProfile} />
        <Route path="*" component={NotFound} />
      </Routes>
    </Router>
  );
}

// ナビゲーション
<A href="/about">About</A>

// プログラマティックナビゲーション
import { useNavigate } from '@solidjs/router';

const navigate = useNavigate();
navigate('/about');

// パラメータの取得
import { useParams } from '@solidjs/router';

const params = useParams();
console.log(params.id);

// クエリパラメータ
import { useSearchParams } from '@solidjs/router';

const [searchParams, setSearchParams] = useSearchParams();
console.log(searchParams.query);
setSearchParams({ query: 'new value' });
```

### 4. その他の有用なライブラリ

#### @solidjs/meta（メタタグ管理）
```tsx
import { Title, Meta } from '@solidjs/meta';

<Title>ページタイトル</Title>
<Meta name="description" content="ページの説明" />
```

#### solid-icons（アイコン）
```tsx
import { FiUser, FiSettings } from 'solid-icons/fi';

<FiUser size={24} />
<FiSettings size={20} color="blue" />
```

#### @solidjs/start（フルスタックフレームワーク）
Solid.js 版の Next.js。SSR、ファイルベースルーティング、API ルートなどをサポート。

---

## パフォーマンスのベストプラクティス

### 1. 不要な再計算を避ける

```tsx
// ❌ 悪い例: 毎回計算される
const ExpensiveComponent: Component<{ data: number[] }> = (props) => {
  const sum = props.data.reduce((a, b) => a + b, 0); // 毎回計算
  return <div>{sum}</div>;
};

// ✅ 良い例: createMemo でキャッシュ
const ExpensiveComponent: Component<{ data: number[] }> = (props) => {
  const sum = createMemo(() => props.data.reduce((a, b) => a + b, 0));
  return <div>{sum()}</div>;
};
```

### 2. 適切な制御フローを使う

```tsx
// ❌ 悪い例: map を使うと全体が再レンダリング
<div>
  {items().map(item => <div>{item}</div>)}
</div>

// ✅ 良い例: For を使う
<For each={items()}>
  {(item) => <div>{item}</div>}
</For>
```

### 3. Signal の更新をバッチ化

```tsx
import { batch } from 'solid-js';

// ❌ 悪い例: 個別に更新すると複数回レンダリング
setFirstName('Alice');
setLastName('Smith');
setAge(25);

// ✅ 良い例: batch で一度にまとめる
batch(() => {
  setFirstName('Alice');
  setLastName('Smith');
  setAge(25);
});
```

### 4. 大きなリストの仮想化

大量のリストを表示する場合は、`@solid-primitives/virtual` を使用します。

```tsx
import { createVirtualizer } from '@solid-primitives/virtual';

const MyList: Component = () => {
  const [items] = createSignal(Array.from({ length: 10000 }, (_, i) => i));

  const virtualized = createVirtualizer({
    count: items().length,
    estimateSize: () => 50,
    overscan: 5
  });

  return (
    <div style={{ height: '400px', overflow: 'auto' }}>
      <For each={virtualized.getVirtualItems()}>
        {(item) => (
          <div style={{ height: '50px' }}>
            Item {items()[item.index]}
          </div>
        )}
      </For>
    </div>
  );
};
```

### 5. コンポーネントの遅延ロード

```tsx
import { lazy } from 'solid-js';
import { Route } from '@solidjs/router';

// 遅延ロード
const Dashboard = lazy(() => import('./Dashboard'));

<Route path="/dashboard" component={Dashboard} />

// Suspense と組み合わせる
import { Suspense } from 'solid-js';

<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

---

## よくあるミスと注意点

### 1. Props を分割代入してはいけない

```tsx
// ❌ 悪い例
const MyComponent: Component<{ count: number }> = ({ count }) => {
  return <div>{count}</div>; // リアクティビティが失われる
};

// ✅ 良い例
const MyComponent: Component<{ count: number }> = (props) => {
  return <div>{props.count}</div>;
};
```

### 2. Signal を Effect の外で読み取ってはいけない

```tsx
// ❌ 悪い例
const count = createSignal(0)[0];
const value = count(); // 初回の値のみ取得、更新されない

createEffect(() => {
  console.log(value); // 常に初回の値
});

// ✅ 良い例
createEffect(() => {
  console.log(count()); // count が更新されるたびに実行
});
```

### 3. コンポーネント内で Signal を条件付きで作成してはいけない

```tsx
// ❌ 悪い例
const MyComponent: Component<{ show: boolean }> = (props) => {
  if (props.show) {
    const [count, setCount] = createSignal(0); // 条件付きで作成
  }
  // ...
};

// ✅ 良い例
const MyComponent: Component<{ show: boolean }> = (props) => {
  const [count, setCount] = createSignal(0); // 常に作成

  return (
    <Show when={props.show}>
      <div>{count()}</div>
    </Show>
  );
};
```

### 4. Effect 内で非同期処理を行う場合の注意

```tsx
// ❌ 悪い例: 古い Effect の結果が遅れて返ってくる可能性
createEffect(() => {
  const id = userId();
  fetchUser(id).then(user => setUser(user));
});

// ✅ 良い例: createResource を使う
const [user] = createResource(userId, fetchUser);

// または AbortController で古いリクエストをキャンセル
createEffect((prevController) => {
  prevController?.abort();

  const controller = new AbortController();
  const id = userId();

  fetchUser(id, { signal: controller.signal })
    .then(user => setUser(user))
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });

  return controller;
});
```

### 5. JSX 内で Signal を直接呼び出す（カッコを忘れない）

```tsx
const [count, setCount] = createSignal(0);

// ❌ 悪い例
<div>{count}</div> // 関数オブジェクトが表示される

// ✅ 良い例
<div>{count()}</div>
```

### 6. map の代わりに For を使う

```tsx
// ❌ 悪い例
{items().map(item => <div>{item}</div>)}

// ✅ 良い例
<For each={items()}>
  {(item) => <div>{item}</div>}
</For>
```

### 7. Effect の無限ループに注意

```tsx
// ❌ 悪い例: 無限ループ
const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log(count());
  setCount(count() + 1); // count を読み取って更新すると無限ループ
});

// ✅ 良い例: untrack を使う
import { untrack } from 'solid-js';

createEffect(() => {
  console.log(count());
  setCount(untrack(count) + 1); // 依存関係から除外
});
```

### 8. Store の更新は専用の setter を使う

```tsx
const [state, setState] = createStore({ count: 0 });

// ❌ 悪い例
state.count = 1; // リアクティビティが失われる

// ✅ 良い例
setState('count', 1);
```

---

## まとめ

Solid.js は React に似た構文を持ちながらも、**細粒度のリアクティビティ**という根本的に異なるアプローチを採用しています。

**重要なポイント**:

1. **JSX は一度だけ実行される**: React のように毎回再実行されない
2. **Signal はゲッター関数**: `count()` で値を取得、`setCount()` で更新
3. **自動的な依存関係追跡**: Effect 内で Signal を呼び出すと自動的に依存関係として追跡
4. **制御フローコンポーネントを使う**: `For`, `Show`, `Switch` を使って効率的に更新
5. **Props を分割代入しない**: リアクティビティが失われる
6. **コンポーネントは一度だけ実行**: ライフサイクルは React と異なる

これらの違いを理解して活用することで、Solid.js の高速性とシンプルさを最大限に引き出すことができます。
