#!/bin/bash/
sleep 8
cd ~/YungBot/LeagueDiscord/
forever start -l yungbot.log YungBot.js -p 8080
