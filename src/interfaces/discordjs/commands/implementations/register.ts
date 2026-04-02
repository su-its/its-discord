import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import type { AppDeps } from "../../../../application/ports/deps";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

const registerCommand: AdminCommand = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("メンバー登録コマンド")
    .addStringOption((option) =>
      option.setName("name").setDescription("名前").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("メールアドレス")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("student_number")
        .setDescription("学籍番号")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("affiliation")
        .setDescription(
          "所属（例: 学士課程 / 情報学部 / 昼間コース / 情報科学科）",
        )
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("在学年次")
        .setRequired(true)
        .setAutocomplete(true),
    ) as SlashCommandBuilder,
  execute: registerCommandHandler,
  autocomplete: registerAutocompleteHandler,
  authorization: new AdminRoleSpecification(),
  isDMAllowed: false,
};

async function registerAutocompleteHandler(
  interaction: AutocompleteInteraction,
  deps: AppDeps,
): Promise<void> {
  const options = deps.itsCorePort.getAllAffiliationOptions();
  const focused = interaction.options.getFocused(true);

  if (focused.name === "affiliation") {
    const query = focused.value.toLowerCase();
    const filtered = options
      .filter((entry) => entry.label.toLowerCase().includes(query))
      .slice(0, 25);
    await interaction.respond(
      filtered.map((entry) => ({ name: entry.label, value: entry.label })),
    );
    return;
  }

  if (focused.name === "year") {
    const affiliationLabel = interaction.options.getString("affiliation") ?? "";
    const entry = options.find((e) => e.label === affiliationLabel);
    if (!entry) {
      await interaction.respond([]);
      return;
    }
    const choices = Array.from({ length: entry.maxYear }, (_, i) => ({
      name: `${i + 1}年`,
      value: i + 1,
    }));
    await interaction.respond(choices);
    return;
  }

  await interaction.respond([]);
}

async function registerCommandHandler(
  interaction: ChatInputCommandInteraction,
  deps: AppDeps,
): Promise<void> {
  const options = deps.itsCorePort.getAllAffiliationOptions();
  const name = interaction.options.getString("name", true);
  const email = interaction.options.getString("email", true);
  const studentNumber = interaction.options.getString("student_number", true);
  const affiliationLabel = interaction.options.getString("affiliation", true);
  const year = interaction.options.getInteger("year", true);

  if (!email.endsWith("@shizuoka.ac.jp")) {
    await interaction.reply({
      content: "メールアドレスは @shizuoka.ac.jp で終わる必要があります。",
      ephemeral: true,
    });
    return;
  }

  const entry = options.find((e) => e.label === affiliationLabel);
  if (!entry) {
    await interaction.reply({
      content:
        "所属の選択が正しくありません。オートコンプリートの候補から選択してください。",
      ephemeral: true,
    });
    return;
  }

  if (year < 1 || year > entry.maxYear) {
    await interaction.reply({
      content: `在学年次は 1〜${entry.maxYear} の範囲で指定してください。`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    await deps.itsCorePort.registerMember({
      email,
      name,
      studentId: studentNumber,
      courseType: entry.courseType,
      affiliationSelections: entry.selections,
      year,
    });

    await interaction.editReply(`${name} さんを登録しました。`);
  } catch (error) {
    await interaction.editReply(
      `登録に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    );
  }
}

export default registerCommand;
