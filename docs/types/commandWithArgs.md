# commandWithArgs

型`CommandWithArgs`は以下の用途で使用されます

- 引数付きの新しいスラッシュコマンドを定義する際に使用されます

## 要素

- data: 独自の型、`OmittedSlashCommandBuilder`を指定してください。開発者視点では通常の`SlashCommandBuilder`と大して変わりません。
- execute: `CommandInteraction`型の引数を受け取る関数を指定して下さい。この関数はコマンドを実行した際のコールバックとして呼び出されます。
