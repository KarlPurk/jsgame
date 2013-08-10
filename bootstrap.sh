#!/usr/bin/env bash

sudo apt-get update
sudo apt-get install python-software-properties -y
sudo add-apt-repository ppa:chris-lea/node.js -y
sudo apt-get update -y
sudo apt-get install nodejs -y
sudo npm install grunt -g
cd /vagrant
sudo npm install socket.io --no-bin-links --save-dev
sudo npm install node-static --no-bin-links --save-dev
sudo node app.js