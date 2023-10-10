FROM node:18

# Create an application directory
RUN mkdir -p /api
# Create app directory
WORKDIR /api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY sreality-api/package*.json ./

RUN npm install

COPY sreality-api/index.ts .

EXPOSE 8080

CMD [ "node", "index.ts" ]
