# auth
## Syntax
```
/auth
```

## Feature
- コマンドを実行したユーザーを認証します。
- FirestoreにユーザーのdiscordIDと紐づくデータMemberが存在する場合に、認証が成功します。
- 認証に成功したユーザーは、`Authorized`ロールを得ます。

## Important
メール認証が完了していない場合、データがFirestoreに存在しても認証に失敗します。

