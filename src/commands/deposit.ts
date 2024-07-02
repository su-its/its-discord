import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command";
import checkIsAdmin from "../utils/checkMemberRole";

const depositCommand: Command = {
  data: new SlashCommandBuilder().setName("deposit").setDescription("基金への入金を管理します。"),
  execute: depositCommandHandler,
};

async function depositCommandHandler(interaction: CommandInteraction) {
  //DMでは実行できないようにする
  if (!interaction.guild) return await interaction.reply("このコマンドはサーバーでのみ実行可能です");

  const isAdmin: boolean = await checkIsAdmin(interaction);
  if(!isAdmin) return await interaction.reply("このコマンドは管理者のみ使用可能です。");
  
};
