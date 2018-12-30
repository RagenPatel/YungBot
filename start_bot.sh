#!/bin/bash/
sleep 8
cd ~/YungBot/LeagueDiscord/
git pull
npm install
forever start YungBot.js -p 8080
