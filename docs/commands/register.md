# register
## Syntax
```
/register [mail] [name] [department] [student_number]
```

## Feature
- 引数の情報に従い、Firestoreにユーザ情報を登録します
- 引数が足りない場合、コマンドは実行されません

## Important
- registerコマンドはユーザー情報を登録するにとどまります。
- 登録したユーザーがサーバーを利用するためには、メール認証の後、`/auth`コマンドを実行する必要があります。
