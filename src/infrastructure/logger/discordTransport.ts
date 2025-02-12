import Transport from "winston-transport";

interface DiscordTransportOptions extends Transport.TransportStreamOptions {
  webhookUrl: string;
}

export default class DiscordTransport extends Transport {
  private webhookUrl: string;

  constructor(opts: DiscordTransportOptions) {
    super(opts);
    this.webhookUrl = opts.webhookUrl;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  public log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    // Discord に送信するメッセージを作成
    const message = {
      // content にはログレベルとメッセージを記述（必要に応じてフォーマット変更）
      content: `**${info.level.toUpperCase()}**: ${info.message}\n${info.stack ? `\`\`\`\n${info.stack}\n\`\`\`` : ""}`,
    };

    // fetch を使って Discord の Webhook に POST する
    fetch(this.webhookUrl, {
      method: "POST",
      body: JSON.stringify(message),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => {
        callback();
      })
      .catch((err) => {
        console.error("Error sending log to Discord:", err);
        callback();
      });
  }
}
