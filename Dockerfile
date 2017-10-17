FROM rust:1.20-jessie
RUN cargo install diesel_cli --no-default-features --features "postgres"
WORKDIR /usr/app
COPY . .
