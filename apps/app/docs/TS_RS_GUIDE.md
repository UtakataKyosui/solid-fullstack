# TypeScript型定義の自動生成

このプロジェクトでは、[ts-rs](https://github.com/Aleph-Alpha/ts-rs)を使用して、RustとTypeScriptの型定義を自動的に同期しています。

## 使い方

### 型定義の自動生成

TypeScript型定義は、**通常のビルド時に自動的に生成されます**。

```bash
# 開発サーバーを起動すると自動的に型定義が生成される
cargo run

# または明示的にビルド
cargo build

# または開発時のウォッチモード
cargo watch -x run
```

生成された型定義は`frontend/src/types/`ディレクトリに出力されます。

### 型定義のみを生成したい場合

```bash
# チェックのみ（型定義も生成される）
cargo check
```

### Rust側での設定

型定義を生成したい構造体に、以下の属性を追加します：

```rust
#[derive(Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "ts-export", derive(ts_rs::TS))]
#[cfg_attr(feature = "ts-export", ts(export, export_to = "../frontend/src/types/"))]
pub struct MyStruct {
    pub field1: String,
    pub field2: i32,
}
```

### TypeScript側での使用

生成された型定義をインポートして使用します：

```typescript
import type { RegisterParams } from '@/types/RegisterParams';

const params: RegisterParams = {
    email: 'user@example.com',
    password: 'password123',
    name: 'User Name'
};
```

## 利点

1. **型安全性**: RustとTypeScriptの型定義が常に一致
2. **自動更新**: Rustの構造体を変更すると、TypeScript型も自動的に更新
3. **開発効率**: 手動で型定義を書く必要がない
4. **バグ削減**: 型の不一致によるランタイムエラーを防止

## 注意事項

- **型定義は自動生成されます**: Rustのコードをビルドすると、自動的にTypeScript型定義が生成されます
- **Gitにコミット**: 生成されたTypeScript型定義はGitにコミットすることを推奨します（フロントエンド開発時に便利）
- **本番ビルド**: 本番環境では`--no-default-features`を使用してts-exportを無効化できます（オプション）

## 対応している型

現在、以下の構造体でTypeScript型定義を生成しています：

- `RegisterParams` - ユーザー登録パラメータ
- `LoginParams` - ログインパラメータ

今後、必要に応じて他の構造体にも追加していきます。
