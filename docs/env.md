# 環境変数

## .env

.envファイルには以下の情報を記載して下さい

```.env
TOKEN= Discord Botのトークン
APP_ID= Discord BotのID
GUILD_ID= 運用するDiscord ServerのID

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
databaseURL=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MESUREMENT_ID=
```

## firebase-admin

firestoreを使用するためにfirestoreから提供されるコンフィグファイルをルートに設置してください
現状`infra/firebase.ts`で読み込んでいますが、分かりにくいので将来的に分離します
