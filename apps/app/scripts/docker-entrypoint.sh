#!/bin/sh
set -e

echo "Generating TypeScript types from Rust..."

# ts-exportフィーチャーを有効にしてテストを実行
# export_typescript_typesテストが実行され、型定義ファイルが生成される
cargo test --features ts-export export_typescript_types --quiet 2>&1 | grep -v "Compiling\|Finished\|Running" || true

# 型定義ディレクトリが存在するか確認
if [ -d "frontend/src/types" ] && [ "$(ls -A frontend/src/types)" ]; then
    echo "TypeScript types generated successfully!"
    echo "Generated files:"
    ls -la frontend/src/types/
else
    echo "Warning: No type files generated"
fi

# 元のコマンドを実行
exec "$@"
