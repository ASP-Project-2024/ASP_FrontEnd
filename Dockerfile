FROM node:23.3-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

ENTRYPOINT [ "npm" ]
CMD ["start"]
