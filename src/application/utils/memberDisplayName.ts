// TODO: 将来的にはMemberドメインモデルにgetDisplayName()メソッドとして移動すべき
// 現在は複数のUsecaseで共通利用するためのユーティリティ関数として配置

/**
 * メンバーのDiscord表示名を決定する
 * ルール: ニックネームがある場合は「本名 / ニックネーム」、ない場合は「本名」
 */
export function getDiscordDisplayName(name: string, nickname?: string): string {
  if (nickname && nickname.trim() !== "") {
    return `${name} / ${nickname}`;
  }
  return name;
}
