# ローカル開発ガイド

## In-memory モード

Firebase と ITSCore に接続せず、ローカルで Bot の動作を検証できるモード。
Discord API には本番（またはテスト用）Bot で接続する。

### セットアップ

1. `.env.local` を作成する:

```bash
cp .env.example .env.local
```

2. `.env.local` を編集:

```env
ENVIRONMENT=local
ITSCORE_ADAPTER=in-memory
EMAIL_AUTH_ADAPTER=in-memory
```

3. Firebase 関連の値はダミーでOK（in-memory モードでは使用されない）。
4. Discord Bot のトークン（`TOKEN`, `APP_ID`, `GUILD_ID`）は実際の値を設定する。

### 起動

```bash
yarn dev
```

`.env.local` が存在すれば自動的に `.env` より優先して読み込まれる。

### アダプタの選択

`ENVIRONMENT=local` の場合、Port ごとにアダプタを選択できる:

| 環境変数 | 値 | 説明 |
|---------|---|------|
| `ITSCORE_ADAPTER` | `in-memory`（デフォルト） | メモリ上で会員データを管理 |
| | `production` | Supabase/PostgreSQL に接続 |
| `EMAIL_AUTH_ADAPTER` | `in-memory`（デフォルト） | メール認証を自動完了扱い |
| | `production` | Firebase Auth に接続 |

`ENVIRONMENT=production` の場合はすべて本番アダプタが使用され、上記の選択は無視される。

### 組み合わせ例

```env
# Core は本番DB、Firebase だけ in-memory
ENVIRONMENT=local
ITSCORE_ADAPTER=production
EMAIL_AUTH_ADAPTER=in-memory
```

### In-memory アダプタの挙動

| アダプタ | 挙動 |
|---------|------|
| InMemoryITSCoreAdapter | 会員データを Map で管理。再起動でリセットされる |
| InMemoryEmailAuthAdapter | メール送信をスキップし、認証は自動完了扱い |

### 本番モードに戻す

`.env.local` を削除するか、`ENVIRONMENT=production` に変更する。
