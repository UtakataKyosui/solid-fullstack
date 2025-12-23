# Known Issues

## 認証関連の問題 (Authentication Issues)

### Issue #1: Email/Password Login Returns 504 Gateway Timeout
**Status**: 🔴 Critical  
**Created**: 2025-12-23

**Description**:
通常のメールアドレス・パスワードによるログインが504 Gateway Timeoutエラーを返す。

**Reproduction Steps**:
1. Auth画面でメールアドレスとパスワードを入力
2. "Sign In"ボタンをクリック
3. `POST /api/auth/login` が504エラーを返す

**Expected Behavior**:
ログインが成功し、JWTトークンが返される

**Actual Behavior**:
```
POST http://localhost:3000/api/auth/login 504 (Gateway Timeout)
```

**Technical Details**:
- Frontend: `Auth.tsx:42` - handleLogin function
- Backend: `/api/auth/login` endpoint
- Error Type: Gateway Timeout (504)

**Possible Causes**:
- バックエンドのタイムアウト設定
- データベースクエリのパフォーマンス問題
- ミドルウェアでのハング

**Priority**: High

---

### Issue #2: API Routes Return 404 Not Found
**Status**: ✅ Fixed (Pending Deployment)  
**Created**: 2025-12-23  
**Fixed**: 2025-12-23 (Commit: 5854c3d)

**Description**:
すべてのAPIエンドポイント (`/api/genres/`, `/api/locations/`, `/api/items/`, `/api/auth/passkeys/`) が404エラーを返していた。

**Root Cause**:
ルート定義でprefixに末尾のスラッシュが含まれており、`.add("/", ...)`と組み合わせると `/api/genres//` のような不正なパスになっていた。

**Fix**:
- Prefixから末尾のスラッシュを削除: `"api/genres/"` → `"api/genres"`  
- パスパラメータを修正: `"{id}"` → `"/:id"`

**Files Changed**:
- `src/controllers/genre.rs`
- `src/controllers/location.rs`
- `src/controllers/item.rs`

**Status**: 修正済み、バックエンド再起動待ち

---

### Issue #3: Passkey Login Error Messaging Unclear
**Status**: ✅ Fixed  
**Created**: 2025-12-23  
**Fixed**: 2025-12-23 (Commit: 0ea1898)

**Description**:
Passkeyログインでトークンが返されない場合、誤ったメッセージ「Passkey verified (Token not yet implemented in backend)」が表示され、ユーザーを混乱させていた。

**Root Cause**:
フロントエンド (`Auth.tsx`) で、`data.token`がない場合のエラーメッセージが不適切だった。

**Fix**:
```typescript
// Before
setMessage("Passkey verified (Token not yet implemented in backend)");

// After
setMessage("Login failed: No token received");
```

**Note**: バックエンドは正しく実装されており、存在しないPasskeyではログインできない。

---

## UI/UX Issues

### Issue #4: Dialog Component Migration Incomplete
**Status**: ✅ Fixed  
**Created**: 2025-12-23  
**Fixed**: 2025-12-23 (Commit: 1bded9c)

**Description**:
`AddItemDialog`と`AddLocationDialog`が古いDialog API (`isOpen`, `onClose`) を使用しており、Park UI移行後にエラーが発生していた。

**Error**:
```
TypeError: Comp is not a function
at AddLocationDialog.tsx:56:1
```

**Fix**:
Park UIの`Dialog.Root`パターンに移行:
- `isOpen/onClose` → `open/onOpenChange`
- `Dialog.Backdrop`, `Dialog.Positioner`, `Dialog.Content`構造を使用
- Panda CSSスタイリングに移行

**Files Changed**:
- `src/components/home/components/AddItemDialog.tsx`
- `src/components/home/components/AddLocationDialog.tsx`

---

## 次のアクション (Next Actions)

1. **Issue #1の調査**: バックエンドログを確認し、504エラーの原因を特定
2. **タイムアウト設定の確認**: Axumのタイムアウト設定、データベース接続プールの確認
3. **パフォーマンステスト**: ログインエンドポイントのレスポンス時間測定
4. **エラーハンドリング改善**: より詳細なエラーメッセージを返すように修正

---

## 解決済み問題 (Resolved Issues)

- ✅ Issue #2: API Routes 404 (Fixed: 5854c3d)
- ✅ Issue #3: Passkey Error Messaging (Fixed: 0ea1898)  
- ✅ Issue #4: Dialog Component Migration (Fixed: 1bded9c)
