import type { AppDeps } from "@application/ports";
import { InvalidTexError, renderTexImage } from "@application/usecases";
import type Command from "@domain/types/command";
import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

/** TeX 数式の最大文字数。巨大な入力による高負荷を防ぐ。 */
const MAX_TEX_LENGTH = 500;

const texCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("tex")
    .setDescription("TeX(LaTeX)の数式を画像にして表示します")
    .addStringOption((option) =>
      option
        .setName("formula")
        .setDescription("画像にしたい TeX 数式 (例: E = mc^2)")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(MAX_TEX_LENGTH),
    ) as SlashCommandBuilder,
  execute: texCommandHandler,
  isDMAllowed: true,
};

async function texCommandHandler(
  interaction: ChatInputCommandInteraction,
  _deps: AppDeps,
) {
  const formula = interaction.options.getString("formula", true).trim();
  if (formula.length === 0) {
    await interaction.reply("数式を入力してください。");
    return;
  }

  // MathJax の初期化や画像変換に時間がかかることがあるため遅延応答する。
  await interaction.deferReply();

  try {
    const image = await renderTexImage(formula);
    const attachment = new AttachmentBuilder(image, { name: "tex.png" });
    await interaction.editReply({ files: [attachment] });
  } catch (error) {
    if (error instanceof InvalidTexError) {
      const detail = error.message.replace(/`/g, "'").slice(0, 500);
      await interaction.editReply(
        `数式を画像に変換できませんでした。TeX の構文を確認してください。\n\`\`\`\n${detail}\n\`\`\``,
      );
      return;
    }
    // 想定外のエラーは共通のエラーハンドラに委ねる。
    throw error;
  }
}

export default texCommand;
