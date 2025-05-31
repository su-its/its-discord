# 環境変数

## .env

.env ファイルには以下の情報を記載して下さい

```.env
TOKEN= Discord Botのトークン
APP_ID= Discord BotのID
GUILD_ID= 運用するDiscord ServerのID

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MESUREMENT_ID=


HOT_CHANNEL_ID= ホットチャンネルのID
GENERAL_CHANNEL_ID= 一般チャンネルのID

DISCORD_LOG_WEBHOOK_URL= ログを送信するWebhookのURL
DATABASEURL= データベースのURL
```

## firebase-admin

firestore を使用するために firestore から提供されるコンフィグファイルをルートに設置してください
現状`infra/firebase.ts`で読み込んでいますが、分かりにくいので将来的に分離します
