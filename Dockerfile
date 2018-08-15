FROM node:8.10.0-alpine

# Set a working directory
WORKDIR /usr/src/app

COPY ./build/package.json .
COPY ./build/yarn.lock .

RUN apk update \
    && apk add sqlite \
    && apk add socat

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

# Run the container under "node" user by default
USER node

EXPOSE 3000/tcp

# Set NODE_ENV env variable to "production" for faster expressjs
ENV NODE_ENV production

# CMD [ "node", "server.js" ]
# CMD [ 'echo', 'debug' ]
