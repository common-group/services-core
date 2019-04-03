FROM comum/pg-dispatcher:latest AS dispatcher-env

FROM node:9.1

RUN apt-get install -y libssl-dev

COPY --from=dispatcher-env /usr/local/bin/pg-dispatcher /usr/local/bin/

WORKDIR /usr/app

COPY . .

RUN npm install
