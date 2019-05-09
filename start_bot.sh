#!/bin/bash/
sleep 8
cd ~/YungBot/LeagueDiscord/
forever -l yungbot.log YungBot.js -p 8080
