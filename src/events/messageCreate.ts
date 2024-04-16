import { ChannelType, Events, Guild, Message } from 'discord.js';
import { CustomClient } from '../types/customClient';
import clearAuthData from '../utils/clearAuthData';
import AuthData from '../types/authData';
import Department from '../entities/department';
import authMember from '../utils/authMember';
import createRoleIfNotFound from '../utils/createRoleNotFound';
import sendAuthMailController from '../controllers/authController';

export function setupMessageCreate(client: CustomClient, userStates: Map<string, AuthData>) {
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
        await setUserInfoAndReply(userStates, userId, { name: message.content }, '学籍番号を教えてください', reply);
    } else if (!userInfo.student_number) {
        await validateAndSetStudentNumber(message, userInfo, userStates, userId, reply);
    } else if (!userInfo.department) {
        await validateAndSetDepartment(message, userInfo, userStates, userId, reply);
    } else if (!userInfo.mail) {
        await validateAndRegisterUser(message, userInfo, userStates, userId, reply);
    }
}

async function setUserInfoAndReply(userStates: Map<string, AuthData>, userId: string, update: Partial<AuthData>, replyMessage: string, reply: (message: string) => Promise<Message>) {
    const userInfo = userStates.get(userId) || {};
    Object.assign(userInfo, update);
    userStates.set(userId, userInfo);
    await reply(replyMessage);
}

async function validateAndSetStudentNumber(message: Message, userInfo: AuthData, userStates: Map<string, AuthData>, userId: string, reply: (message: string) => Promise<Message>) {
    const studentNumber = message.content;
    // 学籍番号の形式が正しいかどうか曖昧にチェック
    if (!/^[a-zA-Z0-9]{8}$/.test(studentNumber)) {
        await reply('学籍番号の形式が正しくありません。');
        return;
    }
    await setUserInfoAndReply(userStates, userId, { student_number: studentNumber }, '学科を以下から教えてください: CS, BI, IA, OTHERS', reply);
}

async function validateAndSetDepartment(message: Message, userInfo: AuthData, userStates: Map<string, AuthData>, userId: string, reply: (message: string) => Promise<Message>) {
    const departmentInput = message.content.toUpperCase();
    if (departmentInput in Department) {
        await setUserInfoAndReply(userStates, userId, { department: Department[departmentInput as keyof typeof Department] }, 'メールアドレスを教えてください', reply);
    } else {
        await reply('形式が正しくありません。学科を以下から教えてください: CS, BI, IA, OTHERS');
    }
}

async function validateAndRegisterUser(message: Message, userInfo: AuthData, userStates: Map<string, AuthData>, userId: string, reply: (message: string) => Promise<Message>) {
    const mail = message.content;
    if (mail.endsWith('@shizuoka.ac.jp')) {
        userInfo.mail = mail;
        if (await authMember(userInfo)) {
            try {
                userInfo.discordId = message.author.id;
                await sendAuthMailController(userInfo);
            } catch (e) {
                userInfo = clearAuthData();
                await reply('認証に失敗しました。もう一度やり直してください');
                await reply('名前(フルネーム)を教えてください');
                return;
            }
            await reply('認証メールを送信しました。静大メールから認証を行い、Discordサーバーで`\\auth`コマンドを実行してください');
        } else {
            userInfo = clearAuthData();
            await reply('認証に失敗しました。もう一度やり直してください');
            await reply('名前(フルネーム)を教えてください');
        }
        userStates.delete(userId); // 登録後は状態をクリア
    } else {
        await reply('メールアドレスの形式が正しくありません。もう一度お願いします');
    }
}
