FROM node:12-alpine

ARG GEELBE_API_CLIENT_ID
ARG GEELBE_API_CLIENT_SECRET
ARG GEELBE_API_SCOPE
ARG GEELBE_API_HOST
ARG GEELBE_API_CLIENT_SECRET
ARG GEELBE_API_PROTOCOL
ARG URI_PREFIX
ARG S3_FOLDER
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG PUBLIC_PATH
ARG GEELBE_FACEBOOK_APP_ID
ARG GEELBE_FACEBOOK_APP_SECRET

ENV AWSCLI_VERSION "1.14.10"

ENV HOST=0.0.0.0
ENV PORT=3000
ENV GEELBE_API_CLIENT_ID=$GEELBE_API_CLIENT_ID
ENV GEELBE_API_CLIENT_SECRET=$GEELBE_API_CLIENT_SECRET
ENV GEELBE_API_SCOPE=$GEELBE_API_SCOPE
ENV GEELBE_API_HOST=$GEELBE_API_HOST
ENV GEELBE_API_CLIENT_SECRET=$GEELBE_API_CLIENT_SECRET
ENV GEELBE_API_PROTOCOL=$GEELBE_API_PROTOCOL
ENV GEELBE_FACEBOOK_APP_ID=$GEELBE_FACEBOOK_APP_ID
ENV GEELBE_FACEBOOK_APP_SECRET=$GEELBE_FACEBOOK_APP_SECRET
ENV URI_PREFIX=$URI_PREFIX
ENV PUBLIC_PATH=$PUBLIC_PATH

RUN apk add --update \
  python \
  python-dev \
  py-pip \
  build-base \
  && pip install awscli==$AWSCLI_VERSION --upgrade --user \
  && apk --purge -v del py-pip \
  && rm -rf /var/cache/apk/*

RUN mkdir -p /usr/src/geelbe
WORKDIR /usr/src/geelbe

RUN apk update && apk upgrade
RUN apk add git

COPY . /usr/src/geelbe/
RUN npm install -D

RUN npm run build

RUN mkdir /root/.aws
RUN echo "[default]" >> /root/.aws/credentials
RUN echo "aws_access_key_id=$AWS_ACCESS_KEY_ID" >> /root/.aws/credentials
RUN echo "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" >> /root/.aws/credentials

RUN echo s3://$S3_FOLDER

RUN /root/.local/bin/aws s3 sync /usr/src/geelbe/.nuxt/dist/client/ s3://$S3_FOLDER

ENV NODE_ENV=production
EXPOSE 3000

RUN  apk del --purge \
  *-dev \
  python \
  build-base


CMD [ "npm", "run", "prod" ]
