FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y software-properties-common vim
RUN add-apt-repository ppa:jonathonf/python-3.6
RUN apt-get update

RUN apt-get install -y build-essential python3.6 python3.6-dev python3-pip python3.6-venv git

# update pip
RUN python3.6 -m pip install pip --upgrade
RUN python3.6 -m pip install wheel
RUN apt-get install -y python-pip python-dev build-essential

EXPOSE 3009
WORKDIR /usr/catarse_recommender
RUN mkdir -p /usr/catarse_recommender
ADD requirements.txt /usr/catarse_recommender
RUN pip3 install --no-cache-dir -r requirements.txt
ADD . /usr/catarse_recommender
