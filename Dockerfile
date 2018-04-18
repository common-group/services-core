FROM rust:1.25-jessie
RUN cargo install diesel_cli --no-default-features --features "postgres"
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ jessie-pgdg main' >> /etc/apt/sources.list.d/pgdg.list
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update && apt-get install postgresql-client-9.6 -y

WORKDIR /usr/app
COPY . .

RUN mkdir -p ./specs/logs
