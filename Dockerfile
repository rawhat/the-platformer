FROM node:latest

WORKDIR /opt/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY app.js .
COPY public/ .
COPY pagedown/ .
COPY views/ .

CMD ["npx", "pm2-docker", "app.js"]
