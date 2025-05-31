FROM node:latest

ENV YARN_VERSION=4.3.1
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
ENV PRISMA_ENABLE_TRACING=false

RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

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
