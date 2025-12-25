#!/bin/bash

# 一時ユーザー作成スクリプト
# development環境でのテスト用

psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-app_development}" << 'EOF'
INSERT INTO users (pid, name, email, created_at, updated_at)
VALUES ('test-user-1', 'Test User', 'test@example.com', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
EOF

echo "Test user created with user_id=1"
