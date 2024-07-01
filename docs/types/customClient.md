# CustomClient

型、`CustomClient`は以下の用途で使用されます

- 新しくDiscord Clientを作成する際に使用します

`Discord.js`には、もともと`Client`クラスが存在し、プロジェクトの様々な箇所で使用する。しかし、設定できるプロパティが多いため、ここでプロパティも含めて定義しなおして、プロジェクト全体で使うことにした。
例えば、

- main.ts
- loadCommands.ts
  等で使用している
