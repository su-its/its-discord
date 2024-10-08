FROM node:latest

ENV YARN_VERSION=4.3.1
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

WORKDIR /usr/src/app

COPY . .

RUN yarn install

RUN yarn deploy-commands

CMD ["yarn", "start"]
