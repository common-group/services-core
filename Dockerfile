FROM python:3
# update pip
EXPOSE 3009
WORKDIR /usr/catarse_recommender
RUN mkdir -p /usr/catarse_recommender
ADD requirements.txt /usr/catarse_recommender
RUN pip3 install --no-cache-dir -r requirements.txt
ADD . /usr/catarse_recommender
