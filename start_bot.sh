#!/bin/bash/
sleep 8
cd ~/YungBot/LeagueDiscord/
git pull
sudo npm install
forever start YungBot.js -p 8080
