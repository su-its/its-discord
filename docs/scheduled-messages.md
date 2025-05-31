# スケジュールメッセージ機能

このドキュメントでは、指定した日時・曜日などに指定したチャンネルに指定したメッセージを送信するスケジュールメッセージ機能について説明します。

## 概要

スケジュールメッセージ機能は、Cron 式を使用して定期的に Discord チャンネルにメッセージを送信する機能です。この機能は厳密なクリーンアーキテクチャに基づいて実装されており、以下の特徴があります：

- **ヘキサゴナルアーキテクチャ**: ポート・アダプターパターンによる疎結合設計
- **依存性注入**: DI コンテナによる依存関係の管理
- **汎用性**: 任意の Cron 式による柔軟なスケジューリング
- **拡張性**: 永続化層の実装を簡単に変更可能
- **設定ファイルベース**: コードベースでの設定管理によりバージョン管理が可能

## 使用方法

### 1. 新しいスケジュールメッセージの追加

`src/config/scheduledMessages.ts` ファイルを編集して、新しいスケジュールメッセージを追加します：

```typescript
{
  id: "unique-identifier",
  description: "説明文",
  channelId: process.env.GENERAL_CHANNEL_ID || "",
  message: "送信するメッセージ",
  cronSchedule: "0 9 * * 1-5", // 平日9時
}
```

### 2. 環境変数の設定

`.env` ファイルでチャンネル ID を設定します：

```env
GENERAL_CHANNEL_ID=1234567890123456789
SYSTEM_CHANNEL_ID=1234567890123456789
```

### 3. アプリケーションの再起動

設定変更後、アプリケーションを再起動すると新しいスケジュールメッセージが自動的に作成・開始されます。

## 現在の設定済みメッセージ

デフォルトで以下のスケジュールメッセージが設定されています：

- **garbage-collection-reminder**: 毎週月曜と木曜日のゴミ捨てリマインダー（12:00）

## Cron 式の例

| 説明             | Cron 式        | 実行タイミング              |
| ---------------- | -------------- | --------------------------- |
| 毎日 9 時        | `0 9 * * *`    | 毎日午前 9 時               |
| 平日 9 時        | `0 9 * * 1-5`  | 月曜日から金曜日の午前 9 時 |
| 毎時 0 分        | `0 * * * *`    | 毎時 0 分                   |
| 毎週月曜日 10 時 | `0 10 * * 1`   | 毎週月曜日の午前 10 時      |
| 毎月 1 日 12 時  | `0 12 1 * *`   | 毎月 1 日の正午             |
| 30 分おき        | `*/30 * * * *` | 30 分ごと                   |

## アーキテクチャ

### レイヤー構成

```
interfaces/
├── cron/
│   └── scheduledMessageCron.ts      # Cronジョブ管理
config/
└── scheduledMessages.ts             # スケジュールメッセージ設定

application/
├── usecases/
│   ├── sendScheduledMessage.ts                   # メッセージ送信ユースケース
│   └── initializeScheduledMessagesFromConfig.ts  # 設定からの初期化
├── services/
│   └── scheduledMessageService.ts   # アプリケーションサービス
└── ports/
    └── scheduledMessagePort.ts      # 永続化インターフェース

domain/
└── entities/
    └── scheduledMessage.ts          # ドメインエンティティ

infrastructure/
├── memory/
│   └── scheduledMessageRepository.ts # メモリベース実装
└── di/
    └── container.ts                 # 依存注入設定
```

### 主要コンポーネント

#### 1. 設定ファイル
- `src/config/scheduledMessages.ts`: スケジュールメッセージの定義
- 環境変数による動的なチャンネル ID 設定

#### 2. ドメインエンティティ
- `ScheduledMessage`: スケジュールメッセージのドメインモデル
- `ScheduledMessageCreate`: 作成時のデータ転送オブジェクト

#### 3. アプリケーション層
- **ユースケース**: ビジネスロジックの実装
- **ポート**: 外部依存の抽象化
- **サービス**: ポートの利用と DI 管理

#### 4. インフラ層
- **リポジトリ**: データ永続化の具体実装
- **アダプター**: 外部サービス（Discord.js）との連携

#### 5. インターフェース層
- **Cron マネージャー**: スケジュール実行の管理

## 設定の変更方法

### 新しいスケジュールメッセージの追加

1. `src/config/scheduledMessages.ts` を編集
2. `SCHEDULED_MESSAGE_CONFIGS` 配列に新しい設定を追加
3. 必要に応じて新しい環境変数を `.env` ファイルに追加
4. アプリケーションを再起動

### 既存メッセージの変更

1. `src/config/scheduledMessages.ts` で該当の設定を変更
2. アプリケーションを再起動（既存のメッセージは上書きされます）

### メッセージの無効化

1. 該当の設定をコメントアウトまたは削除
2. アプリケーションを再起動

## 環境変数

以下の環境変数でチャンネル ID を設定できます：

- `GENERAL_CHANNEL_ID`: 一般的なメッセージ用チャンネル
- `SYSTEM_CHANNEL_ID`: システム通知用チャンネル

設定されていない場合、該当するスケジュールメッセージはスキップされます。

### タイムゾーン

Cron ジョブは `Asia/Tokyo` タイムゾーンで実行されます。変更する場合は `scheduledMessageCron.ts` の設定を修正してください。

## トラブルシューティング

### よくある問題

1. **Cron 式が無効**: 正しい Cron 式の形式を確認してください
2. **メッセージが送信されない**: チャンネル ID と環境変数の設定を確認してください
3. **ジョブが作成されない**: アプリケーションログで初期化エラーを確認してください

### ログの確認

```bash
# アプリケーションログでスケジュールメッセージの動作を確認
tail -f logs/application.log | grep "scheduled"
```

### 初期化時のログ例

```
[INFO] Initializing scheduled messages from configuration...
[INFO] Found 0 existing active scheduled messages
[INFO] Created scheduled message: garbage-collection-reminder (毎週月曜と木曜日のゴミ捨てリマインダー)
[INFO] Scheduled messages initialization completed: 1 created, 0 skipped
```

## 拡張方法

### 永続化層の変更

現在はメモリベースの実装ですが、以下のように他の永続化方法に変更できます：

#### Firebase 実装例

```typescript
export class FirebaseScheduledMessageRepository implements ScheduledMessagePort {
  // Firebase Firestoreを使用した実装
}
```

#### PostgreSQL 実装例

```typescript
export class PostgreSQLScheduledMessageRepository implements ScheduledMessagePort {
  // PostgreSQLを使用した実装
}
```

### 新機能の追加

#### 1. メッセージテンプレート機能

```typescript
export interface MessageTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}
```

#### 2. 条件付き実行機能

```typescript
export interface ConditionalSchedule {
  condition: string;
  expression: string;
}
```

## 今後の改善点

1. **Web UI**: ブラウザベースの設定管理インターフェース
2. **メッセージ履歴**: 送信履歴の記録と表示
3. **エラーハンドリング**: 送信失敗時のリトライ機能
4. **バックアップ**: スケジュール設定のエクスポート/インポート
5. **権限管理**: ユーザーごとのスケジュール管理権限
6. **ホットリロード**: アプリケーション再起動なしでの設定変更
