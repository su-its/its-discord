import type Command from "../../../domain/types/command";

class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  /**
   * コマンドを登録する
   * @param {Command} command  インターフェースを実装したコマンド
   */
  public register(command: Command): void {
    this.commands.set(command.data.name, command);
  }

  /**
   * 登録されたすべてのコマンドを取得する
   * @returns {Command[]}
   */
  public getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}

export default CommandRegistry;
