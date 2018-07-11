FROM library/ruby:2.5.1-alpine

RUN set -x \
  && apk upgrade --no-cache \ 
  && apk add --no-cache --virtual build-dependencies \
    build-base libc-dev linux-headers tzdata\
    postgresql-dev postgresql-client openssl git \
  && apk add --no-cache \
    libxml2-dev \
    libxslt-dev \
  && gem install nokogiri \
    -- --use-system-libraries \
    --with-xml2-config=/usr/bin/xml2-config \
    --with-xslt-config=/usr/bin/xslt-config

WORKDIR /app

COPY . .

ADD Gemfile /app
ADD Gemfile.lock /app

COPY . /app

RUN gem install bundler
RUN bundle install

