FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

COPY . .

EXPOSE 3000

CMD ["/bin/bash"]