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

RUN gem install bundler

WORKDIR /app

COPY Gemfile /app
COPY Gemfile.lock /app
COPY . /app
RUN bundle install --binstubs --without development test


CMD [ "bundle", "exec", "puma", "-C", "config/puma.rb" ]
