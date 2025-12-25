# Solid Fullstack Application

[Loco](https://loco.rs)ベースのRust製バックエンドと、SolidJS製フロントエンドを組み合わせたフルスタックアプリケーションです。

## 技術スタック

- **バックエンド**: Rust + Loco Framework
- **フロントエンド**: SolidJS + Rsbuild + Panda CSS + Ark UI
- **データベース**: PostgreSQL
- **パッケージマネージャー**: Bun
- **タスクランナー**: moonrepo

## 開発環境のセットアップ

### 前提条件

- Rust (最新安定版)
- Bun
- PostgreSQL (ローカル開発の場合)
- Docker & Docker Compose (Docker環境の場合)
- moonrepo

### ローカル開発 (moonrepo使用)

#### 1. 依存関係のインストール

```bash
# フロントエンドの依存関係
cd frontend
bun install
```

#### 2. データベースのセットアップ

```bash
# PostgreSQLが起動していることを確認
# データベースマイグレーション
cargo loco db migrate
```

#### 3. 開発サーバーの起動

```bash
# バックエンド
moon run app:dev

# フロントエンド (別ターミナル)
moon run app:dev-frontend
```

#### 4. アクセス

- フロントエンド: http://localhost:3300
- バックエンドAPI: http://localhost:8000/api

### Docker Compose環境

Docker Composeを使用すると、PostgreSQL、バックエンド、フロントエンドをまとめて起動できます。

#### 1. すべてのサービスを起動

```bash
moon run app:docker-up
```

これにより以下が起動します:
- PostgreSQL (ポート 5434)
- バックエンド (ポート 8000、ホットリロード対応)
- フロントエンド (ポート 3300)

#### 2. マイグレーション実行 (初回のみ)

```bash
moon run app:docker-migrate
```

#### 3. ログの確認

```bash
# すべてのサービス
moon run app:docker-logs

# バックエンドのみ
moon run app:docker-logs-backend
```

#### 4. サービスの停止

```bash
# 停止
moon run app:docker-down

# 停止 + ボリューム削除 (クリーンスタート)
moon run app:docker-down-volumes
```

#### 5. データベースのリセット

```bash
# データベースをリセット
moon run app:docker-reset

# リセット後に再起動
moon run app:docker-reset-reboot
```

## moonrepoタスク一覧

```bash
# ビルド
moon run app:build              # バックエンドビルド
moon run app:build-frontend     # フロントエンドビルド

# 開発
moon run app:dev                # バックエンド開発サーバー
moon run app:dev-frontend       # フロントエンド開発サーバー

# テスト
moon run app:test               # Rustテスト実行

# Docker関連
moon run app:docker-build       # Dockerイメージビルド
moon run app:docker-up          # サービス起動
moon run app:docker-down        # サービス停止
moon run app:docker-logs        # ログ表示
moon run app:docker-migrate     # マイグレーション実行
moon run app:docker-reset       # データベースリセット
```

## プロジェクト構成

```
.
├── src/                    # Rustバックエンドソース
├── frontend/               # SolidJSフロントエンド
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── lib/          # ユーティリティ
│   │   └── types/        # TypeScript型定義
│   ├── package.json
│   └── rsbuild.config.ts
├── migration/             # データベースマイグレーション
├── config/                # Loco設定ファイル
├── scripts/               # ユーティリティスクリプト
├── docker-compose.dev.yml # Docker Compose設定
├── Dockerfile.dev         # 開発用Dockerfile
└── moon.yml              # moonrepoタスク定義
```

## 認証について

このアプリケーションはPasskey (WebAuthn) 認証を使用しています。

## トラブルシューティング

### ポートが使用中

```bash
# ポートを使用しているプロセスを確認
sudo lsof -i :8000
sudo lsof -i :3300
sudo lsof -i :5434

# プロセスを終了
sudo kill -9 <PID>
```

### Dockerコンテナの再ビルド

```bash
moon run app:docker-down-volumes
moon run app:docker-build
moon run app:docker-up
```

## 参考リンク

- [Loco Framework](https://loco.rs)
- [SolidJS](https://www.solidjs.com/)
- [Panda CSS](https://panda-css.com/)
- [Ark UI](https://ark-ui.com/)
