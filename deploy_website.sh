#!/bin/bash/
cd /home/pi/YungBot/LeagueDiscord/
python3 /home/pi/YungBot/LeagueDiscord/updateEmotesWebsite.py
cd /home/pi/YungBot/React/emote-react
npm run deploy

CURRENTDATETIME=`date +"%b %d, %Y %T"`
git add .
git commit -m "Update: ${CURRENTDATETIME}"
git push origin master
