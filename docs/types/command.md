# Command

型`Command`は以下の用途で使用されます

- 新たな**引数を持たないコマンド**を定義する際に使用します
  > [!NOTE]
  > 引数を持つコマンドについては[commandWithArgs]を参照してください

## 要素

data: SlashCommandBuilderのインスタンスを指定して下さい
execute: 引数として`CommandInteraction`型を受け取る関数を指定してください。この関数は、コマンドを実行した際にコールバックとして発火します

## 参考

`SlashCommandBuilder`については以下のドキュメントを参考にしてください[SlashCommandBuilder](https://discord.js.org/docs/packages/builders/1.6.0/SlashCommandBuilder:Class)
