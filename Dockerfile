
# You can build and run this with
#  docker build -t automl-labeling-tool
#  docker run -p 5000:5000 -t automl-labeling-tool
# Go to port 5000 on localhost to see.
from node
WORKDIR /app

RUN npm install pm2 -g

COPY webapp/browser/package.json /app/webapp/browser/
COPY webapp/server/package.json /app/webapp/server/

WORKDIR /app/webapp/browser
RUN npm install

WORKDIR /app/webapp/server
RUN npm install

WORKDIR /app
COPY . .

WORKDIR /app/webapp/server
RUN npm build

EXPOSE 5000
CMD ["pm2-runtime", "server.js"]



