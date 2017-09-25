FROM comum/pg-dispatcher:latest AS dispatcher-env

FROM ruby:2.4.1-jessie

RUN apt-get update
RUN apt-get update && apt-get install -y libssl-dev

COPY --from=dispatcher-env /usr/local/bin/pg-dispatcher /usr/local/bin/

WORKDIR /usr/app

COPY . .

RUN bundle install
