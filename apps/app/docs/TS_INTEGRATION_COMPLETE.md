# TypeScript型定義の統合完了

## 実装内容

### 1. 型定義の自動生成
- Docker起動時に自動的にTypeScript型定義が生成される
- `frontend/src/types/`ディレクトリに出力

### 2. 生成された型定義
- `LoginParams.ts` - ログインパラメータ
- `RegisterParams.ts` - 登録パラメータ
- `index.ts` - 型定義の再エクスポート

### 3. 型定義の使用箇所
以下のコンポーネントで型定義を使用するように修正しました：

#### PasskeyLogin.tsx
```typescript
import type { RegisterParams, LoginParams } from '@/types';

// 登録時
const registerParams: RegisterParams = {
    email: emailValue,
    password: 'passkey-user',
    name: emailValue.split('@')[0]
};

// ログイン時
const loginParams: LoginParams = {
    email: emailValue,
    password: 'passkey-user'
};
```

#### Auth.tsx
```typescript
import type { RegisterParams, LoginParams } from '@/types';

// 登録時
const registerParams: RegisterParams = {
    email: email(),
    password: password(),
    name: name()
};

// ログイン時
const loginParams: LoginParams = {
    email: email(),
    password: password()
};
```

## メリット

### 1. 型安全性
- RustとTypeScriptの型定義が常に一致
- コンパイル時に型エラーを検出
- IDEの補完機能が正確に動作

### 2. 保守性の向上
- Rustの構造体を変更すると、TypeScript型も自動更新
- 手動で型定義を書く必要がない
- 型の不一致によるランタイムエラーを防止

### 3. 開発効率
- Docker起動時に自動生成されるため、追加の手順不要
- 型定義が常に最新の状態に保たれる
- フロントエンドとバックエンドの型が同期

## 今後の拡張

新しいAPI型を追加する場合：

1. Rustの構造体に`ts-rs`属性を追加：
```rust
#[derive(Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "ts-export", derive(ts_rs::TS))]
#[cfg_attr(feature = "ts-export", ts(export, export_to = "../frontend/src/types/"))]
pub struct NewApiParams {
    pub field1: String,
    pub field2: i32,
}
```

2. テストモジュールに追加：
```rust
#[cfg(all(test, feature = "ts-export"))]
mod ts_export_tests {
    use super::*;
    use ts_rs::TS;

    #[test]
    fn export_typescript_types() {
        NewApiParams::export().expect("Failed to export NewApiParams");
    }
}
```

3. Docker再起動で自動的に型定義が生成される

4. フロントエンドで使用：
```typescript
import type { NewApiParams } from '@/types';
```

## 参考
- [ts-rs GitHub](https://github.com/Aleph-Alpha/ts-rs)
- [TS_RS_GUIDE.md](./TS_RS_GUIDE.md)
