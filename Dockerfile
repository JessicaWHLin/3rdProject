# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.15.1

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV development


WORKDIR /usr/src

RUN npm install -g nodemon
COPY package*.json ./
RUN npm install

USER node

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
