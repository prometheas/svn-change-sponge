FROM node:5.8-slim
MAINTAINER John Lianoglou <prometheas@github>

RUN apt-get update
RUN apt-get install -y subversion

RUN npm install -g gulp

COPY fs/ /

RUN chmod -R +x /usr/local/sbin/*
