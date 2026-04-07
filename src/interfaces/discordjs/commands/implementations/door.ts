import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import WebSocket from "ws";
import type Command from "../../../../domain/types/command";

const doorCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("door")
    .setDescription("ITSの開室状況を表示します") as SlashCommandBuilder,
  execute: doorCommandHandler,
  isDMAllowed: true,
};

async function doorCommandHandler(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  let statusText: string;

  try {
    statusText = await new Promise<string>((resolve, reject) => {
      const ws = new WebSocket("wss://its-status.woody1227.com/");
      let resolved = false;

      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        ws.close();
        reject(new Error("WebSocket timeout"));
      }, 8000);

      ws.onmessage = (event) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        try {
          const raw =
            typeof event.data === "string" ? event.data : event.data.toString();
          const parsed = raw ? JSON.parse(raw) : null;
          const open =
            parsed?.open ??
            parsed?.isOpen ??
            (parsed?.status === "open"
              ? true
              : parsed?.status === "closed"
                ? false
                : undefined);
          const text =
            parsed?.message ??
            parsed?.text ??
            (open === true
              ? "🟢 開室中"
              : open === false
                ? "🔴 閉室中"
                : raw || "⚪ 不明");
          resolve(String(text));
        } catch {
          resolve(
            typeof event.data === "string"
              ? event.data
              : "❌ 通信に失敗しました",
          );
        } finally {
          ws.close();
        }
      };

      ws.onerror = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        reject(new Error("WebSocket error"));
      };
    });
  } catch {
    statusText = "❌ 通信に失敗しました";
  }

  await interaction.editReply(`現在の開室状況: ${statusText}`);
}

export default doorCommand;
