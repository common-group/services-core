FROM ruby:3.0.2-alpine3.13

MAINTAINER Catarse <contato@catarse.me>

ENV BUILD_PACKAGES postgresql-dev libxml2-dev libxslt-dev imagemagick imagemagick-dev openssl libpq libffi-dev bash curl-dev libstdc++ tzdata bash ca-certificates build-base ruby-dev libc-dev linux-headers postgresql-client postgresql git nodejs yarn
ENV RUBY_PACKAGES ruby ruby-io-console ruby-bundler ruby-irb ruby-bigdecimal ruby-json zlib-dev yaml-dev readline-dev ruby-dev ncurses
## Update and install all of the required packages.
## At the end, remove the apk cache
RUN apk update && \
    apk upgrade && \
    apk --update add --virtual build_deps $BUILD_PACKAGES && \
    apk --update add $RUBY_PACKAGES


RUN node -v
RUN mkdir /usr/app
WORKDIR /usr/app
#
RUN gem install bundler:2.2.25
#
COPY Gemfile /usr/app/
COPY Gemfile.lock /usr/app/
COPY . /usr/app
#

RUN bundle install

RUN yarn install

#
#RUN cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && echo "America/Sao_Paulo" >  /etc/timezone
#
## ==================================================================================================
## 7: Copy the rest of the application code, install nodejs as a build dependency, then compile the
## app assets, and finally change the owner of the code to 'nobody':
RUN set -ex \
  && mkdir -p /usr/app/tmp/cache \
  && mkdir -p /usr/app/tmp/pids \
  && mkdir -p /usr/app/tmp/sockets
  #  && chown -R nobody /usr/app
#
## ==================================================================================================
## 8: Set the container user to 'nobody':
# USER nobody
