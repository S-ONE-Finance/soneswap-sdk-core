FROM node:12

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN yarn

COPY . ./

EXPOSE 3000

CMD [ "yarn", "start" ]