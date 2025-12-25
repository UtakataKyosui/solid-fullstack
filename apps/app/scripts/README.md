# Scripts

このディレクトリには、開発やDocker環境で使用するユーティリティスクリプトが含まれています。

## スクリプト一覧

### docker-entrypoint.sh

Dockerコンテナ起動時に実行されるエントリーポイントスクリプトです。

**機能:**
- Rust型定義からTypeScript型定義を自動生成
- `frontend/src/types/` に型定義ファイルを出力

**使用方法:**
Docker Composeで自動的に実行されます。

### create_test_user.sh

開発環境でテストユーザーを作成するスクリプトです。

**機能:**
- PostgreSQLにテストユーザーを挿入
- 既存のユーザーがいる場合はスキップ

**使用方法:**
```bash
# Docker環境
docker compose -f docker-compose.dev.yml exec postgres /app/scripts/create_test_user.sh

# ローカル環境
./scripts/create_test_user.sh
```

### disable_auth.sh

**注意: このスクリプトは開発用です。本番環境では使用しないでください。**

認証チェックを一時的に無効化し、ハードコードされたユーザーID (user_id=1) を使用するようにコードを変更します。

**機能:**
- `src/controllers/location.rs` と `src/controllers/item.rs` の認証処理をコメントアウト
- `user_id = 1` をハードコード

**使用方法:**
```bash
./scripts/disable_auth.sh
```

**注意:**
- このスクリプトはソースコードを直接変更します
- 実行後は必ずGitで変更を確認してください
- 本番環境では絶対に使用しないでください
