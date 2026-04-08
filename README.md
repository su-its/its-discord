# its-discord bot

ITSのディスコードサーバーで使用するbotです。
開発前に管理者からクレデンシャルを受け取ってください。

## Getting started

```bash
corepack enable
yarn
yarn start
```

その他詳細は[`docs`ディレクトリ](docs/README.md)を参照してください。

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
