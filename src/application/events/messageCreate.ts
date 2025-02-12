import { ChannelType, Events, type Message } from "discord.js";
import Department from "../../domain/entities/department";
import type AuthData from "../../domain/types/authData";
import type { CustomClient } from "../../domain/types/customClient";
import handleMemberRegistration from "../controllers/authController";
import authMember from "../utils/authMember";

export function setupMessageCreate(
  client: CustomClient,
  userStates: Map<string, AuthData>,
) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot || message.channel.type !== ChannelType.DM) return;
    handleDM(message, userStates);
  });
}

async function handleDM(message: Message, userStates: Map<string, AuthData>) {
  const userId = message.author.id;
  const userInfo = userStates.get(userId) || {};
  const reply = async (text: string) => message.reply(text);

  if (!userInfo.name) {
    await setUserInfoAndReply(
      userStates,
      userId,
      { name: message.content },
      "学籍番号を教えてください",
      reply,
    );
  } else if (!userInfo.student_number) {
    await validateAndSetStudentNumber(
      message,
      userInfo,
      userStates,
      userId,
      reply,
    );
  } else if (!userInfo.department) {
    await validateAndSetDepartment(
      message,
      userInfo,
      userStates,
      userId,
      reply,
    );
  } else if (!userInfo.mail) {
    await validateAndRegisterUser(message, userInfo, userStates, userId, reply);
  }
}

async function setUserInfoAndReply(
  userStates: Map<string, AuthData>,
  userId: string,
  update: Partial<AuthData>,
  replyMessage: string,
  reply: (message: string) => Promise<Message>,
) {
  const userInfo = userStates.get(userId) || {};
  Object.assign(userInfo, update);
  userStates.set(userId, userInfo);
  await reply(replyMessage);
}

async function validateAndSetStudentNumber(
  message: Message,
  userInfo: AuthData,
  userStates: Map<string, AuthData>,
  userId: string,
  reply: (message: string) => Promise<Message>,
) {
  const studentNumber = message.content;
  // 学籍番号の形式が正しいかどうか曖昧にチェック
  if (!/^[a-zA-Z0-9]{8}$/.test(studentNumber)) {
    await reply("学籍番号の形式が正しくありません。");
    return;
  }
  await setUserInfoAndReply(
    userStates,
    userId,
    { student_number: studentNumber },
    "学科を以下から教えてください: CS, BI, IA, OTHERS",
    reply,
  );
}

async function validateAndSetDepartment(
  message: Message,
  userInfo: AuthData,
  userStates: Map<string, AuthData>,
  userId: string,
  reply: (message: string) => Promise<Message>,
) {
  const departmentInput = message.content.toUpperCase();
  if (departmentInput in Department) {
    await setUserInfoAndReply(
      userStates,
      userId,
      { department: Department[departmentInput as keyof typeof Department] },
      "メールアドレスを教えてください",
      reply,
    );
  } else {
    await reply(
      "形式が正しくありません。学科を以下から教えてください: CS, BI, IA, GRADUATE, OTHERS",
    );
  }
}

async function validateAndRegisterUser(
  message: Message,
  userInfo: AuthData,
  userStates: Map<string, AuthData>,
  userId: string,
  reply: (message: string) => Promise<Message>,
) {
  const mail = message.content;
  if (mail.endsWith("@shizuoka.ac.jp")) {
    const updatedUserInfo = { ...userInfo, mail };
    if (await authMember(updatedUserInfo)) {
      try {
        updatedUserInfo.discordId = message.author.id;
        await handleMemberRegistration(updatedUserInfo);
      } catch (e) {
        await reply("認証に失敗しました。もう一度やり直してください");
        await reply("名前(フルネーム)を教えてください");
        userStates.set(userId, clearAuthData());
        return;
      }
      await reply(
        "認証メールを送信しました。静大メールから認証を行い、Discordサーバーで`/auth`コマンドを実行してください",
      );
    } else {
      await reply("認証に失敗しました。もう一度やり直してください");
      await reply("名前(フルネーム)を教えてください");
      userStates.set(userId, clearAuthData());
    }
    userStates.delete(userId); // 登録後は状態をクリア
  } else {
    await reply("メールアドレスの形式が正しくありません。もう一度お願いします");
  }
}

function clearAuthData(): AuthData {
  return {
    name: undefined,
    student_number: undefined,
    department: undefined,
    mail: undefined,
    discordId: undefined,
  };
}
