FROM node:8-alpine
EXPOSE 4096
WORKDIR /home/node
USER node:node
COPY --chown=node:node . .
ENV LOG_LEVEL=info \
    PORT=4096 \
    NODE_ENV=development \
    VUE_APP_API_PREFIX=https://house-rank-api.carlyzach.com
RUN yarn install && \
    yarn lint && \
    yarn build
CMD yarn start