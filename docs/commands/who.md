# whoコマンド
## Syntax
```
/who [User]
```

## Features
- 指定したユーザーの情報を表示します。
- 情報は、Firestoreから参照されます。


## Important
Firestoreへ情報を登録するのは、`/auth`コマンドが成功した際です。
そのため、認証されていないユーザーに関する情報は取得することができません。
