FROM node:12

# 앱 디렉터리 생성
WORKDIR /usr/src/app
VOLUME /usr/src/app

EXPOSE 3000
CMD [ "yarn", "start_nodemon" ]