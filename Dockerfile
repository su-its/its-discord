FROM node:24-slim

RUN corepack enable

WORKDIR /usr/src/app

# 依存関係関連のファイルだけを先にコピー
COPY package.json yarn.lock .yarnrc.yml ./

# 依存関係をインストール
RUN yarn install

# 残りのソースコードをコピー
COPY . .

# デプロイコマンドを実行
RUN yarn deploy-commands

CMD ["yarn", "start"]
