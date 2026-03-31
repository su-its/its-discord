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

const COURSE_TYPES = Object.keys(UNIVERSITY_STRUCTURE) as Array<
  keyof typeof UNIVERSITY_STRUCTURE
>;

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
        .setName("course_type")
        .setDescription("課程区分")
        .setRequired(true)
        .addChoices(
          ...COURSE_TYPES.map((type) => ({
            name: UNIVERSITY_STRUCTURE[type].label,
            value: type,
          })),
        ),
    )
    .addStringOption((option) =>
      option
        .setName("institution")
        .setDescription("学部 / 研究科")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("subdivision")
        .setDescription("学科 / 専攻 / コース")
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("在学年次")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(6),
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
  const courseType = interaction.options.getString("course_type");

  if (
    !courseType ||
    !COURSE_TYPES.includes(courseType as keyof typeof UNIVERSITY_STRUCTURE)
  ) {
    await interaction.respond([]);
    return;
  }

  const typedCourseType = courseType as keyof typeof UNIVERSITY_STRUCTURE;

  if (focused.name === "institution") {
    const steps = getAffiliationSteps(typedCourseType, {});
    const firstStep = steps[0];
    if (!firstStep) {
      await interaction.respond([]);
      return;
    }
    const filtered = firstStep.options
      .filter((opt) => opt.includes(focused.value))
      .slice(0, 25);
    await interaction.respond(
      filtered.map((opt) => ({ name: opt, value: opt })),
    );
    return;
  }

  if (focused.name === "subdivision") {
    const institution = interaction.options.getString("institution") ?? "";
    const steps = getAffiliationSteps(
      typedCourseType,
      buildSelections(typedCourseType, institution),
    );
    const remainingSteps = steps.slice(1);
    if (remainingSteps.length === 0) {
      await interaction.respond([]);
      return;
    }
    const allOptions = remainingSteps.flatMap((step) =>
      step.options.map((opt) => `${step.label}: ${opt}`),
    );
    const filtered = allOptions
      .filter((opt) => opt.includes(focused.value))
      .slice(0, 25);
    await interaction.respond(
      filtered.map((opt) => ({ name: opt, value: opt })),
    );
    return;
  }

  await interaction.respond([]);
}

function buildSelections(
  courseType: keyof typeof UNIVERSITY_STRUCTURE,
  institution: string,
): Record<string, string> {
  const firstStep = getAffiliationSteps(courseType, {})[0];
  if (!firstStep) return {};
  return { [firstStep.field]: institution };
}

function buildAffiliation(
  courseType: string,
  institution: string,
  subdivision: string | null,
  year: number,
): CompleteAffiliation {
  const typedCourseType = courseType as keyof typeof UNIVERSITY_STRUCTURE;
  const steps = getAffiliationSteps(
    typedCourseType,
    buildSelections(typedCourseType, institution),
  );

  const value: Record<string, string | number> = {};

  const firstStep = steps[0];
  if (firstStep) {
    value[firstStep.field] = institution;
  }

  if (subdivision) {
    const parts = subdivision.split(": ");
    if (parts.length === 2) {
      const remainingSteps = steps.slice(1);
      for (const step of remainingSteps) {
        if (step.label === parts[0]) {
          value[step.field] = parts[1];
          break;
        }
      }
    }
  }

  value.year = year;

  return {
    type: typedCourseType,
    value,
  } as CompleteAffiliation;
}

async function registerCommandHandler(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const name = interaction.options.getString("name", true);
  const email = interaction.options.getString("email", true);
  const studentNumber = interaction.options.getString("student_number", true);
  const courseType = interaction.options.getString("course_type", true);
  const institution = interaction.options.getString("institution", true);
  const subdivision = interaction.options.getString("subdivision");
  const year = interaction.options.getInteger("year", true);

  if (!email.endsWith("@shizuoka.ac.jp")) {
    await interaction.reply({
      content: "メールアドレスは @shizuoka.ac.jp で終わる必要があります。",
      ephemeral: true,
    });
    return;
  }

  const maxYear = getMaxYear(courseType as keyof typeof UNIVERSITY_STRUCTURE);
  if (year < 1 || year > maxYear) {
    await interaction.reply({
      content: `在学年次は 1〜${maxYear} の範囲で指定してください。`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const affiliation = buildAffiliation(
      courseType,
      institution,
      subdivision,
      year,
    );

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
