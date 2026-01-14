# /frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# O "--host" é OBRIGATÓRIO para o Vite ser acessível fora do container
CMD ["npm", "start", "--", "--host"]