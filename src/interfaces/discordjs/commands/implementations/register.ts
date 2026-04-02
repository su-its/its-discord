import {
  type CompleteAffiliation,
  getAffiliationSteps,
  getMaxYear,
  UNIVERSITY_STRUCTURE,
} from "@shizuoka-its/core";
import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { itsCoreService } from "../../../../application/services/itsCoreService";
import type AdminCommand from "../../../../domain/types/adminCommand";
import { AdminRoleSpecification } from "../../../../infrastructure/authorization/adminRoleSpecification";

type CourseType = keyof typeof UNIVERSITY_STRUCTURE;
const COURSE_TYPES = Object.keys(UNIVERSITY_STRUCTURE) as CourseType[];
const SEPARATOR = " / ";

/**
 * 全 CourseType × 所属の組み合わせをフラットに列挙する
 * 例: "学士課程 / 情報学部 / 昼間コース / 情報科学科"
 */
interface AffiliationEntry {
  label: string;
  courseType: CourseType;
  selections: Record<string, string>;
}

// TODO: core に getAllAffiliations() が追加されたらこの関数を置き換える (su-its/core#138)
function enumerateAffiliations(): AffiliationEntry[] {
  const entries: AffiliationEntry[] = [];

  for (const courseType of COURSE_TYPES) {
    const courseLabel = UNIVERSITY_STRUCTURE[courseType].label;
    recurse(courseType, courseLabel, {}, 0, entries);
  }

  return entries;
}

function recurse(
  courseType: CourseType,
  prefix: string,
  selections: Record<string, string>,
  depth: number,
  entries: AffiliationEntry[],
): void {
  const steps = getAffiliationSteps(courseType, selections);
  const currentStep = steps[depth];

  if (!currentStep) {
    entries.push({ label: prefix, courseType, selections });
    return;
  }

  for (const option of currentStep.options) {
    const newSelections = { ...selections, [currentStep.field]: option };
    recurse(
      courseType,
      `${prefix}${SEPARATOR}${option}`,
      newSelections,
      depth + 1,
      entries,
    );
  }
}

const ALL_AFFILIATIONS = enumerateAffiliations();

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
): Promise<void> {
  const focused = interaction.options.getFocused(true);

  if (focused.name === "affiliation") {
    const query = focused.value.toLowerCase();
    const filtered = ALL_AFFILIATIONS.filter((entry) =>
      entry.label.toLowerCase().includes(query),
    ).slice(0, 25);
    await interaction.respond(
      filtered.map((entry) => ({ name: entry.label, value: entry.label })),
    );
    return;
  }

  if (focused.name === "year") {
    const affiliationLabel = interaction.options.getString("affiliation") ?? "";
    const entry = ALL_AFFILIATIONS.find((e) => e.label === affiliationLabel);
    if (!entry) {
      await interaction.respond([]);
      return;
    }
    const maxYear = getMaxYear(entry.courseType);
    const choices = Array.from({ length: maxYear }, (_, i) => ({
      name: `${i + 1}年`,
      value: i + 1,
    }));
    await interaction.respond(choices);
    return;
  }

  await interaction.respond([]);
}

function parseAffiliationEntry(label: string): AffiliationEntry | undefined {
  return ALL_AFFILIATIONS.find((entry) => entry.label === label);
}

async function registerCommandHandler(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
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

  const entry = parseAffiliationEntry(affiliationLabel);
  if (!entry) {
    await interaction.reply({
      content:
        "所属の選択が正しくありません。オートコンプリートの候補から選択してください。",
      ephemeral: true,
    });
    return;
  }

  const maxYear = getMaxYear(entry.courseType);
  if (year < 1 || year > maxYear) {
    await interaction.reply({
      content: `在学年次は 1〜${maxYear} の範囲で指定してください。`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const affiliation: CompleteAffiliation = {
      type: entry.courseType,
      value: { ...entry.selections, year },
    } as CompleteAffiliation;

    await itsCoreService.registerMember({
      email,
      name,
      studentId: studentNumber,
      affiliation,
    });

    await interaction.editReply(`${name} さんを登録しました。`);
  } catch (error) {
    await interaction.editReply(
      `登録に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    );
  }
}

export default registerCommand;
