FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential

EXPOSE 3009
WORKDIR /usr/app
RUN mkdir -p /usr/app
ADD requirements.txt /usr/app
RUN pip install --no-cache-dir -r requirements.txt
ADD . /usr/app
