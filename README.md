# its-discord bot

ITSのディスコードサーバーで使用するbotです。

## ローカル開発のはじめかた

開発用の Discord Bot を [Discord Developer Portal](https://discord.com/developers/applications) で作成し、トークンを発行してください。

```bash
corepack enable
yarn
cp .env.example .env.local   # クレデンシャルを設定
yarn deploy-commands:local    # テスト用ギルドにコマンドを登録
yarn start:local              # ローカルモードで起動
```

In-memory モードやアダプタの切り替えなど、詳しくは[ローカル開発ガイド](docs/local-development.md)を参照してください。

その他のドキュメントは[`docs`ディレクトリ](docs/README.md)にあります。

## デプロイ

本番用のクレデンシャル（`.env`）は管理者から受け取ってください。
Docker イメージをビルドして実行します。詳しくは[デプロイガイド](docs/deploy.md)を参照してください。

```bash
docker build -t its-discord .
docker run --env-file .env its-discord
```

## コマンド一覧

### ユーザーコマンド

| コマンド | 説明 | ドキュメント |
|---|---|---|
| `/auth` | 静大メールアドレスで認証を行う | [認証の仕様](docs/specification/auth.md) |
| `/health_check` | Botの稼働状態を確認する | — |
| `/nick` | 自分のニックネームを変更する | — |

### 管理者コマンド

管理者ロール（`bot接頭辞管理者`）が必要です。

| コマンド | 説明 | ドキュメント |
|---|---|---|
| `/register` | 新規メンバーをITSCoreに登録する | [認証の仕様](docs/specification/auth.md) |
| `/refresh_roles` | 全メンバーのロールをITSCoreの最新情報でリフレッシュする | — |
| `/rename_all` | 全メンバーのニックネームをITSCoreの登録名に変更する | — |
| `/who` | 指定ユーザーの登録情報を表示する | — |
| `/hot_channels` | チャンネルのアクティビティランキングを表示する | — |
| `/ps` | Botのプロセス情報を表示する | — |
| `/kill` | 指定したBotプロセスを終了する | — |
