import type { AppDeps } from "@application/ports";
import type Command from "@domain/types/command";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const DOOR_STATUS_WS_URL =
  process.env.DOOR_STATUS_WS_URL ?? "wss://its-status.woody1227.com/";
const WS_TIMEOUT_MS = 8000;

interface DoorStatus {
  open?: boolean;
  isOpen?: boolean;
  status?: string;
  message?: string;
}

function interpretStatus(data: string): string {
  try {
    const parsed: DoorStatus = JSON.parse(data);
    const isOpen = parsed.open ?? parsed.isOpen ?? parsed.status === "open";

    if (parsed.message) return parsed.message;
    return isOpen ? "🟢 開室中" : "🔴 閉室中";
  } catch {
    return data || "⚪ 不明";
  }
}

function fetchDoorStatus(): Promise<string> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(DOOR_STATUS_WS_URL);

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("WebSocket timeout"));
    }, WS_TIMEOUT_MS);

    ws.addEventListener("message", (event) => {
      clearTimeout(timeout);
      const raw =
        typeof event.data === "string" ? event.data : String(event.data);
      resolve(interpretStatus(raw));
      ws.close();
    });

    ws.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error("WebSocket error"));
    });
  });
}

const doorCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("door")
    .setDescription("ITSの開室状況を表示します") as SlashCommandBuilder,
  execute: doorCommandHandler,
  isDMAllowed: true,
};

async function doorCommandHandler(
  interaction: ChatInputCommandInteraction,
  _deps: AppDeps,
) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const status = await fetchDoorStatus();
    await interaction.editReply(`現在の開室状況: ${status}`);
  } catch {
    await interaction.editReply("現在の開室状況: ❌ 通信に失敗しました");
  }
}

export default doorCommand;
