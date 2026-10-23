# Node 10 matches the 2019 dependency set (socket.io 2, mongoose 5, bcrypt 3).
FROM node:10
ENV USE_MOCKS=1 PORT=3000
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
EXPOSE 3000
CMD ["node", "server/server.js"]
