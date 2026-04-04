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

### コマンドのデプロイと起動

```bash
# テスト用ギルドにスラッシュコマンドを登録
yarn deploy-commands:local

# ローカルモードで起動
yarn start:local
```

| コマンド | env ファイル | 対象ギルド |
|---------|------------|-----------|
| `yarn deploy-commands` | `.env` | 本番ギルド |
| `yarn deploy-commands:local` | `.env.local` | テスト用ギルド |
| `yarn start` | `.env` | 本番 |
| `yarn start:local` | `.env.local` | テスト用 |

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

### 本番モードで起動する

```bash
yarn start
```

`yarn start` は `main.ts` を使い、`.env` を読み込む。`.env.local` は参照しない。
