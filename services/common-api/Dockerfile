FROM library/ruby:2.5.1-alpine

RUN set -x \
  && apk upgrade --no-cache \
  && apk add --no-cache --virtual build-dependencies \
    build-base libc-dev linux-headers tzdata\
    postgresql-dev postgresql-client openssl git \
  && apk add --no-cache \
    libxml2-dev \
    libxslt-dev \
  && gem update --system \
  && gem install nokogiri \
    -- --use-system-libraries \
    --with-xml2-config=/usr/bin/xml2-config \
    --with-xslt-config=/usr/bin/xslt-config

RUN gem install bundler -v 2.2.27
ENV BUNDLER_VERSION=2.2.27

WORKDIR /app

ADD Gemfile /app
ADD Gemfile.lock /app
COPY . /app

RUN bundle install
