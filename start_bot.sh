#!/bin/bash/
sleep 8
cd ~/YungBot/LeagueDiscord/
git pull
forever start -a -l yungbot.log YungBot.js -p 8080
